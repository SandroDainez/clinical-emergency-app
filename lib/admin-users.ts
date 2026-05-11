import { supabase } from "./supabase";

export type AdminUserRecord = {
  id: string;
  email: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
  is_confirmed: boolean;
};

export async function loadAdminUsers() {
  if (!supabase) {
    return {
      data: [] as AdminUserRecord[],
      errorMessage: "Supabase não configurado no ambiente.",
    };
  }

  const { data, error } = await supabase.rpc("admin_list_users");
  if (error) {
    if (error.code === "42883") {
      return {
        data: [] as AdminUserRecord[],
        errorMessage: "Migração de usuários não aplicada no Supabase.",
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
