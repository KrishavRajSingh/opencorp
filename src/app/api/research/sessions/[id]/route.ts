import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthedUser();
  if ("response" in auth) return auth.response;

  const { id } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("research_sessions")
    .select("id, input, product_analyst_result, competitor_result, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ session: data });
}
