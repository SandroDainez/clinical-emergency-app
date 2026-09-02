import type { ProtocolEvidenceRegistry } from "../lib/protocol-evidence-registry";

export const TEP_EVIDENCE_REGISTRY: ProtocolEvidenceRegistry = {
  version: {
    protocolId: "tep_2024",
    clinicalVersion: "AHA-ACC-PE-2026-reviewed-2026-09-01",
    publishedAt: "2026-09-01",
    recommendations: [
      {
        id: "tep_2026_classificacao_categorias",
        statement: "Usar a classificação clínica AHA/ACC 2026 para estratificar o TEP agudo em categorias A–E e orientar nível de cuidado e terapias avançadas.",
        evidence: {
          reference: "2026 AHA/ACC/ACCP/ACEP/CHEST/SCAI/SHM/SIR/SVM/SVN Guideline for Acute Pulmonary Embolism",
          version: "2026",
          year: 2026,
          reviewedAt: "2026-09-01",
        },
      },
      {
        id: "tep_trombolise_sistemica_categoria_e",
        statement: "Em TEP agudo categoria E1-2, risco hemorrágico aceitável e terapia avançada em consideração, trombólise sistêmica associada à anticoagulação é razoável sobre anticoagulação isolada.",
        evidence: {
          reference: "2026 AHA/ACC/ACCP/ACEP/CHEST/SCAI/SHM/SIR/SVM/SVN Guideline for Acute Pulmonary Embolism",
          version: "2026",
          year: 2026,
          reviewedAt: "2026-09-01",
        },
      },
      {
        id: "tep_alteplase_100mg_2h_padrao",
        statement: "Alteplase 100 mg em 2 h é o regime sistêmico padrão mais usado para TEP; doses sistêmicas reduzidas podem ser consideradas para reduzir sangramento em casos selecionados.",
        evidence: {
          reference: "2026 AHA/ACC/ACCP/ACEP/CHEST/SCAI/SHM/SIR/SVM/SVN Guideline for Acute Pulmonary Embolism",
          version: "2026",
          year: 2026,
          reviewedAt: "2026-09-01",
        },
      },
    ],
  },
  bindings: [
    { nodeId: "estratificacao", recommendationIds: ["tep_2026_classificacao_categorias"] },
    { nodeId: "ar_trombolise", recommendationIds: ["tep_trombolise_sistemica_categoria_e", "tep_alteplase_100mg_2h_padrao"] },
  ],
};
