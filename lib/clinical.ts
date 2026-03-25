import { supabase } from "./supabase";

export const startClinicalSession = async (moduleKey: string) => {
  const { data, error } = await supabase
    .from("clinical_sessions")
    .insert([
      {
        module_key: moduleKey,
        status: "started",
        notes: "Sessão iniciada pelo app",
      },
    ])
    .select()
    .single();

  return { data, error };
};
