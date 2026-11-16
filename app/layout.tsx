// app/layout.tsx
import type { Metadata } from "next";
import { headers } from "next/headers";
import ContextProvider from "@/context";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Connect Wallet",
  description: "Connect your wallet",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const cookies = headersList.get("cookie");

  return (
    <html lang="en">
      <body className="antialiased">
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
      </body>
    </html>
  );
}
