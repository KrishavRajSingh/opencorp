import "dotenv/config";
import { mastra } from "@/mastra";

async function main() {
  const wf = mastra.getWorkflow("gtmRedditScanWorkflow") as unknown as {
    createRun: (opts?: { runId?: string }) => Promise<{
      runId: string;
      start: (input: { inputData: Record<string, unknown> }) => Promise<{ result: unknown }>;
    }>;
  };
  if (!wf) throw new Error("workflow missing");

  const run = await wf.createRun({ runId: `test_${Date.now().toString(36)}` });
  const out = await run.start({
    inputData: {
      userQuery: "Find me users for an AI marketing assistant that helps solo SaaS founders write content without hiring an agency.",
      productName: "Okara AI CMO",
      description: "AI marketing assistant that helps solo SaaS founders write content without hiring an agency.",
      keyFeatures: ["AI content writer", "social media automation", "weekly post drafts"],
      targetAudience: "solo SaaS founder, indie hacker",
      pricingModel: "$49/month",
      subsSearch: ["SaaS", "startups", "sideproject", "indiehackers", "Entrepreneur"],
    },
  });
  const r = (out as { result?: Record<string, unknown> }).result;
  console.log("\n=== Workflow result ===");
  console.log("intent.product_name:", r?.intent && (r.intent as { product_name?: string }).product_name);

  // Matches workflowOutputSchema.top_threads: flat threadSchema[] (not rank/thread wrapper).
  const threads = (r?.top_threads ?? []) as Array<{
    id: string;
    sub: string;
    title: string;
    author?: string;
    score?: number;
    num_comments?: number;
  }>;

  console.log("\n--- TOP THREADS ---");
  for (const [i, t] of threads.entries()) {
    const rank = String(i + 1).padStart(2, "0");
    console.log(`[${rank}] r/${t.sub} score=${t.score ?? "?"} u/${t.author ?? "?"}`);
    console.log(`    "${t.title.slice(0, 80)}"`);
  }

  console.log("\nstats:", JSON.stringify(r?.stats, null, 2));
}

main().catch((err) => {
  console.error("FAIL:", err.message ?? err);
  process.exit(1);
});
