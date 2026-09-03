import { recordMedicationGiven } from "./clinical-runtime-bridge";
import { supabase } from "./supabase";

function mirrorConfirmedMedicationToCore(
  eventType: string,
  eventLabel: string,
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

  if (medication === "amiodarone") {
    /**
     * Adapter de migração ACLS: o logger legado chama a ação genérica
     * `antiarrhythmic` de "amiodarona" e ainda deriva 300/150 mg pelo contador,
     * embora a árvore permita amiodarona OU lidocaína e não capture qual foi
     * escolhida. O Clinical Core não pode herdar essa falsa precisão.
     */
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
  mirrorConfirmedMedicationToCore(eventType, eventLabel, eventData);

  if (!supabase) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from("clinical_session_events")
    .insert([
      {
        session_id: sessionId,
        event_type: eventType,
        event_label: eventLabel,
        event_data: eventData ?? {},
      },
    ])
    .select()
    .single();

  return { data, error };
};
