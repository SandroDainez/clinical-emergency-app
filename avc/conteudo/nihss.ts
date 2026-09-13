/**
 * O NIHSS DO MÓDULO AVC — ⚠️ consumido da calculadora, ⛔ NÃO reescrito aqui.
 *
 * ── POR QUE ESTE ARQUIVO EXISTE, E POR QUE ELE ⛔ NÃO COPIA A ESCALA ────────
 *
 * A escala já vive no app, item a item, em `clinical-calculators-engine.ts`,
 * com fonte declarada:
 *
 *   Brott T, Adams HP Jr, Olinger CP, et al. *Measurements of acute cerebral
 *   infarction: a clinical examination scale.* Stroke. 1989;20(7):864–870
 *   (escala original) · versão traduzida e adaptada para o Brasil por Octávio
 *   Marques Pontes-Neto (HCFMRP-USP), conferida item a item.
 *
 * ⚠️⚠️ COPIAR OS 15 ITENS PARA CÁ SERIA O DEFEITO QUE A I6 DESCREVE, aplicado a
 * escore: duas cópias da mesma escala, as duas "funcionando", divergindo no dia
 * em que alguém corrigir uma delas — e o médico decidindo pela que ele abriu.
 * As regras condicionais (coma pontua 2 na sensibilidade e 3 na linguagem)
 * moram lá, e ⛔ ninguém as adivinha pelos rótulos.
 *
 * ── POR QUE ISTO É PERMITIDO (§10.1) ──────────────────────────────────────
 *
 * A spec libera consumir **calculadoras neutras — as que sobreviveram e ⛔ não
 * carregam fluxo**. O NIHSS MEDE e ⛔ não roteia: ⛔ não decide superfície, ⛔ não
 * abre etapa, ⛔ não conclui elegibilidade. ⛔ Isto ⛔ NÃO é herdar
 * `LEGACY_ACLS_RUNTIME` (§10.2) — ⛔ nenhum nó, ⛔ nenhum motor de árvore, ⛔ nenhum
 * `estado-clinico` entra por aqui.
 *
 * ⚠️ E a justificativa é caso a caso, como §10.3 exige: entra a DEFINIÇÃO da
 * escala, ⛔ não a tela dela, ⛔ não o cálculo de outra calculadora, ⛔ nada além.
 */

import { CALC_TOOLS, type ScoreTool, type ScoreVar } from "../../clinical-calculators-engine";

const ESCALA = CALC_TOOLS.find((t) => t.id === "nihss");

/**
 * ⚠️ SEM PISO SILENCIOSO: se a escala sumir da calculadora, isto é erro de
 * programação e grita. ⛔ Um módulo clínico ⛔ não pode continuar com meia escala
 * fingindo que está inteiro.
 */
if (!ESCALA || ESCALA.kind !== "score") {
  throw new Error("avc/conteudo/nihss: a escala NIHSS não foi encontrada nas calculadoras");
}

export const NIHSS: ScoreTool = ESCALA as ScoreTool;
export const ITENS_NIHSS: readonly ScoreVar[] = NIHSS.vars;

/** O prefixo dos campos de item na trilha — ⚠️ um fato por item (§3.1). */
export const CAMPO_DE_ITEM = (id: string) => `nihss_${id}`;

/**
 * ── ITEM NÃO TESTÁVEL (UN) — AC-01, 2026-09-13 ─────────────────────────────
 *
 * Fonte: `protocols/fontes-verbatim/nih-nihss-2024.md` (NINDS, *NIH Stroke
 * Scale*, fev. 2024), itens 5, 6, 7 e 10: *"Only in the case of amputation or
 * joint fusion…"* / *"Only if the patient is intubated or has other physical
 * barriers to producing speech, the examiner should record the score as
 * untestable (UN) and clearly write the explanation for this choice."* O item 11
 * *"is never untestable"*; o 1a exige resposta mesmo com tubo endotraqueal.
 *
 * ⚠️ DECISÃO DO AUTOR (2026-09-13), ⛔ não da fonte: o UN ⛔ não entra na soma, e o
 * total é dito como "X, com N itens não testáveis" — ⛔ nunca como total completo.
 * A folha de total do NIH ⛔ não traz regra para UN.
 */
