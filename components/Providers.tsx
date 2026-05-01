"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";
import { BadgeProvider } from "@/contexts/BadgeContext";
import { AudioProvider } from "@/contexts/AudioContext";

import { defineChain } from "viem";

const genLayerStudio = defineChain({
  id: 61999,
  name: 'Genlayer Studio Network',
  nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://studio.genlayer.com/api'] },
  },
  blockExplorers: {
    default: { name: 'GenSearch', url: 'https://explorer.genlayer.com' },
  },
});

const genLayerBradbury = defineChain({
  id: 4221,
  name: "GenLayer Bradbury",
  nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc-bradbury.genlayer.com"] },
  },
  blockExplorers: {
    default: { name: "GenSearch", url: "https://explorer-bradbury.genlayer.com" },
  },
});

const config = getDefaultConfig({
  appName: "GenLayer Case File",
  projectId: "ad8fd3b8f847b34c0681d9a1df2650b6",
  chains: [genLayerStudio, genLayerBradbury],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BadgeProvider>
          <AudioProvider>
            <RainbowKitProvider
              theme={darkTheme({
                accentColor: "#D4AF37", // Gold
                accentColorForeground: "black",
                borderRadius: "small",
                fontStack: "system",
                overlayBlur: "none",
              })}
            >
              {children}
            </RainbowKitProvider>
          </AudioProvider>
        </BadgeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
