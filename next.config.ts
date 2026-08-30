import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Product images and campaign attachments go through Server Actions as
  // multipart form submissions. The default 1MB cap is well under our own
  // size checks (5MB for product images in app/actions/profile.ts, 8MB for
  // campaign attachments in app/actions/campaigns.ts), so real uploads were
  // being rejected before either check ever ran. Set above the larger of the
  // two, with headroom for multipart boundary/field overhead.
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
