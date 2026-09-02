import type { ClinicalEvent } from "./clinical-event-log";
import type { ClinicalHandoffFact } from "./clinical-handoff-payload";

function newestMatchingEvent(
  events: readonly ClinicalEvent[],
  predicate: (event: ClinicalEvent) => boolean
): ClinicalEvent | undefined {
  return [...events]
    .filter(predicate)
    .sort((a, b) => b.occurredAt - a.occurredAt)[0];
}

/**
 * Deriva somente fatos que já estão declarados literalmente no Event Log.
 *
 * Não converte recomendação em tratamento realizado e não tenta adivinhar
 * ritmo, energia, fármaco, captura de marcapasso ou causa reversível.
 */
export function deriveClinicalHandoffFact(input: {
  factId: string;
  events: readonly ClinicalEvent[];
  fromModule: string;
}): ClinicalHandoffFact | undefined {
  const moduleEvents = input.events.filter((event) => event.module === input.fromModule);

  if (input.factId === "tempo_perda_pulso") {
    const event = newestMatchingEvent(
      moduleEvents,
      (item) =>
        item.type === "decision_made" &&
        item.data?.optionId === "sem_pulso"
    );
    if (!event) return undefined;
    return {
      id: input.factId,
      value: event.occurredAt,
      recordedAt: event.occurredAt,
      sourceModule: event.module ?? input.fromModule,
    };
  }

  if (
    input.factId === "numero_cardioversoes" &&
    input.fromModule === "acls_tachycardia_2025"
  ) {
    const cardioversions = moduleEvents.filter(
      (item) =>
        item.type === "action_completed" &&
        item.data?.nodeId === "unstable_cardioversion"
    );
    if (!cardioversions.length) return undefined;
    const latest = cardioversions.reduce((a, b) =>
      a.occurredAt >= b.occurredAt ? a : b
    );
    return {
      id: input.factId,
      value: cardioversions.length,
      recordedAt: latest.occurredAt,
      sourceModule: latest.module ?? input.fromModule,
    };
  }

  if (
    input.factId === "atropina_administrada" &&
    input.fromModule === "acls_bradycardia_2025"
  ) {
    const event = newestMatchingEvent(
      moduleEvents,
      (item) =>
        item.type === "action_completed" &&
        item.data?.nodeId === "atropine"
    );
    if (!event) return undefined;
    return {
      id: input.factId,
      value: true,
      recordedAt: event.occurredAt,
      sourceModule: event.module ?? input.fromModule,
    };
  }

  return undefined;
}
