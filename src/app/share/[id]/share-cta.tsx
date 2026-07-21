"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

export function ShareCtaHeader() {
  return (
    <Button
      size="sm"
      asChild
      onClick={() =>
        trackEvent({
          name: "cta_share_research_own",
          data: { location: "share_header" },
        })
      }
    >
      <Link href="/dashboard">Research yours</Link>
    </Button>
  );
}

export function ShareCtaBanner() {
  return (
    <div className="mx-auto mt-16 max-w-xl text-center">
      <h2 className="font-heading text-2xl tracking-tight text-foreground sm:text-3xl">
        Want threads like these for your product?
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Paste a link. Get alternatives, Reddit threads, and Hacker News
        discussions — free.
      </p>
      <Button
        size="lg"
        className="mt-6"
        asChild
        onClick={() =>
          trackEvent({
            name: "cta_share_research_own",
            data: { location: "share_banner" },
          })
        }
      >
        <Link href="/dashboard">
          Research your product
          <ArrowRight className="size-4" />
        </Link>
      </Button>
      <p className="mt-3 text-xs text-muted-foreground/70">
        Free & open source · No credit card
      </p>
    </div>
  );
}
