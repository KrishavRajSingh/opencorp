import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/dashboard/logo";
import { ScanlineBackdrop } from "@/components/dashboard/scanline-backdrop";
import { SessionViewClient } from "@/app/dashboard/session-view-client";
import { fetchSession } from "@/app/dashboard/data";
import { getAuthedUser } from "@/lib/supabase/auth";
import { ShareCtaBanner, ShareCtaHeader } from "./share-cta";
import type {
  ProductResult,
  CompetitorResult,
  HNResult,
  ShowHNDraft,
} from "@/lib/types/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = await fetchSession(id);
  const product = session?.product_analyst_result as ProductResult | null;
  if (!product?.productName) {
    return { title: "Shared research" };
  }
  const title = `Research for ${product.productName}`;
  const description = `Alternatives, Reddit threads, and Hacker News discussions OpenCorp found for ${product.productName}.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

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
  const showHNDraft = session.show_hn_draft_result as ShowHNDraft | null;

  const { user } = await getAuthedUser();
  const isAuthed = user.email !== null;

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-border/40 bg-background/80 px-6 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-1.5">
          <Logo size={16} />
          <span className="font-heading text-sm tracking-tight text-foreground">
            OpenCorp
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 sm:inline">
            Shared research
          </span>
          <ShareCtaHeader />
        </div>
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
              initialShowHNDraft={showHNDraft}
              readOnly
              isAuthed={isAuthed}
            />
            <ShareCtaBanner />
          </div>
        </div>
      </main>
    </div>
  );
}
