"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  url?: string | null;
  size?: number;
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
};

function getDomain(input: string): string | null {
  const candidate = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  try {
    const u = new URL(candidate);
    return u.host.replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

function hashHue(domain: string): number {
  let h = 0;
  for (let i = 0; i < domain.length; i++) {
    h = (h * 31 + domain.charCodeAt(i)) >>> 0;
  }
  return h % 360;
}

export function ProductFavicon({
  url,
  size = 16,
  className,
  rounded = "md",
}: Props) {
  const domain = url ? getDomain(url) : null;
  const [errored, setErrored] = useState(false);

  const rounding = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  }[rounded];

  if (!domain || errored) {
    const initial = domain ? domain.charAt(0).toUpperCase() : "·";
    const hue = domain ? hashHue(domain) : 40;
    return (
      <div
        aria-hidden
        style={{ width: size, height: size }}
        className={cn(
          "inline-flex shrink-0 items-center justify-center select-none",
          rounding,
          className,
        )}
      >
        <div
          className="flex h-full w-full items-center justify-center"
          style={{
            background: `oklch(0.32 0.05 ${hue})`,
            color: `oklch(0.85 0.12 ${hue})`,
            fontSize: Math.max(8, size * 0.5),
            fontWeight: 600,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            borderRadius: "inherit",
          }}
        >
          {initial}
        </div>
      </div>
    );
  }

  const pixelSize = size <= 16 ? 16 : size <= 24 ? 32 : 64;
  const src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
    domain,
  )}&sz=${pixelSize}`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      onError={() => setErrored(true)}
      loading="lazy"
      decoding="async"
      style={{ width: size, height: size }}
      className={cn("shrink-0 bg-card/50", rounding, className)}
    />
  );
}
