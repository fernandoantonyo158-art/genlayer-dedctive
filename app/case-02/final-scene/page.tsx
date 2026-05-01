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

const SUSPECTS = [
  {
    name: "Sarah Mitchell",
    role: "Socialite",
    desc: "Stood to inherit everything. Last seen near the vault at 23:30.",
    src: "/case-02/sarah-portrait.jpg",
  },
  {
    name: "Alex Morgan",
    role: "Lead Developer",
    desc: "Built the vault's security system. Had full backend access.",
    src: "/case-02/alex-portrait.jpg",
  },
  {
    name: "Vance Richards",
    role: "Estate Lawyer",
    desc: "Held power of attorney. Disputed the digital asset clause.",
    src: "/case-02/vance-portrait.jpg",
  },
  {
    name: "Marcus",
    role: "Private Investigator",
    desc: "Hired to protect the assets. His alibi has a 12-minute gap.",
    src: "/case-02/marcus-portrait.jpg",
  },
];

const EVIDENCE = [
  { icon: "🔒", label: "Vault Access",       detail: "Internal access logged at 23:31 — no forced entry." },
  { icon: "💬", label: "Heated Discussion",  detail: "Witness reports argument in the study at 22:50." },
  { icon: "📷", label: "Security Footage",   detail: "Cameras disabled between 23:28 – 23:44." },
  { icon: "₿",  label: "Crypto Transfer",    detail: "0.8 BTC transferred to unknown wallet at 23:39." },
];

