import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { GeistPixelSquare } from "geist/font/pixel";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const geistPixelSquare = GeistPixelSquare;

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://opencorp.live",
  ),
  title: {
    default: "OpenCorp — Find Where Your Users Already Talk",
    template: "%s · OpenCorp",
  },
  description:
    "Drop a product link. OpenCorp finds alternatives and the Reddit and Hacker News threads where your future users already talk.",
  applicationName: "OpenCorp",
  keywords: [
    "user acquisition",
    "market research",
    "competitor research",
    "Reddit marketing",
    "Hacker News",
    "AI research agent",
  ],
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://opencorp.live",
    siteName: "OpenCorp",
    title: "OpenCorp — Find Where Your Users Already Talk",
    description:
      "Drop a product link. OpenCorp finds alternatives and the Reddit and Hacker News threads where your future users already talk.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "OpenCorp — Find Where Your Users Already Talk",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenCorp — Find Where Your Users Already Talk",
    description:
      "Drop a product link. OpenCorp finds alternatives and the Reddit and Hacker News threads where your future users already talk.",
    images: ["/og.png"],
    site: "@opencorpai",
    creator: "@opencorpai",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${geistPixelSquare.variable} h-full antialiased`}
    >
      <head>
        {process.env.NEXT_PUBLIC_DATAFAST_WEBSITE_ID && (
          <Script
            data-website-id={process.env.NEXT_PUBLIC_DATAFAST_WEBSITE_ID}
            data-domain="opencorp.live"
            src="https://datafa.st/js/script.js"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="min-h-full dark flex flex-col">
        {/* THESIS: The product is a map of where your next users are already talking. The landing is that map, not a hero above it. Refuses the SaaS landing rut (big H1 + subhead + CTA + feature grid + footer) and the predictable opposite (the Cal.com/Plausible/Supabase OS-launch template). OWN-WORLD: Cartographer's map room. Dark desaturated ground (oklch 0.18 0.02 250), warmer map paper (oklch 0.22 0.03 250), hand-drawn graticule in oklch 0.3 0.015 250, five labeled regions (REDDIT, HACKER NEWS, GITHUB, TWITTER, INDIHACKERS), pins in three states (found=oklch 0.72 0.15 75 brand, live=brand+pulse, empty=oklch 0.42 0.012 250), one red thread (oklch 0.62 0.19 25) connecting 2-3 related pins. Headlines in GeistPixelSquare (case-file title). Body in Geist sans. Marginalia in Geist mono. Compass rose, "scale 1:1 — conversations found", "here be the buyers". STORY: Visitor lands on a map. Sees pins, threads, and reasons immediately. Believes: the map is real, the reasons are real, the sources are visible. Does: paste URL, get their own map. FIRST VIEWPORT: Two-column. Left ~40%: "case file: opencorp" corner label top-left, Q3 2026 date top-right. Headline "Your next users / are already talking. / We find them." in GeistPixelSquare, three lines, large. Subhead in Geist sans. URL input as a thin underline + "Open the map" button. Right ~55%: stylized world map filling the column, ~25-30 pins, one red thread, marginalia in corners, compass rose top-right. FORM: The Map Room. Position #3 of 7 in my grounded list (research notebook, intelligence dossier, map-room, annotated bibliography, data-desk sparkline, evidence-board, pin-board). Seed key 3797df7d. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md. */}
        {children}
        <Analytics />
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID &&
          process.env.NEXT_PUBLIC_UMAMI_HOST_URL && (
            <Script
              src="/u/script.js"
              data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
              data-host-url="/u"
              strategy="afterInteractive"
            />
          )}
      </body>
    </html>
  );
}
