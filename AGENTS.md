# opencorp

Next.js 16 (App Router) + Mastra AI — an autonomous user-acquisition platform.

## Commands

```bash
pnpm dev          # dev server at localhost:3000
pnpm build        # production build
pnpm lint         # ESLint only (no typecheck script)
```

pnpm is the only package manager in use.

## Architecture

- **`src/app/`** — Next.js App Router pages and layout. Dark mode is hardcoded in `layout.tsx` (class `dark` on `<body>`). Headings use `GeistPixelSquare` from `geist/font/pixel` (`--font-heading`).
- **`src/components/ui/`** — shadcn/ui components (radix-nova style, lucide icons). Regenerate with `pnpm dlx shadcn@latest add <name>`.
- **`src/components/ai-elements/`** — custom AI chat UI components (panels, messages, artifacts, etc.).
- **`src/mastra/`** — Mastra AI framework. Entrypoint at `src/mastra/index.ts` exports a `Mastra` instance with storage (LibSQL + DuckDB), Pino logging, and OpenTelemetry observability.
- **`src/lib/utils.ts`** — `cn()` helper via `clsx` + `tailwind-merge`.
- **Path alias**: `@/*` → `./src/*`

## Mastra

- Uses `minimax/minimax-m2.7` model routed through **OpenRouter** (requires `OPENROUTER_API_KEY` in `.env`; also set `OPENAI_BASE_URL=https://openrouter.ai/api/v1`).
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
