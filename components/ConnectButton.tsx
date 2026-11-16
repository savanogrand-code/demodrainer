// components/ConnectButton.tsx
// Custom neon-styled wrapper around <appkit-button />
// Falls back gracefully when AppKit web component is not yet registered.
"use client";

import { useAppKit, useAppKitAccount } from "@reown/appkit/react";

// Extend JSX to recognise the AppKit web components
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "appkit-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { size?: string; label?: string };
      "appkit-account-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { balance?: string };
    }
  }
}

export default function ConnectButton() {
  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();

  if (isConnected) {
    // Show the built-in account button (address + avatar + disconnect)
    return (
      <div className="flex items-center gap-3">
        <appkit-account-button balance="show" />
      </div>
    );
  }

  return (
    <button
      onClick={() => open()}
      className="
        relative group px-8 py-3 rounded-xl font-semibold text-sm tracking-wide
        bg-gradient-to-r from-[#00ff88] to-[#00cfff]
        text-black
        shadow-[0_0_20px_rgba(0,255,136,0.4)]
        hover:shadow-[0_0_35px_rgba(0,255,136,0.7)]
        hover:scale-105
        active:scale-95
        transition-all duration-200 ease-out
        overflow-hidden
        cursor-pointer
      "
    >
      {/* Shimmer sweep */}
      <span className="
        absolute inset-0 -translate-x-full
        bg-gradient-to-r from-transparent via-white/30 to-transparent
        group-hover:translate-x-full transition-transform duration-500
      " />
      <span className="relative flex items-center gap-2">
        <WalletIcon />
        Connect Wallet
      </span>
    </button>
  );
}

function WalletIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path d="M2.273 5.625A4.483 4.483 0 015.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0018.75 3H5.25a3 3 0 00-2.977 2.625zM2.273 8.625A4.483 4.483 0 015.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0018.75 6H5.25a3 3 0 00-2.977 2.625zM5.25 9a3 3 0 00-3 3v6a3 3 0 003 3h13.5a3 3 0 003-3v-6a3 3 0 00-3-3H5.25zm7.5 6.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
    </svg>
  );
}
