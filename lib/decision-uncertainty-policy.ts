export type DecisionUncertaintyClassification =
  | "unknown_required"
  | "binary_observable"
  | "guided_elsewhere";

export type DecisionUncertaintyPolicyEntry = {
  protocolId: string;
  nodeId: string;
  classification: DecisionUncertaintyClassification;
  /** Obrigatória quando o ramo de incerteza é dispensado neste nó. */
  rationale?: string;
  /** Nó que oferece a descoberta guiada quando classification = guided_elsewhere. */
  guidedNodeId?: string;
  reviewedAt: string;
};

export function validateDecisionUncertaintyPolicy(
  entries: readonly DecisionUncertaintyPolicyEntry[]
): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    const key = `${entry.protocolId}:${entry.nodeId}`;
    if (seen.has(key)) issues.push(`${key}: classificação duplicada`);
    seen.add(key);

    if (!entry.protocolId) issues.push(`${key}: protocolId ausente`);
    if (!entry.nodeId) issues.push(`${key}: nodeId ausente`);
    if (!entry.reviewedAt) issues.push(`${key}: reviewedAt ausente`);

    if (entry.classification !== "unknown_required" && !entry.rationale?.trim()) {
      issues.push(`${key}: dispensar ramo de incerteza exige justificativa`);
    }

    if (entry.classification === "guided_elsewhere" && !entry.guidedNodeId?.trim()) {
      issues.push(`${key}: guided_elsewhere exige guidedNodeId`);
    }
  }

  return issues;
}

/**
 * Política do Emergências 2.0:
 * - decisões interpretativas/diagnósticas: precisam de saída de incerteza;
 * - perguntas diretamente observáveis podem ser binárias, mas a exceção precisa
 *   estar documentada e revisada;
 * - quando a descoberta guiada já existe em outro nó, a aresta deve ser explícita.
 */
export const DECISION_UNCERTAINTY_POLICY_VERSION = "2026-09-01";
