import { decisionObservationFor } from "./clinical-decision-observation-bindings";
import { appendClinicalEvent } from "./clinical-event-log";
import { recordClinicalObservation } from "./clinical-observations";

let sequence = 0;

function nextEventId(prefix: string, now: number): string {
  sequence += 1;
  return `${prefix}-${now}-${sequence}`;
}

/**
 * Ponte de migração entre os fluxos atuais e o Clinical Core novo.
 *
 * Não decide, não classifica e não altera a árvore. Apenas registra o que o
 * fluxo legado já fez. Isso permite ligar rastreabilidade de forma incremental
 * sem acoplar o shell ao formato interno do event log.
 */
export function recordFlowDecision(input: {
  /** ID canônico do protocolo usado no Event Log e na proveniência clínica. */
  module?: string;
  /**
   * Identificador usado apenas para localizar bindings de decisão já existentes
   * na superfície atual (normalmente o slug de rota). Quando omitido, usa
   * `module` para manter compatibilidade com os chamadores anteriores.
   */
  bindingProtocolId?: string;
  nodeId: string;
  optionId: string;
  optionLabel?: string;
  now?: number;
}): void {
  const now = input.now ?? Date.now();
  appendClinicalEvent({
    id: nextEventId("decision", now),
    type: "decision_made",
    occurredAt: now,
    module: input.module,
    label: input.optionLabel?.trim() || input.optionId,
    data: {
      nodeId: input.nodeId,
      optionId: input.optionId,
    },
  });

  const boundObservation = decisionObservationFor({
    protocolId: input.bindingProtocolId ?? input.module,
    nodeId: input.nodeId,
    optionId: input.optionId,
  });
  if (boundObservation) {
    recordFlowObservation({
      module: input.module,
      fieldId: boundObservation.id,
      value: boundObservation.value,
      unit: boundObservation.unit,
      now,
    });
  }
}

export function recordFlowAdvance(input: {
  module?: string;
  nodeId: string;
  title: string;
  now?: number;
}): void {
  const now = input.now ?? Date.now();
  appendClinicalEvent({
    id: nextEventId("action", now),
    type: "action_completed",
    occurredAt: now,
    module: input.module,
    label: input.title,
    data: { nodeId: input.nodeId },
  });
}

export function recordFlowObservation(input: {
  module?: string;
  fieldId: string;
  value: string;
  unit?: string;
  now?: number;
}): void {
  const value = input.value.trim();
  if (!value) return;
  const now = input.now ?? Date.now();

  recordClinicalObservation({
    id: input.fieldId,
    value,
    unit: input.unit,
    recordedAt: now,
    source: "manual",
    originModule: input.module,
  });

  appendClinicalEvent({
    id: nextEventId("observation", now),
    type: "observation_recorded",
    occurredAt: now,
    module: input.module,
    label: input.fieldId,
    data: {
      fieldId: input.fieldId,
      value,
      unit: input.unit ?? null,
    },
  });
}

export function recordProtocolTransition(input: {
  from?: string;
  to: string;
  trigger?: string;
  now?: number;
}): void {
  const now = input.now ?? Date.now();
  appendClinicalEvent({
    id: nextEventId("transition", now),
    type: "protocol_interrupted",
    occurredAt: now,
    module: input.from,
    label: `${input.from ?? "protocolo"} → ${input.to}`,
    data: {
      from: input.from ?? null,
      to: input.to,
      trigger: input.trigger ?? null,
    },
  });
}

export function recordProtocolResume(input: {
  from: string;
  to: string;
  transitionId?: string;
  now?: number;
}): void {
  const now = input.now ?? Date.now();
  appendClinicalEvent({
    id: nextEventId("resume", now),
    type: "protocol_resumed",
    occurredAt: now,
    module: input.to,
    label: `${input.from} → ${input.to}`,
    data: {
      from: input.from,
      to: input.to,
      transitionId: input.transitionId ?? null,
    },
  });
}
