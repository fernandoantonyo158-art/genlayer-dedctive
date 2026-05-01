"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAudio } from "@/contexts/AudioContext";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";

const CONTRACT_ABI = [
  {
    name: 'solve_case',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'solution_attempt', type: 'string' }],
    outputs: [{ name: '', type: 'string' }]
  }
] as const;

const GENLAYER_CONTRACT_ADDRESS = "0x868ef59CBA2857bD930F3849E0d3Fdb001F914Fa";

const REPORTS = [
  "/case-02/reports/police-report.jpg",
  "/case-02/reports/autopsy-report.jpg",
  "/case-02/reports/press-report.jpg",
  "/case-02/reports/digital-trace.jpg",
];
const SUSPECTS = [
  "/case-02/suspect-sarah.jpg",
  "/case-02/suspect-alex.jpg",
  "/case-02/suspect-marcus.jpg",
  "/case-02/suspect-vance.jpg",
];

export default function VillaScene() {
  const router = useRouter();
  const { playSFX } = useAudio();
  const { isConnected } = useAccount();

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [lightbox, setLightbox] = useState<string | null>(null);
  const [answer, setAnswer]     = useState("");
  const [msg, setMsg]           = useState("");
  const [msgClr, setMsgClr]     = useState("#fff");
  const [btnHover, setBtnHover] = useState(false);

  /* Redirect only after tx confirmed */
  useEffect(() => {
    if (isConfirmed) {
      setMsgClr("lightgreen");
      setMsg("✓ Transaction confirmed. Advancing to Final Verdict...");
      playSFX("success");
      setTimeout(() => router.push("/case-02/final-scene"), 1400);
    }
  }, [isConfirmed]);

  const [verifying, setVerifying] = useState(false);

  const checkAnswer = async () => {
    if (!answer.trim()) return;
    if (!isConnected) {
      setMsgClr("#ffaa00");
      setMsg("⚠ Connect your wallet to advance the investigation.");
      return;
    }
    setVerifying(true);
    setMsg("");
    try {
      const res  = await fetch("/api/verify-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "case02-suspect", attempt: answer.trim() }),
      });
      const data = await res.json();
      if (!data.valid) {
        setMsgClr("#ff4d4d");
        setMsg("✗ Wrong answer. Review the evidence again.");
        playSFX("error");
        setVerifying(false);
        return;
      }
      /* Answer verified server-side — now trigger 0.2 GEN gate tx */
      writeContract({
        address: GENLAYER_CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "solve_case",
        args: [answer.trim()],
        value: parseEther("0.2"),
      });
    } catch {
      setMsgClr("#ff4d4d");
      setMsg("✗ Verification failed. Try again.");
    }
    setVerifying(false);
  };

  const isBusy = verifying || isPending || isConfirming;

  return (
    <>
      <style jsx global>{`
        /* Gold scrollbar */
        .vs::-webkit-scrollbar       { width: 3px; }
        .vs::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .vs::-webkit-scrollbar-thumb { background: #d6a21e; border-radius: 2px; }
        .vs { scrollbar-width: thin; scrollbar-color: #d6a21e rgba(0,0,0,0.2); }

        /* Hover lift */
        .ev-img {
          flex-shrink: 0;
          cursor: zoom-in;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          box-shadow: 2px 4px 16px rgba(0,0,0,0.65);
        }
        .ev-img:hover {
          transform: scale(1.02) translateY(-3px);
          box-shadow: 4px 8px 28px rgba(0,0,0,0.85);
          position: relative;
          z-index: 10;
        }
        .ev-img img { width: 100%; display: block; }

        @keyframes blink { 0%,49%{opacity:1}50%,100%{opacity:0} }

        /* ── Cyber Submit Button ── */
        @keyframes scan-line {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes circuit-pulse {
          0%,100% { opacity: 0.18; }
          50%     { opacity: 0.45; }
        }
        @keyframes gear-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes scanning-dot {
          0%,100% { opacity: 1; }
          33%     { opacity: 0.3; }
          66%     { opacity: 0.7; }
        }

        .cyber-btn {
          position: relative;
          width: 100%;
          padding: 13px 0;
          background: #080c10;
          color: #d6a21e;
          border: 2px solid #d6a21e;
          outline: 1px solid rgba(214,162,30,0.25);
          outline-offset: 3px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 4px;
          cursor: pointer;
          text-transform: uppercase;
          transition: color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 0 12px rgba(214,162,30,0.22), inset 0 0 20px rgba(214,162,30,0.04);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        /* circuit pattern overlay */
        .cyber-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(214,162,30,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(214,162,30,0.07) 1px, transparent 1px);
          background-size: 12px 12px;
          animation: circuit-pulse 3s ease-in-out infinite;
          pointer-events: none;
        }

        /* gold bezel lines */
        .cyber-btn::after {
          content: '';
          position: absolute;
          inset: 3px;
          border: 1px solid rgba(214,162,30,0.12);
          pointer-events: none;
        }

        .cyber-btn:hover {
          color: #00ffff;
          border-color: #00ffff;
          outline-color: rgba(0,255,255,0.2);
          box-shadow:
            0 0 30px rgba(0,255,255,0.4),
            0 0 60px rgba(0,255,255,0.15),
            inset 0 0 24px rgba(0,255,255,0.08);
          background: rgba(0,20,30,0.92);
        }

        .cyber-btn:hover::before {
          background-image:
            linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px);
          animation: circuit-pulse 1s ease-in-out infinite;
        }

        /* scan sweep on hover */
        .cyber-btn .scan-sweep {
          position: absolute;
          top: 0; bottom: 0;
          width: 40%;
          background: linear-gradient(90deg, transparent, rgba(0,255,255,0.15), transparent);
          transform: translateX(-100%);
          pointer-events: none;
        }
        .cyber-btn:hover .scan-sweep {
          animation: scan-line 1.2s linear infinite;
        }

        /* gear icon */
        .cyber-btn .gear-icon {
          font-size: 14px;
          display: inline-block;
          color: #00bcd4;
          text-shadow: 0 0 8px rgba(0,188,212,0.8);
          transition: color 0.3s;
        }
        .cyber-btn:hover .gear-icon {
          animation: gear-spin 2s linear infinite;
          color: #00ffff;
          text-shadow: 0 0 14px rgba(0,255,255,1);
        }

        /* scanning label */
        .cyber-btn .scan-label {
          position: absolute;
          bottom: 3px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 7px;
          letter-spacing: 3px;
          color: rgba(0,255,255,0);
          transition: color 0.3s;
          white-space: nowrap;
          pointer-events: none;
        }
        .cyber-btn:hover .scan-label {
          color: rgba(0,255,255,0.65);
        }

        /* progress bar under hover */
        .cyber-btn .scan-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          width: 0;
          background: linear-gradient(90deg, transparent, #00ffff, transparent);
          pointer-events: none;
          transition: none;
        }
        .cyber-btn:hover .scan-bar {
          animation: scan-line 1.4s linear infinite;
          width: 100%;
        }
      `}</style>

      {/* ── Background: crisp, no blur ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: 'url("/case-02/background-part2-image.jpg")',
        backgroundSize: "cover", backgroundPosition: "center",
        filter: "brightness(0.58)",
      }} />

      {/* ── Edge vignette only ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 10%, rgba(0,0,0,0) 90%, rgba(0,0,0,0.5) 100%)," +
          "linear-gradient(to right,  rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 82%, rgba(0,0,0,0.4) 100%)",
      }} />

      {/* ── Page shell ── */}
      <div style={{
        position: "relative", zIndex: 2,
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        fontFamily: "Georgia, serif",
      }}>


        {/* ── Three-column body ── */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "160px",
          padding: "0 40px 32px",
          flex: 1,
        }}>

          {/* ══ LEFT — Reports: scroll reveals 1 at a time ══ */}
          <div style={{
            width: "260px",
            flexShrink: 0,
            marginTop: "120px",    /* shift down for breathing room */
          }}>
            <p style={{ color: "#d6a21e", fontSize: "9px", letterSpacing: "3px", textAlign: "center", marginBottom: "10px", textTransform: "uppercase" }}>
              Evidence Reports
            </p>
            {/* Fixed-height scroll window — ~1 full image visible at a time */}
            <div
              className="vs"
              style={{
                height: "72vh",
                overflowY: "scroll",
                overflowX: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                background: "rgba(0,0,0,0.15)",
                border: "1px solid rgba(214,162,30,0.12)",
                padding: "8px",
              }}
            >
              {REPORTS.map((src, i) => (
                <div
                  key={i}
                  className="ev-img"
                  onClick={() => { setLightbox(src); playSFX("click"); }}
                >
                  <img src={src} alt="Report" onError={() => console.error("Missing:", src)} />
                </div>
              ))}
              <div style={{ height: "12px", flexShrink: 0 }} />
            </div>
          </div>

          {/* ══ CENTER — Witness + Portal ══ */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0px",
            paddingTop: "16px",
            marginTop: "130px",   /* align vertically with lowered side columns */
            flex: "0 0 330px",   /* scaled down ~25% */
          }}>

            {/* Floating title — directly above central cluster */}
            <h1 style={{
              margin: "0 0 6px 0",
              fontFamily: '"Playfair Display", Georgia, serif',
              color: "#d6a21e",
              fontSize: "22px",
              letterSpacing: "6px",
              textAlign: "center",
              textShadow: "0 0 18px rgba(214,162,30,0.5)",
              whiteSpace: "nowrap",
            }}>
              SUSPECTS &amp; WITNESS STATEMENTS
            </h1>

            {/* CASE: ACTIVE tab — sits directly above witnesses doc */}
            <div style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(4,8,14,0.88)",
              border: "1px solid #d6a21e",
              borderBottom: "none",
              padding: "6px 14px",
              backdropFilter: "blur(10px)",
            }}>
              <span style={{ color: "#d6a21e", fontFamily: "monospace", fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase" }}>Witness Statements</span>
              <span style={{
                color: "#d6a21e",
                fontFamily: "monospace",
                fontSize: "9px",
                letterSpacing: "2px",
                border: "1px solid #d6a21e",
                padding: "2px 10px",
                borderRadius: "10px",
                boxShadow: "0 0 8px rgba(214,162,30,0.3)",
              }}>CASE: ACTIVE</span>
            </div>

            {/* WITNESSES document — compact */}
            <div
              onClick={() => { setLightbox("/case-02/witnesses-report.jpg"); playSFX("click"); }}
              style={{
                width: "100%",
                maxHeight: "40vh",
                overflow: "hidden",
                border: "2px solid #d6a21e",
                boxShadow: "0 0 30px rgba(214,162,30,0.2), 0 10px 30px rgba(0,0,0,0.75)",
                cursor: "zoom-in",
                flexShrink: 0,
              }}
            >
              <img
                src="/case-02/witnesses-report.jpg"
                alt="Witnesses"
                style={{ width: "100%", display: "block", objectFit: "cover", objectPosition: "top" }}
                onError={() => console.error("Missing: witnesses-report.jpg")}
              />
            </div>

            {/* Submit portal — extra top margin for breathing room */}
            <div style={{
              marginTop: "48px",
              width: "100%",
              background: "rgba(2,5,10,0.92)",
              border: "1px solid rgba(214,162,30,0.5)",
              borderTop: "2px solid #d6a21e",
              backdropFilter: "blur(14px)",
              padding: "14px 16px 12px",
              textAlign: "center",
              boxShadow: "0 8px 28px rgba(0,0,0,0.65)",
              flexShrink: 0,
            }}>
              <p style={{
                color: "#d6a21e",
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: "10.5px", letterSpacing: "1.5px",
                marginBottom: "10px", lineHeight: 1.65,
                textTransform: "uppercase", textAlign: "center",
              }}>
                Based on initial witness statements,<br />
                <span style={{ color: "#ffe066", fontWeight: 700 }}>who appears to be the most innocent?</span>
              </p>

              {/* Input */}
              <div style={{
                display: "flex", alignItems: "center",
                border: "1px solid #d6a21e",
                background: "rgba(0,0,0,0.5)",
                marginBottom: "10px",
                boxShadow: "inset 0 0 10px rgba(0,0,0,0.35)",
              }}>
                <span style={{ color: "#d6a21e", fontFamily: "monospace", padding: "0 10px", fontSize: "12px", opacity: 0.7 }}>▶</span>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isBusy && checkAnswer()}
                  placeholder="ENTER SUSPECT NAME..."
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    color: "#fff", fontFamily: '"Courier New", monospace',
                    fontSize: "11px", letterSpacing: "3px",
                    textTransform: "uppercase", padding: "10px 6px 10px 0",
                    caretColor: "#d6a21e",
                  }}
                />
                <span style={{ color: "#d6a21e", padding: "0 10px", fontFamily: "monospace", fontSize: "10px", animation: "blink 1s infinite" }}>█</span>
              </div>

              {/* ── Cyber-Detective Submit Button ── */}
              <button
                className="cyber-btn"
                onClick={checkAnswer}
                disabled={isBusy}
                style={isBusy ? { opacity: 0.65, cursor: "not-allowed" } : {}}
              >
                {/* scan sweep layer */}
                <div className="scan-sweep" />
                {/* progress bar */}
                <div className="scan-bar" />
                {/* hex gear icon */}
                <span className="gear-icon">⬡</span>
                {/* label */}
                <span style={{ position: "relative", zIndex: 1 }}>
                  {verifying ? "CHECKING..." : isPending ? "AWAITING WALLET..." : isConfirming ? "VERIFYING..." : "SUBMIT ANALYSIS"}
                </span>
                {/* scanning status */}
                <span className="scan-label">SCANNING ▸▸▸</span>
              </button>

              {msg && (
                <p style={{ color: msgClr, fontFamily: "monospace", fontSize: "10px", marginTop: "8px", fontWeight: 700 }}>
                  {msg}
                </p>
              )}
            </div>
          </div>

          {/* ══ RIGHT — Suspects: scroll reveals 1 at a time ══ */}
          <div style={{
            width: "260px",
            flexShrink: 0,
            marginTop: "120px",    /* symmetric with left */
          }}>
            <p style={{ color: "#d6a21e", fontSize: "9px", letterSpacing: "3px", textAlign: "center", marginBottom: "10px", textTransform: "uppercase" }}>
              Suspects
            </p>
            {/* Fixed-height scroll window */}
            <div
              className="vs"
              style={{
                height: "72vh",
                overflowY: "scroll",
                overflowX: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                background: "rgba(0,0,0,0.15)",
                border: "1px solid rgba(214,162,30,0.12)",
                padding: "8px",
              }}
            >
              {SUSPECTS.map((src, i) => (
                <div
                  key={i}
                  className="ev-img"
                  onClick={() => { setLightbox(src); playSFX("click"); }}
                >
                  <img src={src} alt="Suspect" onError={() => console.error("Missing:", src)} />
                </div>
              ))}
              <div style={{ height: "12px", flexShrink: 0 }} />
            </div>
          </div>

        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.93)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
            style={{ position: "absolute", top: "18px", right: "26px", background: "none", border: "none", color: "#fff", fontSize: "2.6rem", cursor: "pointer", lineHeight: 1 }}
          >×</button>
          <img
            src={lightbox} alt="Document"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "84vw", maxHeight: "88vh", objectFit: "contain", boxShadow: "0 30px 60px rgba(0,0,0,0.9)", border: "2px solid rgba(214,162,30,0.35)" }}
          />
        </div>
      )}
    </>
  );
}
