"use client";

import { useReducedMotion } from "motion/react";
import { ExternalLink, Link2 } from "lucide-react";
import { ProductFavicon } from "@/components/dashboard/product-favicon";
import { DinoLoader } from "@/components/dashboard/dino-loader";
import { AlternativesStageCard } from "./alternatives-card";
import type { ProductResult, CompetitorResult } from "@/lib/types/session";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export function ProductHeader({
  result,
  competitors,
  competitorsPending,
  competitorsError,
  onReFindCompetitors,
  readOnly = false,
}: {
  result: ProductResult;
  competitors: CompetitorResult | null;
  /** True while backend stage is running or we are waiting for it. */
  competitorsPending: boolean;
  /** Cancel / fail message from stage machine (null = clean idle). */
  competitorsError: string | null;
  onReFindCompetitors: () => void;
  readOnly?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const alts = competitors?.competitors ?? [];
  const aborted =
    !!competitorsError &&
    /cancel|abort|stopped|fail/i.test(competitorsError);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3.5">
        <ProductFavicon
          url={result.url}
          size={40}
          rounded="lg"
          className="mt-0.5 ring-1 ring-border/40"
        />
        <div className="min-w-0 flex-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
            subject
          </span>
          <h2 className="mt-0.5 font-heading text-xl tracking-tight text-foreground sm:text-2xl">
            {result.productName}
          </h2>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-brand/70 hover:text-brand transition-colors"
          >
            <Link2 className="size-3" />
            <span className="truncate">{result.url}</span>
            <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        </div>
      </div>

      {result.description && (
        <p className="max-w-2xl text-sm leading-relaxed text-foreground/80">
          {result.description}
        </p>
      )}

      {result.keyFeatures.length > 0 && (
        <div className="space-y-2">
          <span className="font-heading text-[10px] tracking-widest uppercase text-muted-foreground/60">
            Key Features
          </span>
          <div className="flex flex-wrap gap-1.5">
            {result.keyFeatures.map((f, i) => (
              <span
                key={i}
                className="inline-flex rounded-md border border-border/40 bg-card/30 px-2 py-0.5 text-[11px] text-foreground/80"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {(result.pricingModel || result.targetAudience) && (
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {result.pricingModel && (
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                Pricing
              </dt>
              <dd className="mt-1 text-sm text-foreground/85 leading-relaxed">
                {result.pricingModel}
              </dd>
            </div>
          )}
          {result.targetAudience && (
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                Target Audience
              </dt>
              <dd className="mt-1 text-sm text-foreground/85 leading-relaxed">
                {result.targetAudience}
              </dd>
            </div>
          )}
        </dl>
      )}

      <div className="border-t border-dashed border-border/40 pt-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-[10px] tracking-widest uppercase text-muted-foreground/60">
              Alternatives on the market
            </span>
            {alts.length > 0 && (
              <span className="font-mono text-[10px] tabular-nums text-brand/70">
                {String(alts.length).padStart(2, "0")}
              </span>
            )}
          </div>
          {!readOnly && alts.length > 0 && (
            <button
              type="button"
              onClick={onReFindCompetitors}
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-brand"
            >
              re-run
            </button>
          )}
          {!readOnly && competitorsPending && (
            <button
              type="button"
              onClick={onReFindCompetitors}
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-brand"
            >
              restart
            </button>
          )}
        </div>

        {competitorsPending ? (
          <DinoLoader
            instanceKey="competitors-header"
            label="Finding alternatives…"
            loading
            sublabel="Searching the web for products that overlap with yours. Usually 3–5 minutes — Reddit and HN unlock when this finishes."
            tone="brand"
          />
        ) : alts.length > 0 ? (
          <div
            className={cn(
              "relative max-h-[min(28rem,55vh)] overflow-y-auto overscroll-contain pr-0.5",
              alts.length > 6 &&
                "mask-[linear-gradient(to_bottom,black_0%,black_88%,transparent_100%)]",
            )}
          >
            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {alts.map((c, i) => (
                <motion.li
                  key={`${c.url || c.name}-${i}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { delay: Math.min(i * 0.03, 0.36), duration: 0.28 }
                  }
                >
                  <a
                    href={c.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/alt flex h-full items-start gap-2.5 rounded-md border border-border/40 bg-card/30 px-2.5 py-2 transition-all hover:border-brand/40 hover:bg-card/60"
                  >
                    <span className="mt-0.5 w-4 shrink-0 font-mono text-[9px] tabular-nums text-muted-foreground/35 group-hover/alt:text-brand/50">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <ProductFavicon
                      url={c.url}
                      size={16}
                      rounded="sm"
                      className="mt-0.5 ring-1 ring-border/30"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground/90 group-hover/alt:text-foreground">
                          {c.name}
                        </span>
                        <ExternalLink className="size-2.5 shrink-0 text-muted-foreground/30 opacity-0 transition-opacity group-hover/alt:opacity-100 group-hover/alt:text-brand/60" />
                      </div>
                      {c.description && (
                        <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground/65">
                          {c.description}
                        </p>
                      )}
                    </div>
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>
        ) : competitors ? (
          <AlternativesStageCard
            tone="empty"
            eyebrow="no results"
            title="No alternatives found"
            body="Nothing clear came back. Try again, or run Reddit and HN with product context only."
            actionLabel={readOnly ? undefined : "Try again"}
            onAction={readOnly ? undefined : onReFindCompetitors}
            readOnly={readOnly}
          />
        ) : readOnly ? (
          <AlternativesStageCard
            tone="empty"
            eyebrow="not in report"
            title="No alternatives in this report"
            body="This shared report has product analysis only."
            readOnly
          />
        ) : aborted ? (
          <AlternativesStageCard
            tone="aborted"
            eyebrow="stopped"
            title="Alternatives didn't finish"
            body={
              competitorsError ??
              "This step stopped before results were saved. Run it again to unlock Reddit and HN."
            }
            actionLabel="Find alternatives"
            onAction={onReFindCompetitors}
          />
        ) : (
          <AlternativesStageCard
            tone="idle"
            eyebrow="next step"
            title="Find alternatives"
            body="Discover products that compete with yours. Reddit and Hacker News unlock after this finishes."
            actionLabel="Find alternatives"
            onAction={onReFindCompetitors}
          />
        )}
      </div>
    </div>
  );
}
