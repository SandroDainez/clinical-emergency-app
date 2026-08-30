-- RECUPERADA DO BANCO REMOTO em 2026-08-30, ⛔ NÃO reconstruída por adivinhação.
-- Origem: supabase_migrations.schema_migrations.statements (SQL exato que foi aplicado).
-- Esta migration JÁ ESTÁ APLICADA em produção; o arquivo existe para o
-- repositório representar o banco. ⛔ Não reaplicar.

alter table public.clinical_sessions
  add column if not exists user_id uuid default auth.uid()
  references public.app_users(id) on delete set null;

create index if not exists clinical_sessions_user_id_idx
  on public.clinical_sessions (user_id);

create table if not exists public.app_ratings (
  user_id    uuid primary key default auth.uid()
             references public.app_users(id) on delete cascade,
  rating     integer not null check (rating >= 1 and rating <= 5),
  comment    text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists app_ratings_updated_at_idx
  on public.app_ratings (updated_at desc);

alter table public.app_ratings enable row level security;

drop policy if exists "app_ratings_select_own" on public.app_ratings;
create policy "app_ratings_select_own"
on public.app_ratings for select to authenticated
using (user_id = auth.uid());

drop policy if exists "app_ratings_insert_own" on public.app_ratings;
create policy "app_ratings_insert_own"
on public.app_ratings for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "app_ratings_update_own" on public.app_ratings;
create policy "app_ratings_update_own"
on public.app_ratings for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop function if exists public.admin_list_app_users();
create function public.admin_list_app_users()
returns table (
  id             uuid,
  email          text,
  nome           text,
  status         public.app_user_status,
  role           public.app_user_role,
  pagamento      public.app_user_payment_status,
  data_criacao   timestamptz,
  ultimo_acesso  timestamptz,
  casos_count    bigint,
  ultimo_caso    timestamptz
)
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (
    select 1 from public.app_users au
    where au.id = auth.uid() and au.role = 'admin' and au.status = 'ativo'
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return query
  select
    au.id, au.email, au.nome, au.status, au.role, au.pagamento,
    au.data_criacao, u.last_sign_in_at,
    coalesce(cs.casos_count, 0) as casos_count, cs.ultimo_caso
  from public.app_users au
  join auth.users u on u.id = au.id
  left join (
    select s.user_id, count(*) as casos_count, max(s.created_at) as ultimo_caso
    from public.clinical_sessions s
    where s.user_id is not null
    group by s.user_id
  ) cs on cs.user_id = au.id
  order by au.data_criacao desc;
end;
$$;
revoke all on function public.admin_list_app_users() from public;
grant execute on function public.admin_list_app_users() to authenticated;

drop function if exists public.admin_list_ratings();
create function public.admin_list_ratings()
returns table (
  user_id uuid, nome text, email text,
  rating integer, comment text,
  created_at timestamptz, updated_at timestamptz
)
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (
    select 1 from public.app_users au
    where au.id = auth.uid() and au.role = 'admin' and au.status = 'ativo'
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return query
  select r.user_id, au.nome, au.email, r.rating, r.comment, r.created_at, r.updated_at
  from public.app_ratings r
  join public.app_users au on au.id = r.user_id
  order by r.updated_at desc;
end;
$$;
revoke all on function public.admin_list_ratings() from public;
grant execute on function public.admin_list_ratings() to authenticated;;
