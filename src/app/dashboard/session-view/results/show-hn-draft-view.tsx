"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ShowHNDraft } from "@/lib/types/session";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1 font-mono text-[9px] text-muted-foreground/50 transition-colors hover:text-foreground/70"
    >
      {copied ? (
        <Check className="size-3 text-emerald-400" />
      ) : (
        <Copy className="size-3" />
      )}
      {copied ? "copied" : "copy"}
    </button>
  );
}

const inputBase =
  "w-full rounded-md border border-border/40 bg-card/40 px-2 py-1.5 text-[12px] text-foreground/90 focus:border-brand/50 focus:outline-none";

export function ShowHNDraftView({
  draft,
  onPersist,
}: {
  draft: ShowHNDraft;
  onPersist?: (next: ShowHNDraft) => Promise<void> | void;
}) {
  const [title, setTitle] = useState(draft.title);
  const [body, setBody] = useState(draft.body);
  const [saving, setSaving] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!onPersist) return;
    const dirty = title !== draft.title || body !== draft.body;
    if (!dirty) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true);
      const next: ShowHNDraft = {
        ...draft,
        title,
        body,
      };
      try {
        await onPersist(next);
      } finally {
        setSaving(false);
      }
    }, 800);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [title, body, draft, onPersist]);

  const editable = !!onPersist;

  return (
    <div className="space-y-3 py-2">
      {/* Title */}
      <Card>
        <div className="flex items-center justify-between gap-3 px-(--card-spacing)">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
            Title
          </span>
          <CopyButton text={title} />
        </div>
        <CardContent>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            readOnly={!editable}
            className={cn(inputBase, "font-medium leading-snug")}
          />
        </CardContent>
      </Card>

      {/* Post body */}
      <Card>
        <div className="flex items-center justify-between gap-3 px-(--card-spacing)">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
            Post Body
          </span>
          <CopyButton text={body} />
        </div>
        <CardContent>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            readOnly={!editable}
            rows={18}
            className={cn(inputBase, "resize-y leading-relaxed font-mono")}
          />
        </CardContent>
      </Card>

      <p className="text-center font-mono text-[9px] text-muted-foreground/30">
        {saving
          ? "saving…"
          : `generated ${new Date(draft.generated_at).toLocaleTimeString()}`}
      </p>
    </div>
  );
}
