import type { CanonicalDrug } from "./types";

/**
 * Tenecteplase (TNK) — fonte canônica por INDICAÇÃO.
 *
 * REGRA DE GOVERNANÇA:
 * - apresentação comercial e preparo: fonte do produto/bula brasileira;
 * - cada indicação clínica: fonte específica da indicação;
 * - a redução de dose em idosos no STEMI NÃO é armazenada como regra universal.
 *   O legado atual já restringe essa redução a um contexto farmacoinvasivo
 *   específico; essa condição precisa de governança própria antes de migrar.
 */
export const TENECTEPLASE_CANONICAL: CanonicalDrug = {
  id: "tenecteplase",
  genericName: "Tenecteplase",
  aliases: ["TNK", "Metalyse"],
  presentations: [
    {
      label: "Metalyse 40 mg — pó liofilizado + 8 mL de diluente",
      concentration: "5 mg/mL após reconstituição",
      vialAmount: "40 mg (8.000 U)",
      source: {
        reference: "Metalyse — bula profissional brasileira / Bulário ANVISA",
        reviewedAt: "2026-09-01",
      },
    },
    {
      label: "Metalyse 50 mg — pó liofilizado + 10 mL de diluente",
      concentration: "5 mg/mL após reconstituição",
      vialAmount: "50 mg (10.000 U)",
      source: {
        reference: "Metalyse — bula profissional brasileira / Bulário ANVISA",
        reviewedAt: "2026-09-01",
      },
    },
  ],
  instructions: [
    {
      indicationId: "avc-isquemico-trombolise-iv",
      indicationLabel: "AVC isquêmico agudo — trombólise intravenosa em paciente elegível",
      dose: "0,25 mg/kg",
      route: "IV em bolus único",
      maximum: "25 mg",
      source: {
        reference: "AHA/ASA 2026 — Guideline for the Early Management of Patients With Acute Ischemic Stroke",
        version: "2026",
        reviewedAt: "2026-09-01",
      },
    },
    {
      indicationId: "stemi_fibrinolise_padrao",
      indicationLabel: "STEMI — fibrinólise com tenecteplase quando indicada",
      dose: "<60 kg: 30 mg; 60–69 kg: 35 mg; 70–79 kg: 40 mg; 80–89 kg: 45 mg; ≥90 kg: 50 mg",
      route: "IV em bolus único",
      maximum: "50 mg no regime padrão",
      source: {
        reference: "2025 ACC/AHA/ACEP/NAEMSP/SCAI Guideline for Acute Coronary Syndromes — fibrinolytic agents for STEMI",
        version: "2025",
        reviewedAt: "2026-09-01",
      },
      reassessmentId: "stemi_reavaliar_reperfusao_60_90min",
    },
  ],
};
