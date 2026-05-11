drop policy if exists "app_users_select_admin" on public.app_users;
drop policy if exists "app_users_update_admin" on public.app_users;

create or replace function public.get_current_app_user()
returns table (
  id uuid,
  email text,
  nome text,
  status public.app_user_status,
  role public.app_user_role,
  pagamento public.app_user_payment_status,
  data_criacao timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    au.id,
    au.email,
    au.nome,
    au.status,
    au.role,
    au.pagamento,
    au.data_criacao
  from public.app_users au
  where au.id = auth.uid();
end;
$$;

create or replace function public.admin_list_app_users()
returns table (
  id uuid,
  email text,
  nome text,
  status public.app_user_status,
  role public.app_user_role,
  pagamento public.app_user_payment_status,
  data_criacao timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.app_users au
    where au.id = auth.uid()
      and au.role = 'admin'
      and au.status = 'ativo'
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return query
  select
    au.id,
    au.email,
    au.nome,
    au.status,
    au.role,
    au.pagamento,
    au.data_criacao
  from public.app_users au
  order by au.data_criacao desc;
end;
$$;

create or replace function public.admin_set_user_status(
  target_user_id uuid,
  next_status public.app_user_status
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.app_users au
    where au.id = auth.uid()
      and au.role = 'admin'
      and au.status = 'ativo'
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.app_users
  set status = next_status
  where id = target_user_id;
end;
$$;

revoke all on function public.get_current_app_user() from public;
grant execute on function public.get_current_app_user() to authenticated;

revoke all on function public.admin_list_app_users() from public;
grant execute on function public.admin_list_app_users() to authenticated;

revoke all on function public.admin_set_user_status(uuid, public.app_user_status) from public;
grant execute on function public.admin_set_user_status(uuid, public.app_user_status) to authenticated;
