"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const GITHUB_REPO = "KrishavRajSingh/opencorp";
const STARS_CACHE_KEY = "gh-stars-opencorp";

function formatStars(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function GitHubStarsLink() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
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
      // ignore
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
            // ignore
          }
        }
      })
      .catch(() => {
        // offline / rate-limited
      });
  }, []);

  return (
    <a
      href={`https://github.com/${GITHUB_REPO}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 border border-black px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-black hover:bg-black hover:text-white"
      aria-label="GitHub stars"
    >
      <Star className="size-3 fill-current" />
      {stars !== null ? formatStars(stars) : "···"}
    </a>
  );
}

function SiteNav() {
  return (
    <header
      className="sticky top-0 z-50 w-full select-none"
      style={{
        background: "#fff",
        color: "#000",
        borderBottom: "1px solid #000",
      }}
    >
      <div className="mx-auto flex h-7 w-full items-center gap-4 px-3 font-mono text-[11px] tracking-tight">
        <Link href="/" className="inline-flex items-center gap-1.5 font-bold">
          <span
            aria-hidden
            className="inline-block h-3 w-3"
            style={{ background: "#000" }}
          />
          <span>OPENCORP.APP</span>
        </Link>
        <span
          aria-hidden
          className="h-3.5 w-px"
          style={{ background: "#000" }}
        />
        <nav className="flex items-center gap-3">
          <span className="font-bold underline">File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Window</span>
          <span>Help</span>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <GitHubStarsLink />
          <a
            href="https://x.com/opencorpai"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-black px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white"
          >
            X
          </a>
          <a
            href="https://discord.gg/ArQF8jtC9"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-black px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white"
          >
            DISCORD
          </a>
          <Link
            href="/dashboard"
            onClick={() =>
              trackEvent({ name: "cta_open_dashboard", data: { location: "nav" } })
            }
            className="border border-black bg-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black"
          >
            LAUNCH APP ↗
          </Link>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer
      className="w-full select-none"
      style={{
        background: "#000",
        color: "#fff",
        borderTop: "1px solid #000",
      }}
    >
      <div className="mx-auto flex w-full flex-col gap-2 px-3 py-2 font-mono text-[10px] uppercase tracking-widest sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold">OPENCORP</span>
          <span aria-hidden className="h-3 w-px bg-white" />
          <span className="opacity-80">ELASTIC LICENSE 2.0 · NOT OSI-APPROVED</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className="hover:underline">
            HOME
          </Link>
          <Link href="/privacy" className="hover:underline">
            PRIVACY
          </Link>
          <Link href="/terms" className="hover:underline">
            TERMS
          </Link>
          <a
            href="https://github.com/KrishavRajSingh/opencorp"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            GITHUB
          </a>
          <a
            href="https://x.com/opencorpai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            @opencorpai
          </a>
          <a
            href="https://discord.gg/ArQF8jtC9"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            DISCORD
          </a>
          <span aria-hidden className="h-3 w-px bg-white" />
          <span>1 BIT · 2026</span>
        </div>
      </div>
    </footer>
  );
}

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-svh flex-col"
      style={{
        background: "#000",
        color: "#fff",
        fontFamily:
          'ui-monospace, "SF Mono", Menlo, "JetBrains Mono", monospace',
        imageRendering: "pixelated",
      }}
    >
      <SiteNav />
      {children}
      <SiteFooter />
    </div>
  );
}
