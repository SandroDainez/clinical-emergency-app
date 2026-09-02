import type { ProtocolEvidenceRegistry } from "../lib/protocol-evidence-registry";

export const SCA_EVIDENCE_REGISTRY: ProtocolEvidenceRegistry = {
  version: {
    protocolId: "sca_acs_2023",
    clinicalVersion: "ACC-AHA-ACS-2025-reviewed-2026-09-02",
    publishedAt: "2026-09-02",
    recommendations: [
      {
        id: "sca_ecg_10min",
        statement: "Obter ECG de 12 derivações em até 10 minutos na suspeita de síndrome coronariana aguda.",
        evidence: {
          reference: "2025 ACC/AHA/ACEP/NAEMSP/SCAI Guideline for the Management of Patients With Acute Coronary Syndromes",
          version: "2025",
          year: 2025,
          reviewedAt: "2026-09-01",
        },
      },
      {
        id: "stemi_ppci_120min_fmc",
        statement: "No STEMI, preferir ICP primária quando o intervalo do primeiro contato médico ao primeiro dispositivo puder ser alcançado em até 120 minutos; estimar atrasos reais de transferência antes de definir a estratégia.",
        evidence: {
          reference: "2025 ACC/AHA/ACEP/NAEMSP/SCAI Guideline for the Management of Patients With Acute Coronary Syndromes",
          version: "2025",
          year: 2025,
          reviewedAt: "2026-09-02",
        },
      },
      {
        id: "stemi_tnk_peso_padrao",
        statement: "Quando fibrinólise com tenecteplase estiver indicada no STEMI, usar bolus IV único por faixa de peso: 30/35/40/45/50 mg para <60/60–69/70–79/80–89/≥90 kg.",
        evidence: {
          reference: "2025 ACC/AHA/ACEP/NAEMSP/SCAI Guideline for Acute Coronary Syndromes — Table of fibrin-specific fibrinolytic agents for STEMI",
          version: "2025",
          year: 2025,
          reviewedAt: "2026-09-01",
        },
      },
      {
        id: "stemi_pos_fibrinolise_reavaliar",
        statement: "Após fibrinólise, reavaliar reperfusão e encaminhar para estratégia fármaco-invasiva; falha de reperfusão exige ICP de resgate.",
        evidence: {
          reference: "2025 ACC/AHA/ACEP/NAEMSP/SCAI Guideline for the Management of Patients With Acute Coronary Syndromes",
          version: "2025",
          year: 2025,
          reviewedAt: "2026-09-01",
        },
      },
    ],
  },
  bindings: [
    { nodeId: "entry", recommendationIds: ["sca_ecg_10min"] },
    { nodeId: "stemi_reperfusao", recommendationIds: ["stemi_ppci_120min_fmc"] },
    { nodeId: "stemi_fibrinolise", recommendationIds: ["stemi_tnk_peso_padrao", "stemi_pos_fibrinolise_reavaliar"] },
  ],
};
