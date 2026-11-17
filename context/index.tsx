"use client";
// context/index.tsx
import React, { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider, cookieToInitialState, type Config } from "wagmi";
import { wagmiAdapter, tronAdapter, projectId, networks } from "@/config";
import { mainnet } from "@reown/appkit/networks";

const queryClient = new QueryClient();

// Dynamic origin detection for mobile deep link & universal redirect matching
const getAppUrl = () => {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return "https://demodrainer.vercel.app";
};

const appUrl = getAppUrl();

const metadata = {
  name: "DemoDrainer",
  description: "Connect Wallet",
  url: appUrl,
  icons: [`${appUrl}/favicon.ico`],
  redirect: {
    universal: appUrl,
  },
};

// Initialize AppKit with mobile deep linking & multichain support
createAppKit({
  adapters: [wagmiAdapter, tronAdapter],
  networks,
  defaultNetwork: mainnet,
  projectId: projectId!,
  metadata,
  themeMode: "dark",
  enableWalletConnect: true,
  enableInjected: true,
  allWallets: "SHOW",
  featuredWalletIds: [
    "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", // MetaMask
    "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0", // Trust Wallet
    "971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709", // OKX Wallet
    "38f5d18bd8522ca1eb5d642187fbe33d82367c75f66d8b9de4ade24b98fa4694", // Bitget Wallet
    "fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa", // Coinbase Wallet
    "8a0ee50d1f08b9796d82937d811aeac770557ae5c3b0fae6f40713061e0ee1ea", // Binance Web3 Wallet
    "2045651545b04c3d44da356b3b0522e8cd70b02b6033db44bc6b94737016aa76", // TokenPocket
    "1ae92b26df02f0ffd63060a21eea713bd6e4f4b00fddb7ad0f91c8f1a6399c47", // Rainbow
    "7672e0134015f8d167f70b741165a242f3603417e944b2c125df9f6880860527", // TronLink
  ],
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
