import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SessionSummary } from "./project-switcher";

export const fetchSessions = cache(async (): Promise<SessionSummary[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("research_sessions")
    .select("id, input, product_analyst_result, competitor_result, updated_at")
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) return [];

  return (data ?? []).map((row) => {
    const input = (row.input ?? {}) as { url?: string };
    const product = row.product_analyst_result as
      | { productName?: string }
      | null;
    return {
      id: row.id,
      url: input.url ?? null,
      product_name: product?.productName ?? null,
      has_product: !!row.product_analyst_result,
      has_competitor: !!row.competitor_result,
      updated_at: row.updated_at,
    };
  });
});

export const fetchMostRecentSession = cache(async (): Promise<string | null> => {
  const supabase = await createClient();
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
  } | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("research_sessions")
      .select("id, input, product_analyst_result, competitor_result")
      .eq("id", id)
      .maybeSingle();
    return (data as {
      id: string;
      input: unknown;
      product_analyst_result: unknown;
      competitor_result: unknown;
    } | null) ?? null;
  },
);
