import type { CanonicalDrug } from "./types";

/**
 * Amiodarona — fonte canônica por INDICAÇÃO.
 *
 * A apresentação comercial e cada regime clínico têm proveniência separada.
 * Isto evita o defeito clássico de tratar “amiodarona” como se tivesse uma dose
 * universal. O legado continua ativo; esta entrada nasce em paralelo e só deve
 * substituí-lo depois de paridade demonstrada.
 */
export const AMIODARONA_CANONICA: CanonicalDrug = {
  id: "amiodarona",
  genericName: "Amiodarona",
  aliases: ["cloridrato de amiodarona"],
  presentations: [
    {
      label: "Solução injetável 50 mg/mL — ampola 3 mL",
      concentration: "50 mg/mL",
      ampouleVolumeMl: 3,
      vialAmount: "150 mg/3 mL",
      source: {
        reference: "ANVISA — rótulo aprovado de cloridrato de amiodarona solução injetável 50 mg/mL, ampola 3 mL",
        version: "registro 1.0041.0206.001-9",
        reviewedAt: "2026-09-03",
      },
    },
  ],
  instructions: [
    {
      indicationId: "pcr_fv_tv_sem_pulso",
      indicationLabel: "PCR — fibrilação ventricular / taquicardia ventricular sem pulso refratária",
      dose: "1ª dose 300 mg; 2ª dose 150 mg",
      route: "IV/IO",
      rate: "bolus",
      source: {
        reference: "American Heart Association — Adult Cardiac Arrest Algorithm",
        version: "2025",
        reviewedAt: "2026-09-01",
      },
      reassessmentId: "pcr_reavaliar_ritmo_pulso",
    },
    {
      indicationId: "tv_com_pulso",
      indicationLabel: "Taquiarritmia ventricular com pulso — carga e manutenção IV",
      dose: "150 mg em 10 min",
      route: "IV",
      dilution: "100 mL de SG5% no regime legado atualmente usado pelo app",
      rate: "150 mg/10 min; depois 1 mg/min por 6 h; depois 0,5 mg/min por 18 h",
      interval: "recorrência: 150 mg suplementares em 10 min conforme regime de bula",
      source: {
        reference: "FDA — amiodarone HCl injection / Nexterone prescribing information",
        version: "label 2021",
        reviewedAt: "2026-09-01",
      },
      reassessmentId: "taquiarritmia_reavaliar_ritmo_hemodinamica",
    },
  ],
};
