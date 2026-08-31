import { ImageResponse } from "next/og";
import { getCitationPage } from "@/lib/citation-pages";

export const alt = "OpenCorp best-of SaaS tools comparison";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getCitationPage(slug);
  if (!page) return [];
  return [
    {
      id: slug,
      size,
      contentType,
      alt: `${page.question} — OpenCorp comparison`,
    },
  ];
}

export default async function Image({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const page = getCitationPage(slug);
  if (!page) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a0a",
            color: "#fafafa",
            fontSize: 48,
            fontFamily: "sans-serif",
          }}
        >
          OpenCorp
        </div>
      ),
      { ...size },
    );
  }

  const title = page.question
    .replace(/^What are the /, "")
    .replace(" in 2026?", " 2026");
  const toolCount = page.tools.length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
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
            }}
          />
          OpenCorp comparison
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#a3a3a3",
            }}
          >
            {toolCount} tools reviewed · verified pricing · {page.updated}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 24,
            color: "#737373",
          }}
        >
          opencorp.live/best/{slug}
        </div>
      </div>
    ),
    { ...size },
  );
}