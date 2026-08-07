# opencorp

Next.js 16 (App Router) + Mastra AI — an autonomous user-acquisition platform.

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
