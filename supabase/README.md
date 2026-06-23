# Supabase

This directory holds SQL migrations for the Supabase project at
`https://tyqygzfodwczewacch.supabase.co`.

## Running a migration

1. Open the Supabase dashboard: https://supabase.com/dashboard/project/tyqygzfodwczewacch/sql/new
2. Paste the contents of the file (e.g. `0001_research_results.sql`).
3. Click **Run**.

You do **not** need the Supabase CLI for this workflow — the project is
configured via env vars and the JS client only. If you want CLI-driven
migrations later, run `supabase init` here and move the SQL into
`supabase/migrations/` (already structured for that).

## Migrations

| File | Purpose |
| --- | --- |
| `0001_research_sessions.sql` | `research_sessions` table + RLS policies. One row per project/session; `product_analyst_result` and `competitor_result` are filled in by the dashboard when each agent completes. |
