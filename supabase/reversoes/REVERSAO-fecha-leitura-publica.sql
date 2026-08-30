-- ⚠️⚠️ REVERSÃO DA FASE 4 — saída de emergência, ⛔ e ⛔ não plano B.
--
-- ⛔⛔ RODAR ISTO **REABRE O VAZAMENTO**: volta a expor `notes` e `event_data`
-- de ⛔ todas as sessões a quem tiver a chave publicável.
--
-- ⚠️ Existe por uma razão só: se o fechamento quebrar o app em produção, a
-- janela de indisponibilidade passa a ser *"o tempo de rodar um arquivo"*, em
-- vez de *"o tempo de escrever o SQL sob pressão"*. ⛔ Reversão que ⛔ não existe
-- ⛔ não é reversão — é intenção.
--
-- ⚠️ A Fase 1 ⛔ NÃO é revertida por aqui, e ⛔ não precisa ser: ela é inerte para
-- o app e ⛔ desfazê-la derrubaria os usuários anônimos já criados.
begin;

drop policy if exists "clinical_sessions_select_own" on public.clinical_sessions;
drop policy if exists "clinical_sessions_insert_own" on public.clinical_sessions;
drop policy if exists "clinical_sessions_update_own" on public.clinical_sessions;
drop policy if exists "clinical_session_events_select_own" on public.clinical_session_events;
drop policy if exists "clinical_session_events_insert_own" on public.clinical_session_events;

create policy "clinical_sessions_select_public"
on public.clinical_sessions for select to anon, authenticated using (true);
create policy "clinical_sessions_insert_public"
on public.clinical_sessions for insert to anon, authenticated with check (true);
create policy "clinical_sessions_update_public"
on public.clinical_sessions for update to anon, authenticated using (true) with check (true);
create policy "clinical_session_events_select_public"
on public.clinical_session_events for select to anon, authenticated using (true);
create policy "clinical_session_events_insert_public"
on public.clinical_session_events for insert to anon, authenticated with check (true);

commit;
