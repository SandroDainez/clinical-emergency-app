import type { ClinicalModuleTerminalContract } from "../lib/clinical-module-terminal-contract";

export const PILOT_MODULE_TERMINAL_CLASSIFICATION: readonly ClinicalModuleTerminalContract[] = [
  {
    protocolId: "avc_agudo_2024",
    mode: "care_pathway",
    requiresClinicalDisposition: true,
    requiresReturnToOrigin: false,
    rationale:
      "AVC é linha de cuidado completa: reconhecimento, reperfusão/controle, reavaliação e destino assistencial fazem parte do próprio protocolo.",
    reviewedAt: "2026-09-02",
  },
  {
    protocolId: "anaphylaxis_v3",
    mode: "care_pathway",
    requiresClinicalDisposition: true,
    requiresReturnToOrigin: false,
    rationale:
      "Anafilaxia começa no diagnóstico e termina em alta, observação/internação ou cuidado intensivo conforme resposta e gravidade.",
    reviewedAt: "2026-09-02",
  },
  {
    protocolId: "rsi_v1",
    mode: "procedural_subflow",
    requiresClinicalDisposition: false,
    requiresReturnToOrigin: true,
    rationale:
      "ISR é intervenção procedural acionada por outro atendimento; após intubação/estabilização deve devolver o controle ao protocolo que a originou, não escolher alta ou UTI por conta própria.",
    reviewedAt: "2026-09-02",
  },
] as const;
