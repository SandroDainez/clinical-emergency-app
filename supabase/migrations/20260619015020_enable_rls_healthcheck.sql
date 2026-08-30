-- RECUPERADA DO BANCO REMOTO em 2026-08-30, ⛔ NÃO reconstruída por adivinhação.
-- Origem: supabase_migrations.schema_migrations.statements (SQL exato que foi aplicado).
-- Esta migration JÁ ESTÁ APLICADA em produção; o arquivo existe para o
-- repositório representar o banco. ⛔ Não reaplicar.

ALTER TABLE public.healthcheck ENABLE ROW LEVEL SECURITY;

CREATE POLICY "healthcheck_read_all"
  ON public.healthcheck FOR SELECT
  USING (true);;
