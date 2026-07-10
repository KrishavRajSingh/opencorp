import { ANON_BUCKET_USER_ID, createClient } from "@/lib/supabase/server";

export type AuthedUser = { id: string; email: string | null };

export async function getAuthedUser(): Promise<{ user: AuthedUser }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: { id: ANON_BUCKET_USER_ID, email: null } };
  }

  return { user: { id: user.id, email: user.email ?? null } };
}
