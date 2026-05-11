import { supabase } from "./supabase";

export type AdminUserRecord = {
  id: string;
  email: string | null;
  nome: string;
  status: "pendente" | "ativo" | "bloqueado";
  role: "user" | "admin";
  pagamento: "pago" | "nao_pago";
  data_criacao: string | null;
};

export async function loadAdminUsers() {
  if (!supabase) {
    return {
      data: [] as AdminUserRecord[],
      errorMessage: "Supabase não configurado no ambiente.",
    };
  }

  const { data, error } = await supabase
    .from("app_users")
    .select("id,email,nome,status,role,pagamento,data_criacao")
    .order("data_criacao", { ascending: false });

  if (error) {
    if (error.code === "PGRST116") {
      return {
        data: [] as AdminUserRecord[],
        errorMessage: "Sessão inválida para administração. Faça login novamente como admin.",
      };
    }

    if (error.code === "42P01") {
      return {
        data: [] as AdminUserRecord[],
        errorMessage: "Tabela app_users não encontrada no Supabase.",
      };
    }

    return {
      data: [] as AdminUserRecord[],
      errorMessage: error.message,
    };
  }

  return {
    data: (data ?? []) as AdminUserRecord[],
    errorMessage: null,
  };
}

export async function updateAdminUserStatus(userId: string, status: AdminUserRecord["status"]) {
  if (!supabase) {
    return { errorMessage: "Supabase não configurado no ambiente." };
  }

  const { error } = await supabase.from("app_users").update({ status }).eq("id", userId);
  if (error) {
    return { errorMessage: error.message };
  }

  return { errorMessage: null };
}
