-- Migration: add reddit_scan_result column to research_sessions
-- Run in Supabase dashboard → SQL Editor → New query

alter table public.research_sessions
  add column if not exists reddit_scan_result jsonb;
