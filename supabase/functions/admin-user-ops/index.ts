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
 * ── ⚠️ O QUE A RECUPERAÇÃO CONFIRMOU ─────────────────────────────────────
 *
 * ⚠️ A validação interna auditada **existe e está correta na ordem**: token
 * ausente → 401; chamador ⛔ não identificado → 401; ⛔ não-admin ⛔ ou inativo →
 * 403 — ⛔ tudo **antes** de `updateUserById` ⛔ ou `deleteUser`.
 *
 * ⛔ ⛔ Por isso a autenticação ⛔ NÃO foi alterada nesta rodada. `verify_jwt=false`
 * segue como **dívida de hardening**, ⛔ e ⛔ não vira mudança automática agora —
 * ele seria defesa adicional, ⛔ e ⛔ nunca a autenticação em si (a chave `anon` é
 * um JWT válido que viaja no bundle).
 */
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) return json({ error: "Nao autorizado." }, 401);
    const { data: u } = await admin.auth.getUser(token);
    const callerId = u?.user?.id;
    if (!callerId) return json({ error: "Nao autorizado." }, 401);
    const { data: prof } = await admin
      .from("app_users")
      .select("role,status")
      .eq("id", callerId)
      .maybeSingle();
    if (!(prof?.role === "admin" && prof?.status === "ativo")) {
      return json({ error: "Apenas administradores podem fazer isso." }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "");
    const userId = String(body?.userId ?? "").trim();
    if (!userId) return json({ error: "Usuario nao informado." }, 400);

    if (action === "set_password") {
      const password = String(body?.password ?? "");
      if (password.length < 6) return json({ error: "A senha deve ter ao menos 6 caracteres." }, 400);
      const { error } = await admin.auth.admin.updateUserById(userId, { password });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true }, 200);
    }

    if (action === "delete") {
      if (userId === callerId) return json({ error: "Voce nao pode excluir a propria conta." }, 400);
      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true }, 200);
    }

    return json({ error: "Acao invalida." }, 400);
  } catch (e) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
});
