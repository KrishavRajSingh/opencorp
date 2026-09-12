// Post draft from brand account. Reads drafts.json, posts one comment per run.
// 9:1 ratio enforced via warmup-tracker. Daily cap based on account age.
// Brand account: rdt-cli with TWITTER-style profile env (we'll use rdt browser cookies for now).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

type Thread = {
  subreddit: string;
  post_id: string;
  author: string;
  title: string;
  keyword: string;
  url: string;
};

type Variant = {
  variant: "value-only" | "soft-disclose" | "with-link";
  text: string;
  intent: string;
};

type Draft = {
  thread: Thread;
  variants: Variant[];
};

const STATE = join(process.cwd(), "data", "reddit", "post-state.json");
const LOG = join(process.cwd(), "data", "reddit", "post-log.ndjson");

// Account age: 0 = brand new (14-day warmup), 1 = 14-90 days, 2 = 90+ days.
const ACCOUNT_AGE_BUCKET = Number(process.env.ACCOUNT_AGE_BUCKET ?? "0");

// Daily caps by account age.
const CAPS: Record<number, number> = {
  0: 5,  // <14 days: 5/day max
  1: 10, // 14-90 days: 10/day
  2: 15, // 90+ days: 15/day
};

// Sleep window (local IST): skip 22:00-08:00.
const SLEEP_START = 22;
const SLEEP_END = 8;
const FORCE_DAYTIME = process.env.FORCE_DAYTIME === "1";

// Min 4 min, max 9 min between posts (slower than X to avoid Reddit bot detection).
const JITTER_MIN_MS = 4 * 60 * 1000;
const JITTER_MAX_MS = 9 * 60 * 1000;

type PostState = {
  accountAgeBucket: number;
  postedToday: number;
  lastReset: string;
};

function loadState(): PostState {
  if (existsSync(STATE)) {
    try {
      return JSON.parse(readFileSync(STATE, "utf8")) as PostState;
    } catch {
      /* fresh */
    }
  }
  return { accountAgeBucket: ACCOUNT_AGE_BUCKET, postedToday: 0, lastReset: new Date().toISOString() };
}

function saveState(s: PostState) {
  writeFileSync(STATE, JSON.stringify(s, null, 2));
}

function inSleepWindow(): boolean {
  if (FORCE_DAYTIME) return false;
  const h = new Date().getHours();
  return h >= SLEEP_START || h < SLEEP_END;
}

function ratioIn(actions: Array<{ type: string }>): number {
  const last = actions.slice(-30);
  const promo = last.filter((a) => a.type === "promo").length;
  const comment = last.filter((a) => a.type === "comment").length;
  const total = promo + comment;
  return total === 0 ? 0 : promo / total;
}

