/**
 * create-user — criação de conta **por administrador**.
 *
 * ── ⚠️⚠️ ORIGEM DESTE ARQUIVO ────────────────────────────────────────────────
 *
 * ⚠️ Ele ⛔ **não** foi escrito do zero ⛔ nem reconstruído de memória: é o fonte
 * **recuperado do bundle ESZIP implantado** (versão 1, lida pela Management API
 * em 2026-08-30), com **⛔ uma única mudança** — a autenticação, abaixo.
 *
 * ── ⛔ O DEFEITO QUE ISTO FECHA (P0, auditoria de 2026-08-30) ────────────────
 *
 * A função está implantada com `verify_jwt = false`, e o token era
 * **opcional**:
 *
 *     if (token) { …calcula callerIsAdmin… }
 *     // …e seguia para admin.auth.admin.createUser DE QUALQUER FORMA
 *
 * ⚠️⚠️ Sem token, qualquer um na internet criava **conta real e confirmada**
 * (`email_confirm: true`) usando a `SERVICE_ROLE_KEY` do servidor. O ramo de
 * admin ⛔ só elevava `status`/`role`.
 *
 * ⛔ E ⛔ não é a porta pública: essa é `request-access`. Duplicar cadastro público
 * com service role ⛔ não tem justificativa.
 *
 * ⚠️ Agora o contrato é o mesmo de `admin-user-ops`, que já estava correta:
 * **sem token → 401 · ⛔ não-admin ⛔ ou inativo → 403 · ⛔ só então** o service role
 * é usado. ⚠️⚠️ E a validação acontece **antes** de qualquer chamada privilegiada.
 *
 * ⛔ ESTE ARQUIVO ⛔ NÃO FOI IMPLANTADO. Ele aguarda aprovação explícita.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(obj: unknown, status: number) {
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
    if (!url || !serviceKey) return json({ error: "Ambiente não configurado." }, 503);

    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    /**
     * ⚠️⚠️ FALHA FECHADA, E ANTES DE TUDO — ⛔ nenhuma leitura do corpo, ⛔ nenhuma
     * chamada privilegiada acontece antes daqui.
     */
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

    /** ⚠️ Daqui para baixo, o chamador **é** admin ativo — e ⛔ só aqui. */
    const body = await req.json().catch(() => ({}));
    const nome = String(body?.nome ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!email || password.length < 6) {
      return json({ error: "Informe e-mail e senha (minimo 6 caracteres)." }, 400);
    }

    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome },
    });

    if (cErr) {
      const msg = /registered|already/i.test(cErr.message)
        ? "Ja existe uma conta com esse e-mail."
        : cErr.message;
      return json({ error: msg }, 400);
    }

    const newId = created.user?.id;
    if (!newId) return json({ error: "Falha ao criar a conta." }, 500);

    /**
     * ⚠️ O `callerIsAdmin` sumiu do corpo porque virou **pré-condição**: ⛔ não há
     * mais caminho em que a função rode com chamador ⛔ não-admin, e por isso
     * `status` e `role` vêm do pedido sem ramo alternativo.
     */
    const status = body?.status ?? "ativo";
    const role = body?.role ?? "user";

    await admin
      .from("app_users")
      .upsert({ id: newId, email, nome, status, role }, { onConflict: "id" });

    return json({ id: newId, status, role }, 200);
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
