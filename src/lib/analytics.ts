"use client";

type WithData<TName extends string, TData> = { name: TName; data: TData };

export type AnalyticsEvent =
  | WithData<"cta_open_dashboard", { location: "nav" }>
  | WithData<"cta_try_with_link", { location: "hero" | "footer" }>
  | WithData<
      "demo_progress",
      { pct: 25 | 50 | 75 | 100; location: "hero" | "footer" }
    >
  | WithData<"demo_fullscreen_enter", { location: "hero" | "footer" }>
  | WithData<"demo_fullscreen_exit", { location: "hero" | "footer" }>
  | { name: "auth_google_oauth_click" }
  | { name: "auth_signin_submit" }
  | { name: "auth_signup_submit" };

type DataFor<E extends AnalyticsEvent["name"]> = Extract<
  AnalyticsEvent,
  { name: E; data?: unknown }
>["data"];

export function trackEvent<E extends AnalyticsEvent["name"]>(
  event: { name: E } & (DataFor<E> extends Record<string, unknown>
    ? { data: DataFor<E> }
    : { data?: DataFor<E> }),
): void {
  if (process.env.NODE_ENV !== "production") return;
  if (typeof window === "undefined") return;
  const tracker = window.umami;
  if (!tracker) return;
  try {
    tracker.track(
      event.name,
      "data" in event ? (event.data as Record<string, unknown>) : undefined,
    );
  } catch {
    // never let analytics break the app
  }
}
