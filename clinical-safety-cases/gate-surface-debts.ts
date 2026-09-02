export type ClinicalGateSurfaceDebt = {
  id: string;
  candidateId: string;
  originProtocolId: string;
  originNodeId: string;
  intendedActionId: string;
  preferredSurface: "origin_action" | "destination_action" | "handoff_action";
  destinationModuleId?: string;
  problem: string;
  targetState: string;
};

/**
 * Dívidas de SUPERFÍCIE, não de regra clínica.
 *
 * Um SafetyGate não pode ser ativado até existir uma interação concreta que o
 * usuário esteja tentando executar. Texto dentro de `actions[]` não é uma
 * interação e o botão genérico "continuar" não pode ser usado como substituto.
 */
export const CLINICAL_GATE_SURFACE_DEBTS: readonly ClinicalGateSurfaceDebt[] = [
  {
    id: "tep-isr-sedation-surface",
    candidateId: "tep-high-risk-deep-sedation-ventilation",
    originProtocolId: "tep_2024",
    originNodeId: "ar_suporte",
    intendedActionId: "iniciar_sedacao_profunda_ou_isr",
    preferredSurface: "destination_action",
    destinationModuleId: "isr-rapida",
    problem:
      "O nó ar_suporte hoje apenas contém texto sobre IOT/sedação dentro de actions[] e segue para ar_diagnostico; não há uma ação específica de intubação nem handoff TEP→ISR que possa ser interceptado sem transformar o botão genérico de avanço em gate.",
    targetState:
      "Quando o atendimento realmente abrir ISR a partir do TEP, carregar contexto explícito de categoria C–E/disfunção de VD e indicação de intubação. Avaliar o SafetyGate na ação de indução/sedação do módulo de destino, preservando via rápida quando hipoxemia refratária/proteção de via aérea já estiver documentada.",
  },
] as const;
