-- Migration: allow anyone with the session URL to read it (public share links)
-- Run in Supabase dashboard → SQL Editor → New query

drop policy if exists "anyone with the link can read" on public.research_sessions;

create policy "anyone with the link can read"
  on public.research_sessions for select
  to anon
  using (true);
