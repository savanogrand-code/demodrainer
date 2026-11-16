import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16+ uses Turbopack by default.
  // Wallet libraries no longer need manual Node.js fallback shims.
  turbopack: {},
};

export default nextConfig;
