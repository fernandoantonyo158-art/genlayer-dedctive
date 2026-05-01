"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { useRouter } from "next/navigation";
import { useAudio } from "@/contexts/AudioContext";

const CONTRACT_ABI = [
  {
    name: "mint_agent_card",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const GENLAYER_CONTRACT_ADDRESS = "0x868ef59CBA2857bD930F3849E0d3Fdb001F914Fa";

const short = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;
const serial = (a: string) => `DET-2026-${a.slice(-4).toUpperCase()}`;
const today = () =>
  new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  }).toUpperCase();

export default function VerdictMint() {
  const router = useRouter();
  const { playSFX } = useAudio();
  const { isConnected, address } = useAccount();

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt]     = useState({ x: 0, y: 0 });
  const [minted, setMinted] = useState(false);
  const [error, setError]   = useState("");

  useEffect(() => {
    if (isConfirmed) {
      setMinted(true);
      playSFX("success");
      if (typeof window !== 'undefined') {
        localStorage.setItem('case02_complete', 'true');
        localStorage.setItem('goto_selection', 'true');
      }
      setTimeout(() => router.push("/"), 3000);
    }
  }, [isConfirmed]);

  const handleMint = () => {
    if (!isConnected) { setError("⚠  Connect your wallet first."); return; }
    setError("");
    playSFX("click");
    writeContract({
      address: GENLAYER_CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: "mint_agent_card",
      value: parseEther("1"),
    });
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    setTilt({ x: y * 20, y: -x * 20 });
  };
  const resetTilt = () => setTilt({ x: 0, y: 0 });

  const isBusy    = isPending || isConfirming;
  const detSerial = address ? serial(address) : "DET-2026-????";
  const detWallet = address ? short(address)  : "0x????...????";
  const detDate   = today();

  return (
    <>
      <style jsx global>{`
        * { margin:0; padding:0; box-sizing:border-box; }

        /* ── Background — crisp, no blur ── */
        .mp-bg {
          position: fixed; inset: 0; z-index: -2;
          background: url("/case-02/bqckground-mintpage.png") center/cover no-repeat;
          filter: brightness(0.45);
        }
        .mp-vignette {
          position: fixed; inset: 0; z-index: -1;
          background: radial-gradient(ellipse at 50% 40%,
            rgba(0,0,0,0) 25%, rgba(0,0,0,0.72) 100%);
        }

        /* ── Keyframes ── */
        @keyframes holo {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes card-idle-glow {
          0%,100% { box-shadow: 0 0 28px rgba(214,162,30,.3), 0 0 55px rgba(214,162,30,.08); }
          50%     { box-shadow: 0 0 48px rgba(214,162,30,.55), 0 0 90px rgba(214,162,30,.18); }
        }
        @keyframes card-minted-glow {
          0%,100% { box-shadow: 0 0 35px rgba(0,255,140,.4), 0 0 70px rgba(0,255,140,.12); }
          50%     { box-shadow: 0 0 65px rgba(0,255,140,.7), 0 0 120px rgba(0,255,140,.28); }
        }
        @keyframes scan-v {
          0%   { top: -4px;   opacity: 0.7; }
          90%  { top: 100%;   opacity: 0.3; }
          100% { top: 100%;   opacity: 0;   }
        }
        @keyframes seal-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes amber-idle {
          0%,100% { box-shadow: 0 0 12px rgba(180,100,10,.3); }
          50%     { box-shadow: 0 0 26px rgba(214,140,20,.55); }
        }
        @keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes fade-up {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* ── NFT Card ── */
        .nft-card {
          width: 420px; min-height: 260px;
          border-radius: 14px;
          position: relative; overflow: hidden;
          border: 1px solid rgba(214,162,30,.65);
          cursor: default;
          transition: transform 0.08s ease;
          animation: card-idle-glow 3.5s ease-in-out infinite;
          flex-shrink: 0;
        }
        .nft-card.minted {
          border-color: rgba(0,255,140,.6);
          animation: card-minted-glow 2.5s ease-in-out infinite;
        }

        /* layers */
        .c-base {
          position: absolute; inset: 0;
          background: linear-gradient(135deg,
            #07090f 0%, #0c0f18 25%,
            #10121e 50%, #0a0d14 75%, #07090f 100%);
        }
        .c-holo {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(110deg,
            transparent 15%,
            rgba(214,162,30,.05) 28%,
            rgba(160,100,255,.07) 40%,
            rgba(0,210,255,.06) 52%,
            rgba(214,162,30,.04) 64%,
            transparent 75%);
          background-size: 220% 220%;
          animation: holo 5s ease infinite;
        }
        .c-foil {
          position: absolute; inset: 7px;
          border: 1px solid rgba(214,162,30,.2);
          border-radius: 9px; pointer-events: none;
        }
        .c-scan {
          position: absolute; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(214,162,30,.55), transparent);
          pointer-events: none;
          animation: scan-v 4s linear infinite;
        }
        .c-watermark {
          position: absolute; right: 16px; bottom: 14px;
          font-family: monospace; font-size: 8px;
          color: rgba(214,162,30,.1); letter-spacing: 2px;
          text-transform: uppercase; font-weight: 700;
          transform: rotate(-22deg); pointer-events: none;
        }

        /* corners */
        .c-corner { position: absolute; width: 13px; height: 13px; border-color: #d6a21e; border-style: solid; opacity: .6; }
        .c-corner.tl { top:10px;  left:10px;  border-width: 2px 0 0 2px; }
        .c-corner.tr { top:10px;  right:10px; border-width: 2px 2px 0 0; }
        .c-corner.bl { bottom:10px; left:10px;  border-width: 0 0 2px 2px; }
        .c-corner.br { bottom:10px; right:10px; border-width: 0 2px 2px 0; }

        /* card layout */
        .c-body {
          position: absolute; inset: 0;
          padding: 18px 20px;
          display: flex; flex-direction: column; justify-content: space-between;
        }

        /* top row */
        .c-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .c-agency { display: flex; flex-direction: column; gap: 1px; }
        .c-agency .sub  { color: rgba(214,162,30,.5); font-family: monospace; font-size: 7px; letter-spacing: 3px; }
        .c-agency .main { color: #d6a21e; font-family: monospace; font-size: 12px; font-weight: 700; letter-spacing: 2px; }
        .c-agency .net  { color: rgba(214,162,30,.35); font-family: monospace; font-size: 7px; letter-spacing: 2px; }

        /* Seal */
        .c-seal {
          width: 52px; height: 52px; border-radius: 50%;
          border: 2px solid #d6a21e;
          background: radial-gradient(circle, #1e1508 0%, #090b10 100%);
          display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 1px;
          box-shadow: 0 0 14px rgba(214,162,30,.45), inset 0 0 10px rgba(214,162,30,.08);
          position: relative; overflow: hidden;
        }
        .c-seal-ring {
          position: absolute; inset: 4px; border-radius: 50%;
          border: 1px dashed rgba(214,162,30,.35);
        }
        .c-seal-icon { font-size: 20px; position: relative; z-index: 1; }
        .c-seal-text {
          color: rgba(214,162,30,.7); font-family: monospace; font-size: 5px;
          letter-spacing: 1px; text-align: center; line-height: 1.2;
          position: relative; z-index: 1;
        }

        /* mid */
        .c-mid { display: flex; gap: 14px; align-items: center; }
        .c-avatar {
          width: 60px; height: 60px; flex-shrink: 0;
          border: 2px solid #d6a21e; border-radius: 6px;
          background: linear-gradient(135deg, #1a1408, #0a0c10);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px;
          box-shadow: 0 0 10px rgba(214,162,30,.25);
        }
        .c-det-name {
          color: #ffe066; font-family: "Playfair Display", Georgia, serif;
          font-size: 17px; font-weight: 700; letter-spacing: 1px; margin-bottom: 2px;
        }
        .c-det-title {
          color: rgba(214,162,30,.65); font-family: monospace;
          font-size: 8px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px;
        }
        .c-chip { display: flex; align-items: center; gap: 5px; }
        .chip-gold {
          width: 30px; height: 22px;
          background: linear-gradient(135deg, #c8860a, #8a5e08, #d6a21e, #8a5e08);
          border-radius: 3px; box-shadow: 0 0 6px rgba(214,162,30,.4);
        }
        .chip-bars { display: flex; flex-direction: column; gap: 3px; }
        .chip-bar { width: 20px; height: 2px; background: rgba(214,162,30,.35); border-radius: 1px; }

        /* bottom */
        .c-bottom { display: flex; justify-content: space-between; align-items: flex-end; }
        .c-fields { display: flex; flex-direction: column; gap: 4px; }
        .c-field { display: flex; gap: 8px; align-items: baseline; }
        .f-lbl { color: rgba(214,162,30,.45); font-family: monospace; font-size: 7px; letter-spacing: 2px; }
        .f-val { color: #d6a21e; font-family: monospace; font-size: 9px; letter-spacing: 1px; }
        .c-status { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .status-pill {
          font-family: monospace; font-size: 7px; letter-spacing: 2px;
          padding: 3px 10px; border-radius: 12px;
          background: rgba(214,162,30,.1); border: 1px solid rgba(214,162,30,.4);
          color: #d6a21e;
        }
        .status-pill.ok {
          background: rgba(0,255,140,.1); border-color: rgba(0,255,140,.45); color: #00ff88;
        }
        .c-nft-id { color: rgba(214,162,30,.4); font-family: monospace; font-size: 7px; letter-spacing: 1px; }

        /* ── Mint button ── */
        .mint-btn {
          position: relative; width: 420px; padding: 15px 0;
          background: linear-gradient(180deg, #1c1308 0%, #0d0b06 55%, #181207 100%);
          color: #c8860a; border: 2px solid #8a5e08;
          outline: 1px solid rgba(180,120,20,.22); outline-offset: 4px;
          font-family: "Courier New", monospace; font-size: 12px;
          font-weight: 700; letter-spacing: 5px; cursor: pointer;
          text-transform: uppercase; overflow: hidden;
          display: flex; align-items: center; justify-content: center; gap: 14px;
          transition: all .3s ease; border-radius: 4px;
          animation: amber-idle 3s ease-in-out infinite;
        }
        .mint-btn::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(214,162,30,.5), transparent);
        }
        .mint-btn:hover:not(:disabled) {
          background: linear-gradient(180deg, #2c1c08 0%, #1a1005 55%, #261a08 100%);
          border-color: #d6a21e; color: #f0c040; animation: none;
          box-shadow: 0 0 32px rgba(214,162,30,.5), 0 0 64px rgba(214,162,30,.16), inset 0 0 18px rgba(214,162,30,.08);
        }
        .mint-btn:disabled { opacity: .5; cursor: not-allowed; animation: none; }

        /* ── Download button ── */
        .dl-btn {
          width: 420px; padding: 13px 0;
          background: rgba(0,255,140,.08); border: 1px solid rgba(0,255,140,.5);
          color: #00ff88; font-family: "Courier New", monospace;
          font-size: 11px; font-weight: 700; letter-spacing: 4px;
          cursor: pointer; text-transform: uppercase; border-radius: 4px;
          transition: all .25s ease;
          animation: fade-up .5s ease both;
        }
        .dl-btn:hover { background: rgba(0,255,140,.18); box-shadow: 0 0 22px rgba(0,255,140,.35); }
      `}</style>

      <div className="mp-bg" />
      <div className="mp-vignette" />

      {/* ── Page ── */}
      <div style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: "24px", padding: "100px 24px 48px",
        fontFamily: "Georgia, serif", color: "white",
      }}>

        {/* Header text */}
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "rgba(214,162,30,.55)", fontFamily: "monospace", fontSize: "10px", letterSpacing: "5px", marginBottom: "10px" }}>
            GENLAYER DETECTIVE · CASE #002 CLOSED
          </p>
          <h1 style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            color: "#d6a21e", fontSize: "42px", letterSpacing: "7px",
            textShadow: "0 0 28px rgba(214,162,30,.55)", marginBottom: "8px",
          }}>
            CASE SOLVED
          </h1>
          <p style={{ color: "rgba(232,224,200,.55)", fontFamily: "monospace", fontSize: "11px", letterSpacing: "3px" }}>
            MINT YOUR CERTIFIED DETECTIVE CARD · 2 GEN
          </p>
        </div>

        {/* ── NFT CARD ── */}
        <div
          ref={cardRef}
          className={`nft-card${minted ? " minted" : ""}`}
          onMouseMove={onMouseMove}
          onMouseLeave={resetTilt}
          style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.01)` }}
        >
          {/* layers */}
          <div className="c-base" />
          <div className="c-holo" />
          <div className="c-foil" />
          <div className="c-scan" />
          <div className="c-watermark">GENLAYER INTELLIGENCE AGENCY</div>

          {/* corners */}
          <div className="c-corner tl" /><div className="c-corner tr" />
          <div className="c-corner bl" /><div className="c-corner br" />

          <div className="c-body">

            {/* TOP ROW */}
            <div className="c-top">
              <div className="c-agency">
                <span className="sub">CERTIFIED BY</span>
                <span className="main">GENLAYER INTELLIGENCE AGENCY</span>
                <span className="net">BRADBURY TESTNET · CHAIN 4221</span>
              </div>
              {/* Gold embossed seal */}
              <div className="c-seal">
                <div className="c-seal-ring" />
                <span className="c-seal-icon">⚖</span>
                <span className="c-seal-text">GIA<br/>SEAL</span>
              </div>
            </div>

            {/* MID ROW */}
            <div className="c-mid">
              <div className="c-avatar">🕵</div>
              <div>
                <div className="c-det-name">MASTER DETECTIVE</div>
                <div className="c-det-title">Richards Mansion · Investigator</div>
                <div className="c-chip">
                  <div className="chip-gold" />
                  <div className="chip-bars">
                    <div className="chip-bar" /><div className="chip-bar" /><div className="chip-bar" />
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM ROW */}
            <div className="c-bottom">
              <div className="c-fields">
                <div className="c-field">
                  <span className="f-lbl">DETECTIVE ID</span>
                  <span className="f-val">{detSerial}</span>
                </div>
                <div className="c-field">
                  <span className="f-lbl">WALLET</span>
                  <span className="f-val">{detWallet}</span>
                </div>
                <div className="c-field">
                  <span className="f-lbl">DATE OF ISSUE</span>
                  <span className="f-val">{detDate}</span>
                </div>
              </div>
              <div className="c-status">
                <div className={`status-pill${minted ? " ok" : ""}`}>
                  {minted ? "✓ CERTIFIED" : "PENDING MINT"}
                </div>
                <div className="c-nft-id">
                  {minted ? "ON-CHAIN · BRADBURY" : "2 GEN · TESTNET"}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Action Button ── */}
        {!minted ? (
          <button className="mint-btn" onClick={handleMint} disabled={isBusy}>
            <span style={{ fontSize: "16px" }}>⬡</span>
            <span>
              {!isConnected
                ? "CONNECT WALLET TO MINT"
                : isPending
                ? "AWAITING WALLET APPROVAL..."
                : isConfirming
                ? "CONFIRMING · 1 GEN..."
                : "MINT CERTIFIED CARD · 1 GEN"}
            </span>
            <span style={{ fontSize: "16px" }}>⬡</span>
          </button>
        ) : (
          <button className="dl-btn" onClick={() => window.print()}>
            ↓ &nbsp; DOWNLOAD CERTIFICATE
          </button>
        )}

        {error && (
          <p style={{ color: "#ffaa00", fontFamily: "monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "1px" }}>
            {error}
          </p>
        )}

        {minted && (
          <p style={{ color: "lightgreen", fontFamily: "monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textAlign: "center", animation: "fade-up .5s ease both" }}>
            ✓ MINTED ON GENLAYER BRADBURY TESTNET · 1 GEN TRANSACTED · REDIRECTING...
          </p>
        )}

        <button
          onClick={() => router.push("/")}
          style={{
            background: "transparent", border: "none",
            color: "rgba(214,162,30,.4)", fontFamily: "monospace",
            fontSize: "10px", letterSpacing: "2px",
            cursor: "pointer", textDecoration: "underline", marginTop: "4px",
          }}
        >
          ← RETURN TO CASES
        </button>

      </div>
    </>
  );
}
