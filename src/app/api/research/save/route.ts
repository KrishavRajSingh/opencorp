import { z } from "zod/v4";
import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { competitorResearchTask } from "@/trigger/research";
import { getAuthedUser } from "@/lib/supabase/auth";
import { getDbClient } from "@/lib/supabase/server";

const productAnalystResultSchema = z.object({
  url: z.string(),
  productName: z.string(),
  description: z.string().optional().default(""),
  keyFeatures: z.array(z.string()).optional().default([]),
  targetAudience: z.string().optional().default(""),
  pricingModel: z.string().optional().default(""),
}).passthrough();

const competitorResultSchema = z.object({
  competitors: z.array(z.object({
    name: z.string(),
    url: z.string(),
    description: z.string().optional().default(""),
    mentionSources: z.array(z.string()).optional().default([]),
  }).passthrough()).optional().default([]),
  searchQueriesUsed: z.array(z.string()).optional().default([]),
}).passthrough();

const hnThreadsResultSchema = z.object({
  threads: z.array(z.object({
    objectID: z.string(),
    title: z.string(),
    url: z.string().nullable(),
    points: z.number(),
    comments: z.number(),
    author: z.string(),
    date: z.string(),
    whyRelevant: z.string(),
    topCommentSnippet: z.string().nullable(),
  }).passthrough()).optional().default([]),
}).passthrough();

const redditScanResultSchema = z.object({
  run_id: z.string().optional(),
  generated_at: z.string().optional(),
  top_threads: z.array(z.any()).optional().default([]),
}).passthrough();

const baseSchema = z.object({
  id: z.string().uuid().optional(),
  input: z.object({ url: z.string() }).passthrough().optional(),
  product_analyst_result: productAnalystResultSchema.optional(),
  competitor_result: competitorResultSchema.optional(),
  hn_threads_result: hnThreadsResultSchema.optional(),
  reddit_scan_result: redditScanResultSchema.optional(),
});

export async function POST(request: Request) {
  const auth = await getAuthedUser();
  if ("response" in auth) return auth.response;

  let body: z.infer<typeof baseSchema>;
  try {
    body = baseSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "invalid body" },
      { status: 400 },
    );
  }

  const supabase = await getDbClient();

  if (!body.id) {
    if (!body.input || !body.product_analyst_result) {
      return NextResponse.json(
        { error: "creating a new session requires `input` and `product_analyst_result`" },
        { status: 400 },
      );
    }
    const { data, error } = await supabase
      .from("research_sessions")
      .insert({
        user_id: auth.user.id,
        input: body.input as never,
        product_analyst_result: body.product_analyst_result as never,
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Backend stage: product done → kick off competitors; task persists result.
    const product = body.product_analyst_result;
    let competitorRunId: string | undefined;
    let publicAccessToken: string | undefined;
    try {
      const handle = await tasks.trigger<typeof competitorResearchTask>(
        "competitor-research",
        {
          sessionId: data.id,
          url: product.url,
          productName: product.productName,
          description: product.description ?? "",
          keyFeatures: product.keyFeatures ?? [],
        },
      );
      competitorRunId = handle.id;
      publicAccessToken = handle.publicAccessToken;
    } catch (triggerErr) {
      // Session exists; competitors can be re-run from the session UI.
      console.error("Failed to chain competitor-research:", triggerErr);
    }

    return NextResponse.json(
      {
        id: data.id,
        competitorRunId,
        publicAccessToken,
      },
      { status: 201 },
    );
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.product_analyst_result !== undefined) {
    update.product_analyst_result = body.product_analyst_result;
  }
  if (body.competitor_result !== undefined) {
    update.competitor_result = body.competitor_result;
  }
  if (body.hn_threads_result !== undefined) {
    update.hn_threads_result = body.hn_threads_result;
  }
  if (body.reddit_scan_result !== undefined) {
    update.reddit_scan_result = body.reddit_scan_result;
  }
  if (body.input !== undefined) {
    update.input = body.input;
  }

  const { data, error } = await supabase
    .from("research_sessions")
    .update(update as never)
    .eq("id", body.id)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