export const FONTE_NIHSS_NIH = "protocols/fontes-verbatim/nih-nihss-2024.md";

/** O valor gravado no fato do item quando ele não pôde ser testado. */
export const NAO_TESTAVEL = "nao_testavel" as const;

export type RespostaDoItem = number | typeof NAO_TESTAVEL;

/** A justificativa escrita do UN — ⚠️ um fato próprio, ao lado do item. */
export const CAMPO_DA_JUSTIFICATIVA = (id: string) => `nihss_${id}_justificativa`;

/** ⚠️ SÓ estes itens aceitam UN, cada um com o motivo que a fonte admite. */
export const ITENS_QUE_ACEITAM_NAO_TESTAVEL: Readonly<Record<string, string>> = {
  "5a": "Amputação ou fusão articular no ombro",
  "5b": "Amputação ou fusão articular no ombro",
  "6a": "Amputação ou fusão articular no quadril",
  "6b": "Amputação ou fusão articular no quadril",
  "7": "Amputação ou fusão articular",
  "10": "Intubação ou outra barreira física à fala",
};

export const NOTA_NAO_TESTAVEL =
  "Não testável (UN) só em 5a, 5b, 6a, 6b e 7, por amputação ou fusão articular, e em 10, por intubação ou barreira física, sempre com justificativa escrita. UN não entra na soma.";

export type SomaDoNihss = {
  /** Soma dos itens pontuados. ⚠️ Com UN, ⛔ não é o total completo. */
  readonly soma: number;
  readonly naoTestaveis: readonly string[];
  /** Itens UN ainda sem justificativa escrita. */
  readonly faltamJustificar: readonly string[];
  /** Itens marcados UN sem que a fonte admita UN neles. */
  readonly invalidos: readonly string[];
  readonly respondidos: number;
  /** Todos respondidos, todo UN justificado, nenhum UN inválido. */
  readonly completa: boolean;
};

export function somaDoNihss(
  respostas: Readonly<Record<string, RespostaDoItem | undefined>>,
  justificativas: Readonly<Record<string, string | undefined>> = {}
): SomaDoNihss {
  let soma = 0;
  let respondidos = 0;
  const naoTestaveis: string[] = [];
  const faltamJustificar: string[] = [];
  const invalidos: string[] = [];
  for (const item of ITENS_NIHSS) {
    const r = respostas[item.id];
    if (r === undefined) continue;
    respondidos += 1;
    if (r === NAO_TESTAVEL) {
      if (ITENS_QUE_ACEITAM_NAO_TESTAVEL[item.id] === undefined) {
        invalidos.push(item.id);
        continue;
      }
      naoTestaveis.push(item.id);
      if ((justificativas[item.id] ?? "").trim() === "") faltamJustificar.push(item.id);
      continue;
    }
    soma += r;
  }
  return {
    soma,
    naoTestaveis,
    faltamJustificar,
    invalidos,
    respondidos,
    completa: respondidos === ITENS_NIHSS.length && faltamJustificar.length === 0 && invalidos.length === 0,
  };
}

/**
 * OS ITENS QUE A TABLE 4 USA POR NOME — ⚠️ o mapa que autoriza a derivação.
 *
 * ⚠️⚠️ CADA LINHA VEM DO VERBATIM (F-17, Table 4, p. e355), e ⛔ nenhuma foi
 * inferida por semelhança de nome:
 *
 *   · *"Complete hemianopsia (**≥2 on the NIHSS "vision" question**)"*;
 *   · *"Severe aphasia (**≥2 on the NIHSS "best language" question**)"*;
 *   · *"Severe hemi-attention or extinction to >1 modality (**≥2 on the NIHSS
 *     "extinction and inattention" question**)"*;
 *   · *"Any weakness limiting sustained effort against gravity (**≥2 on the
 *     NIHSS "motor" questions**)"*.
 *
 * ⚠️ O corte `≥2` é da FONTE, ⛔ não meu. E ⛔ ele não classifica déficit: ele diz
 * que o ACHADO está presente — quem julga incapacitância continua sendo o
 * médico (§2.8-6).
 */
