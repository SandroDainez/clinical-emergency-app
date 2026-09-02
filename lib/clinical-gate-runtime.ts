import { clinicalGateFor } from "./clinical-gate-registry";
import { activeClinicalGatesForAction } from "./clinical-gate-trigger-registry";
import type { ClinicalGateContext } from "./clinical-gate-trigger";
import { gateBlocks, gateNeedsOverrideReason, type ClinicalGatePolicy } from "./clinical-gate-policy";
import { recordClinicalSafetyOverride } from "./clinical-safety-override";

export type ClinicalGateEvaluation = {
  policy: ClinicalGatePolicy;
  blocks: boolean;
  overrideAllowed: boolean;
  needsOverrideReason: boolean;
};

export function evaluateClinicalGate(gateId: string): ClinicalGateEvaluation {
  const policy = clinicalGateFor(gateId);
  if (!policy) throw new Error(`Gate clínico desconhecido: ${gateId}`);

  return {
    policy,
    blocks: gateBlocks(policy.level),
    overrideAllowed: policy.overrideAllowed,
    needsOverrideReason: gateNeedsOverrideReason(policy),
  };
}

/**
 * Avalia gates a partir da ação TENTADA + contexto explícito.
 *
 * Esta função não navega, não executa a ação e não faz override. Ela apenas
 * responde quais políticas estão ativas para que a camada de orquestração/UI
 * decida como apresentar o gate correspondente.
 */
export function evaluateClinicalActionGates(input: {
  protocolId: string;
  nodeId?: string;
  actionId: string;
  context: ClinicalGateContext;
}): ClinicalGateEvaluation[] {
  return activeClinicalGatesForAction(input).map(({ policy }) => ({
    policy,
    blocks: gateBlocks(policy.level),
    overrideAllowed: policy.overrideAllowed,
    needsOverrideReason: gateNeedsOverrideReason(policy),
  }));
}

export function overrideClinicalGate(input: {
  gateId: string;
  reason: string;
  module?: string;
  now?: number;
}): void {
  const evaluation = evaluateClinicalGate(input.gateId);
  if (evaluation.policy.level === "hard_stop") {
    throw new Error(`Gate ${input.gateId}: hard stop não admite override`);
  }
  if (evaluation.policy.level === "advisory") {
    throw new Error(`Gate ${input.gateId}: advisory não bloqueia e não usa override`);
  }

  recordClinicalSafetyOverride({
    gateId: input.gateId,
    reason: input.reason,
    module: input.module,
    severity: "critical",
    now: input.now,
  });
}
