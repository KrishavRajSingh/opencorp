import { cookies } from "next/headers";
import { NewResearchClient } from "./new-research-client";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const pendingUrl = cookieStore.get("pending_url")?.value ?? "";
  return (
    <NewResearchClient initialUrl={params.url ?? pendingUrl} />
  );
}
