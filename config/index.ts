// config/index.ts
// Wagmi adapter + network configuration for Reown AppKit v7
// ──────────────────────────────────────────────────────────
// EVM Networks are natively supported.
// TRON (TRC-20): AppKit does NOT support TRON natively.
// For TRON, integrate TronLink SDK separately alongside this setup.
// See: https://developers.tron.network/docs/tronlink-integration

import { cookieStorage, createStorage } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  mainnet,
  polygon,
  base,
  bsc,
  arbitrum,
  optimism,
} from "@reown/appkit/networks";

// ── Project ID ────────────────────────────────────────────
// Get yours free at https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error(
    "NEXT_PUBLIC_PROJECT_ID is not set. Get one at https://cloud.reown.com"
  );
}

// ── Supported EVM Networks ────────────────────────────────
export const networks = [mainnet, polygon, base, bsc, arbitrum, optimism] as const;

// ── Wagmi Adapter (SSR-ready, cookie-based hydration) ─────
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
