import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    maximumDiskCacheSize: 100 * 1024 * 1024,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
