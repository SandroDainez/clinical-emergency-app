create extension if not exists pgcrypto;

create table if not exists public.clinical_sessions (
  id uuid primary key default gen_random_uuid(),
  module_key text not null,
  status text not null default 'started' check (status in ('started', 'completed', 'aborted')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  ended_at timestamptz
);

create table if not exists public.clinical_session_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.clinical_sessions(id) on delete cascade,
  event_type text not null,
  event_label text not null,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists clinical_sessions_created_at_idx
  on public.clinical_sessions (created_at desc);

create index if not exists clinical_sessions_module_key_idx
  on public.clinical_sessions (module_key);

create index if not exists clinical_session_events_session_created_at_idx
  on public.clinical_session_events (session_id, created_at asc);

alter table public.clinical_sessions enable row level security;
alter table public.clinical_session_events enable row level security;

drop policy if exists "clinical_sessions_select_public" on public.clinical_sessions;
create policy "clinical_sessions_select_public"
on public.clinical_sessions
for select
to anon, authenticated
using (true);

drop policy if exists "clinical_sessions_insert_public" on public.clinical_sessions;
create policy "clinical_sessions_insert_public"
on public.clinical_sessions
for insert
to anon, authenticated
with check (true);

drop policy if exists "clinical_sessions_update_public" on public.clinical_sessions;
create policy "clinical_sessions_update_public"
on public.clinical_sessions
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "clinical_session_events_select_public" on public.clinical_session_events;
create policy "clinical_session_events_select_public"
on public.clinical_session_events
for select
to anon, authenticated
using (true);

drop policy if exists "clinical_session_events_insert_public" on public.clinical_session_events;
create policy "clinical_session_events_insert_public"
on public.clinical_session_events
for insert
to anon, authenticated
with check (true);
