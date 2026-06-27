import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/dashboard/logo";
import { ScanlineBackdrop } from "@/components/dashboard/scanline-backdrop";
import { SessionViewClient } from "@/app/dashboard/session-view-client";
import { fetchSession } from "@/app/dashboard/data";

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

export default async function SharedSessionPage({
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
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-border/40 bg-background/80 px-6 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={16} />
          <span className="font-heading text-sm tracking-tight text-foreground">
            OpenCorp
          </span>
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
          Shared research
        </span>
      </header>

      <main className="relative flex-1">
        <ScanlineBackdrop />
        <div className="relative px-6 pb-24 pt-10 sm:px-10 md:pt-14">
          <div className="mx-auto w-full max-w-6xl">
            <SessionViewClient
              sessionId={id}
              product={product}
              competitors={competitors}
              hnResult={hnThreads}
              readOnly
            />
          </div>
        </div>
      </main>
    </div>
  );
}
