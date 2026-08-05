"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Mail, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0c-2.4-1.6-3.5-1.3-3.5-1.3a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 10c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2v3.5" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.095 2.157 2.418 0 1.334-.956 2.42-2.157 2.42zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.095 2.157 2.418 0 1.334-.946 2.42-2.157 2.42z" />
    </svg>
  );
}

const GITHUB_REPO = "KrishavRajSingh/opencorp";
const STARS_CACHE_KEY = "gh-stars-opencorp";

function formatStars(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function GitHubStarsLink() {
  // Always start null so the first client render matches SSR; the cached
  // value is applied from the effect below, after hydration.
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    // Fresh cache entry wins — no GitHub request.
    try {
      const cached = sessionStorage.getItem(STARS_CACHE_KEY);
      if (cached) {
        const { count, ts } = JSON.parse(cached) as {
          count: number;
          ts: number;
        };
        if (typeof count === "number" && Date.now() - ts < 60 * 60 * 1000) {
          // One-shot apply of the cached value right after mount — the
          // hydration-gating pattern this rule heuristically flags.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setStars(count);
          return;
        }
      }
    } catch {
      // ignore cache errors
    }

    fetch(`https://api.github.com/repos/${GITHUB_REPO}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("gh api"))))
      .then((d: { stargazers_count?: number }) => {
        if (typeof d.stargazers_count === "number") {
          setStars(d.stargazers_count);
          try {
            sessionStorage.setItem(
              STARS_CACHE_KEY,
              JSON.stringify({ count: d.stargazers_count, ts: Date.now() }),
            );
          } catch {
            // ignore cache errors
          }
        }
      })
      .catch(() => {
        // offline or rate-limited: keep bare icon
      });
  }, []);

  return (
    <a
      href={`https://github.com/${GITHUB_REPO}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-ink-soft transition-colors hover:text-ink"
      aria-label="GitHub"
    >
      <GitHubIcon className="size-5" />
      {stars !== null && (
        <span className="inline-flex items-center gap-1 rounded-md border border-line bg-white/70 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-ink-soft">
          <Star className="size-3 fill-current" />
          {formatStars(stars)}
        </span>
      )}
    </a>
  );
}

const NAV_LINKS = [
  { href: "#benefits", label: "What you get" },
  { href: "#how", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

function SiteNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav
        aria-label="Main"
        className="relative z-10 mx-auto mt-6 flex w-max max-w-[calc(100%-2rem)] items-center gap-1 rounded-full border border-line bg-white/85 p-2 pl-3 shadow-[0_8px_32px_-16px_rgba(16,19,26,0.25)] backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
      >
        <Link href="/" className="pr-2 font-display text-base font-semibold tracking-tight text-ink">
          OpenCorp
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-sm text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <GitHubStarsLink />
          <a
            href="https://discord.gg/ArQF8jtC9"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-soft transition-colors hover:text-ink"
            aria-label="Discord"
          >
            <DiscordIcon className="size-5" />
          </a>
        </div>

        <Button
          size="sm"
          asChild
          className="hidden md:inline-flex"
          onClick={() =>
            trackEvent({ name: "cta_open_dashboard", data: { location: "nav" } })
          }
        >
          <Link href="/dashboard">Try for free</Link>
        </Button>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="relative grid size-8 place-items-center rounded-full transition-colors hover:bg-ink/5 md:hidden"
        >
          <span
            className={cn(
              "absolute h-0.5 w-4 rounded-full bg-ink transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
              open ? "rotate-45" : "-translate-y-1",
            )}
          />
          <span
            className={cn(
              "absolute h-0.5 w-4 rounded-full bg-ink transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
              open ? "-rotate-45" : "translate-y-1",
            )}
          />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-paper/95 backdrop-blur-3xl"
          >
            <div className="flex h-full flex-col justify-center gap-2 px-8">
              {NAV_LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 48 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.05 + i * 0.08 }}
                  className="font-display text-4xl font-semibold tracking-tight text-ink transition-colors hover:text-signal"
                >
                  {l.label}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 48 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  ease: EASE,
                  delay: 0.05 + NAV_LINKS.length * 0.08,
                }}
                className="mt-6 flex flex-col items-start gap-4"
              >
                <Button
                  size="lg"
                  asChild
                  onClick={() =>
                    trackEvent({
                      name: "cta_open_dashboard",
                      data: { location: "nav" },
                    })
                  }
                >
                  <Link href="/dashboard">Try for free</Link>
                </Button>
                <div className="flex items-center gap-4">
                  <GitHubStarsLink />
                  <a
                    href="https://discord.gg/ArQF8jtC9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Discord"
                  >
                    <DiscordIcon className="size-5" />
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-display font-semibold text-ink transition-colors hover:text-signal"
          >
            OpenCorp
          </Link>
          <span className="hidden sm:inline">
            Find the thread your users are already on
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <Link
            href="/privacy"
            className="transition-colors hover:text-ink"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="transition-colors hover:text-ink"
          >
            Terms
          </Link>
          <a
            href="mailto:krishavrajsingh@gmail.com"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
          >
            <Mail className="size-4" />
            krishavrajsingh@gmail.com
          </a>
          <a
            href="https://www.linkedin.com/company/opencorpai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
            aria-label="LinkedIn"
          >
            <LinkedInIcon className="size-4" />
            LinkedIn
          </a>
          <a
            href="https://x.com/opencorpai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
            aria-label="X (Twitter)"
          >
            <XIcon className="size-3.5" />
            @opencorpai
          </a>
          <a
            href="https://discord.gg/ArQF8jtC9"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
            aria-label="Discord"
          >
            <DiscordIcon className="size-4" />
            Discord
          </a>
        </div>
      </div>
    </footer>
  );
}

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-paper text-ink">
      <a
        href="#main"
        className="sr-only z-[60] rounded-lg bg-ink px-3 py-2 text-sm text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <SiteNav />
      <div id="main" className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
