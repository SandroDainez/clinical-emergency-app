/**
 * ⚠️⚠️ FONTE RECUPERADA DO BUNDLE IMPLANTADO — verbatim, 2026-08-30.
 *
 * ⛔⛔ ⛔ NADA foi corrigido aqui. ⛔ Nem autenticação, ⛔ nem CORS, ⛔ nem risco
 * conhecido. ⚠️ Esta versão existe para que **desligar com segurança** deixe de
 * depender de uma recuperação manual feita sob pressão.
 *
 * ── ⚠️ ORIGEM ────────────────────────────────────────────────────────────
 *
 * Extraída de `sourcesContent` do sourcemap embutido no bundle ESZIP baixado
 * durante a auditoria. ⚠️ É o **fonte original**, ⛔ e ⛔ não o JS transpilado —
 * os tipos estão preservados como o autor escreveu.
 *
 * ⚠️ O único acréscimo é este cabeçalho. ⛔ Nenhuma linha do corpo foi tocada.
 *
 * ── ⚠️⚠️ ⛔ ANTES DE IMPLANTAR ────────────────────────────────────────────
 *
 * ⛔ Este arquivo ⛔ NÃO é uma versão corrigida. Implantá-lo republicaria o
 * comportamento atual, ⛔ inclusive o que está registrado como dívida.
 * ⚠️ Ele serve para **restaurar** depois de um stub 503, ⛔ e ⛔ não para "atualizar".
 *
 * ── ⚠️⚠️ RISCOS RESIDUAIS CONHECIDOS — documentados, ⛔ e ⛔ NÃO corrigidos ──
 *
 * ⚠️ Esta é a porta **pública** de solicitação de acesso: ela ⛔ não tem — ⛔ e por
 * desenho ⛔ não teria — autenticação. Duas dívidas ficam registradas:
 *
 * ⚠️⚠️ **1 · `email_confirm: true` ⛔ sem prova de caixa postal.** A conta nasce
 * com o e-mail marcado como confirmado, ⛔ sem que ⛔ ninguém tenha provado
 * controlar aquele endereço. ⛔ Qualquer pessoa pode criar conta com o e-mail de
 * outra. ⚠️ O dano é contido pelo `status: 'pendente'` — o acesso ainda depende
 * de aprovação do administrador —, ⛔ mas o endereço fica **tomado**.
 *
 * ⚠️⚠️ **2 · ⛔ Sem teto de criação.** ⛔ Nenhum rate limit próprio, ⛔ nenhum
 * captcha, ⛔ nenhuma janela. A fila de aprovação pode ser inundada.
 *
 * ⛔ ⛔ ⛔ NENHUMA das duas foi corrigida nesta rodada, ⛔ por decisão explícita
 * do autor: recuperar o fonte e corrigi-lo na mesma passada tornaria impossível
 * saber o que é comportamento **implantado** e o que é mudança minha.
 */
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
