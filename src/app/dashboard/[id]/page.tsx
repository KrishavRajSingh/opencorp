import { notFound } from "next/navigation";
import { SessionViewClient } from "../session-view-client";
import { fetchSession } from "../data";

type ProductResult = {
  url: string;
  productName: string;
  description: string;
  keyFeatures: string[];
  targetAudience: string;
  pricingModel: string;
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

type HNResult = {
  threads: Array<{
    objectID: string;
    title: string;
    url: string | null;
    points: number;
    comments: number;
    author: string;
    date: string;
    whyRelevant: string;
    topCommentSnippet: string | null;
  }>;
};

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await fetchSession(id);

  if (!session) {
    notFound();
  }

  const product = session.product_analyst_result as ProductResult | null;
  if (!product) {
    notFound();
  }

  const competitors = session.competitor_result as CompetitorResult | null;
  const hnThreads = session.hn_threads_result as HNResult | null;

  return (
    <SessionViewClient
      sessionId={id}
      product={product}
      competitors={competitors}
      hnResult={hnThreads}
    />
  );
}
