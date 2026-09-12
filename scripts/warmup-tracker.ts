// Track 9:1 ratio per subreddit. Log every comment. Refuse if ratio > 10% in last 30 actions per sub.
// One JSON per sub: data/reddit/ratio-<sub>.json

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

type Action = {
  ts: string;
  sub: string;
  type: "comment" | "promo" | "dm";
  text?: string;
  postId?: string;
  ratio: number; // promo/(comment+promo) at time of action
};

function load(sub: string): Action[] {
  const f = join(process.cwd(), "data", "reddit", `ratio-${sub}.json`);
  if (existsSync(f)) return JSON.parse(readFileSync(f, "utf8")) as Action[];
  return [];
}

function save(sub: string, actions: Action[]) {
  mkdirSync(join(process.cwd(), "data", "reddit"), { recursive: true });
  writeFileSync(
    join(process.cwd(), "data", "reddit", `ratio-${sub}.json`),
    JSON.stringify(actions, null, 2),
  );
}

function ratioIn(actions: Action[]): number {
  const last = actions.slice(-30);
  const promo = last.filter((a) => a.type === "promo").length;
  const comment = last.filter((a) => a.type === "comment").length;
  const total = promo + comment;
  if (total === 0) return 0;
  return promo / total;
}

type Args = {
  sub: string;
  type: "comment" | "promo" | "dm";
  text?: string;
  postId?: string;
  check?: boolean;
};

// CLI: tsx scripts/warmup-tracker.ts --sub=SaaS --check
//      tsx scripts/warmup-tracker.ts --sub=SaaS --type=comment --text="..." --postId=xxx
//      tsx scripts/warmup-tracker.ts --sub=SaaS --type=promo --text="..." --postId=xxx
function main() {
  const args = process.argv.slice(2);
  const get = (k: string) => {
    const a = args.find((x) => x.startsWith(`--${k}=`));
    return a ? a.split("=").slice(1).join("=") : undefined;
  };
  const sub = get("sub");
  if (!sub) {
    console.error("usage: --sub=<name> [--check | --type=comment|promo --text=... --postId=...]");
    process.exit(1);
  }
  const check = args.includes("--check");
  const actions = load(sub);

  if (check) {
    const r = ratioIn(actions);
    const last = actions.slice(-10);
    console.log(`[ratio] r/${sub}: ${actions.length} actions logged, last-30 promo ratio = ${(r * 100).toFixed(1)}%`);
    console.log(`[ratio] threshold: 10% (9:1 rule)`);
    console.log(`[ratio] status: ${r <= 0.1 ? "OK to post promo" : "REFUSE promo, post value-only"}`);
    if (last.length > 0) {
      console.log(`[ratio] last 10:`);
      for (const a of last) {
        console.log(`  ${a.ts.slice(0, 16)} [${a.type}] ${(a.text ?? "").slice(0, 80)}`);
      }
    }
    return;
  }

  const type = get("type") as "comment" | "promo" | "dm" | undefined;
  if (!type) {
    console.error("usage: --type=comment|promo --text=... [--postId=...]");
    process.exit(1);
  }

  // Refuse promo if ratio > 10%
  if (type === "promo" && ratioIn(actions) > 0.1) {
    const r = ratioIn(actions);
    console.error(`[ratio] REFUSED. r/${sub} promo ratio = ${(r * 100).toFixed(1)}% > 10%. Post value-only comments first.`);
    process.exit(2);
  }

  const action: Action = {
    ts: new Date().toISOString(),
    sub,
    type,
    text: get("text"),
    postId: get("postId"),
    ratio: ratioIn(actions),
  };
  actions.push(action);
  save(sub, actions);
  console.log(`[ratio] logged [${type}] r/${sub}. new ratio = ${(ratioIn(actions) * 100).toFixed(1)}%`);
}

main();
