/**
 * Amiodarona no paciente COM PULSO — regime completo, em fonte única.
 *
 * ⚠️ ESTE NÃO É O REGIME DA PCR. São três construtos diferentes no app, e
 * misturá-los é o erro que esta lib existe para impedir (R-36):
 *
 *   - PCR (FV/TV sem pulso): 300 mg em bolus → 2ª dose de 150 mg um ciclo
 *     depois. Vive no reducer do ACLS. NÃO entra aqui.
 *   - TV com pulso / taquiarritmia sustentada: 150 mg em 10 min + manutenção.
 *     É este arquivo.
 *   - FA estável no EAP: 300 mg (5–7 mg/kg) em 30–60 min — regime LENTO, com
 *     razão própria documentada naquele módulo. NÃO entra aqui.
 *
 * O QUE A FONTE CORRIGIU, e são três coisas — nenhuma delas "copiar o texto da
 * Farmacologia", que era a minha proposta inicial e estava errada:
 *
 * 1. A ÁRVORE PARAVA EM 6 h. Dizia "depois 1 mg/min por 6 h" e terminava,
 *    omitindo a fase de 0,5 mg/min por 18 h.
 *
 * 2. A FARMACOLOGIA TAMBÉM ESTAVA INCOMPLETA — parava nas 24 h e não tinha a
 *    dose de recorrência. Mais: rotulava a manutenção como "(pós-ROSC)", e a
 *    CATEGORIA está errada. Este regime é do paciente COM PULSO: quem reverteu
 *    uma TV com cardioversão não teve ROSC nenhum. O rótulo errado é pior que a
 *    omissão, porque manda a pessoa procurar noutro lugar — e o lugar certo era
 *    aquele.
 *
 * 3. O "TETO DE 2,2 g/24 h" QUE EU IA ESCREVER NÃO EXISTE NA BULA. A bula não
 *    estabelece máximo; o que ela diz é que doses médias diárias acima de
 *    2100 mg se associaram a mais hipotensão em ensaios controlados. É
 *    OBSERVAÇÃO DE ENSAIO virada em regra pela literatura de treinamento —
 *    R-39 na forma exata, e com o agravante de que o número está numa descrição
 *    de efeito adverso, não em tabela de posologia. Entra como observação.
 *
 * FONTE ABERTA EM SESSÃO (2026-08-15):
 *  - Bula FDA/DailyMed — amiodarona HCl injetável (setid b0eb6c22-7553-4e3f-
 *    a06d-20a186ced99a), seção DOSAGE AND ADMINISTRATION: "150 mg over the
 *    FIRST 10 minutes (15 mg/min)"; "360 mg over the NEXT 6 hours (1 mg/min)";
 *    "540 mg over the REMAINING 18 hours (0.5 mg/min)"; "continue the
 *    maintenance infusion rate of 0.5 mg/min (720 mg per 24 hours)" e "a
 *    maintenance infusion of up to 0.5 mg/min can be continued for 2 to 3
 *    weeks"; recorrência — "150 mg supplemental infusions ... mixed in 100 mL
 *    of D5W and infused over 10 minutes"; "mean daily doses above 2100 mg were
 *    associated with an increased risk of hypotension".
 *  - StatPearls — Amiodarone (NCBI NBK482154), corroborando 150 mg/10 min →
 *    1 mg/min × 6 h → 0,5 mg/min × 18 h na taquicardia de complexo largo.
 */

export const AMIODARONA_COM_PULSO_CARGA =
  "AMIODARONA — 150 mg IV em 10 min (diluídos em 100 mL de SG5%). ⚠️ Este é o regime do paciente COM PULSO. NÃO é o da PCR, onde a 1ª dose é 300 mg em bolus.";

export const AMIODARONA_COM_PULSO_MANUTENCAO =
  "MANUTENÇÃO, que é do regime COM PULSO — não é esquema de pós-PCR: 1 mg/min por 6 h (360 mg), depois 0,5 mg/min por 18 h (540 mg) — cerca de 1 g nas primeiras 24 h. Passadas as 24 h, mantém-se 0,5 mg/min (720 mg/dia), e a bula admite até 2–3 semanas nessa taxa, independentemente de idade, função renal ou função ventricular.";

/**
 * A árvore dizia "repetir se houver recorrência" — sem dose, sem tempo, sem
 * diluição. A bula dá os três, e é a informação mais operacional do fármaco:
 * a recorrência é o que de fato acontece.
 */
export const AMIODARONA_COM_PULSO_RECORRENCIA =
  "SE A ARRITMIA RECORRER durante a infusão: 150 mg suplementares em 100 mL de SG5%, infundidos em 10 min — a mesma carga, repetida. Não é preciso reiniciar o esquema: a manutenção continua na taxa em que estava.";

export const AMIODARONA_COM_PULSO_VIGILANCIA =
  "VIGIAR: PA (hipotensão é o efeito adverso limitante e é dose e velocidade-dependente — não acelerar a carga), bradicardia, bloqueio AV e QT. ⚠️ EVITAR em torsades e em QT longo: a amiodarona prolonga o QT, e ali o fármaco é o magnésio. NÃO usar em FA pré-excitada (WPW). Sem teto máximo declarado em bula, mas doses médias diárias acima de ~2100 mg associaram-se a mais hipotensão em ensaios controlados — é observação de ensaio, não limite regulatório.";
