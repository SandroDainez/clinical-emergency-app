import type { ObservationDecisionPolicy } from "./clinical-observation-decision-gate";

export type ClinicalObservationConsumerBinding = {
  protocolId: string;
  nodeId?: string;
  actionId: string;
  /** Identidade estável da decisão que reutiliza a observação. */
  decisionId: string;
  observationId: string;
  /**
   * Janela temporal da decisão consumidora — nunca da observação global.
   * Só declarar quando houver fundamento clínico/operacional explícito.
   */
  freshForMs: number;
  staleAfterMs: number;
};

/**
 * Registry canônico de decisões que realmente consomem observações voláteis.
 *
 * Importante: começa vazio de propósito. Os fatos hoje ligados aos gates
 * iniciais não possuem, nas fontes transcritas no projeto, uma janela temporal
 * explícita que autorize inventar um TTL:
 * - achado de hemorragia na TC é fato documental do exame;
 * - sedação realizada é evento/estado, não uma medida fisiológica que "vence";
 * - tempo operacional até ICP deve ser reconfirmado quando a logística muda,
 *   mas a guideline não define um número de minutos após o qual a informação
 *   se torna automaticamente inválida.
 *
 * Quando uma decisão passar a reutilizar, por exemplo, uma medida fisiológica
 * com validade temporal explicitamente definida, o binding entra aqui e passa
 * automaticamente pelo gate de observação stale.
 */
export const CLINICAL_OBSERVATION_CONSUMER_BINDINGS: readonly ClinicalObservationConsumerBinding[] = [];

export function observationDecisionPoliciesForAction(input: {
  protocolId: string;
  nodeId?: string;
  actionId: string;
}): ObservationDecisionPolicy[] {
  return CLINICAL_OBSERVATION_CONSUMER_BINDINGS.filter(
    (binding) =>
      binding.protocolId === input.protocolId &&
      (!binding.nodeId || binding.nodeId === input.nodeId) &&
      binding.actionId === input.actionId
  ).map(({ decisionId, observationId, freshForMs, staleAfterMs }) => ({
    decisionId,
    observationId,
    freshForMs,
    staleAfterMs,
  }));
}

export function validateClinicalObservationConsumerBindings(): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const binding of CLINICAL_OBSERVATION_CONSUMER_BINDINGS) {
    const key = `${binding.protocolId}:${binding.nodeId ?? "*"}:${binding.actionId}:${binding.observationId}`;
    if (seen.has(key)) issues.push(`${key}: binding consumidor duplicado`);
    seen.add(key);

    if (!binding.protocolId.trim()) issues.push(`${key}: protocolId ausente`);
    if (!binding.actionId.trim()) issues.push(`${key}: actionId ausente`);
    if (!binding.decisionId.trim()) issues.push(`${key}: decisionId ausente`);
    if (!binding.observationId.trim()) issues.push(`${key}: observationId ausente`);
    if (binding.freshForMs < 0) issues.push(`${key}: freshForMs negativo`);
    if (binding.staleAfterMs <= binding.freshForMs) {
      issues.push(`${key}: staleAfterMs deve ser maior que freshForMs`);
    }
  }

  return issues;
}
