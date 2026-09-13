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
 *   · "encerrar e abrir novo" fecha o caso ⛔ e começa outro.
 *
 * ⛔ O QUE ⛔ NÃO FAZ: sincronizar com servidor, fazer backup, ou garantir que o
 * navegador ⛔ apague os dados — ver `docs/avc/persistencia.md`.
 *
 * ⚠️ A gravação acontece num efeito, ⛔ e ⛔ não dentro do `setEstado`: um updater
 * de estado pode ser chamado duas vezes pelo React, ⛔ e gravar ali duplicaria
 * eventos.
 */
import { useCallback, useEffect, useRef, useState } from "react";

import { abrirAtendimento, type EstadoAvc } from "../../avc/nucleo/estado";
import type { Relogio } from "../../avc/nucleo/relogio";
import { criarArmazenamentoDoAtendimento } from "../../avc/persistencia/armazenamento";
import {
  eventosDaTransicao,
  eventosDeAbertura,
  reconstruirEstado,
  type ContextoDoLog,
} from "../../avc/persistencia/log";
import type { ArmazenamentoDoAtendimento } from "../../avc/persistencia/tipos";
import { criarRegistroDeTravasDoNavegador, type TravaAdquirida } from "../../avc/persistencia/trava";
import { armazenamentoLocal } from "../../lib/armazenamento-local";

export type FaseDoAtendimento = "carregando" | "pronto" | "bloqueado";

/** ⚠️ Autor LOCAL do aparelho — ⛔ não é identidade autenticada (limite declarado). */
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
  const [estado, setEstado] = useState<EstadoAvc>(() => abrirAtendimento(relogio));
  const [recuperadoDe, setRecuperadoDe] = useState<number | undefined>(undefined);
  const [falhaAoGravar, setFalhaAoGravar] = useState(false);
  const [persistente, setPersistente] = useState(false);

  const arm = useRef<ArmazenamentoDoAtendimento | null>(null);
  const trava = useRef<TravaAdquirida | undefined>(undefined);
  const caso = useRef<string | undefined>(undefined);
  const persistido = useRef<EstadoAvc | undefined>(undefined);
  const autor = useRef("");
  const fila = useRef<Promise<unknown>>(Promise.resolve());

  const ctx = useCallback(
    (): ContextoDoLog => ({
      casoId: caso.current as string,
      autor: autor.current,
      agora: relogio.agora(),
      gerarId,
    }),
    [relogio]
  );

  useEffect(() => {
    let vivo = true;
    autor.current = autorLocal();
    const armazenamento = criarArmazenamentoDoAtendimento();
    arm.current = armazenamento;
    setPersistente(armazenamento.persistente);
    (async () => {
      try {
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
          const recuperado = reconstruirEstado(await armazenamento.lerEventos(casoId));
          persistido.current = recuperado;
          setEstado(recuperado);
          setRecuperadoDe(recuperado.abertoEm);
        } else {
          const novo = abrirAtendimento(relogio);
          await armazenamento.anexarEventos(casoId, eventosDeAbertura(novo, ctx()));
          persistido.current = novo;
          setEstado(novo);
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
    setEstado(novo);
    setRecuperadoDe(undefined);
  }, [ctx, relogio]);

  return { fase, estado, setEstado, recuperadoDe, falhaAoGravar, persistente, encerrarEAbrirNovo };
}
