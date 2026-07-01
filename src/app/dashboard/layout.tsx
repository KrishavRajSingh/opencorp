import { createClient, isAuthEnabled } from "@/lib/supabase/server";
import { DashboardShell } from "./dashboard-shell";
import { fetchSessions } from "./data";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const publicMode = !isAuthEnabled();
  const sessions = publicMode || user ? await fetchSessions() : [];

  return (
    <DashboardShell
      sessions={sessions}
      activeName={null}
      user={publicMode ? null : user ? { email: user.email ?? null } : null}
    >
      {children}
    </DashboardShell>
  );
}
