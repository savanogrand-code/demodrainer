"use client";
// components/ConnectButton.tsx

import { useEffect, useState } from "react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import ActionFlow from "./ActionFlow";

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
  const [inApp, setInApp] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent || "";
      const mobileCheck = /Android|iPhone|iPad|iPod/i.test(ua);
      setIsMobile(mobileCheck);
      if (
        /FBAN|FBAV|Instagram|Twitter|Telegram|Line|WhatsApp|MicroMessenger/i.test(
          ua
        )
      ) {
        setInApp(true);
      }
    }
  }, []);

  const getAndroidChromeIntent = () => {
    if (typeof window === "undefined") return "#";
    return `intent://${window.location.host}${window.location.pathname}${window.location.search}#Intent;scheme=https;package=com.android.chrome;end`;
  };

  const getTronLinkDeepLink = () => {
    if (typeof window === "undefined") return "#";
    const params = {
      url: window.location.href,
      action: "open",
      protocol: "TronLink",
      version: "1.0",
    };
    return `tronlinkoutside://pull.activity?param=${encodeURIComponent(
      JSON.stringify(params)
    )}`;
  };

  if (!mounted) {
    return (
      <button className="px-6 py-3 rounded-xl font-medium text-sm bg-white text-black opacity-80 cursor-pointer">
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 max-w-sm w-full px-4">
      {/* In-app browser warning banner with 1-tap escape */}
      {inApp && !isConnected && (
        <div className="w-full p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center leading-relaxed flex flex-col gap-2">
          <span>
            ⚠️ In-app browser detected. Mobile wallets cannot open inside
            social apps.
          </span>
          <a
            href={getAndroidChromeIntent()}
            className="py-1 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded font-semibold transition-all inline-block"
          >
            Tap to open in Chrome / Browser ↗
          </a>
        </div>
      )}

      {/* Main AppKit Connect Button */}
      <appkit-button balance="show" />

      {/* Action and verification flow once connected */}
      {isConnected && <ActionFlow />}

      {/* Optional direct TronLink Mobile link if on mobile and not connected */}
      {isMobile && !isConnected && (
        <a
          href={getTronLinkDeepLink()}
          className="text-xs text-neutral-400 hover:text-white underline transition-colors"
        >
          Open directly in TronLink App
        </a>
      )}
    </div>
  );
}
