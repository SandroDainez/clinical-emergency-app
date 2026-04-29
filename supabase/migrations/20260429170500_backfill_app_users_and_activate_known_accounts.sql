-- Backfill app_users for auth accounts created before the app_users trigger existed
-- and normalize the two known access accounts used to validate login flows.

insert into public.app_users (id, nome, email)
select
  au.id,
  coalesce(au.raw_user_meta_data ->> 'nome', au.raw_user_meta_data ->> 'full_name', ''),
  coalesce(au.email, '')
from auth.users au
left join public.app_users app on app.id = au.id
where app.id is null
on conflict (id) do update
set
  nome = excluded.nome,
  email = excluded.email;

update public.app_users
set
  status = 'ativo',
  role = 'admin'
where lower(email) = 'sandrodainez1@gmail.com';

update public.app_users
set
  status = 'ativo',
  role = 'user'
where lower(email) = 'sandrodainez@hotmail.com';
