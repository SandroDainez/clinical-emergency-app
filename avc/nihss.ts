import { NIHSS_ITEMS } from "./protocol-config";

export function computeNihssTotal(scores: Record<string, number | null>) {
  return NIHSS_ITEMS.reduce((sum, item) => sum + (scores[item.id] ?? 0), 0);
}

export function isNihssComplete(scores: Record<string, number | null>) {
  return NIHSS_ITEMS.every((item) => scores[item.id] != null);
}

/**
 * ── FAIXAS DE GRAVIDADE DO NIHSS — FONTE ÚNICA, DONA AQUI ────────────────────
 *
 * Vive no módulo AVC, e não nas Calculadoras, porque é AQUI que a
 * classificação participa de decisão: o AVC pontua os 15 itens, sabe a
 * lateralidade, avalia incapacitância (`hasPotentiallyDisablingDeficit`) e
 * conhece a janela. As Calculadoras CONSOMEM esta tabela.
 *
 * ── A DIVERGÊNCIA QUE ORIGINOU A UNIFICAÇÃO ──────────────────────────────────
 *
 * O app tinha DUAS classificações do mesmo escore, e elas não eram
 * equivalentes:
 *
 *   AVC           0 · 1–4 · 5–9 · 10–15 · 16–20 · 21+   (6 faixas)
 *   Calculadoras  0 · 1–4 ·  5–15  · 16–20 · 21+        (5 faixas)
 *
 * Um NIHSS 7 saía "AVC leve a moderado" numa tela e "moderado" na outra. O
 * caso é passado adiante por texto — plantão, transferência, registro — e
 * bastava o médico ter aberto a outra tela para o rótulo mudar.
 *
 * ── O QUE ESTA TABELA NÃO FAZ ────────────────────────────────────────────────
 *
 * Não indica conduta (R-19). O NIHSS mede DÉFICIT; a indicação de trombólise
 * sai de incapacitância + janela + contraindicações. NIHSS 3 com afasia
 * isolada ou hemianopsia é incapacitante e trombolisa; NIHSS 6 por déficits
 * sensitivos difusos pode não ser. O número sozinho não distingue os dois.
 */
export const NIHSS_FAIXAS = [
  { ate: 0, rotulo: "Sem déficit mensurável", tone: "green" },
  { ate: 4, rotulo: "AVC leve", tone: "yellow" },
  { ate: 9, rotulo: "AVC leve a moderado", tone: "yellow" },
  { ate: 15, rotulo: "AVC moderado", tone: "orange" },
  { ate: 20, rotulo: "AVC moderado a grave", tone: "orange" },
  { ate: 42, rotulo: "AVC grave", tone: "red" },
] as const;

/**
 * O que a tela de escore diz no lugar da conduta que ela não pode indicar.
 *
 * Literal sem interpolação: a varredura de tradução pula template com `${}`.
 */
export const NIHSS_SEM_INDICACAO =
  "Esta faixa descreve a GRAVIDADE do déficit — não indica reperfusão. A decisão de trombolisar ou trombectomizar depende de o déficit ser INCAPACITANTE, da janela e das contraindicações, que esta tela não pergunta. Déficit incapacitante trombolisa mesmo com NIHSS baixo (afasia isolada, hemianopsia); NIHSS mais alto por déficits sensitivos difusos pode não ser incapacitante. Abrir o módulo AVC, que avalia os três critérios.";

export function faixaNihss(total: number) {
  return NIHSS_FAIXAS.find((f) => total <= f.ate) ?? NIHSS_FAIXAS[NIHSS_FAIXAS.length - 1];
}

export function classifyNihss(total: number) {
  return faixaNihss(total).rotulo;
}

export function hasPotentiallyDisablingDeficit(scores: Record<string, number | null>) {
  return (
    (scores.nihss5a ?? 0) >= 2 ||
    (scores.nihss5b ?? 0) >= 2 ||
    (scores.nihss6a ?? 0) >= 2 ||
    (scores.nihss6b ?? 0) >= 2 ||
    (scores.nihss9 ?? 0) >= 1 ||
    (scores.nihss3 ?? 0) >= 1 ||
    (scores.nihss10 ?? 0) >= 1
  );
}
