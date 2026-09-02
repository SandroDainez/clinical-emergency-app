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
      missingOptionalFacts: readonly string[];
      resolvedFacts: readonly ClinicalHandoffFact[];
    }
  | {
      status: "incomplete";
      missingFacts: readonly string[];
      missingOptionalFacts: readonly string[];
      resolvedFacts: readonly ClinicalHandoffFact[];
    }
  | {
      status: "unavailable";
      missingFacts: readonly string[];
      missingOptionalFacts: readonly string[];
      resolvedFacts: readonly [];
    };

function resolveFact(input: {
  factId: string;
  observationById: Map<string, ClinicalObservation>;
  eventsNewestFirst: readonly ClinicalEvent[];
  fromModule: string;
}): ClinicalHandoffFact | undefined {
  const observation = input.observationById.get(input.factId);
  if (observation) {
    return {
      id: input.factId,
      value: observation.value,
      recordedAt: observation.recordedAt,
      sourceModule: observation.originModule ?? input.fromModule,
    };
  }

  const event = input.eventsNewestFirst.find(
    (item) => item.data && Object.prototype.hasOwnProperty.call(item.data, input.factId)
  );
  if (event?.data) {
    return {
      id: input.factId,
      value: event.data[input.factId],
      recordedAt: event.occurredAt,
      sourceModule: event.module ?? input.fromModule,
    };
  }

  return undefined;
}

/**
 * Extrai contexto já registrado sem inventar informação ausente.
 *
 * Ordem de resolução por fato:
 * 1. observação clínica com id exato;
 * 2. dado homônimo no evento clínico mais recente.
 *
 * Fatos obrigatórios controlam a suficiência do contexto. Fatos opcionais
 * viajam quando existem e permanecem explicitamente ausentes quando não foram
 * registrados. O assembler não navega, não publica handoff e não toma decisão.
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

  const requiredIds = [...input.contract.requiredFacts];
  const optionalIds = [...(input.contract.optionalFacts ?? [])].filter(
    (id) => !requiredIds.includes(id)
  );
  const resolvedFacts: ClinicalHandoffFact[] = [];
  const missingFacts: string[] = [];
  const missingOptionalFacts: string[] = [];

  for (const factId of requiredIds) {
    const fact = resolveFact({
      factId,
      observationById,
      eventsNewestFirst,
      fromModule: input.contract.fromModule,
    });
    if (fact) resolvedFacts.push(fact);
    else missingFacts.push(factId);
  }

  for (const factId of optionalIds) {
    const fact = resolveFact({
      factId,
      observationById,
      eventsNewestFirst,
      fromModule: input.contract.fromModule,
    });
    if (fact) resolvedFacts.push(fact);
    else missingOptionalFacts.push(factId);
  }

  if (!resolvedFacts.length && (requiredIds.length || optionalIds.length)) {
    return {
      status: "unavailable",
      missingFacts,
      missingOptionalFacts,
      resolvedFacts: [],
    };
  }

  if (missingFacts.length) {
    return {
      status: "incomplete",
      missingFacts,
      missingOptionalFacts,
      resolvedFacts: resolvedFacts.map((fact) => ({ ...fact })),
    };
  }

  return {
    status: "complete",
    payload: buildClinicalHandoffPayload(input.contract, resolvedFacts, now),
    missingFacts: [],
    missingOptionalFacts,
    resolvedFacts: resolvedFacts.map((fact) => ({ ...fact })),
  };
}
