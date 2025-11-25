import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",      
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",    
      },
    ],
  },
   eslint: {
    // Ignore ESLint errors during build (not recommended for prod)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TS type errors during build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
