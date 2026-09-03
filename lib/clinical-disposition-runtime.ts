import { appendClinicalEvent, type ClinicalEvent } from "./clinical-event-log";
import { CLINICAL_TRANSITION_CONTRACTS } from "./clinical-transition-contracts";

let dispositionSequence = 0;

/**
 * Registra destino assistencial somente quando um consumidor confirma
 * explicitamente uma transferência terminal para serviço externo.
 *
 * Entrar em um nó que RECOMENDA UTI, centro cirúrgico, hemodinâmica etc. não é
 * suficiente: recomendação não é desfecho. Da mesma forma, trocar para outro
 * módulo do app é `protocol_interrupted`/transição, não `disposition`.
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

  if (transition.mode !== "terminal" || transition.destinationKind !== "external_service") {
    throw new Error(
      `Transição ${transition.id} não representa destino terminal externo confirmável`
    );
  }

  const label = transition.externalLabel?.trim();
  if (!label) {
    throw new Error(`Transição ${transition.id} sem rótulo de destino externo`);
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
