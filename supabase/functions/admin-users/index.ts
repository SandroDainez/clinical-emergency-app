// @ts-nocheck
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

async function getAuthorizedAdmin(req: Request, supabaseUrl: string, anonKey: string, serviceRoleKey: string) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { error: jsonResponse({ ok: false, error: "missing_authorization" }, 401) };
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser();

  if (authError || !user) {
    return { error: jsonResponse({ ok: false, error: "invalid_user" }, 401) };
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: profile, error: profileError } = await adminClient
    .from("app_users")
    .select("id, role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "admin" || profile.status !== "ativo") {
    return { error: jsonResponse({ ok: false, error: "admin_access_required" }, 403) };
  }

  return { adminClient, user };
}

function buildStats(rows: Array<{ status: string }>) {
  const stats = {
    total: rows.length,
    ativos: 0,
    pendentes: 0,
    bloqueados: 0,
  };

  for (const row of rows) {
    if (row.status === "ativo") stats.ativos += 1;
    if (row.status === "pendente") stats.pendentes += 1;
    if (row.status === "bloqueado") stats.bloqueados += 1;
  }

  return stats;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ ok: false, error: "supabase_env_not_configured" }, 503);
  }

  const authorized = await getAuthorizedAdmin(req, supabaseUrl, anonKey, serviceRoleKey);
  if ("error" in authorized) {
    return authorized.error;
  }

  const { adminClient } = authorized;
  const { action, payload } = await req.json();

  if (action === "list") {
    const { data, error } = await adminClient
      .from("app_users")
      .select("id, nome, email, status, role, pagamento, data_criacao")
      .order("data_criacao", { ascending: false });

    if (error) {
      return jsonResponse({ ok: false, error: "list_failed", detail: error.message }, 500);
    }

    return jsonResponse({
      ok: true,
      users: data ?? [],
      stats: buildStats(data ?? []),
    });
  }

  if (action === "update") {
    const { userId, status, pagamento, role, nome } = payload ?? {};
    if (!userId) {
      return jsonResponse({ ok: false, error: "user_id_required" }, 400);
    }

    const updatePayload: Record<string, string> = {};
    if (status) updatePayload.status = status;
    if (pagamento) updatePayload.pagamento = pagamento;
    if (role) updatePayload.role = role;
    if (typeof nome === "string") updatePayload.nome = nome.trim();

    if (Object.keys(updatePayload).length === 0) {
      return jsonResponse({ ok: false, error: "no_update_fields" }, 400);
    }

    const { data, error } = await adminClient
      .from("app_users")
      .update(updatePayload)
      .eq("id", userId)
      .select("id, nome, email, status, role, pagamento, data_criacao")
      .single();

    if (error) {
      return jsonResponse({ ok: false, error: "update_failed", detail: error.message }, 500);
    }

    return jsonResponse({ ok: true, user: data });
  }

  if (action === "create") {
    const nome = typeof payload?.nome === "string" ? payload.nome.trim() : "";
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
    const password = typeof payload?.password === "string" ? payload.password : "";
    const status = payload?.status ?? "ativo";
    const pagamento = payload?.pagamento ?? "nao_pago";
    const role = payload?.role ?? "user";

    if (!nome || !email || !password) {
      return jsonResponse({ ok: false, error: "nome_email_password_required" }, 400);
    }

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nome,
        full_name: nome,
      },
    });

    if (createError || !created.user) {
      return jsonResponse(
        { ok: false, error: "create_user_failed", detail: createError?.message ?? "unknown" },
        500
      );
    }

    const { data: profile, error: profileError } = await adminClient
      .from("app_users")
      .update({
        nome,
        status,
        pagamento,
        role,
      })
      .eq("id", created.user.id)
      .select("id, nome, email, status, role, pagamento, data_criacao")
      .single();

    if (profileError) {
      return jsonResponse({ ok: false, error: "profile_update_failed", detail: profileError.message }, 500);
    }

    return jsonResponse({ ok: true, user: profile });
  }

  return jsonResponse({ ok: false, error: "unknown_action" }, 400);
});
