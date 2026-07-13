-- Migration: add show_hn_draft_result column to research_sessions
-- Run in Supabase dashboard → SQL Editor → New query

alter table public.research_sessions
  add column if not exists show_hn_draft_result jsonb;
