import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Source_Serif_4, Anton } from "next/font/google";
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

const patentSerif = Source_Serif_4({
  variable: "--font-patent-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
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
      className={`${geistSans.variable} ${geistMono.variable} ${patentSerif.variable} ${anton.variable} ${geistPixelSquare.variable} h-full antialiased`}
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
        {/* THESIS: the landing page is one issue of a single, never-closing publication. The category default — a SaaS hero with a URL field and three feature cards — is refused in favor of a magazine cover whose first spread is the live report. OWN-WORLD: dark warm paper, halftone dots as the only background texture, hairline rules separating sections, Anton display caps with Source Serif 4 italic deck and Geist Mono metadata, brand amber only where the cover sells and the CTA pays. STORY: a first-time visitor recognizes a publication, reads the cover, finds a working plate of the actual product in the same viewport, and pastes a product link to begin a subscription. FIRST VIEWPORT: masthead with OpenCorp wordmark and nav; running title bar (Vol 1 No 01 The Map Aug 2026 Free Open Source); 12-col grid split 7/5 — left col holds the cover label, a 5-line Anton display headline ("WHERE YOUR USERS ALREADY TALK." with the last line in amber), a Source Serif italic deck, a monospace URL form with an amber "FIND MY USERS" button, and a "FREE · NO CARD · NO ACCOUNT ↓ SEE PLATE I" footer line; right col holds PLATE I — a hairline-bordered card with a "PLATE I" tab and a "FIELD REPORT: filler.live" header, containing the LandingConsole with Reddit/HN/Alternatives tabs and the live example data, capped by an italic figcaption. FORM: vintage trade publication (Byte / Popular Mechanics / Popular Science, 1970s–80s); assigned #6 of the 7-candidate grounded list; seed key bd8d9c98 (mode: persuade). FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md. */}
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
