import { supabase } from "./supabase";

export type AppUserProfile = {
  id: string;
  email: string | null;
  nome: string;
  status: "pendente" | "ativo" | "bloqueado";
  role: "user" | "admin";
  pagamento: "pago" | "nao_pago";
  data_criacao: string | null;
};

export async function loadCurrentAppUser() {
  if (!supabase) {
    return { data: null as AppUserProfile | null, errorMessage: "Supabase não configurado neste ambiente." };
  }

  const { data, error } = await supabase.rpc("get_current_app_user");
  if (error) {
    if (error.code === "42883") {
      return { data: null as AppUserProfile | null, errorMessage: "Migração de perfil de usuário não aplicada." };
    }
    return { data: null as AppUserProfile | null, errorMessage: error.message };
  }

  const profile = Array.isArray(data) ? (data[0] as AppUserProfile | undefined) : null;
  return { data: profile ?? null, errorMessage: null };
}
