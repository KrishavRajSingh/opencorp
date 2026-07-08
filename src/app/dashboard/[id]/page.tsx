import { notFound, redirect } from "next/navigation";
import { createClient, isAuthEnabled } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/supabase/auth";
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
    id: string;
    sub: string;
    title: string;
    link: string;
    author?: string;
    updated?: string;
    score?: number;
    num_comments?: number;
  }>;
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
  const rawRedditScan = session.reddit_scan_result as (RedditScanResult & { dropped?: unknown }) | null;
  const redditScan: RedditScanResult | null = rawRedditScan
    ? { run_id: rawRedditScan.run_id, generated_at: rawRedditScan.generated_at, top_threads: rawRedditScan.top_threads }
    : null;

  const auth = await getAuthedUser();
  const isAuthed = "user" in auth ? auth.user.email !== null : false;

  return (
    <SessionViewClient
      sessionId={id}
      product={product}
      competitors={competitors}
      hnResult={hnThreads}
      redditScan={redditScan as never}
      isAuthed={isAuthed}
    />
  );
}
