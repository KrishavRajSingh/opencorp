// Opt-in DM handler. Only replies to DMs the brand account received.
// Generates sub-30-word reply, posts it, logs the conversation.
// NEVER cold DMs. If a user DMs the brand account, we reply.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// Sub-30-word replies, opt-in only. Variations to avoid template detection.
const OPENER_POOL: Array<(msg: string) => string> = [
  (m) => `got it. what url should i run?`,
  (m) => `sure. paste the url you want scanned.`,
  (m) => `yeah, send the url and i'll pull the threads.`,
  (m) => `cool. what's the product url?`,
  (m) => `happy to. drop the url here.`,
];

// 23 corporate buzzwords to block (from OneUp 2026 study: any one halves reply rate).
const BLOCKED = [
  "leverage", "leverages", "leveraging",
  "streamline", "streamlines", "streamlining",
  "seamless", "seamlessly",
  "robust",
  "optimize", "optimizes", "optimizing", "optimization",
  "harness",
  "unlock", "unlocks", "unlocking",
  "elevate", "elevates", "elevating",
  "empower", "empowers", "empowering",
  "synergy", "synergies",
  "paradigm",
  "ecosystem",
  "scalable", "scale up",
  "best-in-class",
  "world-class",
  "cutting-edge",
  "next-generation",
  "revolutionize", "revolutionary",
  "innovative", "innovation",
  "disrupt", "disrupting", "disruptive",
];

type Inbox = {
  ts: string;
  from: string;
  body: string;
  reply?: string;
  repliedAt?: string;
};

const LOG = join(process.cwd(), "data", "reddit", "dm-inbox.ndjson");

function loadInbox(): Inbox[] {
  if (!existsSync(LOG)) return [];
  return readFileSync(LOG, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l) as Inbox;
      } catch {
        return null;
      }
    })
    .filter((x): x is Inbox => x !== null);
}

function appendInbox(i: Inbox) {
  writeFileSync(LOG, JSON.stringify({ ts: new Date().toISOString(), ...i }) + "\n", { flag: "a" });
}

function checkBlocked(text: string): string | null {
  const lower = text.toLowerCase();
  for (const w of BLOCKED) {
    if (lower.includes(w)) return w;
  }
  return null;
}

function renderReply(msg: string): string {
  const blocked = checkBlocked(msg);
  if (blocked) {
    console.error(`[dm] blocked: message contains "${blocked}". regenerate.`);
    return "hey, what url should i run?";
  }
  const idx = Math.floor(Math.random() * OPENER_POOL.length);
  const opener = OPENER_POOL[idx]!;
  const out = opener(msg);
  const words = out.split(/\s+/).length;
  if (words > 30) {
    console.warn(`[dm] reply over 30 words (${words}), trimming`);
    return out.split(/\s+/).slice(0, 30).join(" ");
  }
  return out;
}

function fetchInbox(): Inbox[] {
  // rdt-cli has no DM API. Manual fetch via reddit.com/message/inbox required.
  // This is a placeholder: user fetches inbox manually, saves to /tmp/inbox.json,
  // and the script reads it.
  const f = "/tmp/reddit-inbox.json";
  if (!existsSync(f)) {
    console.log("[dm] no /tmp/reddit-inbox.json. user must save inbox export there.");
    return [];
  }
  try {
    const raw = readFileSync(f, "utf8");
    return JSON.parse(raw) as Inbox[];
  } catch (e) {
    console.error(`[dm] bad /tmp/reddit-inbox.json: ${(e as Error).message.slice(0, 100)}`);
    return [];
  }
}

function sendDm(toUser: string, text: string, dryRun: boolean): boolean {
  if (dryRun) {
    console.log(`  [DRY-RUN] would DM @${toUser}: "${text}"`);
    return true;
  }
  try {
    execFileSync(
      "rdt",
      ["dm", toUser, text, "--json"],
      { encoding: "utf8", timeout: 30_000 },
    );
    return true;
  } catch (e) {
    console.error(`  [ERR] DM exec failed: ${(e as Error).message.slice(0, 200)}`);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes("--no-dry-run") && !args.includes("--send");
  const inbox = fetchInbox();
  const already = loadInbox();
  const alreadyIds = new Set(already.map((i) => `${i.from}:${i.body.slice(0, 50)}`));

  let sent = 0;
  for (const msg of inbox) {
    const key = `${msg.from}:${msg.body.slice(0, 50)}`;
    if (alreadyIds.has(key)) continue;
    console.log(`[dm] new from @${msg.from}: "${msg.body.slice(0, 100)}"`);
    const reply = renderReply(msg.body);
    const ok = sendDm(msg.from, reply, dryRun);
    if (ok) {
      appendInbox({ ...msg, reply, repliedAt: new Date().toISOString() });
      sent++;
    } else {
      appendInbox(msg);
    }
  }
  console.log(`[dm] replied to ${sent} (dry_run=${dryRun})`);
}

main();
