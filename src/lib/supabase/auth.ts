import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type AuthedUser = { id: string; email: string | null };

export async function getAuthedUser(): Promise<
  { user: AuthedUser } | { response: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      response: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  }

  return { user: { id: user.id, email: user.email ?? null } };
}
