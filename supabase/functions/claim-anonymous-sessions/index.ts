/**
 * claim-anonymous-sessions — transfere a posse das sessões de uma identidade
 * **anônima provada** para a conta definitiva que o médico acabou de autenticar.
 *
 * ── ⚠️⚠️ A REGRA CENTRAL ────────────────────────────────────────────────────
 *
 * > *"Só transferir quando o servidor conseguir provar **simultaneamente**: esta
 * > identidade anônima é dona dessas sessões, **e** esta conta autenticada é
 * > realmente o destino."*
 *
 * ⛔⛔ **CONHECER UM UUID ⛔ NÃO É PROVA.** Por isso ⛔ não existe RPC
 * `claim_sessions(old_uid)`: o `old_uid` **⛔ nunca** vem do cliente. Ele é
 * **extraído** de um JWT anônimo que o servidor valida por conta própria.
 *
 * ── ⚠️ POR QUE OS DOIS TOKENS CHEGAM VIVOS ─────────────────────────────────
 *
 * O cliente obtém a sessão da conta destino **sem instalar** (ver
 * `lib/auth-sessao.ts`), então a sessão anônima ainda é a ativa e os dois JWTs
 * são recém-emitidos. ⛔ Isso remove a dependência de o token anônimo continuar
 * válido **depois** de um login — comportamento de revogação que ⛔ não foi
 * possível provar sem tocar a produção.
 *
 * ⛔ ESTA FUNÇÃO ⛔ NÃO FOI IMPLANTADA. Aguarda aprovação explícita.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * ⚠️⚠️ O CORS PERMITE **exatamente** o necessário — e `x-anon-token` precisa
 * estar aqui, ⛔ senão o navegador nem envia o cabeçalho.
 */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-anon-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * ⛔⛔ O CORPO DA RESPOSTA ⛔ NUNCA CARREGA O TOKEN ANÔNIMO, ⛔ nem em erro.
 *
 * ⚠️ `x-anon-token` é **credencial**: quem o tem lê as sessões daquela
 * identidade. ⛔ Ele ⛔ não vai para log, analytics, tracing, `console` ⛔ nem
 * mensagem de erro — e é por isso que os erros aqui são **códigos secos**, sem
 * eco do que foi recebido.
 */
