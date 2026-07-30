import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const umami = process.env.NEXT_PUBLIC_UMAMI_HOST_URL;
    if (!umami) return [];
    return [
      { source: "/u/script.js", destination: `${umami}/script.js` },
      { source: "/u/api/send", destination: `${umami}/api/send` },
    ];
  },
};

export default nextConfig;
