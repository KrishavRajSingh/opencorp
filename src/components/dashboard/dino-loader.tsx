"use client";

import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const ChromeDinoGame = dynamic(
  () => import("react-chrome-dino").then((m) => m.default),
  { ssr: false },
);

type Tone = "brand" | "orange";

export function DinoLoader({
  loading,
  label,
  tone,
  instanceKey,
}: {
  loading: boolean;
  label: string;
  tone: Tone;
  instanceKey: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const Original = window.AudioContext;
    class MutedAudioContext {
      createBuffer(): unknown {
        return null;
      }
      createBufferSource(): {
        start: () => void;
        connect: () => void;
        disconnect: () => void;
      } {
        return { start() {}, connect() {}, disconnect() {} };
      }
      decodeAudioData(): Promise<AudioBuffer> {
        return Promise.resolve(null as unknown as AudioBuffer);
      }
      close(): Promise<void> {
        return Promise.resolve();
      }
      get currentTime(): number {
        return 0;
      }
      get destination(): AudioDestinationNode {
        return {} as AudioDestinationNode;
      }
    }
    window.AudioContext =
      MutedAudioContext as unknown as typeof AudioContext;
    return () => {
      window.AudioContext = Original;
    };
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      Runner?: new (selector: string, config?: unknown) => unknown;
    };
    const RealRunner = w.Runner;
    if (typeof RealRunner !== "function") return;

    const IdempotentRunner = function (
      this: unknown,
      selector: string,
      config?: unknown,
    ): unknown {
      const self = IdempotentRunner as unknown as { instance_?: unknown };
      if (self.instance_) {
        return self.instance_;
      }
      const instance = new RealRunner(selector, config);
      self.instance_ = instance;
      return instance;
    } as unknown as new (selector: string, config?: unknown) => unknown;
    (IdempotentRunner as unknown as { instance_?: unknown }).instance_ = (
      RealRunner as unknown as { instance_?: unknown }
    ).instance_;

    w.Runner = IdempotentRunner as unknown as typeof w.Runner;

    return () => {
      w.Runner = RealRunner;
    };
  }, [instanceKey]);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const wrapper = wrapperRef.current;
    const cleanup = () => {
      const extras = wrapper.querySelectorAll(
        ".interstitial-wrapper .runner-container",
      );
      for (let i = 1; i < extras.length; i++) {
        extras[i].remove();
      }
    };
    const id = window.setInterval(cleanup, 50);
    const stopId = window.setTimeout(() => window.clearInterval(id), 1000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(stopId);
    };
  }, [instanceKey]);

  if (!loading) return null;

  return (
    <div
      className="rounded-lg border border-border/40 bg-background/40 p-3"
      ref={wrapperRef}
    >
      <style>{`
        .interstitial-wrapper ~ .controller,
        .controller { display: none !important; }
        .interstitial-wrapper { margin: 0 !important; max-width: 100% !important; }
        .runner-container, .runner-canvas { width: 100% !important; max-width: 100% !important; position: relative !important; }
      `}</style>
      <div className="mb-2 flex items-center gap-2">
        <span
          className={cn(
            "size-1.5 rounded-full",
            tone === "brand" ? "bg-brand" : "bg-orange-400",
            "animate-pulse",
          )}
        />
        <span
          className={cn(
            "font-mono text-[10px] uppercase tracking-widest",
            tone === "brand" ? "text-brand" : "text-orange-400",
          )}
        >
          {label}
        </span>
      </div>
      <div className="overflow-hidden rounded-md bg-zinc-950">
        <ChromeDinoGame key={instanceKey} />
      </div>
      <div className="mt-1.5 text-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50">
        SPACE / ↑ jump · ↓ duck
      </div>
    </div>
  );
}

