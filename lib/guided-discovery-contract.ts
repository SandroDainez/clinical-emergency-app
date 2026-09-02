import type { DecisionUncertaintySource } from "./decision-uncertainty-policy";

export type GuidedDiscoveryMode = "existing_node" | "prepared_plan";

export type GuidedDiscoveryStep = {
  id: string;
  prompt: string;
  /** O que fazer para obter a informação; não é a resposta clínica. */
  obtainBy: string;
};

export type GuidedDiscoveryContract = {
  id: string;
  protocolId: string;
  decisionNodeId: string;
  source: DecisionUncertaintySource;
  mode: GuidedDiscoveryMode;
  /** Nó real que já implementa a descoberta. Obrigatório somente em existing_node. */
  guidedNodeId?: string;
  /** Informação que falta para responder a decisão de origem. */
  missingInformation: string;
  /** 1–3 passos concretos para obter/decompor a informação. */
  steps: readonly GuidedDiscoveryStep[];
  /** Critério explícito para saber quando sair da descoberta. */
  sufficientWhen: string;
  /** A descoberta sempre retorna para a decisão que a originou. */
  returnDecisionNodeId: string;
  reviewedAt: string;
};

export function validateGuidedDiscoveryContracts(
  entries: readonly GuidedDiscoveryContract[]
): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    const key = `${entry.protocolId}:${entry.decisionNodeId}`;
    if (seen.has(key)) issues.push(`${key}: descoberta duplicada`);
    seen.add(key);

    if (!entry.id.trim()) issues.push(`${key}: id ausente`);
    if (!entry.missingInformation.trim()) issues.push(`${key}: informação faltante não descrita`);
    if (!entry.sufficientWhen.trim()) issues.push(`${key}: critério de suficiência ausente`);
    if (!entry.reviewedAt.trim()) issues.push(`${key}: reviewedAt ausente`);
    if (entry.returnDecisionNodeId !== entry.decisionNodeId) {
      issues.push(`${key}: descoberta deve retornar à decisão de origem`);
    }
    if (entry.steps.length < 1 || entry.steps.length > 3) {
      issues.push(`${key}: descoberta deve ter de 1 a 3 passos concretos`);
    }
    for (const step of entry.steps) {
      if (!step.id.trim() || !step.prompt.trim() || !step.obtainBy.trim()) {
        issues.push(`${key}: passo de descoberta incompleto`);
      }
    }
    if (entry.mode === "existing_node" && !entry.guidedNodeId?.trim()) {
      issues.push(`${key}: existing_node exige guidedNodeId real`);
    }
    if (entry.mode === "prepared_plan" && entry.guidedNodeId) {
      issues.push(`${key}: prepared_plan não deve apontar para nó ainda inexistente`);
    }
  }

  return issues;
}
