import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 defaults from create-next-app
  cacheComponents: true,
  experimental: {
    // Admin photo uploads travel through a Server Action (default limit is 1 MB); photos are capped at 6 MB in src/lib/admin/limits.ts
    serverActions: { bodySizeLimit: "10mb" },
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
