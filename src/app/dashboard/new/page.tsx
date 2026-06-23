import { DashboardShell } from "../dashboard-shell";
import { NewResearchClient } from "../new-research-client";
import { fetchSessions } from "../data";

export default async function NewResearchPage() {
  const sessions = await fetchSessions();

  return (
    <DashboardShell sessions={sessions} activeName={null}>
      <NewResearchClient />
    </DashboardShell>
  );
}
