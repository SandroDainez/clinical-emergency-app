import { supabase } from "./supabase";

export type AdminUserRecord = {
  id: string;
  email: string | null;
  nome: string;
  status: "pendente" | "ativo" | "bloqueado";
  role: "user" | "admin";
  pagamento: "pago" | "nao_pago";
  data_criacao: string | null;
  ultimo_acesso: string | null;
};

export async function loadAdminUsers() {
  if (!supabase) {
    return {
      data: [] as AdminUserRecord[],
      errorMessage: "Supabase não configurado. Verifique o .env.local com EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    };
  }

  const { data, error } = await supabase.rpc("admin_list_app_users");

  if (error) {
    if (error.code === "42501") {
      return {
        data: [] as AdminUserRecord[],
        errorMessage: "Sem permissão de admin. Faça login com uma conta que tenha role='admin' e status='ativo' no Supabase.",
      };
    }
    if (error.code === "42883" || error.code === "42P01") {
      return {
        data: [] as AdminUserRecord[],
        errorMessage: "Migração de admin não aplicada no Supabase. Execute as migrações em supabase/migrations/.",
      };
    }
    if (error.code === "PGRST116") {
      return {
        data: [] as AdminUserRecord[],
        errorMessage: "Sessão expirada. Faça login novamente.",
      };
    }
    return {
      data: [] as AdminUserRecord[],
      errorMessage: `Erro Supabase: ${error.message}`,
    };
  }

  return {
    data: (data ?? []) as AdminUserRecord[],
    errorMessage: null,
  };
}

export async function updateAdminUserStatus(userId: string, status: AdminUserRecord["status"]) {
  if (!supabase) return { errorMessage: "Supabase não configurado." };
  const { error } = await supabase.rpc("admin_set_user_status", {
    target_user_id: userId,
    next_status: status,
  });
  return { errorMessage: error ? error.message : null };
}

export async function updateAdminUserRole(userId: string, role: AdminUserRecord["role"]) {
  if (!supabase) return { errorMessage: "Supabase não configurado." };
  const { error } = await supabase.rpc("admin_set_user_role", {
    target_user_id: userId,
    next_role: role,
  });
  return { errorMessage: error ? error.message : null };
}

export async function updateAdminUserPagamento(userId: string, pagamento: AdminUserRecord["pagamento"]) {
  if (!supabase) return { errorMessage: "Supabase não configurado." };
  const { error } = await supabase.rpc("admin_set_user_pagamento", {
    target_user_id: userId,
    next_pagamento: pagamento,
  });
  return { errorMessage: error ? error.message : null };
}

export async function signUpAppUser(params: { nome: string; email: string; password: string }) {
  if (!supabase) return { errorMessage: "Supabase não configurado." };
  const email = params.email.trim().toLowerCase();
  const nome = params.nome.trim();
  const password = params.password.trim();
  if (!email || !password) return { errorMessage: "Informe e-mail e senha." };
  if (password.length < 6) return { errorMessage: "A senha deve ter ao menos 6 caracteres." };

  const { data, error } = await supabase.functions.invoke("create-user", {
    body: { nome, email, password },
  });
  if (error) return { errorMessage: await readFnError(error, "Falha ao criar a conta.") };
  if (data?.error) return { errorMessage: String(data.error) };
  return { errorMessage: null };
}

async function readFnError(error: unknown, fallback: string): Promise<string> {
  try {
    const ctx = (error as { context?: Response })?.context;
    if (ctx && typeof ctx.json === "function") {
      const body = await ctx.json();
      if (body?.error) return String(body.error);
    }
  } catch { /* ignore */ }
  const msg = (error as { message?: string })?.message;
  return msg ? msg : fallback;
}
