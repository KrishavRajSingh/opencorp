import { ImageResponse } from "next/og";
import { citationPages } from "@/lib/citation-pages";

export const alt = "OpenCorp best-of SaaS tools — comparisons for 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: 80,
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 28,
            color: "#a3a3a3",
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              background: "#22c55e",
              marginRight: 16,
            }}
          />
          <span>OpenCorp comparisons</span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Best SaaS tools in 2026
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: "#a3a3a3",
            }}
          >
            {`${citationPages.length} comparisons · verified pricing · for indie founders`}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#737373",
              marginTop: 16,
            }}
          >
            <span>opencorp.live/best</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}