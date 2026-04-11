import { supabase } from "./supabase";

export const completeClinicalSession = async (sessionId: string) => {
  if (!supabase) {
    return { error: null };
  }

  const { error } = await supabase
    .from("clinical_sessions")
    .update({ status: "completed", ended_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (error) {
    console.error("Falha ao encerrar sessão clínica", error);
  }

  return { error };
};
