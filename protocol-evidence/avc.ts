import type { ProtocolEvidenceRegistry } from "../lib/protocol-evidence-registry";

export const AVC_EVIDENCE_REGISTRY: ProtocolEvidenceRegistry = {
  version: {
    protocolId: "avc_agudo_2024",
    clinicalVersion: "AHA-ASA-2026-reviewed-2026-09-02",
    publishedAt: "2026-09-02",
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
        id: "avc_alteplase_09_max90",
        statement: "Quando trombólise IV com alteplase estiver indicada, usar 0,9 mg/kg, máximo 90 mg; 10% em bolus por 1 minuto e o restante em infusão por 60 minutos.",
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
      {
        id: "hic_anticoagulante_identificar_e_reverter",
        statement:
          "Na hemorragia intracerebral, obter rapidamente uso de anticoagulante, agente e última dose, função renal e estudos de coagulação; ausência de história não equivale a ausência de anticoagulação. Quando houver anticoagulação clinicamente relevante conhecida ou fortemente suspeita, interromper o anticoagulante e realizar reversão rapidamente sem atrasá-la por exames adicionais.",
        evidence: {
          reference: "AHA/ASA Guideline for the Management of Patients With Spontaneous Intracerebral Hemorrhage",
          version: "2022-current review",
          year: 2022,
          reviewedAt: "2026-09-02",
        },
      },
    ],
  },
  bindings: [
    { nodeId: "tempo", recommendationIds: ["avc_tempo_ultimo_visto_bem"] },
    { nodeId: "tc", recommendationIds: ["avc_imagem_inicial_urgente"] },
    {
      nodeId: "isq_janela",
      recommendationIds: ["avc_tenecteplase_025_max25", "avc_alteplase_09_max90"],
    },
    { nodeId: "hic_anticoag", recommendationIds: ["hic_anticoagulante_identificar_e_reverter"] },
  ],
};
