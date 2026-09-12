// Ponytail: one-shot Vercel traffic snapshot. Writes data/metrics/traffic-<date>.json
// Run manually or via cron: `pnpm tsx scripts/check-traffic.ts`.
// Captures pageviews, uniques, /tools/* breakdown — the only signal that tells
// us whether the zero-login tools are getting organic discovery.

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "opencompany";
const DAYS = 7;
const VERCEL_BIN = "npx";
const VERCEL_PKG = "-y";
const VERCEL_VER = "vercel@58.7.1";

type Row = {
  request_path: string;
  total: number;
  avg: number;
  min: number;
  max: number;
  sparkline?: string;
};

type Snapshot = {
  date: string;
  capturedAt: string;
  project: string;
  windowDays: number;
  totals: {
    pageviews: number;
    uniques: number;
  };
  dailySeries: Array<{ day: string; pageviews: number; uniques: number }>;
  byPath: Array<{
    path: string;
    pageviews: number;
    avg: number;
    sparkline?: string;
  }>;
  toolsBreakdown: {
    pageviews: number;
    uniques: number;
    paths: Row[];
  };
};

function run(cmd: string, args: string[]): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { env: process.env });
    let stdout = "";
    let stderr = "";
    p.stdout.on("data", (d) => (stdout += d.toString()));
    p.stderr.on("data", (d) => (stderr += d.toString()));
    p.on("close", (code) => resolve({ code, stdout, stderr }));
    p.on("error", (err) => resolve({ code: -1, stdout, stderr: stderr + err.message }));
  });
}

function parseRows(stdout: string): Row[] {
  const rows: Row[] = [];
  const lines = stdout.split("\n");
  for (const line of lines) {
    // Lines look like: "                                                /     48     6  3 at 09-07 00:00  11 at 09-05 00:00"
    // path, total, avg, min, "at MM-DD HH:MM", max, "at MM-DD HH:MM"
    const m = line.match(
      /^\s*(\S+)\s+(\d+)\s+([\d.]+)\s+(\d+)\s+at\s+\d{2}-\d{2}\s+\d{2}:\d{2}\s+(\d+)\s+at\s+\d{2}-\d{2}\s+\d{2}:\d{2}\s*$/,
    );
    if (m) {
      rows.push({
        request_path: m[1]!,
        total: Number(m[2]),
        avg: Number(m[3]),
        min: Number(m[4]),
        max: Number(m[5]),
      });
    }
  }
  return rows;
}

function parseTotals(stdout: string): { total: number } {
  // ponytail: the row looks like "    80   10  7 at 09-06 00:00  16 at 09-05 00:00"
  // total=80, avg=10, min=7 (at MM-DD HH:MM), max=16 (at MM-DD HH:MM).
  const m = /\n\s*(\d+)\s+\d+\s+\d+\s+at\s+\d{2}-\d{2}\s+\d{2}:\d{2}\s+\d+\s+at\s+\d{2}-\d{2}\s+\d{2}:\d{2}/.exec(stdout);
  return { total: m ? Number(m[1]) : 0 };
}

function parseUnique(stdout: string): number {
  const m = /Unique \(period\):\s+(\d+)/.exec(stdout);
  return m ? Number(m[1]) : 0;
}

async function main() {
  const since = `${DAYS}d`;
  const sinceArg = `--since=${since}`;
  const projectArg = `--project=${PROJECT}`;

  // Pageviews by path
  const byPathProc = await run(VERCEL_BIN, [
    VERCEL_PKG,
    VERCEL_VER,
    "metrics",
    "vercel.analytics_pageview.count",
    sinceArg,
    "--granularity=1d",
    projectArg,
    "--group-by=request_path",
  ]);
  if (byPathProc.code !== 0) {
    console.error("vercel pageviews failed:", byPathProc.stderr || byPathProc.stdout);
    process.exit(1);
  }

  // Total pageviews (no group-by)
  const totalProc = await run(VERCEL_BIN, [
    VERCEL_PKG,
    VERCEL_VER,
    "metrics",
    "vercel.analytics_pageview.count",
    sinceArg,
    "--granularity=1d",
    projectArg,
  ]);
  if (totalProc.code !== 0) {
    console.error("vercel total failed:", totalProc.stderr || totalProc.stdout);
    process.exit(1);
  }

  // Uniques (single line)
  const uniqueProc = await run(VERCEL_BIN, [
    VERCEL_PKG,
    VERCEL_VER,
    "metrics",
    "vercel.analytics_pageview.count",
    "-a",
    "unique/visitor_id",
    sinceArg,
    "--granularity=1d",
    projectArg,
  ]);
  if (uniqueProc.code !== 0) {
    console.error("vercel uniques failed:", uniqueProc.stderr || uniqueProc.stdout);
    process.exit(1);
  }

  const byPath = parseRows(byPathProc.stdout);
  const totals = parseTotals(totalProc.stdout);
  const uniques = parseUnique(uniqueProc.stdout);

  // ponytail: tools uniques not separately exposed by Vercel CLI per-path;
  // log paths + totals so we can see the per-tool split.
  const toolsPaths = byPath.filter((r) => r.request_path.startsWith("/tools"));
  const toolsPageviews = toolsPaths.reduce((s, r) => s + r.total, 0);

  const snapshot: Snapshot = {
    date: new Date().toISOString().slice(0, 10),
    capturedAt: new Date().toISOString(),
    project: PROJECT,
    windowDays: DAYS,
    totals: {
      pageviews: totals.total,
      uniques,
    },
    dailySeries: [],
    byPath,
    toolsBreakdown: {
      pageviews: toolsPageviews,
      uniques: 0,
      paths: toolsPaths,
    },
  };

  const dir = join(process.cwd(), "data", "metrics");
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `traffic-${snapshot.date}.json`);
  writeFileSync(path, JSON.stringify(snapshot, null, 2));
  console.log(
    `[traffic] ${snapshot.date} | pv=${snapshot.totals.pageviews} uniq=${snapshot.totals.uniques} | /tools/*=${toolsPageviews} | wrote ${path}`,
  );
}

main().catch((err) => {
  console.error("check-traffic failed:", err);
  process.exit(1);
});
