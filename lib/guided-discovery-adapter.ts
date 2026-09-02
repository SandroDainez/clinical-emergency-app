import { guidedDiscoveryFor } from "./guided-discovery-registry";

export type GuidedDiscoveryViewModel = {
  id: string;
  eyebrow: string;
  title: string;
  sourceLabel: string;
  steps: readonly { id: string; label: string; detail: string }[];
  sufficientWhen: string;
  returnDecisionNodeId: string;
  readyInTree: boolean;
};

const SOURCE_LABELS = {
  clinical_interpretation: "Dúvida clínica",
  missing_observation: "Dado ainda não obtido",
  missing_history: "História ainda não disponível",
  external_operational_data: "Informação operacional pendente",
} as const;

/**
 * Adapta o contrato de domínio para apresentação. Não decide, não navega e não
 * conhece DecisionTreeEngine. Toda regra clínica permanece no registry.
 */
export function guidedDiscoveryViewModel(
  protocolId: string,
  decisionNodeId: string
): GuidedDiscoveryViewModel | undefined {
  const contract = guidedDiscoveryFor(protocolId, decisionNodeId);
  if (!contract) return undefined;

  return {
    id: contract.id,
    eyebrow: "NÃO SEI — VAMOS DESCOBRIR",
    title: contract.missingInformation,
    sourceLabel: SOURCE_LABELS[contract.source],
    steps: contract.steps.map((step) => ({
      id: step.id,
      label: step.prompt,
      detail: step.obtainBy,
    })),
    sufficientWhen: contract.sufficientWhen,
    returnDecisionNodeId: contract.returnDecisionNodeId,
    readyInTree: contract.mode === "existing_node",
  };
}
