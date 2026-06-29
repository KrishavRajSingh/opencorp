import { createClient } from "@/lib/supabase/server";
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

  const sessions = user ? await fetchSessions() : [];

  return (
    <DashboardShell
      sessions={sessions}
      activeName={null}
      user={user ? { email: user.email ?? null } : null}
    >
      {children}
    </DashboardShell>
  );
}
