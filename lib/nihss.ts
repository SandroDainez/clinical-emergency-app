/**
 * NIHSS — as faixas de gravidade da escala.
 *
 * ⚠️ MUDOU DE CASA (2026-08-27), vindo de `avc/nihss.ts`. A pasta `avc/`
 * pertencia ao módulo AVC, removido nesta etapa; mas a Calculadora Clínica tem
 * uma calculadora de NIHSS, e ela é área preservada.
 *
 * A escala é um INSTRUMENTO DE MEDIDA, não conduta de um módulo — ela mede a
 * gravidade do déficit e nada mais. O que ela NÃO diz (que gravidade não é
 * indicação de reperfusão) vive em `escores-limites.ts`, junto dos outros
 * limites de escore.
 */

export const NIHSS_FAIXAS = [
  { ate: 0, rotulo: "Sem déficit mensurável", tone: "green" },
  { ate: 4, rotulo: "AVC leve", tone: "yellow" },
  { ate: 9, rotulo: "AVC leve a moderado", tone: "yellow" },
  { ate: 15, rotulo: "AVC moderado", tone: "orange" },
  { ate: 20, rotulo: "AVC moderado a grave", tone: "orange" },
  { ate: 42, rotulo: "AVC grave", tone: "red" },
] as const;

export function faixaNihss(total: number) {
  return NIHSS_FAIXAS.find((f) => total <= f.ate) ?? NIHSS_FAIXAS[NIHSS_FAIXAS.length - 1];
}

export function classifyNihss(total: number) {
  return faixaNihss(total).rotulo;
}

/**
 * O TOTAL DITO COMO ELE É — AC-01, decisão do autor (2026-09-13).
 *
 * ⚠️ Com item não testável (UN), a soma ⛔ não é o total completo da escala, e o
 * texto diz quantos itens ficaram de fora: "14, com 1 item não testável".
 * `tr` traduz os fragmentos; sem ele, sai em português.
 */
export function textoDoTotalNihss(
  soma: number,
  naoTestaveis: number,
  tr: (pt: string) => string = (pt) => pt
): string {
  if (naoTestaveis <= 0) return String(soma);
  const resto = naoTestaveis === 1 ? tr("item não testável") : tr("itens não testáveis");
  return `${soma}, ${tr("com")} ${naoTestaveis} ${resto}`;
}

/**
 * ── ITEM NÃO TESTÁVEL (UN) — a regra ÚNICA do app (AC-01 · AC-29) ─────────
 *
 * Fonte: `protocols/fontes-verbatim/nih-nihss-2024.md` (NINDS, NIH Stroke Scale,
 * fev. 2024), itens 5, 6, 7 e 10: UN só por amputação ou fusão articular (5, 6,
 * 7) ou intubação ou outra barreira física (10), com explicação escrita; o 11
 * *"is never untestable"*.
 *
 * ⚠️ Mora AQUI porque o módulo AVC e a calculadora avulsa a usam — ⛔ nenhuma
 * cópia em lugar nenhum. Decisão do autor (2026-09-13), ⛔ não da fonte: UN fora
 * da soma; com UN a soma é limite inferior do escore (D-PEND-13).
 */
export const NAO_TESTAVEL = "nao_testavel" as const;

export type RespostaDoItemNihss = number | typeof NAO_TESTAVEL;

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
  /** Soma dos itens pontuados. ⚠️ Com UN, ⛔ não é o total completo: é limite inferior. */
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

/** A soma de uma escala NIHSS com os itens `ids`, pela regra UN única. */
export function somaDoNihssDe(
  ids: readonly string[],
  respostas: Readonly<Record<string, RespostaDoItemNihss | undefined>>,
  justificativas: Readonly<Record<string, string | undefined>> = {}
): SomaDoNihss {
  let soma = 0;
  let respondidos = 0;
  const naoTestaveis: string[] = [];
  const faltamJustificar: string[] = [];
  const invalidos: string[] = [];
  for (const id of ids) {
    const r = respostas[id];
    if (r === undefined) continue;
    respondidos += 1;
    if (r === NAO_TESTAVEL) {
      if (ITENS_QUE_ACEITAM_NAO_TESTAVEL[id] === undefined) {
        invalidos.push(id);
        continue;
      }
      naoTestaveis.push(id);
      if ((justificativas[id] ?? "").trim() === "") faltamJustificar.push(id);
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
    completa: respondidos === ids.length && faltamJustificar.length === 0 && invalidos.length === 0,
  };
}
