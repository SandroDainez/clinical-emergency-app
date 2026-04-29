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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ ok: false, error: "supabase_env_not_configured" }, 503);
  }

  const { nome, email, password } = await req.json();

  if (!nome || !email || !password) {
    return jsonResponse({ ok: false, error: "nome_email_password_required" }, 400);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email: String(email).trim().toLowerCase(),
    password: String(password),
    email_confirm: true,
    user_metadata: {
      nome: String(nome).trim(),
      full_name: String(nome).trim(),
    },
  });

  if (createError || !created.user) {
    return jsonResponse(
      { ok: false, error: "create_user_failed", detail: createError?.message ?? "unknown" },
      400
    );
  }

  const { error: profileError } = await adminClient
    .from("app_users")
    .update({
      nome: String(nome).trim(),
      status: "pendente",
      role: "user",
      pagamento: "nao_pago",
    })
    .eq("id", created.user.id);

  if (profileError) {
    return jsonResponse({ ok: false, error: "profile_update_failed", detail: profileError.message }, 500);
  }

  return jsonResponse({ ok: true, message: "request_created" });
});
