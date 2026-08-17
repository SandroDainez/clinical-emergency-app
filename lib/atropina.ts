/**
 * Atropina — apresentações e dose, em fonte única.
 *
 * Criada ANTES do segundo sítio, não depois: a Bradicardia é o próximo módulo
 * desta fase e é exatamente onde a atropina reaparece. Segurar para "quando
 * divergir" significaria um segundo passe no mesmo arquivo — foi o que
 * aconteceu com a própria atropina e com a adrenalina nesta auditoria.
 *
 * As apresentações vêm da correção da Fase 1: existem DUAS concentrações no
 * mercado nacional, e a diferença importa porque a dose é a mesma em
 * miligramas mas o VOLUME muda por 2×.
 */

export const ATROPINA_APRESENTACOES =
  "APRESENTAÇÕES NACIONAIS — são DUAS, e o volume muda: sulfato de atropina 0,25 mg/mL e 0,5 mg/mL, ampola de 1 mL. A de 0,25 mg/mL é a padronizada pelo SUS, e nela 1 mg exige QUATRO ampolas. Conferir o rótulo antes de aspirar: a dose em miligramas é a mesma, o volume não.";

export const ATROPINA_DOSE_BRADICARDIA =
  "ATROPINA — 1 mg IV em bolus, repetir a cada 3–5 min conforme a resposta, até o total de 3 mg (efeito vagolítico máximo). Acima disso não há ganho: se a bradicardia persistir, o caminho é marcapasso transcutâneo ou infusão cronotrópica, não mais atropina.";

// ⚠️ ATROPINA_ONDE_NAO_FUNCIONA REMOVIDA (2026-08-17) — e não por ser
// desnecessária: o conteúdo JÁ CHEGA ao médico por outra via. O nó da
// bradicardia diz "⚠️ Pouco eficaz em Mobitz II e BAV total (bloqueio
// infranodal) — NÃO atrasar o marcapasso". Esta constante era uma SEGUNDA
// REDAÇÃO da mesma coisa, mais longa, que nenhum nó consumia.
//
// Fonte única que virou fonte DUPLA e a segunda morreu — o padrão real da
// classe, e o oposto do que parecia ("conteúdo clínico invisível").

