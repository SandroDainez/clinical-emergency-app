/**
 * ATENDIMENTO PERSISTIDO — liga a tela ao log local (AC-02 · D-PEND-02 · D-PEND-03).
 *
 * ⚠️ O QUE FAZ:
 *   · ao abrir o módulo, recupera o caso mais recente ⛔ não encerrado; sem caso,
 *     abre um novo ⛔ e grava a abertura;
 *   · adquire a trava do caso: se outra aba deste aparelho já o tem aberto, a fase
 *     vira `bloqueado` ⛔ e nada é escrito;
 *   · depois de cada mudança de estado, entrega os eventos da transição ao
 *     armazenamento, em fila — ⚠️ quem atribui a ORDEM (`seq`) é o armazenamento, na
 *     gravação; este hook ⛔ não numera nada;
 *   · AC-40: o autor de cada evento é o `user.id` da sessão Supabase; sem sessão, o
 *     ID do aparelho, ⛔ marcado como tal (`origemDoAutor`);
 *   · toque duplo: TODA mudança de estado passa por `repeteOGestoAnterior` — o
 *     gesto repetido ⛔ vira fato ⛔ nem evento;
 *   · "encerrar e abrir novo" fecha o caso ⛔ e começa outro.
 *
 * ⛔ O QUE ⛔ NÃO FAZ: sincronizar com servidor, fazer backup, ou garantir que o
 * navegador ⛔ apague os dados — ver `docs/avc/persistencia.md`.
 *
 * ⚠️ A gravação acontece num efeito, ⛔ e ⛔ não dentro do `setEstado`: um updater
 * de estado pode ser chamado duas vezes pelo React, ⛔ e gravar ali duplicaria
 * eventos. A regra de toque duplo é PURA, ⛔ e por isso pode morar no updater.
 */
import { useCallback, useEffect, useRef, useState, type SetStateAction } from "react";

import { abrirAtendimento, type EstadoAvc } from "../../avc/nucleo/estado";
import type { Relogio } from "../../avc/nucleo/relogio";
import { repeteOGestoAnterior } from "../../avc/nucleo/toque-duplo";
import { criarArmazenamentoDoAtendimento } from "../../avc/persistencia/armazenamento";
import {
  autoriaDoEvento,
  autoriaPorFatoDoLog,
  lerSessaoParaAutoria,
  type Autoria,
} from "../../avc/persistencia/autoria";
import {
  eventosDaTransicao,
  eventosDeAbertura,
  reconstruirEstado,
  type ContextoDoLog,
} from "../../avc/persistencia/log";
import type { ArmazenamentoDoAtendimento } from "../../avc/persistencia/tipos";
import { criarRegistroDeTravasDoNavegador, type TravaAdquirida } from "../../avc/persistencia/trava";
import { armazenamentoLocal } from "../../lib/armazenamento-local";
import { supabase } from "../../lib/supabase";

export type FaseDoAtendimento = "carregando" | "pronto" | "bloqueado";

/** ⚠️ ID LOCAL do aparelho — ⛔ não é identidade: só o recurso de quem ⛔ não tem sessão (AC-40). */
const CHAVE_DO_AUTOR = "avc-autor-local";

function gerarId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function autorLocal(): string {
  const disco = armazenamentoLocal();
  const salvo = disco?.ler(CHAVE_DO_AUTOR);
  if (salvo) return salvo;
  const novo = `local:${gerarId()}`;
  disco?.gravar(CHAVE_DO_AUTOR, novo);
  return novo;
}

const NOME_DA_TRAVA = (casoId: string) => `avc-atendimento:${casoId}`;

/**
 * ⚠️ Recarregar a página solta a trava da aba anterior ⛔ um instante depois de a
 * nova começar: poucas tentativas curtas evitam bloquear o próprio médico. Outra
 * aba ⛔ viva continua segurando a trava, ⛔ e o bloqueio acontece.
 */
async function adquirirComTentativas(nome: string): Promise<TravaAdquirida | undefined> {
  const travas = criarRegistroDeTravasDoNavegador();
  for (let i = 0; i < 6; i += 1) {
    const t = await travas.adquirir(nome);
    if (t !== undefined) return t;
    await new Promise((r) => setTimeout(r, 250));
  }
  return undefined;
}

