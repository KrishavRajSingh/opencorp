import { cache } from "react";
import { getDbClient } from "@/lib/supabase/server";
import type { SessionSummary } from "./project-list";

export const fetchSessions = cache(async (): Promise<SessionSummary[]> => {
  const supabase = await getDbClient();
  const { data, error } = await supabase
    .from("research_sessions")
    .select("id, input, product_analyst_result, competitor_result, hn_threads_result, reddit_scan_result, updated_at")
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) return [];

  return (data ?? []).map((row) => {
    const r = row as unknown as Record<string, unknown>;
    const input = (r.input ?? {}) as { url?: string };
    const product = r.product_analyst_result as
      | { productName?: string }
      | null;
    return {
      id: r.id as string,
      url: input.url ?? null,
      product_name: product?.productName ?? null,
      has_product: !!r.product_analyst_result,
      has_competitor: !!r.competitor_result,
      has_hn: !!r.hn_threads_result,
      has_reddit: !!r.reddit_scan_result,
      updated_at: r.updated_at as string,
    };
  });
});

export const fetchMostRecentSession = cache(async (): Promise<string | null> => {
  const supabase = await getDbClient();
  const { data } = await supabase
    .from("research_sessions")
    .select("id")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
});

export const fetchSession = cache(
  async (id: string): Promise<{
    id: string;
    input: unknown;
    product_analyst_result: unknown;
    competitor_result: unknown;
    hn_threads_result: unknown;
    reddit_scan_result: unknown;
    show_hn_draft_result: unknown;
  } | null> => {
    const supabase = await getDbClient();
    const { data } = await supabase
      .from("research_sessions")
      .select("id, input, product_analyst_result, competitor_result, hn_threads_result, reddit_scan_result, show_hn_draft_result")
      .eq("id", id)
      .maybeSingle();
    const row = data as Record<string, unknown> | null;
    if (!row) return null;
    return {
      id: row.id as string,
      input: row.input,
      product_analyst_result: row.product_analyst_result,
      competitor_result: row.competitor_result,
      hn_threads_result: row.hn_threads_result,
      reddit_scan_result: row.reddit_scan_result ?? null,
      show_hn_draft_result: row.show_hn_draft_result ?? null,
    };
  },
);
