import { supabase } from "./supabase";

export type ClinicalSessionEvent = {
  id: string;
  event_type: string;
  event_label: string;
  created_at: string;
  event_data?: Record<string, any>;
};

export type ClinicalSessionSummary = {
  protocolOpenedAt?: string;
  rhythms: string[];
  shockCount: number;
  medications: Record<string, number>;
  stepsConfirmed: number;
  completed: boolean;
};

export async function loadClinicalSessionEvents(sessionId: string) {
  if (!supabase) {
    return { data: [] as ClinicalSessionEvent[], error: null };
  }

  const { data, error } = await supabase
    .from("clinical_session_events")
    .select("id,event_type,event_label,created_at,event_data")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  return { data: (data ?? []) as ClinicalSessionEvent[], error };
}

export function buildClinicalSessionSummary(events: ClinicalSessionEvent[]): ClinicalSessionSummary {
  const summary: ClinicalSessionSummary = {
    protocolOpenedAt: undefined,
    rhythms: [],
    shockCount: 0,
    medications: {},
    stepsConfirmed: 0,
    completed: false,
  };
  const rhythmSet = new Set<string>();

  for (const event of events) {
    switch (event.event_type) {
      case "protocol_opened":
        if (!summary.protocolOpenedAt) {
          summary.protocolOpenedAt = event.created_at;
        }
        break;
      case "rhythm_selected":
        if (event.event_data?.rhythm) {
          rhythmSet.add(String(event.event_data.rhythm));
        }
        break;
      case "shock_performed":
        summary.shockCount += 1;
        break;
      case "medication_administered":
        if (event.event_data?.medication) {
          const medication = String(event.event_data.medication);
          summary.medications[medication] = (summary.medications[medication] ?? 0) + 1;
        }
        break;
      case "step_confirmed":
        summary.stepsConfirmed += 1;
        break;
      case "protocol_completed":
        summary.completed = true;
        break;
      default:
        break;
    }
  }

  summary.rhythms = Array.from(rhythmSet);
  return summary;
}
