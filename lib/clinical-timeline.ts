import type { ClinicalEvent } from "./clinical-event-log";

export type TimelineEntry = {
  id: string;
  occurredAt: number;
  timeLabel: string;
  module?: string;
  label: string;
  type: ClinicalEvent["type"];
};

export function formatClock(timestamp: number): string {
  const d = new Date(timestamp);
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

export function buildClinicalTimeline(events: readonly ClinicalEvent[]): TimelineEntry[] {
  return [...events]
    .sort((a, b) => a.occurredAt - b.occurredAt)
    .map((event) => ({
      id: event.id,
      occurredAt: event.occurredAt,
      timeLabel: formatClock(event.occurredAt),
      module: event.module,
      label: event.label,
      type: event.type,
    }));
}

export function elapsedMinutesBetween(
  events: readonly ClinicalEvent[],
  fromType: ClinicalEvent["type"],
  toType: ClinicalEvent["type"]
): number | undefined {
  const ordered = [...events].sort((a, b) => a.occurredAt - b.occurredAt);
  const from = ordered.find((event) => event.type === fromType);
  if (!from) return undefined;
  const to = ordered.find((event) => event.type === toType && event.occurredAt >= from.occurredAt);
  if (!to) return undefined;
  return Math.round(((to.occurredAt - from.occurredAt) / 60_000) * 10) / 10;
}
