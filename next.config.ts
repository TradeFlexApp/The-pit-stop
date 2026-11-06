import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 defaults from create-next-app
  cacheComponents: true,
  experimental: {
    // Admin photo uploads travel through a Server Action (default limit is 1 MB)
    serverActions: { bodySizeLimit: "8mb" },
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Menu / promo images served from Supabase Storage
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
  },
};

export default nextConfig;
