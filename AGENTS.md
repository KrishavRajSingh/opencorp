# opencorp

Next.js 16 (App Router) + Mastra AI — an autonomous user-acquisition platform.

## Current state (last touched 2026-09-13)

**Shipped:** 5 zero-login `/tools/*` pages, all live at `opencorp.live/tools/*`:
- `reddit-thread-finder` — Reddit JSON search, top 25 threads ranked by relevance/top/new/comments, subreddit filter, time filter. ~5min edge cache.
- `hn-thread-finder` — HN Algolia search, top 25 threads, Show HN / Ask HN / all-stories filter, sort by relevance/points/comments/recency. ~5min edge cache.
- `niche-subreddit-finder` — Reddit JSON search across all, group by subreddit, rank by post count + score + comments, top post per sub. ~10min edge cache.
- `show-hn-drafter` — wraps existing `showHNDrafterAgent`. Fetches `bestofshowhn.com` corpus for current year, calls agent, returns title + body, copy button.
- `competitor-scraper` — wraps `productAnalystAgent` + `competitorAnalystAgent` + `searchExa`. Full pipeline: read product → plan 5 search angles → dedupe by domain → synthesize top 5-10 competitors. ~30-60s, ~$0.05/run.

**Pattern:** `src/app/tools/<slug>/{actions.ts,form.tsx,results.tsx,page.tsx}` + `src/lib/tools/<engine>.ts`. Server actions only. No Supabase persistence (deferred). Each page has JSON-LD `WebApplication` + `FAQPage`, sitemap entry, IndexNow ping on script run.

**Analytics events added** (`src/lib/analytics.ts`):
- `tool_run` `{ tool }`
- `tool_thread_click` `{ tool, rank }`
- `tool_to_dashboard` `{ tool }`

**Validation plan (free, no DMs, no paid channels):**
- Daily `pnpm check:traffic` writes `data/metrics/traffic-YYYY-MM-DD.json` (pageviews, uniques, byPath, /tools/* breakdown).
- Day-0 baseline: 80 PV / 60 uniques (7d window before tools shipped). /tools/* = 0.
- 5+ visits/day on any tool page → funnel works, layer pSEO + IndexNow.
- 0-2 visits/day → fix SEO angle or change the tools. No DMs yet.
- Open `data/metrics/traffic-<today>.json` in a new tab to see the current state.

**Deliberately NOT done (do not do without asking):**
- No DMs sent anywhere. No `dm` mode in `x-composer.ts`. No `daily-engagement-followup.ts` task.
- No outreach automation on Reddit (rdt-cli is personal account `pop6996pop`).
- No X Premium purchase.
- No new posts/replies from this session on `opencorpai`.
- Pre-existing `daily-posts.ts` + `daily-replies.ts` triggers untouched.

**Open decision:** whether to add a 6th tool, ship pSEO scale (3 → 50 `/best/` pages), build the public leaderboard, or do outreach. Pending traffic data.

## Commands

```bash
pnpm dev          # dev server at localhost:3000
pnpm build        # production build
pnpm lint         # ESLint only (no typecheck script)
```

pnpm is the only package manager in use.

## Web analytics (Vercel CLI)

When asked for analytics/traffic/stats, query **Vercel Web Analytics** via the `vercel` CLI:

```bash
npx -y vercel@58.7.1 metrics vercel.analytics_pageview.count --since 3d --granularity 1d --all --group-by project_name
```

- No `--from`/`--to` flags — specific day range uses `--since <ISO date> --until <ISO date>` (e.g. `--since 2026-08-06 --until 2026-08-07 --granularity 1d`).
- Default aggregation is `sum` (pageviews). Unique visitors: `-a unique/visitor_id`.
- Local `vercel` binary is old (50.4.0) and lacks `metrics` — always use `npx -y vercel@58.7.1`.
- No project is linked in this repo; use `--all` or `--project <name>` (main project: `opencompany`).
- For deeper views: `--group-by` by `request_path` / `country`, `--aggregation unique/visitor_id` for unique visitors, `--prod` to limit to production. Docs: https://vercel.com/docs/analytics/accessing-metrics-with-vercel-cli

## Architecture

- **`src/app/`** — Next.js App Router pages and layout. Dark mode is hardcoded in `layout.tsx` (class `dark` on `<body>`). Headings use `GeistPixelSquare` from `geist/font/pixel` (`--font-heading`).
- **`src/components/ui/`** — shadcn/ui components (radix-nova style, lucide icons). Regenerate with `pnpm dlx shadcn@latest add <name>`.
- **`src/components/ai-elements/`** — custom AI chat UI components (panels, messages, artifacts, etc.).
- **`src/mastra/`** — Mastra AI framework. Entrypoint at `src/mastra/index.ts` exports a `Mastra` instance with storage (LibSQL + DuckDB), Pino logging, and OpenTelemetry observability.
- **`src/lib/utils.ts`** — `cn()` helper via `clsx` + `tailwind-merge`.
- **`src/lib/analytics.ts`** — typed `trackEvent(...)` wrapper around `window.umami.track(...)`. No-ops in dev (`NODE_ENV !== "production"`). Umami cloud script is injected via `next/script` in `src/app/layout.tsx`. Event-name union lives in this file.
- **Path alias**: `@/*` → `./src/*`

## Mastra

- Uses `openrouter/deepseek/deepseek-v4-flash` model through **OpenRouter** (requires `OPENROUTER_API_KEY` in `.env`). The `openrouter/` prefix triggers Mastra's OpenRouter provider which reads `OPENROUTER_API_KEY`. Automatic prompt caching reduces repeated-prefix cost by 60-80%.
- Storage: LibSQL (default) + DuckDB (observability domain).
- Agents, tools, and workflows live in `src/mastra/agents/`, `src/mastra/tools/`, `src/mastra/workflows/`.

## Tech stack quirks

- **Tailwind v4** with `@theme inline` directive, `tw-animate-css`, and `shadcn/tailwind.css`. PostCSS plugin is `@tailwindcss/postcss`.
- **pnpm-workspace.yaml** blocks esbuild, sharp, and unrs-resolver builds (`allowBuilds: false`).
- **Zod v4** — use the newer API.
- No test framework is configured.

## Style

- `@/components/ui/` components use `cva` (class-variance-authority) for variants.
- Prefer `motion/react` (framer-motion v12+) for animations (already used in `page.tsx`).
- All components are `"use client"` unless server-rendered.
- **When making frontend UI changes, load the `frontend-design` skill first** for intentional, distinctive visual design.

## Git

- **Never commit.** The user is the only one who commits. Make file changes, but do not `git add`, `git commit`, or `git push` unless the user explicitly asks for that specific action. This includes commits to spec/plan/notes docs, code, config, and one-off fixes.
