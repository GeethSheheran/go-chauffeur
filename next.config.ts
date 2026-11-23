import type { NextConfig } from "next";

const config: NextConfig = {
  // Serve existing image assets on Workers without requiring Cloudflare Images.
  images: { unoptimized: process.env.CLOUDFLARE_BUILD === "1" },
  poweredByHeader: false,
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
    ] }];
  },
};

export default config;
