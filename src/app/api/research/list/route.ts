import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/supabase/auth";
import { getDbClient } from "@/lib/supabase/server";

type SessionRow = {
  id: string;
  input: unknown;
  product_analyst_result: { productName?: string; url?: string } | null;
  competitor_result: unknown | null;
  updated_at: string;
};

export async function GET() {
  const auth = await getAuthedUser();
  if ("response" in auth) return auth.response;

  const supabase = await getDbClient();
  const { data, error } = await supabase
    .from("research_sessions")
    .select("id, input, product_analyst_result, competitor_result, updated_at")
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as SessionRow[];
  const results = rows.map((row) => {
    const input = (row.input ?? {}) as { url?: string };
    const product = row.product_analyst_result;
    return {
      id: row.id,
      url: input.url ?? null,
      product_name: product?.productName ?? null,
      has_product: !!product,
      has_competitor: !!row.competitor_result,
      updated_at: row.updated_at,
    };
  });

  return NextResponse.json({ results });
}
