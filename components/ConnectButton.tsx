"use client";
// components/ConnectButton.tsx

import { useEffect, useState } from "react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "appkit-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        size?: string;
        label?: string;
        balance?: string;
      };
    }
  }
}

export default function ConnectButton() {
  const [mounted, setMounted] = useState(false);
  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="px-6 py-3 rounded-xl font-medium text-sm bg-white text-black opacity-80 cursor-pointer">
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <appkit-button balance="show" />
    </div>
  );
}
