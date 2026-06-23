import { redirect } from "next/navigation";
import { fetchMostRecentSession } from "./data";

export default async function DashboardIndexPage() {
  const mostRecent = await fetchMostRecentSession();
  if (mostRecent) {
    redirect(`/dashboard/${mostRecent}`);
  }
  redirect("/dashboard/new");
}
