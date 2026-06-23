-- Migration: create research_sessions table with RLS
-- Run in Supabase dashboard → SQL Editor → New query

create table if not exists public.research_sessions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users(id) on delete cascade,
  input                  jsonb not null,
  product_analyst_result jsonb,
  competitor_result      jsonb,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists research_sessions_user_id_updated_at_idx
  on public.research_sessions (user_id, updated_at desc);

alter table public.research_sessions enable row level security;

-- Per Supabase security checklist: combine TO authenticated with an ownership
-- predicate. (TO authenticated alone is authentication without authorization
-- — known as BOLA / IDOR.)
drop policy if exists "users read own sessions"   on public.research_sessions;
drop policy if exists "users insert own sessions" on public.research_sessions;
drop policy if exists "users update own sessions" on public.research_sessions;
drop policy if exists "users delete own sessions" on public.research_sessions;

create policy "users read own sessions"
  on public.research_sessions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users insert own sessions"
  on public.research_sessions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "users update own sessions"
  on public.research_sessions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users delete own sessions"
  on public.research_sessions for delete
  to authenticated
  using ((select auth.uid()) = user_id);
