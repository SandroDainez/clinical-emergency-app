import type { Session } from "@supabase/supabase-js";

import { supabase } from "./supabase";

export type AppUserStatus = "pendente" | "ativo" | "bloqueado";
export type AppUserRole = "user" | "admin";
export type AppUserPaymentStatus = "pago" | "nao_pago";

export type AppUserProfile = {
  id: string;
  nome: string;
  email: string;
  status: AppUserStatus;
  role: AppUserRole;
  pagamento: AppUserPaymentStatus;
  data_criacao: string;
};

export type AccessRequestInput = {
  nome: string;
  email: string;
  password: string;
};

export type AuthResult =
  | { ok: true; session: Session; profile: AppUserProfile }
  | { ok: false; code: string; message: string };

export type AccessRequestResult =
  | { ok: true; message: string }
  | { ok: false; code: string; message: string };

export async function fetchCurrentUserProfile(userId: string) {
  if (!supabase) {
    return { data: null as AppUserProfile | null, error: new Error("supabase_not_configured") };
  }

  const { data, error } = await supabase
    .from("app_users")
    .select("id, nome, email, status, role, pagamento, data_criacao")
    .eq("id", userId)
    .maybeSingle();

  return { data: (data as AppUserProfile | null) ?? null, error };
}

export function describeSupabaseAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return {
      code: "invalid_credentials",
      message: "Credenciais inválidas. Confira o e-mail cadastrado e a senha informada.",
    };
  }

  if (normalized.includes("email not confirmed")) {
    return {
      code: "email_not_confirmed",
      message: "Este usuário ainda precisa confirmar o e-mail no provedor de autenticação.",
    };
  }

  if (normalized.includes("user already registered")) {
    return {
      code: "user_exists",
      message: "Já existe um usuário com este e-mail.",
    };
  }

  if (normalized.includes("password")) {
    return {
      code: "password_rejected",
      message: "A senha foi rejeitada pelo provedor de autenticação.",
    };
  }

  return {
    code: "auth_error",
    message,
  };
}

export async function requestAccess(input: AccessRequestInput): Promise<AccessRequestResult> {
  if (!supabase) {
    return {
      ok: false,
      code: "supabase_not_configured",
      message: "Supabase não está configurado neste ambiente.",
    };
  }

  const { data, error } = await supabase.functions.invoke("request-access", {
    body: {
      nome: input.nome.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
    },
  });

  if (error) {
    return { ok: false, code: "request_failed", message: error.message };
  }

  if (!data?.ok) {
    return {
      ok: false,
      code: data?.error ?? "request_failed",
      message: data?.detail ?? "Não foi possível registrar a solicitação de acesso.",
    };
  }

  return { ok: true, message: "Solicitação enviada. Aguarde aprovação do administrador." };
}

export async function signInWithAccess(email: string, password: string): Promise<AuthResult> {
  if (!supabase) {
    return {
      ok: false,
      code: "supabase_not_configured",
      message: "Supabase não está configurado neste ambiente.",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    const authError = describeSupabaseAuthError(error.message);
    return { ok: false, code: authError.code, message: authError.message };
  }

  if (!data.session || !data.user) {
    return {
      ok: false,
      code: "session_missing",
      message: "Login concluído sem sessão válida.",
    };
  }

  const { data: profile, error: profileError } = await fetchCurrentUserProfile(data.user.id);
  if (profileError || !profile) {
    await supabase.auth.signOut();
    return {
      ok: false,
      code: "profile_missing",
      message: "Seu perfil de acesso não foi encontrado.",
    };
  }

  if (profile.status === "pendente") {
    await supabase.auth.signOut();
    return {
      ok: false,
      code: "pending",
      message: "Aguardando aprovação do administrador.",
    };
  }

  if (profile.status === "bloqueado") {
    await supabase.auth.signOut();
    return {
      ok: false,
      code: "blocked",
      message: "Acesso bloqueado.",
    };
  }

  return { ok: true, session: data.session, profile };
}

export async function signOutCurrentUser() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
