export type FlowTerminalCoverageEntry = {
  moduleId: string;
  protocolId?: string;
  status: "classified" | "pending_semantic_review";
  rationale?: string;
  reviewedAt: string;
};

/**
 * Cobertura terminal dos módulos que o catálogo declara como `presentation: "flow"`.
 *
 * Esta tabela não decide destino clínico. Ela apenas impede que um fluxo desapareça
 * da auditoria por usar uma tela/runtime diferente das árvores compartilhadas.
 * `classified` exige um contrato real em module-terminal-classification.ts.
 * `pending_semantic_review` é dívida explícita: não autoriza inventar alta/UTI.
 */
export const FLOW_TERMINAL_COVERAGE: readonly FlowTerminalCoverageEntry[] = [
  { moduleId: "sepse-adulto", protocolId: "sepse_ssc_2024", status: "classified", reviewedAt: "2026-09-03" },
  { moduleId: "isr-rapida", protocolId: "isr_rsi_adulto", status: "classified", reviewedAt: "2026-09-03" },
  { moduleId: "edema-agudo-pulmao", protocolId: "eap_2024", status: "classified", reviewedAt: "2026-09-03" },
  { moduleId: "cetoacidose-hiperosmolar", protocolId: "cad_ehh_ada_2024", status: "classified", reviewedAt: "2026-09-03" },
  { moduleId: "ventilacao-mecanica", protocolId: "vm_adulto_2024", status: "classified", reviewedAt: "2026-09-03" },
  { moduleId: "anafilaxia", protocolId: "anaphylaxis_v3", status: "classified", reviewedAt: "2026-09-03" },
  { moduleId: "avc", protocolId: "avc_agudo_2024", status: "classified", reviewedAt: "2026-09-03" },
  { moduleId: "sindromes-coronarianas", protocolId: "sca_acs_2023", status: "classified", reviewedAt: "2026-09-03" },
  { moduleId: "bradicardia-acls", protocolId: "acls_bradycardia_2025", status: "classified", reviewedAt: "2026-09-03" },
  { moduleId: "taquicardia-acls", protocolId: "acls_tachycardia_2025", status: "classified", reviewedAt: "2026-09-03" },
  { moduleId: "tep", protocolId: "tep_2024", status: "classified", reviewedAt: "2026-09-03" },
  { moduleId: "pre-eclampsia", protocolId: "pre_eclampsia_eclampsia_2024", status: "classified", reviewedAt: "2026-09-03" },
  { moduleId: "politrauma", protocolId: "politrauma", status: "classified", reviewedAt: "2026-09-03" },
  { moduleId: "tce", protocolId: "tce", status: "classified", reviewedAt: "2026-09-03" },
  { moduleId: "crises-convulsivas", protocolId: "mal_epileptico", status: "classified", reviewedAt: "2026-09-03" },
  { moduleId: "intoxicacoes-exogenas", protocolId: "intoxicacoes_exogenas", status: "classified", reviewedAt: "2026-09-03" },
  { moduleId: "choque", protocolId: "choque", status: "classified", reviewedAt: "2026-09-03" },
  { moduleId: "injuria-renal-aguda", protocolId: "injuria_renal_aguda", status: "classified", reviewedAt: "2026-09-03" },
  { moduleId: "insuficiencia-respiratoria", protocolId: "insuficiencia_respiratoria", status: "classified", reviewedAt: "2026-09-03" },
  { moduleId: "abdome-agudo", protocolId: "abdome_agudo", status: "classified", reviewedAt: "2026-09-03" },
  { moduleId: "pcr-adulto", protocolId: "pcr_adulto", status: "classified", reviewedAt: "2026-09-03" },
  { moduleId: "ovace-adulto", protocolId: "ovace_adulto", status: "classified", reviewedAt: "2026-09-03" },
] as const;
