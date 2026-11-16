// app/page.tsx
// Hero landing page with neon DeFi theme + Connect Wallet CTA
import Navbar from "@/components/Navbar";
import ConnectButton from "@/components/ConnectButton";
import WalletStatus from "@/components/WalletStatus";

const STATS = [
  { label: "Total Value Locked", value: "$4.2B", accent: "#00ff88" },
  { label: "24h Volume", value: "$890M", accent: "#00cfff" },
  { label: "Active Wallets", value: "2.1M+", accent: "#9d4edd" },
  { label: "Chains Supported", value: "12", accent: "#ff6b35" },
];

const FEATURES = [
  {
    icon: "⚡",
    title: "Instant Swaps",
    desc: "Zero slippage DEX aggregation across all major EVM chains.",
  },
  {
    icon: "🔒",
    title: "Non-Custodial",
    desc: "Your keys, your coins. We never hold your assets.",
  },
  {
    icon: "🌐",
    title: "Multi-Chain",
    desc: "Ethereum, Polygon, Base, BNB Chain, Arbitrum & more.",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen grid-bg">
      {/* Hero ambient glow */}
      <div className="hero-glow absolute inset-0 pointer-events-none" />

      {/* Navbar */}
      <Navbar />

      {/* ── Hero Section ─────────────────────────────────── */}
      <main className="relative flex flex-col items-center justify-center min-h-screen pt-20 px-4 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00ff88]/30 bg-[#00ff88]/5 text-[#00ff88] text-xs font-medium tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
          Now Live on 12 Networks
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-4 tracking-tight">
          <span className="text-white">The Future of</span>
          <br />
          <span className="neon-text bg-gradient-to-r from-[#00ff88] to-[#00cfff] bg-clip-text text-transparent">
            Decentralized Finance
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="max-w-xl text-white/50 text-lg mb-10 leading-relaxed">
          Connect your wallet to swap, stake, and bridge across every major
          chain — all in one seamless interface.
        </p>

        {/* ── CTA: Connect Wallet ──────────────────────── */}
        <div className="flex flex-col items-center gap-4">
          <ConnectButton />
          <WalletStatus />
          <p className="text-white/25 text-xs mt-2">
            Supports MetaMask, Coinbase, WalletConnect & 400+ wallets
          </p>
        </div>

        {/* ── Stats Row ────────────────────────────────── */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
          {STATS.map((s) => (
            <div key={s.label} className="stat-card px-5 py-4 text-left">
              <p
                className="text-2xl font-bold"
                style={{ color: s.accent }}
              >
                {s.value}
              </p>
              <p className="text-white/40 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Feature Cards ─────────────────────────────── */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-20">
          {FEATURES.map((f) => (
            <div key={f.title} className="stat-card px-6 py-5 text-left">
              <span className="text-2xl">{f.icon}</span>
              <h3 className="mt-3 font-semibold text-white">{f.title}</h3>
              <p className="mt-1 text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative py-6 border-t border-white/5 text-center text-white/20 text-xs">
        DemoDrainer · Built with Reown AppKit + Next.js 15
      </footer>
    </div>
  );
}
