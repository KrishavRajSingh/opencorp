"use client";

import type { HNResult } from "@/lib/types/session";
import {
  ANON_PREVIEW_COUNT,
  LockedThreadRow,
  SignupUnlockBar,
} from "@/components/dashboard/thread-gate";
import { HNCardHeader, HNLiveRow } from "./hn-live-row";

export function HNResultView({
  result,
  isAuthed,
  signupHref,
}: {
  result: HNResult | null;
  isAuthed: boolean;
  signupHref: string;
}) {
  const totalCount = result?.threads.length ?? 0;
  const hiddenCount = Math.max(0, totalCount - ANON_PREVIEW_COUNT);
  const visibleThreads = isAuthed
    ? (result?.threads ?? [])
    : (result?.threads ?? []).slice(0, ANON_PREVIEW_COUNT);

  return (
    <div>
      {totalCount > 0 && <HNCardHeader count={totalCount} />}
      {visibleThreads.map((t, i) => (
        <HNLiveRow key={t.objectID} t={t} rank={i + 1} />
      ))}

      {!isAuthed && hiddenCount > 0 && (
        <SignupUnlockBar hiddenCount={hiddenCount} signupHref={signupHref} />
      )}

      {!isAuthed && result && hiddenCount > 0 && (
        <>
          {result.threads.slice(ANON_PREVIEW_COUNT).map((t, i) => (
            <LockedThreadRow
              key={t.objectID}
              rank={i + 1 + ANON_PREVIEW_COUNT}
              title={t.title}
            />
          ))}
        </>
      )}
    </div>
  );
}
