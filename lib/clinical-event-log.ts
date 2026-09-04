export type ClinicalEventType =
  | "case_started"
  | "observation_recorded"
  | "decision_made"
  | "action_completed"
  | "medication_given"
  | "protocol_started"
  | "protocol_interrupted"
  | "protocol_resumed"
  | "safety_override"
  | "reassessment"
  | "disposition";

export type ClinicalEvent = {
  id: string;
  type: ClinicalEventType;
  occurredAt: number;
  module?: string;
  label: string;
  data?: Record<string, string | number | boolean | null>;
};

/**
 * Event log em memória do atendimento atual.
 *
 * Append-only por contrato: eventos não são editados nem removidos
 * individualmente. Uma nova informação gera novo evento. Isso permite depois
 * reconstruir linha do tempo e auditoria sem depender do estado final da tela.
 */
const events: ClinicalEvent[] = [];

export function appendClinicalEvent(event: ClinicalEvent): void {
  if (!event.id.trim()) throw new Error("Evento clínico sem id");
  if (!event.label.trim()) throw new Error(`Evento ${event.id} sem label`);
  events.push({
    ...event,
    data: event.data ? { ...event.data } : undefined,
  });
}

export function listClinicalEvents(): ClinicalEvent[] {
  return events.map((event) => ({
    ...event,
    data: event.data ? { ...event.data } : undefined,
  }));
}

export function exportClinicalEventLogSnapshot(): ClinicalEvent[] {
  return listClinicalEvents();
}

export function restoreClinicalEventLogSnapshot(snapshot: ClinicalEvent[]): void {
  clearClinicalEventLog();
  for (const event of snapshot) appendClinicalEvent(event);
}

export function clearClinicalEventLog(): void {
  events.length = 0;
}
