do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_user_status') then
    create type public.app_user_status as enum ('pendente', 'ativo', 'bloqueado');
  end if;

  if not exists (select 1 from pg_type where typname = 'app_user_role') then
    create type public.app_user_role as enum ('user', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'app_user_payment_status') then
    create type public.app_user_payment_status as enum ('pago', 'nao_pago');
  end if;
end $$;

create table if not exists public.app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  email text not null unique,
  status public.app_user_status not null default 'pendente',
  role public.app_user_role not null default 'user',
  pagamento public.app_user_payment_status not null default 'nao_pago',
  data_criacao timestamptz not null default timezone('utc', now()),
  atualizado_em timestamptz not null default timezone('utc', now())
);

create index if not exists app_users_status_idx on public.app_users (status);
create index if not exists app_users_role_idx on public.app_users (role);
create index if not exists app_users_pagamento_idx on public.app_users (pagamento);
create index if not exists app_users_data_criacao_idx on public.app_users (data_criacao desc);

create or replace function public.touch_app_users_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists app_users_touch_updated_at on public.app_users;
create trigger app_users_touch_updated_at
before update on public.app_users
for each row
execute function public.touch_app_users_updated_at();

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.app_users (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do update
    set nome = excluded.nome,
        email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_auth_user_created();

create or replace function public.handle_auth_user_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.app_users
     set nome = coalesce(new.raw_user_meta_data ->> 'nome', new.raw_user_meta_data ->> 'full_name', app_users.nome),
         email = coalesce(new.email, app_users.email)
   where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update of email, raw_user_meta_data on auth.users
for each row
execute function public.handle_auth_user_updated();

alter table public.app_users enable row level security;

drop policy if exists "app_users_select_self" on public.app_users;
create policy "app_users_select_self"
on public.app_users
for select
to authenticated
using (auth.uid() = id);