function json(obj: unknown, status: number) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return json({ error: "env_not_configured" }, 503);

  /**
   * ⚠️⚠️ VALIDAÇÃO 1 · A CONTA DE DESTINO.
   * ⛔ Impede: chamada anônima ao endpoint.
   */
  const bearer = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!bearer) return json({ error: "unauthorized" }, 401);

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: destino } = await admin.auth.getUser(bearer);
  const newUid = destino?.user?.id;
  if (!newUid) return json({ error: "unauthorized" }, 401);

  /**
   * ⚠️⚠️ VALIDAÇÃO 2 · A IDENTIDADE ANÔNIMA — validada de forma **independente**.
   * ⛔ Impede: reivindicar sessões de terceiros conhecendo o UUID.
   */
  const anonToken = (req.headers.get("x-anon-token") ?? "").trim();
  if (!anonToken) return json({ error: "anon_proof_required" }, 401);

  const { data: anterior } = await admin.auth.getUser(anonToken);
  const oldUid = anterior?.user?.id;
  if (!oldUid) return json({ error: "anon_proof_invalid" }, 401);

  /**
   * ⚠️⚠️ VALIDAÇÃO 3 · ELA PRECISA SER MESMO ANÔNIMA.
   * ⛔ Impede: usar um token roubado de uma conta **cadastrada** para drenar as
   * sessões dela para outra conta.
   */
  if (anterior?.user?.is_anonymous !== true) {
    return json({ error: "source_not_anonymous" }, 403);
  }

  /** ⚠️ VALIDAÇÃO 4 · origem ≠ destino. ⛔ Impede transferência circular. */
  if (oldUid === newUid) return json({ ok: true, transferred: 0 }, 200);

  /**
   * ⚠️⚠️ VALIDAÇÃO 5 · A CONTA DESTINO PRECISA ESTAR **ATIVA**.
   *
   * ── ⚠️⚠️ POR QUE ISTO MORA AQUI, ⛔ E ⛔ NÃO NO CLIENTE ────────────────────
   *
   * ⛔ Se o cliente consultasse o `status` e decidisse ⛔ não chamar o claim, ele
   * voltaria a ser **autoridade sobre a própria autorização** — ⛔ exatamente o
   * defeito do `old_user_id`, com outra roupa. ⚠️ Por isso o claim é **sempre
   * chamado**, e é ele quem descobre.
   *
   * ── ⚠️⚠️ POR QUE ⛔ NÃO BASTA A RLS ───────────────────────────────────────
   *
   * ⚠️ Transferir para uma conta `pendente` ⛔ não perde dado — mas `pode_usar_clinico()`
   * ⛔ impede a conta de ler o que acabou de receber, ⛔ enquanto a identidade
   * anônima, que lia, deixa de ser a sessão ativa. ⚠️⚠️ Para o médico isso é
   * **indistinguível de perda**, e é ⛔ a mesma experiência que a regra
   * *"claim falho ⛔ não troca a sessão"* existe para evitar.
   *
   * ⚠️⚠️ A semântica que se preserva: **posse ⛔ só muda quando a nova identidade
   * está autorizada a exercê-la.**
   *
   * ⛔ Falha fechada: ⛔ sem linha em `app_users`, ⛔ ou com erro na consulta, o
   * desfecho é `conta_indisponivel` — ⛔ nunca transferência.
   */
  const { data: destinoPerfil } = await admin
    .from("app_users")
    .select("status")
    .eq("id", newUid)
    .maybeSingle();

  if (destinoPerfil?.status !== "ativo") {
    /**
     * ⚠️⚠️ `pendente` e bloqueada ⛔ NÃO compartilham resposta. Dizer *"aguardando
     * aprovação"* a quem foi **bloqueado** é falso, e manda a pessoa esperar por
     * algo que ⛔ não vai acontecer.
     *
     * ⛔ E ⛔ nada além disso é revelado: o cliente ⛔ não recebe papel, ⛔ nem
     * histórico administrativo, ⛔ nem o motivo do bloqueio.
     */
    const motivo = destinoPerfil?.status === "pendente" ? "conta_pendente" : "conta_indisponivel";
    return json({ error: motivo }, 403);
  }

  /**
   * ⚠️⚠️ A TRANSFERÊNCIA — e a **cláusula é a autoridade**.
   *
   * ⛔ ⛔ NENHUMA lista de session IDs é aceita: o cliente ⛔ não escolhe o que
   * migra. E `user_id IS NULL` ⛔ **nunca** casa com igualdade, então as sessões
   * legadas órfãs ficam fora **por construção**, e ⛔ não por uma exceção escrita.
   *
   * ⚠️ Idempotente: repetir casa zero linhas, porque `user_id` já mudou.
   */
  const { data: movidas, error } = await admin
    .from("clinical_sessions")
    .update({ user_id: newUid })
    .eq("user_id", oldUid)
    .select("id");

  if (error) {
    /** ⛔ Erro do banco ⛔ não ecoa parâmetro ⛔ nem token. */
    return json({ error: "transfer_failed" }, 500);
  }

  /**
   * ⚠️ Auditoria mínima: quem, para quem, quantas, quando.
   * ⛔ ⛔ Nenhum conteúdo clínico — ⛔ nem `notes`, ⛔ nem `event_data`, ⛔ nem ids de
   * sessão, ⛔ nem o token.
   */
  console.log(
    JSON.stringify({
      evento: "claim_anonymous_sessions",
      old_uid: oldUid,
      new_uid: newUid,
      transferidas: movidas?.length ?? 0,
    })
  );

  /**
   * ⛔ Os eventos ⛔ NÃO trocam de dono: a autorização deles deriva da sessão pai.
   * Mover a sessão move os eventos junto, e ⛔ sem criar um segundo dono que possa
   * divergir.
   */
  return json({ ok: true, transferred: movidas?.length ?? 0 }, 200);
});
