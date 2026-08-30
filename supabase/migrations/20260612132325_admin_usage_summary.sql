-- RECUPERADA DO BANCO REMOTO em 2026-08-30, ⛔ NÃO reconstruída por adivinhação.
-- Origem: supabase_migrations.schema_migrations.statements (SQL exato que foi aplicado).
-- Esta migration JÁ ESTÁ APLICADA em produção; o arquivo existe para o
-- repositório representar o banco. ⛔ Não reaplicar.

create or replace function public.admin_usage_summary()
returns table (
  total_users     bigint,
  users_logaram   bigint,
  total_casos     bigint,
  casos_7d        bigint,
  casos_hoje      bigint,
  casos_acls      bigint,
  casos_avc       bigint,
  ultimo_uso      timestamptz
)
language plpgsql
security definer
set search_path = public
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
    (select count(*) from public.app_users),
    (select count(*) from auth.users where last_sign_in_at is not null),
    (select count(*) from public.clinical_sessions),
    (select count(*) from public.clinical_sessions where created_at > now() - interval '7 days'),
    (select count(*) from public.clinical_sessions where created_at::date = (now() at time zone 'utc')::date),
    (select count(*) from public.clinical_sessions where module_key = 'acls_adulto'),
    (select count(*) from public.clinical_sessions where module_key = 'avc'),
    (select max(created_at) from public.clinical_sessions);
end;
$$;

revoke all on function public.admin_usage_summary() from public;
grant execute on function public.admin_usage_summary() to authenticated;;
