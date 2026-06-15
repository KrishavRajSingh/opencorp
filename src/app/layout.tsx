import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GeistPixelSquare } from "geist/font/pixel";
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
  title: "OpenCorp — Find Your Users While You Build",
  description:
    "Your autonomous AI company. OpenCorp does market research, user discovery, SEO, and outreach — so you can focus on building.",
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
      <body className="min-h-full dark flex flex-col">{children}</body>
    </html>
  );
}
