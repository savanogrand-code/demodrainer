"use client";
// context/index.tsx
// AppKit + WagmiProvider + React Query — client-side only
// ────────────────────────────────────────────────────────

import React, { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider, cookieToInitialState, type Config } from "wagmi";
import { wagmiAdapter, projectId, networks } from "@/config";

// ── Query Client ─────────────────────────────────────────
const queryClient = new QueryClient();

// ── AppKit Metadata ───────────────────────────────────────
const metadata = {
  name: "DemoDrainer",
  description: "Next-gen DeFi platform",
  url: typeof window !== "undefined" ? window.location.origin : "",
  icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

// ── Create AppKit Modal (runs once at module level) ───────
createAppKit({
  adapters: [wagmiAdapter],
  projectId: projectId!,
  networks,
  metadata,
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#00ff88",
    "--w3m-color-mix": "#001a0d",
    "--w3m-color-mix-strength": 40,
    "--w3m-font-family": "Inter, sans-serif",
    "--w3m-border-radius-master": "12px",
  },
  features: {
    analytics: true,
    email: true,
    socials: ["google", "x", "discord"],
    emailShowWallets: true,
  },
  enableWalletConnect: true,
  enableInjected: true,
  enableCoinbase: true,
});

// ── Context Provider ──────────────────────────────────────
interface ContextProviderProps {
  children: ReactNode;
  cookies?: string | null;
}

export default function ContextProvider({
  children,
  cookies,
}: ContextProviderProps) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
