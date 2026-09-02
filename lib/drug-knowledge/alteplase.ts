import type { CanonicalDrug } from "./types";

/**
 * Alteplase (rt-PA) — entrada canônica inicial SOMENTE para AVC isquêmico.
 *
 * Esta migração não tenta unificar regimes de TEP/IAM com AVC. O mesmo fármaco
 * tem esquemas diferentes por indicação; cada um precisa de revisão e fonte
 * próprias antes de entrar na base canônica.
 */
export const ALTEPLASE_CANONICAL: CanonicalDrug = {
  id: "alteplase",
  genericName: "Alteplase",
  aliases: ["rt-PA", "tPA"],
  presentations: [],
  instructions: [
    {
      indicationId: "avc_isquemico_ivt",
      indicationLabel: "AVC isquêmico — trombólise intravenosa",
      dose: "0,9 mg/kg",
      route: "IV",
      rate: "10% da dose em bolus por 1 min; restante em infusão por 60 min",
      maximum: "90 mg",
      source: {
        reference: "AHA/ASA — 2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke",
        version: "2026",
        reviewedAt: "2026-09-01",
      },
      reassessmentId: "avc_pos_trombolise",
    },
  ],
};
