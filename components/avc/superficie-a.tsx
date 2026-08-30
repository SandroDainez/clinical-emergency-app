/**
 * SUPERFÍCIE A · Entrada e estabilização — a tela.
 *
 * ⛔ NENHUMA medicina nasce aqui. Campos vêm de `avc/conteudo/superficie-a.ts`,
 * leituras vêm de `avc/nucleo/derivacoes.ts`, e esta camada só desenha (E-29).
 *
 * ⚠️ O que a tela precisa mostrar sem inventar:
 *   · os três estados de resposta distinguíveis (E-37);
 *   · toda leitura com os insumos e a fonte que a produziram (E-22, E-30);
 *   · ⛔ nenhum campo obrigatório (E-49) — a superfície não trava nada.
 *
 * ⚠️ OS CONTROLES SAÍRAM DAQUI (2026-08-28) e moram em `campos-clinicos.tsx`,
 * partilhados com as demais superfícies. As sete lições que a revisão de tela
 * produziu — barra em vez de só −/+, ARIA de rádio, rascunho, "não informado"
 * que ⛔ não parece número — passariam a existir em duas versões, e a próxima
 * correção acertaria uma delas.
 *
 * ⚠️ O **controle de hora** foi o último a sair (2026-08-29). Ele ficou aqui
 * enquanto era exclusivo desta superfície — e deixou de ser: a Superfície B já
 * declarava um campo `tipo: "hora"` que a tela ⛔ não sabia desenhar, e a C
 * precisa do horário da tomografia.
 */
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PRIORIDADE_A, GRUPOS_A, TODOS_OS_CAMPOS_A } from "../../avc/conteudo/superficie-a";
import { camposDoGrupo } from "../../avc/conteudo/campo";
import { leiturasDaSuperficieA } from "../../avc/nucleo/derivacoes";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import { valorAtual } from "../../avc/nucleo/estado";
import { instanciaAberta, valorNaInstancia } from "../../avc/nucleo/instancia";
import {
  CabecalhoDeBloco,
  CampoDaSuperficie,
  PainelDeLeituras,
  useDetalhes,
} from "./campos-clinicos";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { useTr } from "../../lib/use-tr";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";

type Props = {
  estado: EstadoAvc;
  /** "Agora", lido pelo dono pela porta única de Q-01. ⛔ Nenhum relógio aqui. */
  agora: number;
  onEscolher: (campo: string, valor: string) => void;
  onMedir: (campo: string, valor: number) => void;
  onHora: (campo: string, instante: number, relogio?: string) => void;
  /** ⚠️ Desfazer é operação de primeira classe (§7.16) — ⛔ não apaga, corrige. */
  onDesfazer: (campo: string) => void;
  /**
   * ⚠️⚠️ NOVA AFERIÇÃO — o gesto que abre outra medida (D-120).
   *
   * ⚠️ Sem ele, editar a sistólica depois de registrar a PA seria ambíguo entre
   * **correção** e **nova medida** — e a ambiguidade ⛔ não é de interface: ela
   * muda o que a trilha AFIRMA sobre o paciente (§3.4). *"Medi a PA"* contado
   * como *"tratei a PA"* é a fronteira que §2.10 nomeia.
   */
  onNovaMedida: (tipo: string) => void;
};

