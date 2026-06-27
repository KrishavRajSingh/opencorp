-- Migration: add hn_threads_result column to research_sessions
-- Run in Supabase dashboard → SQL Editor → New query

alter table public.research_sessions
  add column if not exists hn_threads_result jsonb;
