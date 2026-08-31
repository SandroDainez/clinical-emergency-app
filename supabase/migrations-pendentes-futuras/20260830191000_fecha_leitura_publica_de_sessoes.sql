-- ═══════════════════════════════════════════════════════════════════════════
-- FASE 4 · FECHA A LEITURA PÚBLICA DAS SESSÕES CLÍNICAS — o P0.
--
-- ⛔⛔ NÃO APLICADA. ⛔ Depende da Fase 1 aplicada, da função de claim
-- implantada, do cliente implantado e de Anonymous Sign-In JÁ HABILITADO.
--
-- ── ⚠️⚠️ O DEFEITO QUE ISTO FECHA ─────────────────────────────────────────
--
-- `20260324103000` criou as políticas com `using (true)` para `anon`: qualquer
-- pessoa com a chave publicável — pública ⛔ por definição, embarcada no bundle
-- web — lê **todas** as sessões clínicas, ⛔ inclusive `notes` e ⛔ todo o
-- `event_data`. Confirmado empiricamente na auditoria usando ⛔ apenas contagens.
--
-- ── ⚠️⚠️ ⛔ POR QUE ESTA MIGRATION ⛔ NÃO PODE VIR ANTES ────────────────────
--
-- ⚠️ Ela troca *"todos podem ler"* por *"o dono pode ler"*. Enquanto o cliente
-- ⛔ não tiver `auth.uid()` — ou seja, enquanto Anonymous Sign-In estiver
-- desligado — **dono ⛔ não existe**, e o app não-autenticado para de funcionar
-- por completo. ⛔ Aplicar fora de ordem ⛔ não é imprudência: é interrupção.
--
-- ── ⚠️⚠️ O QUE ESTA MIGRATION CUSTA, DITO SEM RODEIO ──────────────────────
--
-- ⚠️ Neste instante as sessões legadas com `user_id IS NULL` deixam de ser
-- acessíveis pelo cliente e passam a ser **legacy orphaned**, acessíveis ⛔ só
-- ao `service_role`. É a regra dada: ⛔ `user_id IS NULL` ⛔ não é posse. Linha sem
-- dono virar linha de todos ⛔ **é** o vazamento, escrito de outro jeito.
--
-- ⚠️ ⛔ ISTO ⛔ NÃO SE DESFAZ SOZINHO. A reversão está preparada e pronta para
-- rodar em `supabase/reversoes/20260830191000_reverte_fechamento.sql` — ela
-- reabre o acesso público, ⛔ com o vazamento junto. É saída de emergência,
-- ⛔ não plano B confortável.
--
-- ⚠️ Toda a troca acontece em UMA transação: DDL no Postgres é transacional,
-- então ⛔ não existe instante intermediário em que ⛔ nenhuma política valha.
-- ═══════════════════════════════════════════════════════════════════════════
begin;

-- ── 4 · AS POLÍTICAS ──────────────────────────────────────────────────────
--
-- ⚠️ `to authenticated` ⛔ apenas: o usuário anônimo do Supabase **é**
-- `authenticated` (ele tem JWT e `auth.uid()`). O papel `anon` é o de quem
-- ⛔ não tem sessão ⛔ nenhuma — e esse ⛔ não deve ler ⛔ nada.
--
-- ⚠️ `(select auth.uid())` em vez de `auth.uid()`: o planejador avalia uma vez
-- por consulta em vez de uma vez por linha (initplan).

drop policy if exists "clinical_sessions_select_public" on public.clinical_sessions;
drop policy if exists "clinical_sessions_insert_public" on public.clinical_sessions;
drop policy if exists "clinical_sessions_update_public" on public.clinical_sessions;

create policy "clinical_sessions_select_own"
on public.clinical_sessions for select to authenticated
using ((select auth.uid()) = user_id);

create policy "clinical_sessions_insert_own"
on public.clinical_sessions for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "clinical_sessions_update_own"
on public.clinical_sessions for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- ⚠️⚠️ OS EVENTOS ⛔ NÃO TÊM DONO PRÓPRIO — ⛔ e ⛔ não devem ter.
--
-- A autorização deles **deriva da sessão pai**. Uma coluna `user_id` aqui seria
-- um segundo dono capaz de **divergir** do primeiro, e a transferência teria de
-- acertar os dois em sincronia — ⛔ dois lugares para a mesma verdade (I6).
--
-- ⚠️ Consequência boa: mover a sessão move os eventos junto, ⛔ sem tocá-los.

drop policy if exists "clinical_session_events_select_public" on public.clinical_session_events;
drop policy if exists "clinical_session_events_insert_public" on public.clinical_session_events;

create policy "clinical_session_events_select_own"
on public.clinical_session_events for select to authenticated
using (exists (
  select 1 from public.clinical_sessions s
  where s.id = session_id and s.user_id = (select auth.uid())
));

create policy "clinical_session_events_insert_own"
on public.clinical_session_events for insert to authenticated
with check (exists (
  select 1 from public.clinical_sessions s
  where s.id = session_id and s.user_id = (select auth.uid())
));

commit;
