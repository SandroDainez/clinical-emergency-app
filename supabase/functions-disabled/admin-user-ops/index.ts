/**
 * STUB DE DEGRADAÇÃO · admin-user-ops — responde **503 e ⛔ nada mais**.
 *
 * ⛔⛔ ISTO ⛔ NÃO É A FUNÇÃO. É o substituto deliberado dela, para o caso de a
 * versão corrigida apresentar defeito de funcionalidade em produção.
 *
 * ── ⚠️⚠️ POR QUE ELE EXISTE ────────────────────────────────────────────────
 *
 *   ⚠️⚠️ **Disponibilidade pode degradar. Confidencialidade, ⛔ não.**
 *
 * ⚠️ Sem este arquivo, a escada de rollback de uma Edge Function tinha ⛔ só dois
 * degraus: *"corrigir para frente"* ⛔ ou *"voltar a versão anterior"* — e as
 * versões anteriores de `admin-user-ops` e `acls-assistant` são as **vulneráveis**
 * (uma com token opcional, a outra chamando a OpenAI ⛔ sem autenticação
 * ⛔ nenhuma). ⛔ Sob pressão, a escolha real virava reabrir o risco.
 *
 * ⚠️ Com o stub, o degrau do meio existe: a função fica **indisponível**, ⛔ e ⛔ não
 * vulnerável.
 *
 * ── ⚠️⚠️ O QUE ELE ⛔ NÃO TEM, ⛔ E É O PONTO ───────────────────────────────
 *
 * ⛔ ⛔ ⛔ Nenhum `SERVICE_ROLE_KEY`. ⛔ Nenhum `OPENAI_API_KEY`.
 * ⛔ ⛔ ⛔ Nenhum acesso a banco. ⛔ Nenhum `fetch` para ⛔ lugar ⛔ nenhum.
 * ⛔ ⛔ ⛔ Nenhum `import` do código real — ⛔ ele ⛔ não pode "quase" rodar.
 * ⛔ ⛔ ⛔ Nenhum log: ⛔ nem do corpo, ⛔ nem de cabeçalho, ⛔ nem de credencial.
 *
 * ⚠️ ⛔ Ele ⛔ nem lê o corpo da requisição. ⛔ Não há o que dar errado aqui.
 *
 * ── ⚠️ COMO SAIR DESTE MODO ───────────────────────────────────────────────
 *
 * Reimplantar a partir de `supabase/functions/admin-user-ops/`, que
 * segue versionada e ⛔ intacta. ⚠️ A saída é para a versão **corrigida**,
 * ⛔ e ⛔ nunca para a anterior.
 */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-anon-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  /**
   * ⚠️ 503 e ⛔ não 500: ⛔ nada quebrou. O recurso está **temporariamente
   * desligado por decisão** — e `Retry-After` diz isso à máquina, do mesmo jeito
   * que a tela do histórico diz ao médico.
   */
  return new Response(
    JSON.stringify({ error: "service_unavailable", function: "admin-user-ops" }),
    {
      status: 503,
      headers: { "Content-Type": "application/json", "Retry-After": "3600", ...CORS },
    }
  );
});
