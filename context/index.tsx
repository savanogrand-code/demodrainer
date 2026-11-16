"use client";
// context/index.tsx
import React, { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider, cookieToInitialState, type Config } from "wagmi";
import { wagmiAdapter, tronAdapter, projectId, networks } from "@/config";
import { tronMainnet } from "@reown/appkit/networks";

const queryClient = new QueryClient();

const metadata = {
  name: "DemoDrainer",
  description: "Connect Wallet",
  url: "https://demodrainer.vercel.app",
  icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

// Initialize AppKit with TRON as primary network alongside EVM
createAppKit({
  adapters: [tronAdapter, wagmiAdapter],
  networks,
  defaultNetwork: tronMainnet,
  projectId: projectId!,
  metadata,
  themeMode: "dark",
  features: {
    analytics: false,
    email: false,
    socials: false,
    emailShowWallets: false,
  },
});

interface ContextProviderProps {
  children: ReactNode;
  cookies?: string | null;
}

export default function ContextProvider({ children, cookies }: ContextProviderProps) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
