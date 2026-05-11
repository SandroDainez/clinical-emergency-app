drop policy if exists "app_users_select_admin" on public.app_users;
create policy "app_users_select_admin"
on public.app_users
for select
to authenticated
using (
  auth.uid() in (
    select id
    from public.app_users
    where role = 'admin' and status = 'ativo'
  )
);

drop policy if exists "app_users_update_admin" on public.app_users;
create policy "app_users_update_admin"
on public.app_users
for update
to authenticated
using (
  auth.uid() in (
    select id
    from public.app_users
    where role = 'admin' and status = 'ativo'
  )
)
with check (
  auth.uid() in (
    select id
    from public.app_users
    where role = 'admin' and status = 'ativo'
  )
);
