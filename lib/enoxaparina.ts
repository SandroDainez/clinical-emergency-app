/**
 * Enoxaparina — apresentação e o que fazer quando a dose não cai na seringa.
 *
 * R-48. O módulo calcula {enoxaPorPeso} e manda administrar. A apresentação
 * brasileira é de SERINGAS PRONTAS em degraus fixos, e a dose calculada por
 * peso quase nunca coincide com um degrau — o app dava o número sem dizer como
 * se chega a ele.
 *
 * ── FONTES ABERTAS EM SESSÃO (2026-08-15) ───────────────────────────────────
 *
 *  · Apresentação nacional (Clexane/Sanofi e genéricos): seringas preenchidas
 *    de 20 mg/0,2 mL · 40 mg/0,4 mL · 60 mg/0,6 mL · 80 mg/0,8 mL ·
 *    100 mg/1 mL — todas na concentração de 100 mg/mL, o que torna a regra de
 *    volume direta.
 *  · ⚠️ A conferência da bula ANVISA em fonte primária não foi possível nesta
 *    sessão; a concentração de 100 mg/mL e os degraus são convergentes entre
 *    referências. O texto manda conferir a graduação da seringa em uso, e não
 *    afirma volumes de outros fabricantes.
 */

/**
 * ⚠️ DOIS REGIMES, E O QUE OS SEPARA NÃO É O FÁRMACO — É O QUE ELA ACOMPANHA.
 *
 * R-36. Alguém que veja "enoxaparina 1 mg/kg 12/12h" nos dois módulos vai
 * querer "unificar" — e apagaria justamente o que é específico do infarto.
 *
 * No IAM, a enoxaparina acompanha FIBRINÓLISE. É isso que explica as duas
 * particularidades:
 *   · o BOLUS IV de 30 mg existe para ter anticoagulação plena no momento em
 *     que o trombolítico entra — não faz sentido fora desse contexto;
 *   · a REDUÇÃO POR IDADE (sem bolus, 0,75 mg/kg a partir de 75 anos) veio do
 *     excesso de hemorragia intracraniana no idoso trombolisado.
 *
 * No TEP/TVP ela é a ANTICOAGULAÇÃO em si, sem trombolítico junto: 1 mg/kg
 * 12/12h, sem bolus e sem corte etário.
 */
export const ENOXAPARINA_REGIME_IAM =
  "ENOXAPARINA NO IAM COM FIBRINÓLISE — < 75 anos: bolus IV de 30 mg + 1 mg/kg SC 12/12h. ≥ 75 anos: SEM bolus IV, 0,75 mg/kg SC 12/12h. ⚠️ O bolus e o corte por idade são DESTE contexto: o bolus existe para cobrir o momento do trombolítico, e a redução no idoso veio do excesso de hemorragia intracraniana em quem foi trombolisado. Fora da fibrinólise, nenhum dos dois se aplica.";

export const ENOXAPARINA_REGIME_TEV =
  "ENOXAPARINA NO TEP/TVP — 1 mg/kg SC 12/12h, SEM bolus IV e SEM redução por idade: aqui ela é a anticoagulação em si, não adjuvante de trombolítico. Alternativa em dose única diária: 1,5 mg/kg 24/24h. ⚠️ AJUSTE RENAL: com ClCr < 30 mL/min, espaçar para 1 mg/kg 24/24h — a enoxaparina é de eliminação renal e acumula.";

export const ENOXAPARINA_APRESENTACAO =
  "APRESENTAÇÃO — seringas PREENCHIDAS em degraus fixos: 20, 40, 60, 80 e 100 mg, todas a 100 mg/mL (ou seja, 60 mg = 0,6 mL). A dose por peso raramente cai num degrau exato: use a seringa graduada e DESPREZE o excedente, sem arredondar para o degrau de cima. ⚠️ Arredondar 68 mg para 80 mg é 18% de anticoagulante a mais em quem talvez já vá receber fibrinolítico e dupla antiagregação. Confira a graduação da seringa em uso antes de desprezar volume.";
