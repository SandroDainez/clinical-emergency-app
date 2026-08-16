/**
 * Heparina não fracionada — apresentação e preparo, onde a dose é dada.
 *
 * R-48. O TEP prescreve bolus por peso (80 U/kg, teto 10.000) e infusão em
 * bomba (18 U/kg/h) — e o módulo inteiro tem DUAS menções de apresentação, para
 * quatro classes de fármaco.
 *
 * ⚠️ AQUI A ESCALA É O PERIGO. O frasco nacional é de 5.000 UI/mL, e a dose se
 * prescreve em MILHARES de unidades: um bolus de 5.600 U cabe em 1,1 mL. Errar
 * o zero na diluição é um fator de dez num anticoagulante pleno — e o TEP é o
 * cenário em que o paciente pode ir para trombólise de resgate logo depois.
 *
 * ── FONTES ABERTAS EM SESSÃO (2026-08-15) ───────────────────────────────────
 *
 *  · Apresentação nacional: heparina sódica 5.000 UI/mL, frasco-ampola de 5 mL
 *    (25.000 UI) — a mais usada em bomba —, e frasco de 5.000 UI/0,25 mL para
 *    uso subcutâneo. As duas convivem na mesma gaveta com rótulos parecidos.
 *  · ⚠️ A conferência da bula ANVISA em fonte primária não foi possível nesta
 *    sessão. Por isso o texto manda CONFERIR O ROTULO, e não afirma o preparo
 *    de um fabricante específico — mesma decisão da hidrocortisona.
 */

export const HNF_APRESENTACAO =
  "APRESENTAÇÃO E PREPARO — heparina sódica 5.000 UI/mL: o frasco-ampola de 5 mL tem 25.000 UI. ⚠️ CONFIRA O RÓTULO: convivem na mesma gaveta o frasco para BOMBA (5.000 UI/mL) e o de uso SUBCUTÂNEO, com aparência parecida. A dose se prescreve em MILHARES de unidades e o volume é pequeno — um bolus de 5.600 U cabe em pouco mais de 1 mL, e errar uma casa na diluição é um fator de DEZ num anticoagulante pleno. Diluir a solução de bomba em SF ou SG5% conforme o protocolo da unidade, e conferir a programação com um segundo profissional.";
