import type { ActionableRecommendation, ProtocolVersion } from "./evidence-governance";

export type NodeEvidenceBinding = {
  nodeId: string;
  recommendationIds: readonly string[];
};

export type ProtocolEvidenceRegistry = {
  version: ProtocolVersion;
  bindings: readonly NodeEvidenceBinding[];
};

/**
 * Liga recomendações acionáveis a nós concretos sem duplicar o texto clínico da
 * árvore. O nó continua descrevendo a conduta; o registry descreve de onde ela
 * veio e em qual versão foi revisada.
 */
export function validateProtocolEvidenceRegistry(registry: ProtocolEvidenceRegistry): string[] {
  const issues: string[] = [];
  const recommendationIds = new Set(registry.version.recommendations.map((r) => r.id));
  const bound = new Set<string>();

  for (const binding of registry.bindings) {
    if (!binding.nodeId.trim()) issues.push("binding sem nodeId");
    if (!binding.recommendationIds.length) issues.push(`${binding.nodeId}: sem recomendação vinculada`);
    for (const id of binding.recommendationIds) {
      if (!recommendationIds.has(id)) issues.push(`${binding.nodeId}: recomendação inexistente ${id}`);
      bound.add(id);
    }
  }

  for (const recommendation of registry.version.recommendations) {
    if (!bound.has(recommendation.id)) issues.push(`${recommendation.id}: recomendação sem nó vinculado`);
  }
  return issues;
}

export function evidenceForNode(
  registry: ProtocolEvidenceRegistry,
  nodeId: string
): ActionableRecommendation[] {
  const ids = new Set(
    registry.bindings.find((binding) => binding.nodeId === nodeId)?.recommendationIds ?? []
  );
  return registry.version.recommendations.filter((recommendation) => ids.has(recommendation.id));
}
