/**
 * Adrenalina EV em infusão contínua — anafilaxia refratária, em fonte única.
 *
 * ── DUAS FONTES, DUAS VEZES, MESMO NÚMERO ───────────────────────────────────
 *
 * ASBAI (boletim nov/2024, baseado no Practice Parameter americano 2023) e o
 * guideline clínico do RCH Melbourne concordam: a dose de PARTIDA é
 * 0,1 mcg/kg/min, com incrementos de 0,05 mcg/kg/min a cada 3 min conforme a
 * resposta. Nenhuma das duas declara teto fixo — as duas dizem "titular pela
 * resposta".
 *
 * ── O QUE NENHUM DOS DOIS ARQUIVOS DO APP DIZIA ─────────────────────────────
 *
 * A árvore (este arquivo) tinha "iniciar 0,1–0,3" — o 0,3 não é a partida em
 * fonte nenhuma; é onde a titulação PODE chegar, não onde ela começa. E tinha
 * "dose habitual: 0,05–1" — um teto sem citação, que é pior que não ter teto
 * (D-10): número solto convida a tratá-lo como limite quando não é.
 *
 * O engine morto (`anafilaxia-engine.ts`, código sem alcançabilidade — D-22)
 * usava 0,05–0,1 como PARTIDA em todo o arquivo. Não é erro aleatório: é a
 * dose de infusão PEDIÁTRICA (fonte canadense, mesma busca) aplicada como se
 * fosse a geral. Acharia isso o mesmo padrão do peso predito (R-12): duas
 * implementações, cada uma plausível sozinha, discordando por terem herdado
 * números de contextos diferentes.
 */
export const ADRENALINA_EV_ANAFILAXIA_DOSE =
  "Iniciar 0,1 mcg/kg/min; aumentar 0,05 mcg/kg/min a cada 3 min conforme a resposta (ASBAI 2024 / Practice Parameter 2023). Titular pela resposta clínica — nenhuma fonte declara teto fixo.";
