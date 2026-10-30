import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns", "radix-ui"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
