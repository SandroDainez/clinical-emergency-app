-- ============================================================
-- Admin full controls migration
-- Adds: ultimo_acesso to admin list, role change, payment change
-- ============================================================

-- 1. Replace admin_list_app_users to include last_sign_in_at
create or replace function public.admin_list_app_users()
returns table (
  id             uuid,
  email          text,
  nome           text,
  status         public.app_user_status,
  role           public.app_user_role,
  pagamento      public.app_user_payment_status,
  data_criacao   timestamptz,
  ultimo_acesso  timestamptz
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
    au.data_criacao,
    u.last_sign_in_at
  from public.app_users au
  join auth.users u on u.id = au.id
  order by au.data_criacao desc;
end;
$$;

revoke all on function public.admin_list_app_users() from public;
grant execute on function public.admin_list_app_users() to authenticated;


-- 2. New: change user role (user <-> admin)
create or replace function public.admin_set_user_role(
  target_user_id uuid,
  next_role       public.app_user_role
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

  -- Prevent admin from demoting themselves
  if target_user_id = auth.uid() then
    raise exception 'cannot change own role' using errcode = '22023';
  end if;

  update public.app_users
  set role = next_role
  where id = target_user_id;
end;
$$;

revoke all on function public.admin_set_user_role(uuid, public.app_user_role) from public;
grant execute on function public.admin_set_user_role(uuid, public.app_user_role) to authenticated;


-- 3. New: change payment status
create or replace function public.admin_set_user_pagamento(
  target_user_id  uuid,
  next_pagamento  public.app_user_payment_status
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
  set pagamento = next_pagamento
  where id = target_user_id;
end;
$$;

revoke all on function public.admin_set_user_pagamento(uuid, public.app_user_payment_status) from public;
grant execute on function public.admin_set_user_pagamento(uuid, public.app_user_payment_status) to authenticated;
