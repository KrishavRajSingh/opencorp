"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { runShowHNDraft, type ShowHNDraftResult } from "./actions";
import { ShowHNResults } from "./results";

export function ShowHNForm() {
  const [url, setUrl] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<ShowHNDraftResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    let normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }
    trackEvent({ name: "tool_run", data: { tool: "show_hn_drafter" } });
    startTransition(async () => {
      const res = await runShowHNDraft({
        productName: deriveName(normalized),
        description: context || `Product at ${normalized}`,
        keyFeatures: [],
        targetAudience: "indie hackers, founders",
        demoUrl: normalized,
        buildMotivation: null,
        techStack: null,
        hardChallenge: null,
        tradeoffs: null,
        lessonLearned: null,
        keyMetric: null,
      });
      setResult(res);
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border/60 bg-card/50 px-3 py-2.5 backdrop-blur-sm transition-colors focus-within:border-brand/50">
          <Sparkles className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            name="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="your-product.com"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
          />
        </div>
        <textarea
          name="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Optional: one sentence on who this is for and what makes it different. Better input = better draft."
          rows={2}
          className="w-full rounded-lg border border-border/60 bg-card/50 px-3 py-2 text-sm text-foreground outline-none backdrop-blur-sm placeholder:text-muted-foreground/50"
          maxLength={500}
        />

        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Drafting
            </>
          ) : (
            <>
              Generate draft
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      {result && <ShowHNResults result={result} />}
    </div>
  );
}

function deriveName(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "").split(".")[0] || "Product";
  } catch {
    return "Product";
  }
}
