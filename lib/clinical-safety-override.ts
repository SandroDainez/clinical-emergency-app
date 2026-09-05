import { appendClinicalEvent } from "./clinical-event-log";
import { tr } from "./i18n";
import { trf } from "./i18n/trf";

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
    label: trf(tr, "Override de segurança: {0}", [input.gateId]),
    data: {
      gateId: input.gateId,
      reason,
      severity: input.severity,
    },
  });
}
