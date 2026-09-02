import { appendClinicalEvent } from "./clinical-event-log";
import { getCriticalTherapyReassessmentRule } from "./clinical-reassessment-policy";

export type PendingClinicalReassessment = {
  id: string;
  therapyId: string;
  module?: string;
  startedAt: number;
  dueAt?: number;
};

const pending = new Map<string, PendingClinicalReassessment>();
let sequence = 0;

export function requireClinicalReassessment(input: {
  therapyId: string;
  module?: string;
  now?: number;
}): PendingClinicalReassessment | undefined {
  const rule = getCriticalTherapyReassessmentRule(input.therapyId);
  if (!rule?.reassessmentRequired) return undefined;

  const now = input.now ?? Date.now();
  sequence += 1;
  const item: PendingClinicalReassessment = {
    id: `reassess-${input.therapyId}-${now}-${sequence}`,
    therapyId: input.therapyId,
    module: input.module,
    startedAt: now,
    dueAt: rule.reassessmentWithinMinutes
      ? now + rule.reassessmentWithinMinutes * 60_000
      : undefined,
  };
  pending.set(item.id, item);
  return { ...item };
}

export function completeClinicalReassessment(input: {
  reassessmentId: string;
  summary: string;
  now?: number;
}): void {
  const item = pending.get(input.reassessmentId);
  if (!item) throw new Error(`Reavaliação pendente não encontrada: ${input.reassessmentId}`);

  const summary = input.summary.trim();
  if (!summary) throw new Error(`Reavaliação ${input.reassessmentId}: resumo obrigatório`);

  const now = input.now ?? Date.now();
  appendClinicalEvent({
    id: `reassessment-${input.reassessmentId}-${now}`,
    type: "reassessment",
    occurredAt: now,
    module: item.module,
    label: `Reavaliação após ${item.therapyId}`,
    data: {
      therapyId: item.therapyId,
      reassessmentId: item.id,
      summary,
      elapsedSeconds: Math.max(0, Math.round((now - item.startedAt) / 1000)),
    },
  });
  pending.delete(item.id);
}

export function listPendingClinicalReassessments(): PendingClinicalReassessment[] {
  return [...pending.values()].map((item) => ({ ...item }));
}

export function clearPendingClinicalReassessments(): void {
  pending.clear();
}
