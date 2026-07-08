import "dotenv/config";
import { mastra } from "@/mastra";

const wf = mastra.getWorkflow("gtmRedditScanWorkflow") as unknown as {
  createRun: (opts?: { runId?: string }) => Promise<{
    runId: string;
    start: (input: { inputData: Record<string, unknown> }) => Promise<{ result: unknown }>;
  }>;
};

async function main() {
  const run = await wf.createRun({ runId: `filler_${Date.now().toString(36)}` });
  const out = await run.start({
    inputData: {
      userQuery: "Find me users for Filler — a free Chrome extension that auto-fills repetitive online forms (job apps, surveys, signups) by reading natural-language questions.",
      productName: "Filler",
      description: "Filler is a free Chrome extension that eliminates the tedium of retyping the same information across different online forms. It reads the actual natural-language question the form asks, not the HTML field name, and intelligently matches it to the right piece of data in your profile. Free, no account required, privacy-first.",
      keyFeatures: [
        "one-time profile setup stored locally",
        "intelligent natural-language question reading",
        "answer reuse across forms",
        "smart guessing with review flags",
        "Google Forms, Ashby ATS, Tally, etc.",
        "privacy-first, no account needed",
      ],
      targetAudience: "job applicants filling multiple applications, students filling surveys, anyone repeating same answers",
      pricingModel: "Free",
      subsSearch: ["jobs", "jobsearchhacks", "careerguidance", "cscareerquestions", "ExperiencedDevs", "recruitinghell", "AskHR", "jobboard"],
    },
  });
  const r = out.result as {
    top_threads: Array<{
      rank: number;
      thread: { id: string; sub: string; title: string; author?: string; score?: number };
      buyer_reason?: string;
      top_quotes?: string[];
    }>;
    dropped: Array<{ id: string; title: string; drop_reason: string }>;
    stats: { threads_scanned: number; top_threads: number; dropped: number };
  };

  console.log("\n=== KEPT (real buyers) ===");
  for (const t of r.top_threads) {
    console.log(`[${t.rank}] r/${t.thread.sub} score=${t.thread.score} u/${t.thread.author ?? "?"}`);
    console.log(`    "${t.thread.title.slice(0, 80)}"`);
    if (t.buyer_reason) console.log(`    why: ${t.buyer_reason}`);
    if (t.top_quotes) {
      for (const q of t.top_quotes.slice(0, 1)) {
        console.log(`    > "${q.slice(0, 100)}${q.length > 100 ? "..." : ""}"`);
      }
    }
  }

  console.log(`\n=== DROPPED (${r.dropped.length}) ===`);
  for (const d of r.dropped.slice(0, 15)) {
    console.log(`  - ${d.title.slice(0, 60)}`);
    console.log(`    reason: ${d.drop_reason}`);
  }
  if (r.dropped.length > 15) console.log(`  ... +${r.dropped.length - 15} more`);

  console.log("\nstats:", JSON.stringify(r.stats, null, 2));
}

main().catch((err) => {
  console.error("FAIL:", err.message ?? err);
  process.exit(1);
});
