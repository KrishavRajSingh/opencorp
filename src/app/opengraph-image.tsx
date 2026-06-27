import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import wawoff2 from "wawoff2";

export const runtime = "nodejs";
export const alt = "OpenCorp — Find Your Users While You Build";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACCENT = "#FF6600";
const BG = "#0a0a0a";
const FG = "#fafafa";
const MUTED = "#8a8a8a";
const GRID = "#1a1a1a";

export default async function Image() {
  const woff2 = await readFile(
    join(process.cwd(), "public/og-fonts/GeistPixel-Square.woff2"),
  );
  const fontData = await wawoff2.decompress(woff2);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: BG,
          fontFamily: "GeistPixelSquare",
          color: FG,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(to right, " +
              GRID +
              " 1px, transparent 1px), linear-gradient(to bottom, " +
              GRID +
              " 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            opacity: 0.6,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            display: "flex",
            background: FG,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "64px 80px 0",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                display: "flex",
                background: ACCENT,
              }}
            />
            <div
              style={{
                fontSize: 26,
                letterSpacing: 2,
                display: "flex",
              }}
            >
              OPENCORP
            </div>
          </div>
          <div
            style={{
              fontSize: 20,
              color: MUTED,
              display: "flex",
              letterSpacing: 1,
            }}
          >
            opencorp.live
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 80px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 88,
              lineHeight: 1.05,
              letterSpacing: -1,
              display: "flex",
              flexDirection: "column",
              maxWidth: 1040,
            }}
          >
            <span style={{ display: "flex" }}>Find Your Users</span>
            <span style={{ display: "flex" }}>
              While You{" "}
              <span style={{ display: "flex", color: ACCENT }}>Build</span>
              <span
                style={{
                  display: "flex",
                  color: ACCENT,
                  marginLeft: 4,
                }}
              >
                _
              </span>
            </span>
          </div>

          <div
            style={{
              marginTop: 36,
              fontSize: 24,
              color: MUTED,
              lineHeight: 1.4,
              display: "flex",
              maxWidth: 820,
            }}
          >
            Market research, user discovery, SEO, and outreach — on autopilot.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 80px 56px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 24,
              fontSize: 18,
              color: MUTED,
              letterSpacing: 1,
            }}
          >
            <span style={{ display: "flex" }}>[ RESEARCH ]</span>
            <span style={{ display: "flex" }}>[ DISCOVERY ]</span>
            <span style={{ display: "flex" }}>[ OUTREACH ]</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 18,
              color: FG,
              letterSpacing: 1,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                display: "flex",
                background: ACCENT,
              }}
            />
            <span style={{ display: "flex" }}>v0.1 — LIVE</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "GeistPixelSquare",
          data: fontData,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
