import { supabase } from "./supabase";

export const logClinicalSessionEvent = async (
  sessionId: string,
  eventType: string,
  eventLabel: string,
  eventData?: Record<string, any>
) => {
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
