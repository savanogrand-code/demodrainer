// app/layout.tsx
import type { Metadata } from "next";
import { headers } from "next/headers";
import ContextProvider from "@/context";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "DemoDrainer — DeFi Platform",
  description: "Connect your wallet and explore next-gen DeFi",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pass SSR cookies for Wagmi cookie-storage hydration
  const headersList = await headers();
  const cookies = headersList.get("cookie");

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
      </body>
    </html>
  );
}
