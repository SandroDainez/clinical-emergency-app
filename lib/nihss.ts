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
