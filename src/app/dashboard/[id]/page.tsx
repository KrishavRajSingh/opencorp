import { notFound } from "next/navigation";
import { DashboardShell } from "../dashboard-shell";
import { SessionViewClient } from "../session-view-client";
import { fetchSession, fetchSessions } from "../data";

type ProductResult = {
  url: string;
  productName: string;
  description: string;
  keyFeatures: string[];
  targetAudience: string;
  pricingModel: string;
  techStack: string;
  marketPosition: string;
  researchSummary: string;
};

type CompetitorResult = {
  competitors: Array<{
    name: string;
    url: string;
    description: string;
    mentionSources: string[];
  }>;
  searchQueriesUsed?: string[];
};

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, sessions] = await Promise.all([
    fetchSession(id),
    fetchSessions(),
  ]);

  if (!session) {
    notFound();
  }

  const product = session.product_analyst_result as ProductResult | null;
  if (!product) {
    notFound();
  }

  const competitors = session.competitor_result as CompetitorResult | null;
  const activeName =
    product.productName ?? sessions.find((s) => s.id === id)?.url ?? null;

  return (
    <DashboardShell sessions={sessions} activeName={activeName}>
      <SessionViewClient
        sessionId={id}
        product={product}
        competitors={competitors}
      />
    </DashboardShell>
  );
}
