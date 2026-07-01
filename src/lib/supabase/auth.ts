import { NextResponse } from "next/server";
import { createClient, isAuthEnabled } from "@/lib/supabase/server";

export type AuthedUser = { id: string; email: string | null };

export async function getAuthedUser(): Promise<
  { user: AuthedUser } | { response: NextResponse }
> {
  if (!isAuthEnabled()) {
    const id = process.env.PUBLIC_BUCKET_USER_ID;
    if (!id) {
      return {
        response: NextResponse.json(
          { error: "public mode is on but PUBLIC_BUCKET_USER_ID is not set" },
          { status: 500 },
        ),
      };
    }
    return { user: { id, email: null } };
  }

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
