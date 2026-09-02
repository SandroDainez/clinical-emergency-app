import { listClinicalEvents, type ClinicalEvent } from "./clinical-event-log";
import { getAllClinicalObservations, type ClinicalObservation } from "./clinical-observations";
import {
  buildClinicalHandoffPayload,
  type ClinicalHandoffPreservationContract,
} from "./clinical-handoff-contract";
import type { ClinicalHandoffFact, ClinicalHandoffPayload } from "./clinical-handoff-payload";

export type ClinicalHandoffAssemblyResult =
  | {
      status: "complete";
      payload: ClinicalHandoffPayload;
      missingFacts: readonly [];
      resolvedFacts: readonly ClinicalHandoffFact[];
    }
  | {
      status: "incomplete";
      missingFacts: readonly string[];
      resolvedFacts: readonly ClinicalHandoffFact[];
    }
  | {
      status: "unavailable";
      missingFacts: readonly string[];
      resolvedFacts: readonly [];
    };

/**
 * Extrai contexto já registrado sem inventar informação ausente.
 *
 * Ordem de resolução por fato:
 * 1. observação clínica com id exato;
 * 2. dado homônimo no evento clínico mais recente.
 *
 * O assembler não navega, não publica handoff e não toma decisão clínica.
 * Ele apenas transforma Patient State/Event Log em um snapshot candidato.
 */
export function assembleClinicalHandoff(input: {
  contract: ClinicalHandoffPreservationContract;
  observations?: readonly ClinicalObservation[];
  events?: readonly ClinicalEvent[];
  now?: number;
}): ClinicalHandoffAssemblyResult {
  const observations = input.observations ?? getAllClinicalObservations();
  const events = input.events ?? listClinicalEvents();
  const now = input.now ?? Date.now();

  const observationById = new Map(observations.map((item) => [item.id, item] as const));
  const eventsNewestFirst = [...events].sort((a, b) => b.occurredAt - a.occurredAt);

  const resolvedFacts: ClinicalHandoffFact[] = [];
  const missingFacts: string[] = [];

  for (const factId of input.contract.requiredFacts) {
    const observation = observationById.get(factId);
    if (observation) {
      resolvedFacts.push({
        id: factId,
        value: observation.value,
        recordedAt: observation.recordedAt,
        sourceModule: observation.originModule ?? input.contract.fromModule,
      });
      continue;
    }

    const event = eventsNewestFirst.find(
      (item) => item.data && Object.prototype.hasOwnProperty.call(item.data, factId)
    );
    if (event?.data) {
      resolvedFacts.push({
        id: factId,
        value: event.data[factId],
        recordedAt: event.occurredAt,
        sourceModule: event.module ?? input.contract.fromModule,
      });
      continue;
    }

    missingFacts.push(factId);
  }

  if (!resolvedFacts.length) {
    return {
      status: "unavailable",
      missingFacts,
      resolvedFacts: [],
    };
  }

  if (missingFacts.length) {
    return {
      status: "incomplete",
      missingFacts,
      resolvedFacts: resolvedFacts.map((fact) => ({ ...fact })),
    };
  }

  return {
    status: "complete",
    payload: buildClinicalHandoffPayload(input.contract, resolvedFacts, now),
    missingFacts: [],
    resolvedFacts: resolvedFacts.map((fact) => ({ ...fact })),
  };
}
