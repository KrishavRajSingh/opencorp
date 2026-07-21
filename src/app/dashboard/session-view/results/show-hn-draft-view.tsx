"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import type { ShowHNDraft } from "@/lib/types/session";
import { cn } from "@/lib/utils";

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
      className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-foreground/80"
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

const fieldBase =
  "w-full bg-transparent text-sm text-foreground/90 placeholder:text-muted-foreground/30 focus:outline-none focus:bg-orange-400/[0.04] transition-colors";

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
      const next: ShowHNDraft = { ...draft, title, body };
      try {
        await onPersist(next);
      } catch {
        /* save failed — indicator clears; next edit retries */
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
    <div>
      <Field label="title" copyText={title} editable={editable}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          readOnly={!editable}
          className={cn(
            fieldBase,
            "py-3 text-[15px] font-medium leading-snug",
            !editable && "cursor-default",
          )}
          placeholder="Show HN: I built …"
        />
      </Field>

      <Field label="body" copyText={body} editable={editable}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          readOnly={!editable}
          rows={18}
          className={cn(
            fieldBase,
            "resize-y py-3 font-mono text-[12.5px] leading-relaxed",
            !editable && "cursor-default",
          )}
          placeholder="Hey HN — I got tired of …"
        />
      </Field>

      <div className="border-t border-border/30 px-3 py-2 text-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground/35">
        {saving
          ? "saving…"
          : `generated ${new Date(draft.generated_at).toLocaleTimeString()}`}
      </div>
    </div>
  );
}

function Field({
  label,
  copyText,
  editable,
  children,
}: {
  label: string;
  copyText: string;
  editable: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border/30">
      <div className="flex items-center justify-between gap-3 px-3 pt-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/55">
          {label}
        </span>
        {editable && <CopyButton text={copyText} />}
      </div>
      <div className="px-3 pb-2">{children}</div>
    </div>
  );
}
