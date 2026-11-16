"use client";
// components/Navbar.tsx

import ConnectButton from "./ConnectButton";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-md bg-black/40">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-[#00ff88] font-bold text-xl tracking-tight">
          ◈ DemoDrainer
        </span>
      </div>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-7 text-sm text-white/60">
        {["Swap", "Pool", "Bridge", "Portfolio"].map((item) => (
          <a
            key={item}
            href="#"
            className="hover:text-[#00ff88] transition-colors duration-150"
          >
            {item}
          </a>
        ))}
      </nav>

      {/* Wallet */}
      <ConnectButton />
    </header>
  );
}
