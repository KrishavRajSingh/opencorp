import { useState } from "react";

const SUB_PRESETS: { label: string; subs: string[] }[] = [
  {
    // huge consumer money market: budgeting, investing, debt
    label: "finance",
    subs: ["personalfinance", "povertyfinance", "investing", "FinancialPlanning", "ynab"],
  },
  {
    // huge consumer health market
    label: "fitness",
    subs: ["fitness", "loseit", "bodyweightfitness", "xxfitness", "nutrition"],
  },
  {
    // peer founders / indie software
    label: "indie SaaS",
    subs: ["SaaS", "startups", "sideproject", "indiehackers", "bootstrapping"],
  },
];

export function SubsSearchInput({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const [localText, setLocalText] = useState<string | null>(null);
  const displayText = localText ?? value.join(", ");

  const commit = () => {
    const next = displayText
      .split(/[\s,]+/)
      .map((s) => s.replace(/^r\//, "").trim())
      .filter((s) => s.length > 0 && /^[A-Za-z0-9_]+$/.test(s));
    setLocalText(null);
    onChange([...new Set(next)].slice(0, 15));
  };

  return (
    <div className="space-y-1.5 rounded-md border border-[#FF4500]/20 bg-[#FF4500]/[0.04] p-2.5">
      <label className="block font-mono text-[10px] uppercase tracking-widest text-[#FF4500]/80">
        Target subreddits
      </label>
      <textarea
        value={displayText}
        disabled={disabled}
        placeholder="SaaS, startups, sideproject, indiehackers"
        onChange={(e) => setLocalText(e.target.value)}
        onBlur={commit}
        rows={2}
        className="w-full resize-none rounded border border-border/40 bg-background/60 px-2 py-1 font-mono text-[11px] text-foreground/85 placeholder:text-muted-foreground/40 focus:border-[#FF4500]/60 focus:outline-none disabled:opacity-50"
      />
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/50">
          presets
        </span>
        {SUB_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            disabled={disabled}
            title={preset.subs.join(", ")}
            onClick={() => {
              setLocalText(null);
              onChange(preset.subs);
            }}
            className="rounded border border-border/40 bg-card/40 px-1.5 py-0.5 font-mono text-[10px] text-foreground/70 transition-colors hover:border-[#FF4500]/40 hover:text-foreground disabled:opacity-50"
          >
            {preset.label}
          </button>
        ))}
        {value.length > 0 && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setLocalText(null);
              onChange([]);
            }}
            className="ml-auto rounded px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/60 transition-colors hover:text-foreground disabled:opacity-50"
          >
            clear
          </button>
        )}
      </div>
      <p className="text-[10px] leading-snug text-muted-foreground/55">
        Leave empty to auto-pick subs from your product. Pin to force those only.
      </p>
    </div>
  );
}
