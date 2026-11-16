"use client";
// components/WalletStatus.tsx
// Shows connected wallet info: address, balance, network, disconnect

import { useAppKitAccount, useAppKitNetwork, useDisconnect } from "@reown/appkit/react";
import { useBalance } from "wagmi";

export default function WalletStatus() {
  const { address, isConnected, embeddedWalletInfo } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address: address as `0x${string}` | undefined });

  if (!isConnected || !address) return null;

  const short = `${address.slice(0, 6)}…${address.slice(-4)}`;
  const bal = balance
    ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
    : "—";

  return (
    <div className="
      mt-6 flex flex-col items-center gap-3
      bg-white/5 border border-[#00ff88]/20 rounded-2xl
      px-8 py-5 backdrop-blur-sm
      shadow-[0_0_30px_rgba(0,255,136,0.08)]
      text-sm
    ">
      <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest">
        <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
        Connected · {caipNetwork?.name ?? "Unknown Network"}
      </div>

      <p className="font-mono text-white text-base">{short}</p>

      {embeddedWalletInfo?.user?.email && (
        <p className="text-white/40 text-xs">{embeddedWalletInfo.user.email}</p>
      )}

      <p className="text-[#00cfff] font-semibold">{bal}</p>

      <button
        onClick={() => disconnect()}
        className="
          mt-1 px-5 py-1.5 rounded-lg text-xs font-medium
          border border-red-500/30 text-red-400
          hover:bg-red-500/10 hover:border-red-400
          transition-all duration-150
        "
      >
        Disconnect
      </button>
    </div>
  );
}
