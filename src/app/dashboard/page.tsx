import { cookies } from "next/headers";
import { createClient, isAuthEnabled } from "@/lib/supabase/server";
import { NewResearchClient } from "./new-research-client";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const params = await searchParams;
  const cookieStore = await cookies();
  const pendingUrl = cookieStore.get("pending_url")?.value ?? "";
  return (
    <NewResearchClient
      isAuthed={!isAuthEnabled() || !!user}
      initialUrl={params.url ?? pendingUrl}
    />
  );
}
