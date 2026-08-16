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

export const ENOXAPARINA_APRESENTACAO =
  "APRESENTAÇÃO — seringas PREENCHIDAS em degraus fixos: 20, 40, 60, 80 e 100 mg, todas a 100 mg/mL (ou seja, 60 mg = 0,6 mL). A dose por peso raramente cai num degrau exato: use a seringa graduada e DESPREZE o excedente, sem arredondar para o degrau de cima. ⚠️ Arredondar 68 mg para 80 mg é 18% de anticoagulante a mais em quem talvez já vá receber fibrinolítico e dupla antiagregação. Confira a graduação da seringa em uso antes de desprezar volume.";
