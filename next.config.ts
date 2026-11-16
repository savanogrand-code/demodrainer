import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Next.js 15 config */
  webpack: (config) => {
    // Required for some wallet libraries that use Node.js built-ins
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
