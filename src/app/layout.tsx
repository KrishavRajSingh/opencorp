import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { Bricolage_Grotesque } from "next/font/google";
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

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const geistPixelSquare = GeistPixelSquare;

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://opencorp.live",
  ),
  title: {
    default: "OpenCorp — Find the thread your users are already on",
    template: "%s · OpenCorp",
  },
  description:
    "Paste a product link. OpenCorp maps the Reddit threads and Hacker News discussions where your future users already talk, plus the alternatives they compare.",
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
    title: "OpenCorp — Find the thread your users are already on",
    description:
      "Paste a product link. OpenCorp maps the Reddit threads and Hacker News discussions where your future users already talk, plus the alternatives they compare.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "OpenCorp — Find the thread your users are already on",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenCorp — Find the thread your users are already on",
    description:
      "Paste a product link. OpenCorp maps the Reddit threads and Hacker News discussions where your future users already talk, plus the alternatives they compare.",
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
      className={`${geistSans.variable} ${geistMono.variable} ${geistPixelSquare.variable} ${bricolage.variable} h-full antialiased`}
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
      <body className="min-h-full flex flex-col">
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
