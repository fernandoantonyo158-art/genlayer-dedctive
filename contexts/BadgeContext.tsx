"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAccount, useReadContract } from "wagmi";

const CONTRACT_ADDRESS = "0x868ef59CBA2857bD930F3849E0d3Fdb001F914Fa" as `0x${string}`;

const CONTRACT_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const;

interface BadgeContextType {
  hasBadge: boolean;
  isLoading: boolean;
  refreshBadge: () => void;
  markBadgeMinted: () => void;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export function BadgeProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();
  const [hasBadge, setHasBadge] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(0);

  const { data: nftBalance, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { 
      enabled: !!address,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchInterval: 5000 // Poll every 5 seconds for real-time updates
    }
  });

  useEffect(() => {
    if (!address) {
      setHasBadge(false);
      setIsLoading(false);
      console.log('[Gating System] No wallet connected');
      return;
    }

    if (nftBalance !== undefined) {
      const hasToken = Number(nftBalance) > 0;
      setHasBadge(hasToken);
      setIsLoading(false);
      
      console.log('[Gating System] NFT Found:', hasToken);
      console.log('[Gating System] Contract:', CONTRACT_ADDRESS);
      console.log('[Gating System] Wallet:', address);
      console.log('[Gating System] Balance:', nftBalance.toString());
    }
  }, [nftBalance, address, forceRefresh]);

  // Listen for account changes
  useEffect(() => {
    const handleAccountsChanged = () => {
      console.log('[Gating System] Account changed - refreshing badge status');
      setForceRefresh(prev => prev + 1);
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const refreshBadge = () => {
    console.log('[Gating System] Manual refresh triggered');
    setForceRefresh(prev => prev + 1);
    refetch();
  };

  const markBadgeMinted = () => {
    console.log('[Gating System] Badge marked as minted');
    setHasBadge(true);
    setForceRefresh(prev => prev + 1);
  };

  return (
    <BadgeContext.Provider value={{ hasBadge, isLoading, refreshBadge, markBadgeMinted }}>
      {children}
    </BadgeContext.Provider>
  );
}

export function useBadge() {
  const context = useContext(BadgeContext);
  if (context === undefined) {
    throw new Error('useBadge must be used within a BadgeProvider');
  }
  return context;
}
