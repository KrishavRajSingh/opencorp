"use client";

import { DinoLoader } from "@/components/dashboard/dino-loader";
import { GtmBriefView } from "@/components/ai-elements/gtm-brief";
import { HNResultView } from "./results/hn-result-view";
import { ShowHNDraftView } from "./results/show-hn-draft-view";
import { HNActionRow, type HNActionState } from "./hn-action-row";
import {
  ChannelWaitingBay,
  ChannelArmingBay,
} from "./channels";
import type {
  HNResult,
  RedditScanResult,
  ShowHNDraft,
} from "@/lib/types/session";
import { cn } from "@/lib/utils";

export type ConsoleProps = {
  status: "idle" | "competitors" | "reddit" | "hn";
  hasCompetitors: boolean;
  /** Alternatives stage actively running (for wait-bay motion/copy). */
  competitorsRunning: boolean;
  hasReddit: boolean;
  hasHN: boolean;
  redditCount: number;
  hnCount: number;
  onFindReddit: () => void;
  onFindHN: () => void;
  onCancel: () => void;
  streamStatus: string | null;
  elapsedDisplay: string;
  error: string | null;
  redditScan: RedditScanResult | null;
  hnResult: HNResult | null;
  loadingReddit: boolean;
  loadingHN: boolean;
  activeResult: "reddit" | "hn";
  onSwitchResult: (tab: "reddit" | "hn") => void;
  readOnly?: boolean;
  isAuthed: boolean;
  signupHref: string;
  showHNDraft: ShowHNDraft | null;
  loadingShowHN: boolean;
  onDraftShowHN: () => void;
  onCancelDraft?: () => void;
  onPersistShowHN?: (next: ShowHNDraft) => Promise<void> | void;
  activeHNChannel: "find" | "draft" | null;
  onActivateHNChannel: (next: "find" | "draft") => void;
};

