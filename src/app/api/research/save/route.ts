import { z } from "zod/v4";
import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

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

const baseSchema = z.object({
  id: z.string().uuid().optional(),
  input: z.object({ url: z.string() }).passthrough().optional(),
  product_analyst_result: productAnalystResultSchema.optional(),
  competitor_result: competitorResultSchema.optional(),
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

  const supabase = await createClient();

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
    return NextResponse.json({ id: data.id }, { status: 201 });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.product_analyst_result !== undefined) {
    update.product_analyst_result = body.product_analyst_result;
  }
  if (body.competitor_result !== undefined) {
    update.competitor_result = body.competitor_result;
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
