-- ═══════════════════════════════════════════════════════════════════════════
-- FECHA O ACESSO CLÍNICO À CONTA ATIVA — o P0, pelo caminho curto.
--
-- ⛔⛔ NÃO APLICADA. Depende da guarda de rota publicada antes.
--
-- ── ⚠️⚠️ O DEFEITO ────────────────────────────────────────────────────────
--
-- `20260324103000` criou as policies com `using (true)` para `anon`. Qualquer
-- pessoa com a chave publicável — pública ⛔ por definição, embarcada no bundle
-- web — lê **todas** as sessões clínicas, ⛔ inclusive `notes` e `event_data`.
--
-- ⚠️ E o build publica uma URL por módulo, então `/session-history` entregava
-- isso pela **própria interface**, ⛔ sem login ⛔ nenhum.
--
-- ── ⚠️⚠️ POR QUE ⛔ SEM O RAMO ANÔNIMO ─────────────────────────────────────
--
-- ⛔ A versão preparada para uso anônimo vive em `migrations-pendentes-futuras/`
-- e tem um `or (auth.jwt() ->> 'is_anonymous')::boolean is true`.
--
-- ⚠️⚠️ Enquanto ⛔ não houver uso clínico anônimo, esse `or` é uma **concessão
-- adormecida**: ligar Anonymous Sign-In no Dashboard — ⛔ um clique, ⛔ sem
-- migration ⛔ nenhuma — passaria a conceder acesso clínico. ⛔ A segurança de hoje
-- ficaria dependendo de uma configuração remota continuar desligada.
--
-- ⚠️ ⛔ Nada se perde: a outra versão está versionada, e volta junto com o
-- recurso quando ele voltar ao roadmap.
--
-- ── ⚠️ O QUE ISTO CUSTA, DITO SEM RODEIO ──────────────────────────────────
--
-- ⚠️ 536 das 697 sessões têm `user_id IS NULL`. Elas permanecem **no banco**,
-- ⛔ intactas, e deixam de ser acessíveis ao cliente. Das 46 contas, ⛔ só 7
-- possuem alguma sessão — as outras 39 verão histórico vazio.
--
-- ⛔ ⛔ ⛔ NENHUMA delas é atribuída a ⛔ ninguém. Linha sem dono virar linha de
-- todos ⛔ **é** o vazamento, escrito de outro jeito.
-- ═══════════════════════════════════════════════════════════════════════════
begin;

-- ── ⚠️⚠️ A AUTORIZAÇÃO, NUM LUGAR SÓ ──────────────────────────────────────
--
-- ⚠️ `security invoker`: a função lê a **própria** linha do chamador, e
-- `app_users_select_self` (`auth.uid() = id`) já permite ⛔ exatamente isso.
-- ⛔ ⛔ Nenhum SECURITY DEFINER genérico contornando RLS.
--
-- ⚠️ `stable`: o planejador pode avaliar uma vez por consulta.
create or replace function public.pode_usar_clinico()
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
      from public.app_users a
     where a.id = auth.uid()
       and a.status = 'ativo'
  );
$$;

revoke execute on function public.pode_usar_clinico() from public;
revoke execute on function public.pode_usar_clinico() from anon;
grant execute on function public.pode_usar_clinico() to authenticated;

-- ── ⚠️⚠️ AS POLICIES ──────────────────────────────────────────────────────
--
-- ⚠️ `to authenticated` ⛔ apenas. O papel `anon` — quem ⛔ não tem sessão
-- ⛔ nenhuma — deixa de ter policy, e ⛔ portanto ⛔ não lê ⛔ nada.
--
-- ⚠️ `(select …)` nas duas chamadas: initplan. ⛔ Sem isso, `pode_usar_clinico()`
-- rodaria **por linha** — numa listagem de 536, a diferença entre 1 e 536.
--
-- ⚠️⚠️ A autorização entra no `using` **e** no `with check`. ⛔ Só no `using`, a
-- conta `pendente` continuaria conseguindo **inserir**.

drop policy if exists "clinical_sessions_select_public" on public.clinical_sessions;
drop policy if exists "clinical_sessions_insert_public" on public.clinical_sessions;
drop policy if exists "clinical_sessions_update_public" on public.clinical_sessions;

create policy "clinical_sessions_select_own"
on public.clinical_sessions for select to authenticated
using (user_id = (select auth.uid()) and (select public.pode_usar_clinico()));

create policy "clinical_sessions_insert_own"
on public.clinical_sessions for insert to authenticated
with check (user_id = (select auth.uid()) and (select public.pode_usar_clinico()));

create policy "clinical_sessions_update_own"
on public.clinical_sessions for update to authenticated
using (user_id = (select auth.uid()) and (select public.pode_usar_clinico()))
with check (user_id = (select auth.uid()) and (select public.pode_usar_clinico()));

-- ⚠️⚠️ ⛔ NENHUMA POLICY DE DELETE — ⛔ e a ausência é a decisão.
--
-- ⛔ Sem policy, apagar já é negado por padrão. Criar uma seria **conceder uma
-- capacidade nova**, ⛔ e ⛔ não fechar um buraco. Fechamento de vulnerabilidade
-- ⛔ não é hora de ampliar o que dá para fazer.

-- ⚠️⚠️ OS EVENTOS DERIVAM DA SESSÃO PAI, ⛔ e ⛔ não têm dono próprio.
--
-- ⛔ Uma coluna `user_id` aqui seria um segundo dono capaz de **divergir** do
-- primeiro, e toda transferência teria de acertar os dois em sincronia — ⛔ dois
-- lugares para a mesma verdade.

drop policy if exists "clinical_session_events_select_public" on public.clinical_session_events;
drop policy if exists "clinical_session_events_insert_public" on public.clinical_session_events;

create policy "clinical_session_events_select_own"
on public.clinical_session_events for select to authenticated
using (exists (
  select 1 from public.clinical_sessions s
  where s.id = session_id
    and s.user_id = (select auth.uid())
    and (select public.pode_usar_clinico())
));

create policy "clinical_session_events_insert_own"
on public.clinical_session_events for insert to authenticated
with check (exists (
  select 1 from public.clinical_sessions s
  where s.id = session_id
    and s.user_id = (select auth.uid())
    and (select public.pode_usar_clinico())
));

commit;
