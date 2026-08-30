import { supabase } from "./supabase";
import { historicoDisponivel } from "./historico-disponivel";

export type ClinicalSessionRecord = {
  id: string;
  module_key: string;
  status: string;
  created_at: string | null;
  ended_at: string | null;
};

/**
 * ⚠️⚠️ A PORTA ÚNICA — e é por isso que o interruptor mora **aqui**.
 *
 * Três telas consomem histórico (lista, detalhe, debrief). Um interruptor por
 * tela teria três versões do mesmo desligamento, e a próxima correção acertaria
 * uma delas (I6). ⛔ Desligar na porta cobre as três ⛔ por construção.
 */
export async function loadClinicalSessions() {
  /** ⚠️ ⛔ Terceiro estado — ⛔ NÃO lista vazia. Ver `historico-disponivel.ts`. */
  if (!historicoDisponivel()) {
    return { data: [] as ClinicalSessionRecord[], error: null, indisponivel: true };
  }
  if (!supabase) {
    return { data: [] as ClinicalSessionRecord[], error: null, indisponivel: false };
  }

  const { data, error } = await supabase
    .from("clinical_sessions")
    .select("id,module_key,status,created_at,ended_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return { data: (data ?? []) as ClinicalSessionRecord[], error, indisponivel: false };
}

export async function loadClinicalSessionById(sessionId: string) {
  if (!historicoDisponivel()) {
    return { data: null, error: null, indisponivel: true };
  }
  if (!supabase) {
    return { data: null, error: null, indisponivel: false };
  }

  const { data, error } = await supabase
    .from("clinical_sessions")
    .select("id,module_key,status,created_at,ended_at")
    .eq("id", sessionId)
    .single();

  return { data: data as ClinicalSessionRecord | null, error, indisponivel: false };
}
