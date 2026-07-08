import { notFound, redirect } from "next/navigation";
import { createClient, isAuthEnabled } from "@/lib/supabase/server";
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

type RedditScanResult = {
  run_id?: string;
  generated_at?: string;
  top_threads?: Array<{
    rank: number;
    thread: { id: string; sub: string; title: string; link: string; author?: string; updated?: string; score?: number; num_comments?: number };
    buyer_reason?: string;
    top_quotes?: string[];
  }>;
  dropped?: Array<{ id: string; title: string; drop_reason: string }>;
};

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (isAuthEnabled()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(`/auth/sign-in?next=/dashboard/${id}`);
    }
  }

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
  const redditScan = session.reddit_scan_result as RedditScanResult | null;

  return (
    <SessionViewClient
      sessionId={id}
      product={product}
      competitors={competitors}
      hnResult={hnThreads}
      redditScan={redditScan as never}
    />
  );
}
