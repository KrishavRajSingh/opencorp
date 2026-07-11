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
      <body className="min-h-full dark flex flex-col">
        {children}
        <Analytics />
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID &&
          process.env.NEXT_PUBLIC_UMAMI_HOST_URL && (
            <Script
              src={`${process.env.NEXT_PUBLIC_UMAMI_HOST_URL}/script.js`}
              data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
              data-host-url={process.env.NEXT_PUBLIC_UMAMI_HOST_URL}
              strategy="afterInteractive"
            />
          )}
      </body>
    </html>
  );
}