export const ACHADOS_DERIVAVEIS: readonly {
  campo: string;
  itens: readonly string[];
  corte: number;
}[] = [
  { campo: "t4_hemianopsia_completa", itens: ["3"], corte: 2 },
  { campo: "t4_afasia_grave", itens: ["9"], corte: 2 },
  { campo: "t4_extincao_grave", itens: ["11"], corte: 2 },
  /**
   * ⚠️ "as questões motoras" são as QUATRO — braço e perna, dos dois lados. A
   * fonte diz *"motor questions"* no plural e ⛔ não nomeia um membro: qualquer
   * um deles ≥2 é "fraqueza limitando o esforço sustentado contra a gravidade".
   */
  { campo: "t4_fraqueza_contra_gravidade", itens: ["5a", "5b", "6a", "6b"], corte: 2 },
];

/**
 * OS ITENS MOTORES POR LADO — ⚠️ para a lateralidade, e SÓ quando ela for
 * realmente derivável.
 *
 * ⚠️⚠️ ⛔ A LATERALIDADE ⛔ NÃO É UM ACHADO DA TABLE 4: ela é registro de exame, e
 * a derivação aqui é ARITMÉTICA — qual lado pontuou mais nos itens motores. ⛔ Ela
 * ⛔ não vale quando os dois lados estão zerados: um déficit puramente visual,
 * sensitivo ou de linguagem tem lado, e os itens motores ⛔ não sabem qual é.
 * Nesse caso o app ⛔ não deriva nada e a pergunta continua com o médico.
 */
/**
 * AS OPÇÕES DA ESCALA QUE **CONTAM** PARA UM ACHADO — ⚠️ o glossário que o app
 * pode dar sem inventar nada.
 *
 * ── O PEDIDO (autor, 2026-08-29) ──────────────────────────────────────────
 *
 * *"Isso dá para ter uma descrição básica do que cada item significa, para o
 * usuário que não sabe bem o que é? Por exemplo hemianopsia… se o usuário não
 * lembra o que é."*
 *
 * ⚠️⚠️ O QUE ISTO ENTREGA, E O QUE ⛔ NÃO ENTREGA. Ele devolve **as opções da
 * própria escala** que satisfazem o corte — "2 · Hemianopsia completa", "3 ·
 * Cegueira bilateral" —, que é conteúdo com fonte (Brott 1989 + adaptação
 * brasileira) e diz ao médico exatamente o que a Table 4 está pedindo.
 *
 * ⛔ Ele ⛔ NÃO define o TERMO: "hemianopsia é a perda de metade do campo visual"
 * ⛔ não está em fonte nenhuma deste repositório, e escrevê-lo seria **E-31**
 * violada — a glosa clínica precisa de fonte ou da redação aprovada do autor.
 */
export function opcoesQueContam(campo: string): readonly string[] {
  const regra = ACHADOS_DERIVAVEIS.find((r) => r.campo === campo);
  if (!regra) return [];
  const vistas = new Set<string>();
  for (const item of regra.itens) {
    const def = ITENS_NIHSS.find((v) => v.id === item);
    if (!def) continue;
    for (const o of def.options) {
      if (o.points >= regra.corte) vistas.add(`${o.points} · ${o.label}`);
    }
  }
  return [...vistas];
}

export const MOTORES_POR_LADO = {
  esquerdo: ["5a", "6a"],
  direito: ["5b", "6b"],
} as const;
