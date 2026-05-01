"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState, useEffect } from "react";
import { parseEther } from "viem";
import { useBadge } from "@/contexts/BadgeContext";

const CONTRACT_ADDRESS = "0x868ef59CBA2857bD930F3849E0d3Fdb001F914Fa" as `0x${string}`;

const CONTRACT_ABI = [
  {
    name: 'solve_case',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'solution_attempt', type: 'string' }],
    outputs: [{ name: '', type: 'string' }]
  }
];

interface NFTMinterProps {
  onReturn?: () => void;
}

export default function NFTMinter({ onReturn }: NFTMinterProps) {
  const { address } = useAccount();
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const [minted, setMinted] = useState(false);
  const { markBadgeMinted } = useBadge();

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  });

  const makeDetectiveId = (wallet: string) => {
    let hash = 0;
    for (let i = 0; i < wallet.length; i++) {
      hash = wallet.charCodeAt(i) + ((hash << 5) - hash);
    }
    return "GL-DET-" + Math.abs(hash).toString(16).toUpperCase().slice(0, 6);
  };

  const handleClaim = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'solve_case',
      args: ['ShadowAdmin'],
      value: parseEther('0.5')
    });
  };

  const handleReturn = () => {
    if (onReturn) {
      onReturn();
    } else if (window.history.length > 1) {
      window.history.back();
    }
  };

  useEffect(() => {
    if (isConfirmed && !minted) {
      setMinted(true);
      markBadgeMinted();
    }
  }, [isConfirmed, minted, markBadgeMinted]);

  if (!address) {
    return (
      <div className="terminal-box p-6 text-center">
        <p className="text-sm font-mono text-zinc-500">Connect wallet to claim NFT</p>
      </div>
    );
  }

  const detectiveId = makeDetectiveId(address);

  return (
    <div className="achievement-screen">
      <div className="top-right-title">MASTER DETECTIVE VERIFIED</div>
      <div className="achievement-page">
        <div className="main-card">
          <div className="case-left">
            <div className="case-label">CASE FILE</div>

            <div className="case-title">
              CASE <span>#01</span><br />
              SOLVER
            </div>

            <div className="case-desc">THE REVELATION OF SHADOWADMIN</div>

            <div className="badge-emblem">
              <div className="emblem-shield"></div>
            </div>

            <div className="info-grid">
              <div className="info-box">
                <span>RANK</span>
                <b>Master Investigator</b>
              </div>

              <div className="info-box green">
                <span>STATUS</span>
                <b>Officially Verified</b>
              </div>

              <div className="info-box">
                <span>ISSUED</span>
                <b>{currentDate}</b>
              </div>

              <div className="info-box">
                <span>CASE ID</span>
                <b>GL-CASE-01</b>
              </div>
            </div>
          </div>

          <div className="id-panel">
            <h2>DETECTIVE ID</h2>

            <div className="portrait"></div>

            <div className="id-row">
              <span>WALLET ADDRESS</span>
              <b>{address?.slice(0, 6)}...{address?.slice(-4)}</b>
            </div>

            <div className="id-row">
              <span>DETECTIVE ID</span>
              <b>{detectiveId}</b>
            </div>

            <div className="id-row clearance">
              <span>CLEARANCE LEVEL</span>
              <b>GENESIS LEVEL</b>
            </div>

            <div className="codes">
              <div className="qr"></div>
              <div className="barcode"></div>
            </div>
          </div>
        </div>

        <div className="case-actions">
          <button 
            onClick={handleClaim}
            disabled={minted || isPending || isConfirming}
            className={`claim-bar ${minted ? 'minted' : ''}`}
          >
            <span>◉</span>
            {minted ? 'ALREADY MINTED' : isPending || isConfirming ? 'MINTING...' : 'CLAIM BADGE'}
            <span>›</span>
          </button>
          <button 
            onClick={handleReturn}
            className="return-bar"
          >
            <span>▣</span>
            RETURN TO DATABASE
            <span>›</span>
          </button>
        </div>

        {isConfirmed && !minted && (
          <div className="mt-4 text-center relative z-10">
            <p className="text-green-400 text-xs font-mono">Badge minted successfully</p>
            <p className="text-[8px] text-zinc-500 mt-1">TX: {hash?.slice(0, 10)}...{hash?.slice(-8)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
