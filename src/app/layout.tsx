import type { Metadata } from "next";
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
    default: "OpenCorp — Find Your Users While You Build",
    template: "%s · OpenCorp",
  },
  description:
    "Your autonomous AI company. OpenCorp does market research, user discovery, SEO, and outreach — so you can focus on building.",
  applicationName: "OpenCorp",
  keywords: [
    "user acquisition",
    "market research",
    "lead generation",
    "AI agent",
    "outreach",
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
    title: "OpenCorp — Find Your Users While You Build",
    description:
      "Your autonomous AI company. OpenCorp does market research, user discovery, SEO, and outreach — so you can focus on building.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "OpenCorp — Find Your Users While You Build",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenCorp — Find Your Users While You Build",
    description:
      "Your autonomous AI company. OpenCorp does market research, user discovery, SEO, and outreach — so you can focus on building.",
    images: ["/opengraph-image"],
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
      </body>
    </html>
  );
}