export default function SuperficieA({
  estado,
  agora,
  onEscolher,
  onMedir,
  onHora,
  onDesfazer,
  onNovaMedida,
}: Props) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const leituras = leiturasDaSuperficieA(estado);
  const detalhes = useDetalhes();

  const rotuloDoCampo = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of TODOS_OS_CAMPOS_A) m[c.id] = c.rotulo;
    return m;
  }, []);

  function numeroGravado(id: string): number | undefined {
    const f = valorAtual(estado, id);
    return typeof f?.valor === "number" ? f.valor : undefined;
  }

  function instanteGravado(id: string): number | undefined {
    const f = valorAtual(estado, id);
    return typeof f?.valor === "number" ? f.valor : undefined;
  }

  /**
   * ⚠️⚠️ O FATO DO CAMPO **NA AFERIÇÃO ABERTA** — e ⛔ não o último da trilha.
   *
   * ── O DEFEITO QUE ISTO FECHA (achado pelo e2e de Correções, 2026-08-30) ────
   *
   * A tela lia `valorAtual`, que devolve o **último valor do campo em qualquer
   * instância**. Depois de tocar em **Nova medida**, a aferição nova ⛔ não tinha
   * PAS ⛔ nenhuma — e o controle reaparecia mostrando **210**, o valor da medida
   * anterior, **a um toque de virar uma aferição que ⛔ ninguém fez**.
   *
   * ⚠️⚠️ É a família do **E-52**: dado desconhecido apresentado como se fosse
   * medida. E aqui era pior que fabricar na trilha — a tela **convidava** o
   * médico a fabricar, com o número já posicionado.
   *
   * ⛔ Campo sem instância continua lendo a trilha inteira: é o comportamento
   * certo para peso, glicemia e afins, que ⛔ não são aferição composta.
   */
  function fatoDoCampo(campo: { id: string; instanciaDe?: string }) {
    if (!campo.instanciaDe) return valorAtual(estado, campo.id);
    const aberta = instanciaAberta(estado, campo.instanciaDe);
    return aberta === undefined ? undefined : valorNaInstancia(estado, aberta, campo.id);
  }

  /** ⚠️ "Ninguém sabe dizer" — ⛔ diferente de não ter sido perguntado (E-02). */
  /** ⚠️ ⛔ Só oferece "nova medida" quando já existe uma medida para suceder. */
  function haMedidaAberta(grupo: { campos: readonly { id: string }[] }): boolean {
    return grupo.campos.some((c) => valorAtual(estado, c.id) !== undefined);
  }

  function marcadoDesconhecido(id: string): boolean {
    return String(valorAtual(estado, id)?.valor ?? "") === "nao_sei";
  }

  return (
    <View style={e.raiz} testID="avc-superficie-a-conteudo">
      {/**
        * ⚠️⚠️ ESTABILIZAÇÃO PRIMEIRO — moldura de **prioridade**, e ⛔ não conduta.
        *
        * ⛔ ⛔ Nenhuma meta, ⛔ nenhum fármaco, ⛔ nenhum limiar, ⛔ nenhum "se… então":
        * qualquer um deles exigiria fonte transcrita (**E-31**), e o card de ACLS
        * — que os tem — ⛔ **não** foi importado.
        */}
      <View style={e.prioridade} testID="avc-a-prioridade">
        <Text style={e.prioridadeTitulo}>{tr(PRIORIDADE_A.titulo)}</Text>
        <Text style={e.prioridadeFrase}>{tr(PRIORIDADE_A.frase)}</Text>
        <Text style={e.prioridadeNota}>{tr(PRIORIDADE_A.nota)}</Text>
      </View>

      {GRUPOS_A.map((grupo) => (
        <View key={grupo.id} style={e.grupo} testID={`avc-grupo-${grupo.id}`}>
          <CabecalhoDeBloco titulo={grupo.titulo} testID={`avc-bloco-${grupo.id}`} />
          {/**
            * ⚠️⚠️ "NOVA MEDIDA" — o gesto explícito de §3.4, e ⛔ só onde há
            * aferição composta. Ele ⛔ não aparece por estética: sem um gesto
            * nomeado, ⛔ não há como distinguir *"o paciente foi medido de novo"*
            * de *"aquele valor ⛔ nunca foi verdade"*.
            */}
          {grupo.campos.some((c) => c.instanciaDe) && haMedidaAberta(grupo) ? (
            <Pressable
              style={e.novaMedida}
              accessibilityRole="button"
              testID={`avc-nova-medida-${grupo.id}`}
              onPress={() => onNovaMedida(grupo.campos.find((c) => c.instanciaDe)!.instanciaDe!)}
            >
              <Text style={e.novaMedidaTexto}>{tr("Nova medida")}</Text>
            </Pressable>
          ) : null}
          {camposDoGrupo(grupo).map((campo) => (
            <CampoDaSuperficie
              /**
               * ── ⛔ A `key` POR INSTÂNCIA FOI REMOVIDA (2026-08-30) ──────────
               *
               * ⚠️ Ela existia como defesa em profundidade para o **rascunho ⛔ não
               * confirmado**: mover a barra e, sem soltar, abrir "Nova medida".
               *
               * ⛔⛔ **O cenário ⛔ não é alcançável.** O `NumericStepper` confirma em
               * `onSlidingComplete`, que dispara ao **soltar** — e para tocar em
               * "Nova medida" o dedo precisa sair da barra antes. Os botões
               * `−`/`+` confirmam a cada toque. ⛔ Não há caminho em que um
               * rascunho sobreviva até a troca de aferição.
               *
               * ⚠️ E a mutação provou: removê-la ⛔ não quebrava teste ⛔ nenhum. Quem
               * conserta o defeito é `fatoDoCampo`, lendo a instância aberta.
               * ⛔ Código defensivo cuja necessidade ⛔ não se consegue medir ⛔ não fica.
               */
              key={campo.id}
              campo={campo}
              casaAtual="estabilizacao"
              bruto={String(fatoDoCampo(campo)?.valor ?? "")}
              numero={(() => {
                const f = fatoDoCampo(campo);
                return typeof f?.valor === "number" ? f.valor : undefined;
              })()}
              agora={agora}
              detalheAberto={detalhes.aberto(campo.id)}
              onAlternarDetalhe={() => detalhes.alternar(campo.id)}
              onEscolher={onEscolher}
              onMedir={onMedir}
              onHora={onHora}
              onDesfazer={onDesfazer}
              nomeDaCasa="Paciente"
            />
          ))}
        </View>
      ))}

      <PainelDeLeituras
        leituras={leituras}
        rotuloDoCampo={rotuloDoCampo}
        detalheAberto={detalhes.aberto}
        onAlternarDetalhe={detalhes.alternar}
      />
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    raiz: { gap: ESPACO.md },
    /**
     * ⚠️ Card de prioridade: destaque **sem** cor de espécie clínica — ele ⛔ não é
     * um estado do paciente, é a ordem de leitura da tela (**E-39**).
     */
    prioridade: {
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.border,
      padding: ESPACO.md, gap: ESPACO.xs,
    },
    prioridadeTitulo: {
      color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "800",
    },
    prioridadeFrase: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize },
    prioridadeNota: {
      color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize,
    },
    grupo: { gap: ESPACO.xs },
    novaMedida: {
      alignSelf: "flex-start",
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
    },
    novaMedidaTexto: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.body.fontSize,
      fontWeight: "600",
    },
  });
