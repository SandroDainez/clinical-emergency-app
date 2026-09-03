import { recordMedicationGiven } from "./clinical-runtime-bridge";
import { supabase } from "./supabase";

function normalizeClinicalSessionEvent(
  eventType: string,
  eventLabel: string,
  eventData?: Record<string, any>
) {
  if (eventType !== "medication_administered" || eventData?.medication !== "amiodarone") {
    return {
      eventLabel,
      eventData: eventData ?? {},
    };
  }

  /**
   * O caller ACLS ainda usa a ação genérica `antiarrhythmic`, mas o logger
   * legado a convertia em amiodarona 300/150 mg. Como a árvore permite também
   * lidocaína e não captura qual agente foi usado, persistir esse nome/dose
   * cria documentação falsa. Normalizamos na fronteira de persistência até a
   * UI ganhar seleção explícita do antiarrítmico.
   */
  const normalizedData = { ...(eventData ?? {}) };
  normalizedData.medication = "antiarrhythmic_unspecified";
  delete normalizedData.dose;

  return {
    eventLabel: "Antiarrítmico administrado",
    eventData: normalizedData,
  };
}

function mirrorConfirmedMedicationToCore(
  eventType: string,
  eventData?: Record<string, any>
) {
  if (eventType !== "medication_administered") return;

  const medication = typeof eventData?.medication === "string" ? eventData.medication : undefined;
  const count = typeof eventData?.count === "number" ? eventData.count : undefined;
  const stateId = typeof eventData?.stateId === "string" ? eventData.stateId : undefined;

  if (medication === "epinephrine") {
    recordMedicationGiven({
      actionId: "adrenaline",
      label: "Epinefrina administrada",
      medicationId: "epinephrine",
      dose: typeof eventData?.dose === "string" ? eventData.dose : undefined,
      count,
      stateId,
    });
    return;
  }

  if (medication === "antiarrhythmic_unspecified") {
    recordMedicationGiven({
      actionId: "antiarrhythmic",
      label: "Antiarrítmico administrado",
      count,
      stateId,
    });
  }
}

export const logClinicalSessionEvent = async (
  sessionId: string,
  eventType: string,
  eventLabel: string,
  eventData?: Record<string, any>
) => {
  const normalized = normalizeClinicalSessionEvent(eventType, eventLabel, eventData);
  mirrorConfirmedMedicationToCore(eventType, normalized.eventData);

  if (!supabase) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from("clinical_session_events")
    .insert([
      {
        session_id: sessionId,
        event_type: eventType,
        event_label: normalized.eventLabel,
        event_data: normalized.eventData,
      },
    ])
    .select()
    .single();

  return { data, error };
};
