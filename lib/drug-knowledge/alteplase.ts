import type { CanonicalDrug } from "./types";

/**
 * Alteplase (rt-PA) — fonte canônica por INDICAÇÃO.
 *
 * AVC e TEP usam o mesmo fármaco com regimes diferentes. Eles permanecem
 * separados por indicationId e fonte clínica. PCR atribuída ao TEP NÃO recebe
 * dose canônica aqui porque a diretriz AHA 2025 não fixa um esquema único para
 * esse cenário; o módulo legado mantém a discussão contextual já existente.
 *
 * APRESENTAÇÕES NO BRASIL:
 * A lista oficial CMED/ANVISA vigente consultada em 2026 mantém Actilyse 10 mg,
 * 20 mg e 50 mg, cada apresentação acompanhada do respectivo diluente de
 * 10 mL, 20 mL e 50 mL. A concentração de 1 mg/mL abaixo é consequência
 * aritmética direta dessas apresentações, não uma regra clínica de dose.
 */
export const ALTEPLASE_CANONICAL: CanonicalDrug = {
  id: "alteplase",
  genericName: "Alteplase",
  aliases: ["rt-PA", "tPA", "Actilyse"],
  presentations: [
    {
      label: "Actilyse 10 mg — pó liofilizado + 10 mL de diluente",
      concentration: "1 mg/mL após reconstituição",
      ampouleVolumeMl: 10,
      vialAmount: "10 mg",
      source: {
        reference: "ANVISA/CMED — lista oficial de apresentações comercializadas no Brasil (Actilyse/al­teplase)",
        version: "consulta 2026",
        reviewedAt: "2026-09-03",
      },
    },
    {
      label: "Actilyse 20 mg — pó liofilizado + 20 mL de diluente",
      concentration: "1 mg/mL após reconstituição",
      ampouleVolumeMl: 20,
      vialAmount: "20 mg",
      source: {
        reference: "ANVISA/CMED — lista oficial de apresentações comercializadas no Brasil (Actilyse/al­teplase)",
        version: "consulta 2026",
        reviewedAt: "2026-09-03",
      },
    },
    {
      label: "Actilyse 50 mg — pó liofilizado + 50 mL de diluente",
      concentration: "1 mg/mL após reconstituição",
      ampouleVolumeMl: 50,
      vialAmount: "50 mg",
      source: {
        reference: "ANVISA/CMED — lista oficial de apresentações comercializadas no Brasil (Actilyse/al­teplase)",
        version: "consulta 2026",
        reviewedAt: "2026-09-03",
      },
    },
  ],
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
    {
      indicationId: "tep_agudo_trombolise_sistemica",
      indicationLabel: "TEP agudo — trombólise sistêmica quando indicada",
      dose: "100 mg",
      route: "IV",
      rate: "infusão sistêmica em 2 h",
      source: {
        reference: "AHA/ACC/ACCP/ACEP/CHEST/SCAI/SHM/SIR/SVM/SVN — Acute Pulmonary Embolism Guideline",
        version: "2026",
        reviewedAt: "2026-09-01",
      },
      reassessmentId: "tep_pos_trombolise",
    },
  ],
};
