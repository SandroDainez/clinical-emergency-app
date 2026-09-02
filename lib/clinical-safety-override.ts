import { appendClinicalEvent } from "./clinical-event-log";

let overrideSequence = 0;

export type ClinicalSafetyOverrideInput = {
  module?: string;
  gateId: string;
  reason: string;
  severity: "warning" | "critical";
  now?: number;
};

export function recordClinicalSafetyOverride(input: ClinicalSafetyOverrideInput): void {
  const reason = input.reason.trim();
  if (!reason) {
    throw new Error(`Override ${input.gateId}: motivo obrigatório`);
  }

  const now = input.now ?? Date.now();
  overrideSequence += 1;
  appendClinicalEvent({
    id: `override-${now}-${overrideSequence}`,
    type: "safety_override",
    occurredAt: now,
    module: input.module,
    label: `Override de segurança: ${input.gateId}`,
    data: {
      gateId: input.gateId,
      reason,
      severity: input.severity,
    },
  });
}
