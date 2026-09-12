// ponytail: automated public-reply sender for opencorp outreach.
// Reads data/outreach/day-1-list.csv, sends replies via twitter-cli
// with random timing, ramp schedule, daily cap, and brand-account env vars.
// Resumes from CSV state (interruption-safe).
//
// Run:  pnpm tsx scripts/send-outreach.ts [--dry-run] [--max N] [--day N]
//
// Defaults: dry-run=true, no sends. Pass --no-dry-run to actually send.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

type Row = {
  num: number;
  handle: string;
  name: string;
  tweetId: string;
  hook: string;
  sentAt: string;
  replyId: string;
  status: string;
};

const CSV = join(process.cwd(), "data", "outreach", "day-1-list.csv");
const STATE = join(process.cwd(), "data", "outreach", "send-state.json");
const LOG = join(process.cwd(), "data", "outreach", "send-log.ndjson");

// Brand-account env vars (opencorpai lives in Chrome Profile 4).
// ponytail: prefix baked in so cron / user runs the script blind.
const ENV = {
  ...process.env,
  TWITTER_BROWSER: "chrome",
  TWITTER_CHROME_PROFILE: "Profile 4",
};

// Ramp schedule: day -> max replies for the day.
// Week 1-2 ramp from 0 to 12/day, per HelperX 2026: 15-30% weekly growth.
const RAMP: Record<number, number> = {
  1: 5, 2: 5, 3: 6, 4: 7, 5: 8, 6: 8, 7: 9, 8: 10, 9: 10, 10: 11, 11: 11, 12: 12, 13: 12, 14: 12,
};

// Sleep window: skip replies between these hours (local).
const SLEEP_START = 22;
const SLEEP_END = 8;
// Allow forcing "daytime" for tests via env var.
const FORCE_DAYTIME = process.env.FORCE_DAYTIME === "1";

// Jitter between sends (ms). 5-15 min per SocialNexis 2026.
const JITTER_MIN_MS = 5 * 60 * 1000;
const JITTER_MAX_MS = 15 * 60 * 1000;

// Per-run skip: random 1-2h block, max 2 per run.
const SKIP_PROB = 0.15;

type SendState = {
  day: number; // 1-indexed
  sentToday: number;
  startedAt: string;
};

function loadState(): SendState {
  if (existsSync(STATE)) {
    try {
      return JSON.parse(readFileSync(STATE, "utf8")) as SendState;
    } catch {
      /* fresh state */
    }
  }
  return { day: 1, sentToday: 0, startedAt: new Date().toISOString() };
}

function saveState(s: SendState) {
  writeFileSync(STATE, JSON.stringify(s, null, 2));
}

function parseCsv(): Row[] {
  const raw = readFileSync(CSV, "utf8");
  const lines = raw.split("\n").filter((l) => l.length > 0);
  const rows: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!;
    // Simple CSV parser (no embedded newlines per build script)
    const cells: string[] = [];
    let cur = "";
    let inQuote = false;
    for (let j = 0; j < line.length; j++) {
      const c = line[j]!;
      if (c === '"') {
        if (inQuote && line[j + 1] === '"') {
          cur += '"';
          j++;
        } else {
          inQuote = !inQuote;
        }
      } else if (c === "," && !inQuote) {
        cells.push(cur);
        cur = "";
      } else {
        cur += c;
      }
    }
    cells.push(cur);
    rows.push({
      num: parseInt(cells[0] ?? "0", 10),
      handle: cells[1] ?? "",
      name: cells[2] ?? "",
      tweetId: cells[3] ?? "",
      hook: cells[4] ?? "",
      sentAt: cells[5] ?? "",
      replyId: cells[6] ?? "",
      status: cells[7] ?? "pending",
    });
  }
  return rows;
}

function writeCsv(rows: Row[]) {
  const esc = (s: string) => `"${s.replace(/"/g, '""').replace(/\n/g, " ")}"`;
  const lines = ["#,handle,name,tweet_id,hook,sent_at,reply_id,status"];
  for (const r of rows) {
    lines.push(
      [r.num, r.handle, esc(r.name), r.tweetId, esc(r.hook), r.sentAt, r.replyId, r.status].join(","),
    );
  }
  writeFileSync(CSV, lines.join("\n"));
}

function appendLog(entry: Record<string, unknown>) {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...entry });
  writeFileSync(LOG, line + "\n", { flag: "a" });
}

function inSleepWindow(now = new Date()): boolean {
  if (FORCE_DAYTIME) return false;
  const h = now.getHours();
  return h >= SLEEP_START || h < SLEEP_END;
}

