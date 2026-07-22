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
    },
  });
  // Matches workflowOutputSchema.top_threads: flat threadSchema[] (not rank/thread wrapper).
  const r = out.result as {
    top_threads: Array<{
      id: string;
      sub: string;
      title: string;
      author?: string;
      score?: number;
      num_comments?: number;
    }>;
    stats: {
      threads_scanned: number;
      top_threads: number;
      runtime_s: number;
      queries: number;
    };
  };

  console.log("\n=== TOP THREADS ===");
  for (const [i, t] of (r.top_threads ?? []).entries()) {
    const rank = String(i + 1).padStart(2, "0");
    console.log(`[${rank}] r/${t.sub} score=${t.score ?? "?"} u/${t.author ?? "?"}`);
    console.log(`    "${t.title.slice(0, 80)}"`);
  }

  console.log("\nstats:", JSON.stringify(r.stats, null, 2));
}

main().catch((err) => {
  console.error("FAIL:", err.message ?? err);
  process.exit(1);
});