function loadRatioLog(sub: string): Array<{ type: string }> {
  const f = join(process.cwd(), "data", "reddit", `ratio-${sub}.json`);
  if (!existsSync(f)) return [];
  return JSON.parse(readFileSync(f, "utf8")) as Array<{ type: string }>;
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function logRatio(sub: string, type: "comment" | "promo", text: string, postId: string) {
  // Reuse the warmup-tracker.ts via exec so we don't duplicate logic.
  try {
    execFileSync(
      "pnpm",
      ["tsx", "scripts/warmup-tracker.ts", `--sub=${sub}`, `--type=${type}`, `--text=${text.slice(0, 200)}`, `--postId=${postId}`],
      { encoding: "utf8", timeout: 15_000, stdio: "pipe" },
    );
  } catch (e) {
    // ratio script exits 2 when promo refused
    const msg = (e as Error).message;
    if (msg.includes("REFUSED")) {
      throw new Error("ratio_refused");
    }
    throw e;
  }
}

function postComment(postId: string, text: string, dryRun: boolean): string | null {
  if (dryRun) {
    console.log(`  [DRY-RUN] would comment on ${postId}:`);
    console.log(`    "${text.slice(0, 200)}..."`);
    return "dry-run";
  }
  try {
    // rdt comment takes post id (or full name t3_xxx)
    const out = execFileSync(
      "rdt",
      ["comment", postId, text, "--json"],
      { encoding: "utf8", timeout: 30_000 },
    );
    const d = JSON.parse(out) as { ok?: boolean; data?: { id?: string } };
    if (d.ok && d.data?.id) return d.data.id;
    console.error(`  [ERR] comment failed: ${out.slice(0, 200)}`);
    return null;
  } catch (e) {
    console.error(`  [ERR] comment exec failed: ${(e as Error).message.slice(0, 200)}`);
    return null;
  }
}

function appendLog(entry: Record<string, unknown>) {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...entry });
  writeFileSync(LOG, line + "\n", { flag: "a" });
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes("--no-dry-run") && !args.includes("--send");
  const maxArg = args.find((a) => a.startsWith("--max="));
  const variantArg = args.find((a) => a.startsWith("--variant="));
  const maxOverride = maxArg ? parseInt(maxArg.split("=")[1]!, 10) : undefined;
  const variantPref = variantArg ? (variantArg.split("=")[1] as Variant["variant"]) : null;

  if (inSleepWindow()) {
    console.log("[post] in sleep window. exit.");
    return;
  }

  const state = loadState();
  const today = new Date().toISOString().slice(0, 10);
  if (state.lastReset.slice(0, 10) !== today) {
    state.postedToday = 0;
    state.lastReset = new Date().toISOString();
  }
  const dailyCap = maxOverride ?? CAPS[ACCOUNT_AGE_BUCKET] ?? 5;

  const draftsRaw = readFileSync(join(process.cwd(), "data", "reddit", "drafts.json"), "utf8");
  const drafts = JSON.parse(draftsRaw) as Draft[];

  // Filter to drafts not yet posted
  const logRaw = existsSync(LOG) ? readFileSync(LOG, "utf8") : "";
  const posted = new Set<string>();
  for (const line of logRaw.split("\n").filter(Boolean)) {
    try {
      const e = JSON.parse(line) as { postId?: string };
      if (e.postId) posted.add(e.postId);
    } catch {
      /* skip */
    }
  }
  const queue = drafts.filter((d) => !posted.has(d.thread.post_id));

  console.log(`[post] day_cap=${dailyCap} posted_today=${state.postedToday} queue=${queue.length} dry_run=${dryRun} variant=${variantPref ?? "auto"}`);

  let postedCount = 0;
  for (const d of queue) {
    if (state.postedToday + postedCount >= dailyCap) {
      console.log("[post] daily cap hit. stop.");
      break;
    }
    if (inSleepWindow()) {
      console.log("[post] entered sleep window. stop.");
      break;
    }

    // Pick variant: prefer "value-only" unless ratio is very low (<5%)
    const subActions = loadRatioLog(d.thread.subreddit);
    const r = ratioIn(subActions);
    let variant = variantPref;
    if (!variant) {
      variant = r < 0.05 ? "with-link" : r < 0.08 ? "soft-disclose" : "value-only";
    }
    const v = d.variants.find((x) => x.variant === variant) ?? d.variants[0]!;

    console.log(`[${d.thread.post_id}] r/${d.thread.subreddit} variant=${v.variant} ratio=${(r * 100).toFixed(0)}%`);

    // Log to ratio first (refuses if promo + ratio too high)
    try {
      logRatio(d.thread.subreddit, v.variant === "value-only" ? "comment" : "promo", v.text, d.thread.post_id);
    } catch (e) {
      if ((e as Error).message === "ratio_refused") {
        console.log(`  [skip] ratio refused promo in r/${d.thread.subreddit}, picking value-only`);
        const fallback = d.variants.find((x) => x.variant === "value-only")!;
        logRatio(d.thread.subreddit, "comment", fallback.text, d.thread.post_id);
        const id = postComment(d.thread.post_id, fallback.text, dryRun);
        if (id) {
          postedCount++;
          appendLog({ postId: d.thread.post_id, sub: d.thread.subreddit, variant: "value-only", ratioRefused: true, replyId: id });
        }
        continue;
      }
      throw e;
    }

    const id = postComment(d.thread.post_id, v.text, dryRun);
    if (id) {
      postedCount++;
      appendLog({ postId: d.thread.post_id, sub: d.thread.subreddit, variant: v.variant, replyId: id });
    }

    // Persist state
    state.postedToday += 1;
    saveState(state);

    // Jitter
    const ms = JITTER_MIN_MS + Math.floor(Math.random() * (JITTER_MAX_MS - JITTER_MIN_MS));
    console.log(`[post] jitter ${(ms / 60000).toFixed(1)} min`);
    if (!dryRun) await sleep(ms);
  }

  console.log(`[post] posted ${postedCount} (cap=${dailyCap})`);
}

main().catch((err) => {
  console.error("[post] fatal:", err);
  process.exit(1);
});
