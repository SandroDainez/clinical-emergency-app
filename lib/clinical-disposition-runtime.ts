import {
  appendClinicalEvent,
  listClinicalEvents,
  type ClinicalEvent,
} from "./clinical-event-log";
import { CLINICAL_TRANSITION_CONTRACTS } from "./clinical-transition-contracts";
import type { ClinicalTransitionContract } from "./clinical-transitions";

let dispositionSequence = 0;

export type ConfirmableExternalDisposition = {
  transitionId: string;
  protocolId: string;
  sourceNodeId: string;
  destination: string;
  label: string;
  confirmed: boolean;
};

function isExternalTerminalTransition(
  transition: ClinicalTransitionContract
): boolean {
  return (
    transition.mode === "terminal" &&
    transition.destinationKind === "external_service" &&
    Boolean(transition.externalLabel?.trim()) &&
    Boolean(transition.sourceNodeId?.trim())
  );
}

export function getConfirmableExternalDisposition(input: {
  protocolId: string;
  sourceNodeId: string;
}): ConfirmableExternalDisposition | undefined {
  const transition = CLINICAL_TRANSITION_CONTRACTS.find(
    (item) =>
      item.from === input.protocolId &&
      item.sourceNodeId === input.sourceNodeId &&
      isExternalTerminalTransition(item)
  );

  if (!transition?.externalLabel || !transition.sourceNodeId) return undefined;

  return {
    transitionId: transition.id,
    protocolId: transition.from,
    sourceNodeId: transition.sourceNodeId,
    destination: transition.to,
    label: transition.externalLabel,
    confirmed: isExternalClinicalDispositionConfirmed(transition.id),
  };
}

export function isExternalClinicalDispositionConfirmed(transitionId: string): boolean {
  return listClinicalEvents().some(
    (event) =>
      event.type === "disposition" &&
      event.data?.transitionId === transitionId
  );
}

/**
 * Registra destino assistencial somente quando um consumidor confirma
 * explicitamente uma transferência terminal para serviço externo.
 *
 * Entrar em um nó que RECOMENDA UTI, centro cirúrgico, hemodinâmica etc. não é
 * suficiente: recomendação não é desfecho. Da mesma forma, trocar para outro
 * módulo do app é `protocol_interrupted`/transição, não `disposition`.
 *
 * Idempotente por transitionId durante o atendimento atual: toque duplo ou
 * remontagem da tela devolve o evento existente e não duplica o desfecho.
 */
export function confirmExternalClinicalDisposition(input: {
  transitionId: string;
  now?: number;
}): ClinicalEvent {
  const transition = CLINICAL_TRANSITION_CONTRACTS.find(
    (item) => item.id === input.transitionId
  );

  if (!transition) {
    throw new Error(`Transição clínica não encontrada: ${input.transitionId}`);
  }

  if (!isExternalTerminalTransition(transition)) {
    throw new Error(
      `Transição ${transition.id} não representa destino terminal externo confirmável`
    );
  }

  const label = transition.externalLabel?.trim();
  if (!label) {
    throw new Error(`Transição ${transition.id} sem rótulo de destino externo`);
  }

  const existing = listClinicalEvents().find(
    (event) =>
      event.type === "disposition" &&
      event.data?.transitionId === transition.id
  );
  if (existing) {
    return {
      ...existing,
      data: existing.data ? { ...existing.data } : undefined,
    };
  }

  const now = input.now ?? Date.now();
  dispositionSequence += 1;
  const event: ClinicalEvent = {
    id: `disposition-${now}-${dispositionSequence}`,
    type: "disposition",
    occurredAt: now,
    module: transition.from,
    label,
    data: {
      transitionId: transition.id,
      sourceNodeId: transition.sourceNodeId ?? null,
      destination: transition.to,
      destinationKind: "external_service",
    },
  };

  appendClinicalEvent(event);
  return {
    ...event,
    data: event.data ? { ...event.data } : undefined,
  };
}
