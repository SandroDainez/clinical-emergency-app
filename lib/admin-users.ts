import { supabase } from "./supabase";
import type { AppUserPaymentStatus, AppUserProfile, AppUserRole, AppUserStatus } from "./auth";

type AdminUsersResponse = {
  ok: boolean;
  users?: AppUserProfile[];
  user?: AppUserProfile;
  stats?: {
    total: number;
    ativos: number;
    pendentes: number;
    bloqueados: number;
  };
  error?: string;
  detail?: string;
};

async function invokeAdminUsers(body: Record<string, unknown>) {
  if (!supabase) {
    throw new Error("Supabase não está configurado neste ambiente.");
  }

  const { data, error } = await supabase.functions.invoke("admin-users", { body });

  if (error) {
    throw new Error(error.message);
  }

  const response = data as AdminUsersResponse;
  if (!response?.ok) {
    throw new Error(response?.detail || response?.error || "Falha administrativa.");
  }

  return response;
}

export async function listAdminUsers() {
  const response = await invokeAdminUsers({ action: "list" });
  return {
    users: response.users ?? [],
    stats: response.stats ?? { total: 0, ativos: 0, pendentes: 0, bloqueados: 0 },
  };
}

export async function updateAdminUser(input: {
  userId: string;
  status?: AppUserStatus;
  pagamento?: AppUserPaymentStatus;
  role?: AppUserRole;
  nome?: string;
}) {
  const response = await invokeAdminUsers({
    action: "update",
    payload: input,
  });

  return response.user ?? null;
}

export async function createAdminUser(input: {
  nome: string;
  email: string;
  password: string;
  status?: AppUserStatus;
  pagamento?: AppUserPaymentStatus;
  role?: AppUserRole;
}) {
  const response = await invokeAdminUsers({
    action: "create",
    payload: input,
  });

  return response.user ?? null;
}
