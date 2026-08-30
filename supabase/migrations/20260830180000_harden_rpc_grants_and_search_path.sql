-- ============================================================================
-- ENDURECIMENTO DE RPCs, search_path E POLICIES DE initplan
--
-- Auditoria de 2026-08-30. Esta migration NÃO foi aplicada em produção — ela
-- aguarda aprovação explícita do autor.
--
-- ⛔ ELA NÃO TOCA em clinical_sessions nem clinical_session_events: a correção
-- daquelas policies exige decisão de arquitetura sobre POSSE DE SESSÃO ANÔNIMA
-- (536 das 697 sessões são anônimas) e foi reportada em separado, sem código.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- P0-1 · admin_list_users() — SECURITY DEFINER sem qualquer validação,
--        executável por anon, lendo auth.users inteiro.
--
-- EVIDÊNCIA: chamada com a chave publishable (anon) devolveu 46 linhas de
-- auth.users — id, e-mail, created_at, last_sign_in_at, confirmação.
-- Isso é enumeração de e-mail de toda a base por qualquer um que tenha a chave
-- que já viaja no bundle do cliente.
--
-- CONSUMIDORES: nenhum. Não aparece no app, nem no bundle publicado, nem em
-- nenhuma das cinco Edge Functions implantadas (verificado por busca no corpo
-- de cada uma).
--
-- DECISÃO: revogar o EXECUTE e, ainda assim, colocar a guarda interna. A função
-- não é removida nesta migration porque remover é irreversível e ela não tem
-- consumidor conhecido — a remoção vai proposta em separado.
-- ─────────────────────────────────────────────────────────────────────────────
revoke execute on function public.admin_list_users() from public;
revoke execute on function public.admin_list_users() from anon;
revoke execute on function public.admin_list_users() from authenticated;

create or replace function public.admin_list_users()
returns table (
  id                uuid,
  email             text,
  created_at        timestamptz,
  last_sign_in_at   timestamptz,
  is_confirmed      boolean
)
language plpgsql
security definer
-- ⚠️ Mínimo necessário: a função lê auth.users e app_users, e nada mais.
set search_path = auth, public, pg_catalog
as $$
begin
  -- ⚠️ Exige usuário autenticado. anon tem auth.uid() nulo e cai aqui.
  if auth.uid() is null then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  -- ⚠️ E admin ATIVO — a mesma guarda que admin_list_app_users já usava.
  if not exists (
    select 1 from public.app_users au
    where au.id = auth.uid()
      and au.role = 'admin'
      and au.status = 'ativo'
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return query
  select u.id, u.email::text, u.created_at, u.last_sign_in_at,
         (u.email_confirmed_at is not null)
  from auth.users u
  order by u.created_at desc;
end;
$$;

-- ⚠️ CREATE OR REPLACE restaura o ACL padrão; revogar de novo, depois.
revoke execute on function public.admin_list_users() from public;
revoke execute on function public.admin_list_users() from anon;
revoke execute on function public.admin_list_users() from authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- P1 · EXECUTE desnecessário para anon nas RPCs administrativas.
--
-- Todas já validam admin ativo internamente, então isto NÃO corrige uma
-- vulnerabilidade demonstrada: remove privilégio que nunca teve uso legítimo.
-- anon não tem auth.uid(), logo nunca poderia passar na guarda.
-- ─────────────────────────────────────────────────────────────────────────────
revoke execute on function public.admin_list_app_users() from anon;
revoke execute on function public.admin_list_ratings() from anon;
revoke execute on function public.admin_usage_summary() from anon;
revoke execute on function public.admin_set_user_role(uuid, public.app_user_role) from anon;
revoke execute on function public.admin_set_user_status(uuid, public.app_user_status) from anon;
revoke execute on function public.admin_set_user_pagamento(uuid, public.app_user_payment_status) from anon;

-- ⚠️ get_current_app_user é escopada a auth.uid() e devolve zero linhas para
-- anon. Revogar de anon não muda comportamento legítimo: o app só a chama
-- depois do login (lib/app-user.ts).
revoke execute on function public.get_current_app_user() from anon;

-- ─────────────────────────────────────────────────────────────────────────────
-- P1 · Funções de TRIGGER não precisam de exposição RPC nenhuma.
-- Elas rodam pelo trigger, com o privilégio do dono — nunca por chamada direta.
-- ─────────────────────────────────────────────────────────────────────────────
revoke execute on function public.handle_auth_user_created() from public;
revoke execute on function public.handle_auth_user_created() from anon;
revoke execute on function public.handle_auth_user_created() from authenticated;
revoke execute on function public.handle_auth_user_updated() from public;
revoke execute on function public.handle_auth_user_updated() from anon;
revoke execute on function public.handle_auth_user_updated() from authenticated;
revoke execute on function public.touch_app_users_updated_at() from public;
revoke execute on function public.touch_app_users_updated_at() from anon;
revoke execute on function public.touch_app_users_updated_at() from authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- P2 · touch_app_users_updated_at() com search_path mutável.
-- Corpo inalterado; só o search_path passa a ser explícito e mínimo.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.touch_app_users_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.atualizado_em = timezone('utc', now());
  return new;
end;
$$;

revoke execute on function public.touch_app_users_updated_at() from public;
revoke execute on function public.touch_app_users_updated_at() from anon;
revoke execute on function public.touch_app_users_updated_at() from authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- P2 · initplan — auth.uid() por linha vira (select auth.uid()).
--
-- ⚠️ A LÓGICA DE AUTORIZAÇÃO É IDÊNTICA. auth.uid() é STABLE e não depende da
-- linha; embrulhá-lo num subselect faz o planner avaliá-lo UMA vez por
-- statement em vez de uma vez por linha. Mesmo conjunto de linhas autorizadas.
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "app_users_select_self" on public.app_users;
create policy "app_users_select_self"
on public.app_users for select to authenticated
using ((select auth.uid()) = id);

drop policy if exists "app_ratings_select_own" on public.app_ratings;
create policy "app_ratings_select_own"
on public.app_ratings for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "app_ratings_insert_own" on public.app_ratings;
create policy "app_ratings_insert_own"
on public.app_ratings for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "app_ratings_update_own" on public.app_ratings;
create policy "app_ratings_update_own"
on public.app_ratings for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));
