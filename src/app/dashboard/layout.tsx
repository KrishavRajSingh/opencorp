import { redirect } from "next/navigation";
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

  if (!user) {
    redirect("/auth/sign-in?next=/dashboard");
  }

  const sessions = await fetchSessions();

  return (
    <DashboardShell
      sessions={sessions}
      activeName={null}
      user={{ email: user.email ?? null }}
    >
      {children}
    </DashboardShell>
  );
}
