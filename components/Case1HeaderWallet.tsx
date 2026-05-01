"use client";

import { useAccount } from "wagmi";

export default function Case1HeaderWallet() {
  const { address } = useAccount();

  if (!address) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 border border-[#d4af37]/30 rounded-full" style={{ background: 'rgba(0, 0, 0, 0.3)' }}>
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
      <span className="text-white font-mono text-[10px] uppercase tracking-widest">
        {address.slice(0, 6)}...{address.slice(-4)}
      </span>
    </div>
  );
}
