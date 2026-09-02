import { clinicalGateFor } from "./clinical-gate-registry";
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