export function Console({
  status,
  hasCompetitors,
  competitorsRunning,
  hasReddit,
  hasHN,
  redditCount,
  hnCount,
  onFindReddit,
  onFindHN,
  onCancel,
  streamStatus,
  elapsedDisplay,
  error,
  redditScan,
  hnResult,
  loadingReddit,
  loadingHN,
  activeResult,
  onSwitchResult,
  readOnly = false,
  isAuthed,
  signupHref,
  showHNDraft,
  loadingShowHN,
  onDraftShowHN,
  onCancelDraft,
  onPersistShowHN,
  activeHNChannel,
  onActivateHNChannel,
}: ConsoleProps) {
  const busy = status !== "idle";
  // Independent channels — both unlock after competitors; neither waits on the other.
  const waitingOnCompetitors = !hasCompetitors;
  const showRedditBtn = hasCompetitors && !hasReddit;
  const allDone = hasCompetitors && hasReddit && hasHN && !busy;

  const findState: HNActionState = loadingHN
    ? "running"
    : hasHN
      ? "done"
      : "idle";
  const draftState: HNActionState = loadingShowHN
    ? "running"
    : showHNDraft
      ? "done"
      : "idle";

  const findAvailable = loadingHN || hnResult !== null;
  const draftAvailable = loadingShowHN || showHNDraft !== null;
  const displayedChannel: "find" | "draft" | null =
    activeHNChannel === "find" && findAvailable
      ? "find"
      : activeHNChannel === "draft" && draftAvailable
        ? "draft"
        : findAvailable
          ? "find"
          : draftAvailable
            ? "draft"
            : null;

  // Read-only sessions hide the channel rows, so displayedChannel would
  // lock to "find" — with both artifacts present, render both instead.
  const showBothReadOnly =
    readOnly && hnResult !== null && showHNDraft !== null;

  const statusMeta = {
    idle: {
      dot: "bg-muted-foreground/50",
      label: "READY",
      tone: "text-muted-foreground/70",
    },
    allComplete: {
      dot: "bg-emerald-400",
      label: "ALL COMPLETE",
      tone: "text-emerald-400/80",
    },
    competitors: {
      dot: "bg-brand",
      label: "FINDING ALTERNATIVES",
      tone: "text-brand",
    },
    reddit: {
      dot: "bg-[#FF4500]",
      label: "SCANNING REDDIT",
      tone: "text-[#FF4500]",
    },
    hn: {
      dot: "bg-orange-400",
      label: "FINDING HN THREADS",
      tone: "text-orange-400",
    },
  }[allDone ? "allComplete" : status];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm">
      <div
        className={cn(
          "flex items-center justify-between gap-3 border-b border-border/30 px-4 py-3",
          status === "competitors" && "border-brand/30",
          status === "hn" && "border-orange-400/30",
          allDone && "border-emerald-400/30",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "inline-block size-1.5 rounded-full",
              statusMeta.dot,
              busy && "animate-pulse",
            )}
          />
          <span
            className={cn(
              "font-mono text-[10px] uppercase tracking-widest",
              statusMeta.tone,
            )}
          >
            {statusMeta.label}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {busy && (
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
              {elapsedDisplay}
            </span>
          )}
          {busy && !readOnly && (
            <button
              type="button"
              onClick={onCancel}
              className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              cancel
            </button>
          )}
        </div>
      </div>

      {streamStatus && busy && (
        <div className="border-b border-border/30 px-4 py-2.5 font-mono text-[11px] text-brand/80 truncate">
          <span className="text-muted-foreground/50">&gt; </span>
          {streamStatus}
        </div>
      )}

      {/* Tabs stay put; results pane is the only scroll region (flex min-h-0 chain). */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="m-3 flex shrink-0 items-center rounded-lg border border-border/30 bg-card/30 p-0.5">
          <button
            onClick={() => onSwitchResult("reddit")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-all",
              activeResult === "reddit"
                ? "bg-[#FF4500]/10 text-foreground"
                : "text-muted-foreground/70 hover:text-foreground/80",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                activeResult === "reddit" ? "bg-[#FF4500]" : "bg-[#FF4500]/40",
              )}
            />
            <span>Reddit</span>
            {redditCount > 0 && (
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
                {redditCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onSwitchResult("hn")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-all",
              activeResult === "hn"
                ? "bg-orange-400/10 text-foreground"
                : "text-muted-foreground/70 hover:text-foreground/80",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                activeResult === "hn"
                  ? "bg-orange-400"
                  : "bg-orange-400/40",
              )}
            />
            <span>Hacker News</span>
            {hnCount > 0 && (
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
                {hnCount}
              </span>
            )}
          </button>
        </div>

        {activeResult === "reddit" ? (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
            {waitingOnCompetitors && !readOnly ? (
              <ChannelWaitingBay
                channel="reddit"
                active={competitorsRunning}
              />
            ) : redditScan && (redditScan.top_threads?.length ?? 0) > 0 ? (
              <GtmBriefView
                brief={redditScan}
                isAuthed={isAuthed}
                signupHref={signupHref}
              />
            ) : loadingReddit ? (
              <div className="flex min-h-full flex-col items-center justify-center py-8">
                <DinoLoader
                  instanceKey="reddit"
                  label="Scanning Reddit for your market..."
                  loading={loadingReddit}
                  sublabel="This usually takes 20-40 seconds. We're running 3-5 sharp search terms against the target subs and curating the best threads."
                  tone="brand"
                />
              </div>
            ) : redditScan ? (
              <div className="flex min-h-full flex-col items-center justify-center gap-2 py-10 text-center">
                <p className="font-mono text-[11px] text-muted-foreground/60">
                  No Reddit threads found.
                </p>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={onFindReddit}
                    disabled={busy}
                    className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-[#FF4500] disabled:opacity-50"
                  >
                    re-run
                  </button>
                )}
              </div>
            ) : showRedditBtn && !readOnly ? (
              <ChannelArmingBay
                channel="reddit"
                label="Find Reddit users"
                onRun={onFindReddit}
                busy={busy}
              />
            ) : readOnly && !redditScan ? (
              <p className="py-10 text-center font-mono text-[11px] text-muted-foreground/50">
                No Reddit scan in this report.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
            {waitingOnCompetitors && !readOnly ? (
              <ChannelWaitingBay channel="hn" active={competitorsRunning} />
            ) : readOnly && !hnResult && !showHNDraft ? (
              <p className="px-4 py-10 text-center font-mono text-[11px] text-muted-foreground/50">
                No HN data in this report.
              </p>
            ) : (
              <>
                {!readOnly && findState === "idle" && draftState === "idle" ? (
                  <ChannelArmingBay
                    channel="hn"
                    label="Find HN threads"
                    onRun={onFindHN}
                    busy={busy}
                    secondaryAction={{
                      label: "Draft my launch post",
                      onRun: onDraftShowHN,
                    }}
                  />
                ) : !readOnly ? (
                  <div className="border-y border-border/30">
                    <HNActionRow
                      action="find"
                      state={findState}
                      onRun={onFindHN}
                      onActivate={() => onActivateHNChannel("find")}
                      onCancel={loadingHN ? onCancel : undefined}
                      busy={busy && !loadingHN}
                      isActive={displayedChannel === "find"}
                      resultSummary={
                        hnResult
                          ? `${hnResult.threads.length} thread${hnResult.threads.length === 1 ? "" : "s"}`
                          : undefined
                      }
                    />
                    <HNActionRow
                      action="draft"
                      state={draftState}
                      onRun={onDraftShowHN}
                      onActivate={() => onActivateHNChannel("draft")}
                      onCancel={loadingShowHN ? onCancelDraft : undefined}
                      busy={busy && !loadingShowHN}
                      isActive={displayedChannel === "draft"}
                      resultSummary={showHNDraft ? "1 draft" : undefined}
                    />
                  </div>
                ) : null}

                {(displayedChannel === "find" || showBothReadOnly) && (
                  <div>
                    {loadingHN ? (
                      <div className="flex flex-col items-center justify-center py-6">
                        <DinoLoader
                          instanceKey="hn"
                          label="Searching Hacker News…"
                          loading={loadingHN}
                          sublabel="This usually takes 1–2 minutes. We're searching Hacker News for threads where your future users are already talking — hang tight."
                          tone="orange"
                        />
                      </div>
                    ) : hnResult && hnResult.threads.length > 0 ? (
                      <HNResultView
                        result={hnResult}
                        isAuthed={isAuthed}
                        signupHref={signupHref}
                      />
                    ) : hnResult ? (
                      <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
                        <p className="font-mono text-[11px] text-muted-foreground/60">
                          No HN threads found.
                        </p>
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={onFindHN}
                            disabled={busy}
                            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-orange-400 disabled:opacity-50"
                          >
                            re-run
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}

                {(displayedChannel === "draft" || showBothReadOnly) && (
                  <div
                    className={cn(
                      showBothReadOnly && "mt-4 border-t border-border/30 pt-4",
                    )}
                  >
                    {loadingShowHN && !showHNDraft ? (
                      <div className="flex flex-col items-center justify-center py-6">
                        <DinoLoader
                          instanceKey="showhn"
                          label="Drafting your Show HN post…"
                          loading={loadingShowHN}
                          sublabel="Ghostwriting from your product context. Usually takes 15–30 seconds."
                          tone="brand"
                        />
                      </div>
                    ) : showHNDraft ? (
                      <ShowHNDraftView
                        key={showHNDraft.run_id}
                        draft={showHNDraft}
                        onPersist={readOnly ? undefined : onPersistShowHN}
                      />
                    ) : null}
                  </div>
                )}

              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 border-t border-border/30 px-4 py-3 text-xs text-red-400">
          <span className="mt-0.5 size-3.5 shrink-0">⚠</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
