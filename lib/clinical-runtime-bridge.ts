import { decisionObservationFor } from "./clinical-decision-observation-bindings";
import { appendClinicalEvent, listClinicalEvents } from "./clinical-event-log";
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
export function recordClinicalCaseStarted(input: {
  caseId: string;
  now?: number;
}): void {
  const caseId = input.caseId.trim();
  if (!caseId) return;
  const now = input.now ?? Date.now();
  appendClinicalEvent({
    id: nextEventId("case", now),
    type: "case_started",
    occurredAt: now,
    label: "Atendimento iniciado",
    data: { caseId },
  });
}

/**
 * Registra a primeira entrada real em um protocolo dentro do atendimento.
 *
 * O shell pode montar novamente ao retornar de uma interrupção. Nessa situação
 * a volta já possui `protocol_resumed`; gravar outro `protocol_started` faria a
 * timeline sugerir um novo protocolo. Por isso a deduplicação usa o próprio log
 * append-only como fonte de verdade, sem criar um segundo store de lifecycle.
 */
export function recordProtocolStarted(input: {
  module: string;
  label?: string;
  now?: number;
}): void {
  const module = input.module.trim();
  if (!module) return;
  const alreadyStarted = listClinicalEvents().some(
    (event) => event.type === "protocol_started" && event.module === module
  );
  if (alreadyStarted) return;

  const now = input.now ?? Date.now();
  appendClinicalEvent({
    id: nextEventId("protocol", now),
    type: "protocol_started",
    occurredAt: now,
    module,
    label: input.label?.trim() || module,
    data: { module },
  });
}

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

/**
 * Registra uma medicação SOMENTE depois de a administração ter sido confirmada
 * pelo fluxo consumidor. Esta função não deve ser chamada por recomendações,
 * lembretes ou nós `medication_due_now`.
 *
 * `medicationId` e `dose` são opcionais de propósito: quando o fluxo sabe apenas
 * que uma classe foi administrada (ex.: ação genérica `antiarrhythmic`), o Event
 * Log preserva essa incerteza em vez de escolher uma droga/dose por inferência.
 */
export function recordMedicationGiven(input: {
  module?: string;
  actionId: string;
  label: string;
  medicationId?: string;
  dose?: string;
  count?: number;
  stateId?: string;
  now?: number;
}): void {
  const actionId = input.actionId.trim();
  const label = input.label.trim();
  if (!actionId || !label) return;

  const now = input.now ?? Date.now();
  appendClinicalEvent({
    id: nextEventId("medication", now),
    type: "medication_given",
    occurredAt: now,
    module: input.module,
    label,
    data: {
      actionId,
      medicationId: input.medicationId?.trim() || null,
      dose: input.dose?.trim() || null,
      count: input.count ?? null,
      stateId: input.stateId?.trim() || null,
    },
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
