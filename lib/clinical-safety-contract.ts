export type SafetyDecisionOption = {
  id: string;
  next?: string;
};

export type SafetyDecisionNode = {
  id: string;
  options?: SafetyDecisionOption[];
};

export type SafetyIssue = {
  code:
    | "decision_without_unknown"
    | "therapy_without_reassessment"
    | "transition_without_return_or_terminal"
    | "module_without_destination";
  nodeId?: string;
  message: string;
};

export function hasUnknownBranch(node: SafetyDecisionNode): boolean {
  return (node.options ?? []).some((option) =>
    ["nao_sei", "naoSei", "não_sei", "incerto", "nao_consigo_avaliar"].includes(option.id)
  );
}

export function assertDecisionHasUnknownBranch(node: SafetyDecisionNode): SafetyIssue | undefined {
  if (hasUnknownBranch(node)) return undefined;
  return {
    code: "decision_without_unknown",
    nodeId: node.id,
    message: `Decisão ${node.id} não oferece saída segura para quem não sabe responder.`,
  };
}

/**
 * Contrato mínimo da nova arquitetura. A validação completa será ligada ao
 * universo real das árvores em um passo posterior; manter as regras aqui evita
 * que UI, lint e auditoria inventem definições diferentes para o mesmo requisito.
 */
export const CLINICAL_SAFETY_RULES = {
  decisionNeedsUnknownBranch: true,
  criticalTherapyNeedsReassessment: true,
  transitionNeedsReturnOrTerminal: true,
  moduleNeedsReachableDestination: true,
  overrideNeedsReason: true,
} as const;
