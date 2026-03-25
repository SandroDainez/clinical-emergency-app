import { supabase } from "./supabase";

export type ClinicalSessionRecord = {
  id: string;
  module_key: string;
  status: string;
  created_at: string | null;
  ended_at: string | null;
};

export async function loadClinicalSessions() {
  const { data, error } = await supabase
    .from("clinical_sessions")
    .select("id,module_key,status,created_at,ended_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return { data: (data ?? []) as ClinicalSessionRecord[], error };
}

export async function loadClinicalSessionById(sessionId: string) {
  const { data, error } = await supabase
    .from("clinical_sessions")
    .select("id,module_key,status,created_at,ended_at")
    .eq("id", sessionId)
    .single();

  return { data: data as ClinicalSessionRecord | null, error };
}
