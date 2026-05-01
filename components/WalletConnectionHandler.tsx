"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function WalletConnectionHandler() {
  const { isConnected, address } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const [walletError, setWalletError] = useState<string | null>(null);

  useEffect(() => {
    if (connectError) {
      setWalletError(connectError.message);
      setTimeout(() => setWalletError(null), 5000);
    }
  }, [connectError]);

  const handleConnect = () => {
    // Try to connect with injected wallet (MetaMask)
    const injectedConnector = connectors.find(c => c.id === 'injected');
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  if (walletError) {
    return (
      <div className="fixed top-4 right-4 bg-red-900/90 border border-red-500 text-white p-4 rounded-lg z-50 max-w-sm">
        <p className="text-sm font-bold">Wallet Connection Error</p>
        <p className="text-xs mt-1">{walletError}</p>
        <p className="text-xs mt-2 text-yellow-300">
          💡 Please install MetaMask or another supported wallet
        </p>
        <button 
          onClick={() => setWalletError(null)}
          className="mt-2 text-xs underline hover:no-underline"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <ConnectButton />
    </div>
  );
}