function jitterMs(): number {
  return JITTER_MIN_MS + Math.floor(Math.random() * (JITTER_MAX_MS - JITTER_MIN_MS));
}

async function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

async function sendReply(tweetId: string, text: string, dryRun: boolean): Promise<string | null> {
  if (dryRun) {
    console.log(`  [DRY-RUN] would reply to tweet ${tweetId}:`);
    console.log(`    "${text}"`);
    return "dry-run";
  }
  try {
    const out = execFileSync(
      "twitter",
      ["reply", tweetId, text, "--json"],
      { env: ENV, encoding: "utf8", timeout: 30_000 },
    );
    const parsed = JSON.parse(out) as { data?: { id?: string }; ok?: boolean };
    if (parsed.ok && parsed.data?.id) return parsed.data.id;
    console.error(`  [ERR] reply failed: ${out.slice(0, 200)}`);
    return null;
  } catch (e) {
    console.error(`  [ERR] reply exec failed: ${(e as Error).message.slice(0, 200)}`);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes("--no-dry-run") && !args.includes("--send");
  const maxArg = args.find((a) => a.startsWith("--max="));
  const dayArg = args.find((a) => a.startsWith("--day="));
  const maxOverride = maxArg ? parseInt(maxArg.split("=")[1]!, 10) : undefined;
  const dayOverride = dayArg ? parseInt(dayArg.split("=")[1]!, 10) : undefined;

  const state = loadState();
  if (dayOverride) state.day = dayOverride;
  const dailyCap = maxOverride ?? RAMP[state.day] ?? 5;
  const today = new Date().toISOString().slice(0, 10);
  if (state.startedAt.slice(0, 10) !== today) {
    state.sentToday = 0;
    state.startedAt = new Date().toISOString();
  }

  const rows = parseCsv();
  const pending = rows.filter((r) => r.status === "pending");
  console.log(
    `[send] day=${state.day} cap=${dailyCap} sent_today=${state.sentToday} pending=${pending.length} dry_run=${dryRun}`,
  );

  if (pending.length === 0) {
    console.log("[send] nothing pending. all done.");
    return;
  }
  if (state.sentToday >= dailyCap) {
    console.log(`[send] daily cap hit (${state.sentToday}/${dailyCap}). bump --day=N to advance.`);
    return;
  }
  if (inSleepWindow()) {
    console.log(`[send] in sleep window (${SLEEP_START}:00-${SLEEP_END}:00 local). exit.`);
    return;
  }

  let sent = 0;
  for (const r of pending) {
    if (state.sentToday >= dailyCap) {
      console.log(`[send] daily cap hit mid-run.`);
      break;
    }
    if (inSleepWindow()) {
      console.log(`[send] entered sleep window. stopping.`);
      break;
    }

    // Render draft with rotation: index by row num so each row gets stable opener
    // (re-runs are idempotent) but consecutive rows use different openers.
    const openerIdx = (r.num - 1) % 6;
    const { buildDraft } = await import("./build-outreach-list");
    const draft = buildDraft(r.hook, openerIdx);

    console.log(`[${r.num}] @${r.handle} (opener #${openerIdx + 1})`);
    const replyId = await sendReply(r.tweetId, draft, dryRun);
    if (replyId) {
      r.status = dryRun ? "dry-run" : "sent";
      r.sentAt = new Date().toISOString();
      r.replyId = replyId;
      sent++;
      appendLog({ row: r.num, handle: r.handle, tweetId: r.tweetId, replyId, status: r.status, opener: openerIdx });
    } else {
      r.status = "failed";
      appendLog({ row: r.num, handle: r.handle, tweetId: r.tweetId, status: "failed" });
    }

    // Persist state after every send so we resume on interrupt
    state.sentToday += 1;
    saveState(state);
    writeCsv(rows);

    // Random skip block: 15% chance, skip 1-2h
    if (Math.random() < SKIP_PROB) {
      const skipMin = 60 + Math.floor(Math.random() * 60);
      console.log(`[send] random skip: ${skipMin} min`);
      if (!dryRun) {
        await sleep(skipMin * 60 * 1000);
      }
    } else {
      const ms = jitterMs();
      console.log(`[send] jitter ${(ms / 60000).toFixed(1)} min`);
      if (!dryRun) {
        await sleep(ms);
      }
    }
  }

  console.log(`[send] sent ${sent} (cap=${dailyCap}, day=${state.day})`);
}

main().catch((err) => {
  console.error("[send] fatal:", err);
  process.exit(1);
});
