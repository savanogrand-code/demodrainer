"use client";
// context/index.tsx
import React, { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider, cookieToInitialState, type Config } from "wagmi";
import { wagmiAdapter, projectId, networks } from "@/config";

const queryClient = new QueryClient();

const metadata = {
  name: "DemoDrainer",
  description: "Connect Wallet",
  url: "https://demodrainer.vercel.app",
  icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

// Initialize AppKit without social or email logins (crypto wallets only)
createAppKit({
  adapters: [wagmiAdapter],
  projectId: projectId!,
  networks,
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
