-- ═══════════════════════════════════════════════════════════════════════════
-- DEGRAU 3 · FAIL-CLOSED — o histórico fecha, ⛔ e ⛔ NADA se abre.
--
-- ⚠️⚠️ ESTE MODO TORNA O HISTÓRICO INDISPONÍVEL PARA O CLIENTE, MAS ⛔ NÃO
-- ⚠️⚠️ REABRE ACESSO ENTRE USUÁRIOS.
--
-- ── ⚠️ QUANDO USAR ────────────────────────────────────────────────────────
--
-- Depois da Fase 4, se a leitura legítima quebrar e ⛔ não der para redeployar o
-- cliente rápido. ⚠️ É SQL puro, aplica em segundos, e ⛔ não depende de build.
--
-- ⚠️⚠️ ⛔ NÃO é rollback do fechamento. É **mais fechado** que o fechamento:
-- troca *"o dono lê"* por *"⛔ ninguém lê pelo cliente"*. A falha vira histórico
-- **vazio**, ⛔ e ⛔ nunca histórico **de outra pessoa**.
--
-- ── ⚠️⚠️ O QUE ELE ⛔ NÃO FAZ ──────────────────────────────────────────────
--
-- ⛔ ⛔ ⛔ Nenhuma policy pública é recriada. ⛔ Nenhum `USING (true)`.
-- ⛔ ⛔ ⛔ Nenhuma linha é lida, alterada ⛔ ou apagada. ⛔ Zero `select`, zero
--         `update`, zero `delete` — ⛔ nem em `notes`, ⛔ nem em `event_data`.
-- ⛔ ⛔ ⛔ Posse ⛔ não é tocada: `user_id` fica ⛔ exatamente como está.
--
-- ⚠️ O `service_role` continua com acesso administrativo — ⛔ ele ⛔ não passa por
-- RLS ⛔ por definição, então investigação e suporte seguem possíveis.
--
-- ── ⚠️ COMO SAIR DESTE MODO ───────────────────────────────────────────────
--
-- Reaplicar `supabase/migrations/20260830191000_fecha_leitura_publica_de_sessoes.sql`,
-- que recria as policies de posse. ⚠️ A saída é para o estado **seguro**,
-- ⛔ e ⛔ não para o estado aberto.
-- ═══════════════════════════════════════════════════════════════════════════
begin;

-- ⚠️ `using (false)` em vez de `drop policy`: sem policy ⛔ nenhuma, uma tabela
-- com RLS ligada também nega tudo — mas ⛔ silenciosamente, e o próximo a olhar
-- ⛔ não saberia se foi decisão ⛔ ou acidente. ⚠️ A policy explícita **declara**.

drop policy if exists "clinical_sessions_select_own" on public.clinical_sessions;
drop policy if exists "clinical_sessions_insert_own" on public.clinical_sessions;
drop policy if exists "clinical_sessions_update_own" on public.clinical_sessions;
drop policy if exists "clinical_session_events_select_own" on public.clinical_session_events;
drop policy if exists "clinical_session_events_insert_own" on public.clinical_session_events;

create policy "clinical_sessions_degradado"
on public.clinical_sessions for all to authenticated
using (false) with check (false);

create policy "clinical_session_events_degradado"
on public.clinical_session_events for all to authenticated
using (false) with check (false);

commit;
