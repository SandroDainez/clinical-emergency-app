import type { CanonicalDrug } from "./types";

/**
 * Primeiro fármaco migrado para a Drug Knowledge Base do Emergências 2.0.
 *
 * REGRA DE GOVERNANÇA:
 * - apresentação comercial e preparo: fonte do produto/bula brasileira;
 * - indicação e dose no AVC: fonte clínica específica da indicação.
 *
 * Isto é deliberado: a existência de uma apresentação no Brasil não transforma
 * automaticamente toda indicação de guideline em indicação de bula, e a bula
 * da apresentação não deve ser usada como substituto de uma diretriz de AVC.
 *
 * A fonte legada (`lib/tenecteplase.ts`) permanece ativa durante a migração.
 * Este objeto ainda não altera cálculo nem conduta em nenhuma tela.
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
  ],
};
