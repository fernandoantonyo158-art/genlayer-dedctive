"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function HeaderWallet() {
  const { isConnected, address } = useAccount();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3 px-4 py-1.5 border border-[#d4af37]/30 rounded-full min-w-[140px] justify-center bg-transparent">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.8)]"></div>
        <span className="text-white font-mono text-[10px] uppercase tracking-widest whitespace-nowrap">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      </div>
    );
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              "style": {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="flex items-center gap-3 px-4 py-1.5 border border-[#d4af37]/30 rounded-full min-w-[100px] justify-center bg-transparent hover:border-[#d4af37]/50 transition-colors"
                  >
                    <span className="text-[#d4af37] font-mono text-[10px] uppercase tracking-widest whitespace-nowrap">Connect</span>
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="flex items-center gap-3 px-4 py-1.5 border border-red-500/30 rounded-full min-w-[140px] justify-center bg-transparent"
                  >
                    <span className="text-red-500 font-mono text-[10px] uppercase tracking-widest whitespace-nowrap">Wrong network</span>
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-3 px-4 py-1.5 border border-[#d4af37]/30 rounded-full min-w-[140px] justify-center bg-transparent">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.8)]"></div>
                  <span className="text-white font-mono text-[10px] uppercase tracking-widest whitespace-nowrap">
                    {account.displayName}
                  </span>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