export default function FinalScene() {
  const router = useRouter();
  const { playSFX } = useAudio();
  const { isConnected } = useAccount();

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [answer, setAnswer]     = useState("");
  const [result, setResult]     = useState("");
  const [resColor, setResColor] = useState("white");

  /* Confirmed → success message then redirect */
  useEffect(() => {
    if (isConfirmed) {
      setResColor("lightgreen");
      setResult("✓ Verdict Authenticated. Case Closed. 1 GEN Transacted.");
      playSFX("success");
      setTimeout(() => router.push("/case-02/verdict"), 2200);
    }
  }, [isConfirmed]);

  const [verifying, setVerifying] = useState(false);

  const check = async () => {
    if (!answer.trim()) return;
    if (!isConnected) {
      setResColor("#ffaa00");
      setResult("⚠ Connect your wallet to submit the verdict.");
      return;
    }
    setVerifying(true);
    setResult("");
    try {
      const res  = await fetch("/api/verify-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "case02-killer", attempt: answer.trim() }),
      });
      const data = await res.json();
      if (!data.valid) {
        setResColor("#ff4d4d");
        setResult("✗ WRONG — Recheck the evidence.");
        playSFX("error");
        setVerifying(false);
        return;
      }
      /* Verified server-side — trigger 1 GEN verdict tx */
      playSFX("success");
      writeContract({
        address: GENLAYER_CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "solve_case",
        args: [answer.trim()],
        value: parseEther("1"),
      });
    } catch {
      setResColor("#ff4d4d");
      setResult("✗ Verification failed. Try again.");
    }
    setVerifying(false);
  };

  const isBusy = verifying || isPending || isConfirming;

  return (
    <>
      <style jsx global>{`
        * { margin:0; padding:0; box-sizing:border-box; }

        /* Hide CASE: ACTIVE pill + any top divider on this page only */
        header > div:nth-child(2) { display: none !important; }
        header { border-bottom: none !important; box-shadow: none !important; }

        .fv-bg {
          position:fixed; width:100%; height:100%;
          background:url("/case-02/background-final.jpg") center/cover no-repeat;
          filter:brightness(0.4);
          z-index:-2;
        }
        .fv-overlay {
          position:fixed; width:100%; height:100%;
          background:rgba(0,0,0,0.5);
          z-index:-1;
        }

        /* scrollbar */
        .vs::-webkit-scrollbar { width:3px; }
        .vs::-webkit-scrollbar-track { background:rgba(0,0,0,.2); }
        .vs::-webkit-scrollbar-thumb { background:#d6a21e; border-radius:2px; }
        .vs { scrollbar-width:thin; scrollbar-color:#d6a21e rgba(0,0,0,.2); }

        /* Gavel button */
        @keyframes gavel-strike {
          0%   { transform:rotate(0deg) translateY(0); }
          20%  { transform:rotate(-16deg) translateY(-5px); }
          55%  { transform:rotate(7deg) translateY(2px); }
          80%  { transform:rotate(-4deg) translateY(-1px); }
          100% { transform:rotate(0deg) translateY(0); }
        }
        @keyframes amber-idle {
          0%,100% { box-shadow:0 0 12px rgba(180,100,10,.3),inset 0 0 16px rgba(180,100,10,.05); }
          50%     { box-shadow:0 0 26px rgba(214,140,20,.55),inset 0 0 24px rgba(214,140,20,.1); }
        }
        @keyframes fv-blink { 0%,49%{opacity:1}50%,100%{opacity:0} }

        .fv-btn {
          position:relative; width:100%; padding:13px 0;
          background:linear-gradient(180deg,#1c1308 0%,#0e0b05 60%,#1a1207 100%);
          color:#c8860a; border:2px solid #8a5e08;
          outline:1px solid rgba(180,120,20,.25); outline-offset:4px;
          font-family:"Courier New",monospace; font-size:12px;
          font-weight:700; letter-spacing:5px; cursor:pointer;
          text-transform:uppercase; overflow:hidden;
          display:flex; align-items:center; justify-content:center; gap:14px;
          transition:all .3s ease;
          animation:amber-idle 3s ease-in-out infinite;
        }
        .fv-btn::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(214,162,30,.55),transparent);
          pointer-events:none;
        }
        .fv-btn::after {
          content:''; position:absolute; inset:4px;
          border:1px solid rgba(180,120,20,.18); pointer-events:none;
        }
        .fv-btn:hover {
          background:linear-gradient(180deg,#2c1c08 0%,#1a1005 60%,#261a08 100%);
          border-color:#d6a21e; color:#f0c040; animation:none;
          box-shadow:0 0 32px rgba(214,162,30,.5),0 0 64px rgba(214,162,30,.18),inset 0 0 20px rgba(214,162,30,.08);
        }
        .fv-btn .wing { font-size:15px; color:#7a5010; transition:color .3s; }
        .fv-btn:hover .wing { color:#d6a21e; text-shadow:0 0 8px rgba(214,162,30,.7); }
        .fv-btn .gavel { font-size:20px; color:#c8860a; transition:color .3s; display:inline-block; }
        .fv-btn:hover .gavel { animation:gavel-strike .5s ease-in-out infinite; color:#f0c040; text-shadow:0 0 14px rgba(214,162,30,1); }
        .fv-btn .amber-bar {
          position:absolute; bottom:0; left:15%; right:15%; height:2px;
          background:linear-gradient(90deg,transparent,#c8860a,transparent);
          opacity:.55; pointer-events:none; transition:opacity .3s;
        }
        .fv-btn:hover .amber-bar { opacity:1; background:linear-gradient(90deg,transparent,#f0c040,transparent); box-shadow:0 0 8px rgba(214,162,30,.7); }

        /* review btn */
        .fv-back {
          display:flex; align-items:center; gap:8px;
          background:rgba(10,15,20,.8); border:1px solid rgba(214,162,30,.4);
          color:#d6a21e; font-family:monospace; font-size:11px;
          letter-spacing:2px; padding:10px 18px; cursor:pointer;
          transition:all .2s;
        }
        .fv-back:hover { border-color:#d6a21e; background:rgba(214,162,30,.1); }
      `}</style>

      <div className="fv-bg" />
      <div className="fv-overlay" />

      {/* ── Page grid ── */}
      <div style={{
        display:"grid",
        gridTemplateRows:"1fr auto",
        minHeight:"100vh",
        paddingTop:"80px",   /* clear fixed global header (h-20 = 80px) */
        fontFamily:"Georgia,serif",
        color:"white",
      }}>


        {/* MAIN CONTENT */}
        <div style={{
          display:"grid",
          gridTemplateColumns:"280px 1fr 300px",
          gap:"0",
          alignItems:"start",
          padding:"16px 0",
        }}>

          {/* ═══ LEFT PANEL ═══ */}
          <div style={{
            margin:"0 0 0 24px",
            background:"rgba(10,15,20,.82)",
            border:"1px solid rgba(214,162,30,.55)",
            borderRadius:"8px",
            padding:"20px",
            display:"flex", flexDirection:"column", gap:"20px",
          }}>

            {/* Case Summary */}
            <div>
              <h3 style={{ color:"#d6a21e", fontFamily:"monospace", fontSize:"11px", letterSpacing:"3px", marginBottom:"14px", borderBottom:"1px solid rgba(214,162,30,.25)", paddingBottom:"8px" }}>
                CASE SUMMARY
              </h3>
              <div style={{ display:"flex", flexDirection:"column", gap:"6px", marginBottom:"12px" }}>
                {[
                  ["VICTIM",    "Adrian Keller"],
                  ["LOCATION",  "Richards Mansion, Varna"],
                  ["DATE",      "May 14, 2024"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display:"flex", flexDirection:"column", gap:"1px" }}>
                    <span style={{ color:"rgba(214,162,30,.5)", fontFamily:"monospace", fontSize:"8px", letterSpacing:"2px" }}>{k}</span>
                    <span style={{ color:"#ffe066", fontFamily:"monospace", fontSize:"11px" }}>{v}</span>
                  </div>
                ))}
              </div>
              <p style={{ color:"rgba(232,224,200,.8)", fontFamily:"monospace", fontSize:"10px", lineHeight:1.8, letterSpacing:".3px" }}>
                Adrian Keller was found unresponsive inside the secured digital vault. All crypto assets — estimated at $2.4M — had been transferred minutes before. No forced entry was detected. The perpetrator had insider knowledge.
              </p>
            </div>

            {/* Key Evidence */}
            <div>
              <h3 style={{ color:"#d6a21e", fontFamily:"monospace", fontSize:"11px", letterSpacing:"3px", marginBottom:"14px", borderBottom:"1px solid rgba(214,162,30,.25)", paddingBottom:"8px" }}>
                KEY EVIDENCE
              </h3>
              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                {EVIDENCE.map((e, i) => (
                  <div key={i} style={{ display:"flex", gap:"10px", alignItems:"flex-start" }}>
                    <span style={{ fontSize:"16px", flexShrink:0, lineHeight:1.2 }}>{e.icon}</span>
                    <div>
                      <p style={{ color:"#d6a21e", fontFamily:"monospace", fontSize:"10px", fontWeight:700, marginBottom:"2px" }}>{e.label}</p>
                      <p style={{ color:"rgba(232,224,200,.7)", fontFamily:"monospace", fontSize:"10px", lineHeight:1.6 }}>{e.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══ CENTER ═══ */}
          <div style={{
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"flex-start",
            textAlign:"center", gap:"16px",
            padding:"20px 32px",
            minHeight:"60vh",
            marginTop:"195px",
          }}>
            <h1 style={{
              fontFamily:'"Playfair Display",Georgia,serif',
              color:"#d6a21e", fontSize:"52px",
              letterSpacing:"6px",
              textShadow:"0 0 28px rgba(214,162,30,.55)",
              paddingTop:"40px",
            }}>
              FINAL VERDICT
            </h1>

            <span style={{ fontSize:"32px", opacity:.85 }}>⚖</span>

            <p style={{
              maxWidth:"420px", fontFamily:"monospace",
              fontSize:"13px", lineHeight:1.8,
              color:"rgba(232,224,200,.85)", letterSpacing:".5px",
            }}>
              The evidence is in. The suspects are before you.<br />
              Only one of them is the killer.<br />
              <strong style={{ color:"#ffe066" }}>Who is the killer?</strong>
            </p>

            {/* Input */}
            <div style={{
              display:"flex", alignItems:"center",
              width:"360px",
              border:"1px solid #d6a21e",
              background:"rgba(0,0,0,.55)",
              boxShadow:"inset 0 0 10px rgba(0,0,0,.35)",
              marginTop:"6px",
            }}>
              <span style={{ color:"#d6a21e", fontFamily:"monospace", padding:"0 10px", fontSize:"13px", opacity:.7 }}>▶</span>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && check()}
                placeholder="Enter the killer's name..."
                style={{
                  flex:1, background:"transparent", border:"none", outline:"none",
                  color:"#fff", fontFamily:'"Courier New",monospace',
                  fontSize:"13px", letterSpacing:"2px",
                  padding:"12px 6px 12px 0",
                  caretColor:"#d6a21e",
                }}
              />
              <span style={{ color:"#d6a21e", padding:"0 10px", fontFamily:"monospace", fontSize:"11px", animation:"fv-blink 1s infinite" }}>█</span>
            </div>

            {/* Gavel button */}
            <div style={{ width:"360px" }}>
              <button
                className="fv-btn"
                onClick={check}
                disabled={isBusy}
                style={isBusy ? { opacity: 0.65, cursor: "not-allowed", animation: "none" } : {}}
              >
                <div className="amber-bar" />
                <span className="wing">‹‹</span>
                <span className="gavel">⚖</span>
                <span style={{ position:"relative", zIndex:1 }}>
                  {verifying ? "CHECKING..." : isPending ? "AWAITING WALLET..." : isConfirming ? "CONFIRMING TX..." : "SUBMIT VERDICT"}
                </span>
                <span className="gavel">⚖</span>
                <span className="wing">››</span>
              </button>
            </div>

            {result && (
              <p style={{ color:resColor, fontFamily:"monospace", fontSize:"12px", fontWeight:700, letterSpacing:"1px" }}>
                {result}
              </p>
            )}
          </div>

          {/* ═══ RIGHT PANEL ═══ */}
          <div style={{
            margin:"0 24px 0 0",
            background:"rgba(10,15,20,.82)",
            border:"1px solid rgba(214,162,30,.55)",
            borderRadius:"8px",
            padding:"20px",
          }}>
            <h3 style={{ color:"#d6a21e", fontFamily:"monospace", fontSize:"10px", letterSpacing:"3px", marginBottom:"16px", borderBottom:"1px solid rgba(214,162,30,.25)", paddingBottom:"8px" }}>
              THE FOUR UNDER SURVEILLANCE
            </h3>

            <div className="vs" style={{ display:"flex", flexDirection:"column", gap:"12px", maxHeight:"65vh", overflowY:"auto" }}>
              {SUSPECTS.map((s, i) => (
                <div key={i} style={{
                  display:"flex", gap:"12px", alignItems:"flex-start",
                  padding:"10px", border:"1px solid rgba(214,162,30,.12)",
                  background:"rgba(0,0,0,.25)",
                  transition:"border-color .2s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(214,162,30,.5)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(214,162,30,.12)")}
                >
                  {/* Portrait */}
                  <div style={{
                    width:"52px", height:"52px", flexShrink:0,
                    border:"2px solid #d6a21e", overflow:"hidden",
                    boxShadow:"0 0 8px rgba(214,162,30,.3)",
                  }}>
                    <img src={s.src} alt={s.name}
                      style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top", display:"block" }}
                      onError={() => console.error("Missing:", s.src)}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex:1 }}>
                    <p style={{ color:"#ffe066", fontFamily:"monospace", fontSize:"10px", fontWeight:700, letterSpacing:"1px", marginBottom:"2px" }}>{s.name}</p>
                    <p style={{ color:"#d6a21e", fontFamily:"monospace", fontSize:"9px", letterSpacing:"1px", opacity:.7, marginBottom:"4px" }}>{s.role}</p>
                    <p style={{ color:"rgba(232,224,200,.65)", fontFamily:"monospace", fontSize:"9px", lineHeight:1.6 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── FOOTER ── */}
        <div style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"7px 28px",          /* slim bar */
          background:"rgba(0,0,0,.55)",
          borderTop:"1px solid rgba(214,162,30,.12)",
        }}>
          {/* Back button */}
          <button className="fv-back" onClick={() => router.push("/case-02/villa-scene")}>
            ← REVIEW EVIDENCE
          </button>

          {/* Tip box */}
          <div style={{
            background:"rgba(10,15,20,.8)", border:"1px solid rgba(214,162,30,.35)",
            borderRadius:"6px", padding:"8px 16px",
            display:"flex", alignItems:"center", gap:"10px",
          }}>
            <span style={{ fontSize:"14px" }}>💡</span>
            <span style={{ color:"rgba(214,162,30,.8)", fontFamily:"monospace", fontSize:"10px", letterSpacing:"1px" }}>
              <strong style={{ color:"#d6a21e" }}>TIP:</strong> Think carefully. Justice depends on you.
            </span>
          </div>
        </div>

      </div>
    </>
  );
}
