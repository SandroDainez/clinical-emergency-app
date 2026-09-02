import { evaluateClinicalActionGates, type ClinicalGateEvaluation } from "./clinical-gate-runtime";
import type { ClinicalGateContext } from "./clinical-gate-trigger";

export type ClinicalActionGateDecision = {
  evaluations: readonly ClinicalGateEvaluation[];
  hardStops: readonly ClinicalGateEvaluation[];
  softStops: readonly ClinicalGateEvaluation[];
  advisories: readonly ClinicalGateEvaluation[];
  canProceedWithoutOverride: boolean;
};

/**
 * Classifica a tentativa de ação sem executá-la e sem produzir efeitos colaterais.
 * Override continua sendo um evento explícito separado, registrado pelo runtime
 * de segurança antes de a camada chamadora considerar o soft stop resolvido.
 */
export function evaluateClinicalActionAttempt(input: {
  protocolId: string;
  nodeId?: string;
  actionId: string;
  context: ClinicalGateContext;
}): ClinicalActionGateDecision {
  const evaluations = evaluateClinicalActionGates(input);
  const hardStops = evaluations.filter((item) => item.policy.level === "hard_stop");
  const softStops = evaluations.filter((item) => item.policy.level === "soft_stop");
  const advisories = evaluations.filter((item) => item.policy.level === "advisory");

  return {
    evaluations,
    hardStops,
    softStops,
    advisories,
    canProceedWithoutOverride: hardStops.length === 0 && softStops.length === 0,
  };
}

/**
 * Reavalia apenas a autorização lógica depois que overrides já foram registrados.
 * Hard stop nunca é liberado. Advisory nunca precisa entrar no conjunto.
 */
export function canProceedAfterRecordedOverrides(
  decision: ClinicalActionGateDecision,
  overriddenGateIds: ReadonlySet<string>
): boolean {
  if (decision.hardStops.length) return false;
  return decision.softStops.every((item) => overriddenGateIds.has(item.policy.id));
}
