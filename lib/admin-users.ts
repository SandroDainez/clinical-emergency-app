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

  const { data, error } = await supabase.rpc("admin_list_app_users");

  if (error) {
    if (error.code === "PGRST116") {
      return {
        data: [] as AdminUserRecord[],
        errorMessage: "Sessão inválida para administração. Faça login novamente como admin.",
      };
    }

    if (error.code === "42P01" || error.code === "42883") {
      return {
        data: [] as AdminUserRecord[],
        errorMessage: "Migração de administração não aplicada no Supabase.",
      };
    }

    if (error.code === "42501") {
      return {
        data: [] as AdminUserRecord[],
        errorMessage: "A conta logada não tem permissão de administrador.",
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

  const { error } = await supabase.rpc("admin_set_user_status", {
    target_user_id: userId,
    next_status: status,
  });
  if (error) {
    return { errorMessage: error.message };
  }

  return { errorMessage: null };
}
