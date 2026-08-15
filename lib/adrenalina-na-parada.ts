/**
 * Adrenalina na PCR — a apresentação, na superfície onde a dose é dada.
 *
 * R-48, quarta ocorrência, e a mais previsível de todas: a Farmacologia
 * (superfície de CONSULTA) declara a apresentação no campo `source` —
 * "epinefrina 1 mg/mL, ampola 1 mL (Hipolabor / Cristália) — bula ANVISA" — e
 * o FLUXO da parada não a tinha em lugar nenhum. Busca por "1 mg/mL", "ampola",
 * "1:10.000" e "1:1.000" no reducer, nas notas de fase, no protocol.json e na
 * tela do ACLS: ZERO nas quatro.
 *
 * O card do fluxo dizia "Dose N · 1 mg IV/IO" e parava aí.
 *
 * ── POR QUE ISTO IMPORTA NA PARADA, E NÃO É PREZIOSISMO ─────────────────────
 *
 * Aqui a apresentação nacional AJUDA: 1 mg/mL em ampola de 1 mL significa uma
 * ampola inteira por dose, sem cálculo. Dizer isso em voz alta é o que impede
 * o erro que aparece quando alguém tenta lembrar da diluição de anafilaxia no
 * meio de uma parada — lá a adrenalina é 1:1.000 IM, e a confusão entre as
 * apresentações é conhecida.
 *
 * A menção ao 1:10.000 existe pelo motivo oposto: ele NÃO é o que está na
 * gaveta no Brasil, e o texto internacional que o médico leu na residência usa
 * essa nomenclatura. Nomear a equivalência é mais curto do que deixar alguém
 * procurando uma ampola que não existe.
 */
export const ADRENALINA_NA_PARADA_APRESENTACAO =
  "1 mg = UMA ampola inteira de adrenalina 1 mg/mL (1 mL) — sem diluir, seguida de flush de 20 mL e elevação do membro. É a apresentação nacional, e é a mesma ampola da anafilaxia: o que muda é a VIA e a dose (lá 0,5 mg IM). O \"1:10.000\" da literatura internacional é a mesma massa em 10 mL — não procure a ampola diluída, ela não é a padronizada aqui.";
