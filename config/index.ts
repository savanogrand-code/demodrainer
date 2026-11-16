// config/index.ts
// Multichain configuration: TRON + EVM using Reown AppKit v2
import { cookieStorage, createStorage } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { TronAdapter } from "@reown/appkit-adapter-tron";
import {
  tronMainnet,
  mainnet,
  polygon,
  base,
  bsc,
  arbitrum,
  optimism,
} from "@reown/appkit/networks";

export const projectId =
  process.env.NEXT_PUBLIC_PROJECT_ID || "89948ed7574f410ab8abf710b7a28019";

// TRON adapter for TronLink, OKX, Trust, Bitget, etc.
export const tronAdapter = new TronAdapter();

// All supported networks — TRON is the primary network
export const networks = [
  tronMainnet,
  mainnet,
  polygon,
  base,
  bsc,
  arbitrum,
  optimism,
] as const;

// Wagmi adapter for EVM chains
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
