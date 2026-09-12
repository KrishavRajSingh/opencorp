"use client";

import { useState } from "react";
import { Check, Copy, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import type { ShowHNDraftResult } from "./actions";

export function ShowHNResults({ result }: { result: ShowHNDraftResult }) {
  if (!result.ok) {
    return (
      <div className="mt-6 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div>
          <p className="text-sm font-medium text-foreground">Couldn&apos;t generate a draft</p>
          <p className="mt-1 text-xs text-muted-foreground">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-xl border border-border/50 bg-card/40 p-5">
        <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-widest text-muted-foreground/70">
          <span>Title</span>
          <CopyButton
            text={`${result.title}\n\n${result.body}`}
            onClick={() => trackEvent({ name: "tool_thread_click", data: { tool: "show_hn_drafter", rank: 0 } })}
            label="Copy both"
          />
        </div>
        <h3 className="mt-2 font-heading text-xl text-foreground">{result.title}</h3>

        <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground/70">
          Body
        </div>
        <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-border/30 bg-background/40 p-4 text-sm leading-relaxed text-foreground/90">
{result.body}
        </pre>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Generated {new Date(result.generatedAt).toLocaleString()} · run {result.runId}.
        Re-run for a different angle, or edit the placeholder fields above for a
        sharper draft.
      </p>

      <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-5 text-center">
        <p className="text-sm font-medium text-foreground">
          Want this + the threads to mention it in?
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          OpenCorp surfaces the HN + Reddit threads where your future users
          are most active. Free, no card.
        </p>
        <Button
          size="sm"
          className="mt-3"
          asChild
          onClick={() =>
            trackEvent({ name: "tool_to_dashboard", data: { tool: "show_hn_drafter" } })
          }
        >
          <Link href="/dashboard">Run the full research →</Link>
        </Button>
      </div>
    </div>
  );
}

function CopyButton({
  text,
  onClick,
  label,
}: {
  text: string;
  onClick?: () => void;
  label: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
          onClick?.();
        } catch {
          /* ignore */
        }
      }}
      className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-background/40 px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? "Copied" : label}
    </button>
  );
}