export function useAtendimentoPersistido(relogio: Relogio) {
  const [fase, setFase] = useState<FaseDoAtendimento>("carregando");
  const [estado, setEstadoCru] = useState<EstadoAvc>(() => abrirAtendimento(relogio));
  const [recuperadoDe, setRecuperadoDe] = useState<number | undefined>(undefined);
  const [falhaAoGravar, setFalhaAoGravar] = useState(false);
  const [persistente, setPersistente] = useState(false);
  const [autoriaPorFato, setAutoriaPorFato] = useState<Readonly<Record<string, Autoria>>>({});

  const arm = useRef<ArmazenamentoDoAtendimento | null>(null);
  const trava = useRef<TravaAdquirida | undefined>(undefined);
  const caso = useRef<string | undefined>(undefined);
  const persistido = useRef<EstadoAvc | undefined>(undefined);
  const autoria = useRef<Autoria>({ autor: "", origemDoAutor: "aparelho" });
  const fila = useRef<Promise<unknown>>(Promise.resolve());

  const ctx = useCallback(
    (): ContextoDoLog => ({
      casoId: caso.current as string,
      autor: autoria.current.autor,
      origemDoAutor: autoria.current.origemDoAutor,
      agora: relogio.agora(),
      gerarId,
    }),
    [relogio]
  );

  /**
   * ⚠️⚠️ O REGISTRO — ⛔ toda mudança de estado da tela entra por aqui. O gesto que
   * repete o anterior ⛔ sem nada entre os dois devolve o MESMO estado: ⛔ nenhum
   * fato, ⛔ nenhum evento.
   */
  const setEstado = useCallback((acao: SetStateAction<EstadoAvc>) => {
    setEstadoCru((e) => {
      const proximo = typeof acao === "function" ? (acao as (x: EstadoAvc) => EstadoAvc)(e) : acao;
      return repeteOGestoAnterior(e, proximo) ? e : proximo;
    });
  }, []);

  useEffect(() => {
    let vivo = true;
    const aparelho = autorLocal();
    autoria.current = autoriaDoEvento(undefined, aparelho);
    const armazenamento = criarArmazenamentoDoAtendimento();
    arm.current = armazenamento;
    setPersistente(armazenamento.persistente);

    /** ⚠️ Login ⛔ ou logout no meio do caso: os eventos SEGUINTES mudam de autor. */
    const inscricao = supabase?.auth.onAuthStateChange(() => {
      void lerSessaoParaAutoria(supabase).then((s) => {
        autoria.current = autoriaDoEvento(s, aparelho);
      });
    });

    (async () => {
      try {
        autoria.current = autoriaDoEvento(await lerSessaoParaAutoria(supabase), aparelho);
        const existente = await armazenamento.casoMaisRecenteNaoEncerrado();
        const casoId = existente ?? `caso-${gerarId()}`;
        const t = await adquirirComTentativas(NOME_DA_TRAVA(casoId));
        if (!vivo) {
          await t?.liberar();
          return;
        }
        if (t === undefined) {
          setFase("bloqueado");
          return;
        }
        trava.current = t;
        caso.current = casoId;
        if (existente !== undefined) {
          const eventos = await armazenamento.lerEventos(casoId);
          const recuperado = reconstruirEstado(eventos);
          persistido.current = recuperado;
          setEstadoCru(recuperado);
          setAutoriaPorFato(autoriaPorFatoDoLog(eventos));
          setRecuperadoDe(recuperado.abertoEm);
        } else {
          const novo = abrirAtendimento(relogio);
          await armazenamento.anexarEventos(casoId, eventosDeAbertura(novo, ctx()));
          persistido.current = novo;
          setEstadoCru(novo);
        }
        if (vivo) setFase("pronto");
      } catch {
        /** ⚠️ Sem armazenamento, o atendimento segue só nesta aba — ⛔ e a tela diz isso. */
        if (vivo) {
          persistido.current = undefined;
          setFalhaAoGravar(true);
          setFase("pronto");
        }
      }
    })();
    return () => {
      vivo = false;
      inscricao?.data.subscription.unsubscribe();
      void trava.current?.liberar();
    };
    // ⚠️ Uma vez por montagem do módulo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fase !== "pronto" || arm.current === null || caso.current === undefined) return;
    const anterior = persistido.current;
    if (anterior === undefined || anterior === estado) return;
    let eventos;
    try {
      eventos = eventosDaTransicao(anterior, estado, ctx());
    } catch {
      setFalhaAoGravar(true);
      return;
    }
    persistido.current = estado;
    const novas = autoriaPorFatoDoLog(eventos);
    if (Object.keys(novas).length > 0) setAutoriaPorFato((m) => ({ ...m, ...novas }));
    const casoId = caso.current;
    const armazenamento = arm.current;
    /** ⚠️ Em fila: a ordem de ENTREGA é a ordem de gravação — e é a gravação que numera. */
    fila.current = fila.current
      .then(() => armazenamento.anexarEventos(casoId, eventos))
      .catch(() => setFalhaAoGravar(true));
  }, [estado, fase, ctx]);

  const encerrarEAbrirNovo = useCallback(async () => {
    const armazenamento = arm.current;
    const antigo = caso.current;
    await fila.current;
    if (armazenamento && antigo) await armazenamento.encerrarCaso(antigo, relogio.agora());
    await trava.current?.liberar();
    const novoId = `caso-${gerarId()}`;
    trava.current = await adquirirComTentativas(NOME_DA_TRAVA(novoId));
    caso.current = novoId;
    const novo = abrirAtendimento(relogio);
    if (armazenamento) await armazenamento.anexarEventos(novoId, eventosDeAbertura(novo, ctx()));
    persistido.current = novo;
    setEstadoCru(novo);
    setAutoriaPorFato({});
    setRecuperadoDe(undefined);
  }, [ctx, relogio]);

  /** ⚠️ 13ª rodada: o id do caso é o `encounterId` do contrato de navegação entre módulos. */
  return { fase, estado, setEstado, recuperadoDe, falhaAoGravar, persistente, autoriaPorFato, encerrarEAbrirNovo, casoId: caso.current };
}
