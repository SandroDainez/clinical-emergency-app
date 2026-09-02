import type { ProtocolEvidenceRegistry } from "../lib/protocol-evidence-registry";

export const AVC_EVIDENCE_REGISTRY: ProtocolEvidenceRegistry = {
  version: {
    protocolId: "avc_agudo_2024",
    clinicalVersion: "AHA-ASA-2026-reviewed-2026-09-01",
    publishedAt: "2026-09-01",
    recommendations: [
      {
        id: "avc_imagem_inicial_urgente",
        statement: "Realizar neuroimagem cerebral urgente para diferenciar AVC isquêmico de hemorragia e orientar reperfusão.",
        evidence: {
          reference: "AHA/ASA Guideline for the Early Management of Patients With Acute Ischemic Stroke",
          version: "2026",
          year: 2026,
          reviewedAt: "2026-09-01",
        },
      },
      {
        id: "avc_tenecteplase_025_max25",
        statement: "Quando trombólise IV com tenecteplase estiver indicada, usar 0,25 mg/kg, máximo 25 mg, em bolus único.",
        evidence: {
          reference: "AHA/ASA Guideline for the Early Management of Patients With Acute Ischemic Stroke",
          version: "2026",
          year: 2026,
          reviewedAt: "2026-09-01",
        },
      },
      {
        id: "avc_tempo_ultimo_visto_bem",
        statement: "Registrar o tempo a partir do último momento conhecido sem déficit / último visto bem para decisões de reperfusão.",
        evidence: {
          reference: "AHA/ASA Guideline for the Early Management of Patients With Acute Ischemic Stroke",
          version: "2026",
          year: 2026,
          reviewedAt: "2026-09-01",
        },
      },
    ],
  },
  bindings: [
    { nodeId: "tempo", recommendationIds: ["avc_tempo_ultimo_visto_bem"] },
    { nodeId: "tc", recommendationIds: ["avc_imagem_inicial_urgente"] },
    { nodeId: "isq_janela", recommendationIds: ["avc_tenecteplase_025_max25"] },
  ],
};
