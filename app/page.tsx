"use client";

import { useState, useEffect, useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Lock, Unlock, FileImage, FileText, Database, ShieldAlert, Cpu, Trophy, Volume2, VolumeX, FolderOpen, Search, Wallet } from "lucide-react";
import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

const CONTRACT_ABI = [
  {
    name: 'solve_case',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'solution_attempt', type: 'string' }],
    outputs: [{ name: '', type: 'string' }]
  },
  {
    name: 'is_master_detective',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'detective', type: 'string' }],
    outputs: [{ name: '', type: 'bool' }]
  }
] as const;

const GENLAYER_CONTRACT_ADDRESS = "0x868ef59CBA2857bD930F3849E0d3Fdb001F914Fa";

const SFX = {
  typewriter: "https://assets.mixkit.co/active_storage/sfx/590/590-preview.mp3",
  noir_ambient: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Low noir ambient placeholder
  success: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3",
  error: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"
};

export default function Home() {
  const { isConnected, address } = useAccount();
  const [screen, setScreen] = useState<'intro' | 'selection' | 'investigation'>('intro');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const ambientRef = useRef<HTMLAudioElement | null>(null);

  // Contract Logic
  const { data: hash, writeContract, isPending: isMinting } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const { data: isMasterDetective } = useReadContract({
     address: GENLAYER_CONTRACT_ADDRESS as `0x${string}`,
     abi: CONTRACT_ABI,
     functionName: 'is_master_detective',
     args: [address as `0x${string}`],
     query: { enabled: !!address }
  });

  const caseSolved = isConfirmed || !!isMasterDetective;

  // Investigation State
  const [unlockedEnvelopes, setUnlockedEnvelopes] = useState([false, false, false]);
  const [env1Code, setEnv1Code] = useState("");
  const [env2Code, setEnv2Code] = useState("");
  const [solutionHash, setSolutionHash] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState<{ src: string; title: string } | null>(null);

  // Sounds
  const playSFX = (type: keyof typeof SFX) => {
    if (!soundEnabled) return;
    const audio = new Audio(SFX[type]);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  useEffect(() => {
    if (screen !== 'intro' && soundEnabled) {
      if (!ambientRef.current) {
        ambientRef.current = new Audio(SFX.noir_ambient);
        ambientRef.current.loop = true;
        ambientRef.current.volume = 0.1;
      }
      ambientRef.current.play().catch(() => {});
    } else if (ambientRef.current) {
      ambientRef.current.pause();
    }
  }, [screen, soundEnabled]);

  // Intro Typewriter
  const [introText, setIntroText] = useState("");
  const [introFinished, setIntroFinished] = useState(false);
  const fullIntro = `GENLAYER INTELLIGENCE AGENCY // CENTRAL DATABASE\n\nSYSTEM STATUS: CRITICAL\nAccess granted to Detective: ${address || "UNIDENTIFIED"}\n\nThe digital world is bleeding. Decentralized crimes require a new breed of investigator. You are now connected to the only system capable of processing AI-driven evidence and subjective consensus.\n\nYour directive: Navigate through the data, decode encrypted patterns, and use the power of the GenLayer Intelligent Contracts to bring justice. Select an active case file to commence deployment.`;

  useEffect(() => {
    if (screen === 'intro' && isConnected) {
      let i = 0;
      const interval = setInterval(() => {
        setIntroText(fullIntro.slice(0, i));
        if (i % 5 === 0) playSFX('typewriter');
        i++;
        if (i > fullIntro.length) {
          clearInterval(interval);
          setIntroFinished(true);
        }
      }, 40);
      return () => clearInterval(interval);
    }
  }, [screen, isConnected, address]);

  // Handlers
  const handleUnlockEnv1 = () => {
    if (env1Code.toUpperCase().trim() === "LEGEND") {
      setUnlockedEnvelopes([true, unlockedEnvelopes[1], unlockedEnvelopes[2]]);
      playSFX('success');
    } else {
      playSFX('error');
    }
  };

  const handleUnlockEnv2 = () => {
    if (env2Code.trim() === "031407") {
      setUnlockedEnvelopes([unlockedEnvelopes[0], true, true]);
      playSFX('success');
    } else {
      playSFX('error');
    }
  };

  const handleVerifySolution = () => {
    if (!solutionHash || !address) return;
    playSFX('click');
    writeContract({
      address: GENLAYER_CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'solve_case',
      args: [solutionHash],
    });
  };

  // --------------------------------------------------------------------------------
  // SCREEN: Intro Terminal
  // --------------------------------------------------------------------------------
  if (screen === 'intro') {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6 film-grain">
        {!isConnected ? (
          <div className="text-center space-y-6">
            <ShieldAlert className="w-20 h-20 text-[#d4af37] mx-auto animate-pulse" />
            <h1 className="text-2xl font-mono text-[#d4af37]/80 tracking-[0.5em] uppercase">GenLayer Noir</h1>
            <div className="p-8 border border-white/10 bg-zinc-900/50 rounded-xl space-y-6">
               <p className="text-sm font-mono text-zinc-400">Restricted Access. Authenticate for agency deployment.</p>
               <ConnectButton />
            </div>
          </div>
        ) : (
          <div className="max-w-3xl w-full">
             <div className="noir-panel p-8 md:p-12 font-mono text-sm leading-loose whitespace-pre-wrap text-zinc-400 border-l-4 border-[#d4af37]">
                {introText}
                {!introFinished && <span className="cursor-blink"></span>}
                
                {introFinished && (
                  <button 
                    onClick={() => { playSFX('click'); setScreen('selection'); }}
                    className="mt-12 block w-full py-4 border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all uppercase tracking-[0.3em] font-bold animate-in fade-in slide-in-from-bottom-4 duration-1000"
                  >
                    View Active Case Files
                  </button>
                )}
             </div>
          </div>
        )}
      </main>
    );
  }

  // --------------------------------------------------------------------------------
  // SCREEN: Case Selection
  // --------------------------------------------------------------------------------
  if (screen === 'selection') {
    return (
      <main className="min-h-screen p-8 md:p-16 film-grain">
        <header className="flex justify-between items-center mb-16 pb-8 border-b border-white/10">
           <div>
             <h1 className="text-4xl font-bold uppercase tracking-widest text-[#d4af37] mb-2">Agency Dashboard</h1>
             <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Signed in as: {address?.slice(0,6)}...{address?.slice(-4)}</p>
           </div>
           <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-3 border border-white/10 text-zinc-500 hover:text-white transition-colors">
              {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
           </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
           {/* Case #01 */}
           <div 
             onClick={() => { playSFX('click'); setScreen('investigation'); }}
             className="group cursor-pointer space-y-4"
           >
              <div className="aspect-[4/3] bg-zinc-900 border border-white/10 rounded-lg flex items-center justify-center transition-all group-hover:border-[#d4af37] relative overflow-hidden">
                 <FolderOpen className="w-20 h-20 text-[#d4af37]/30 group-hover:text-[#d4af37] transition-all" />
                 <div className="absolute top-4 left-4 px-2 py-1 bg-[#d4af37] text-black text-[10px] font-bold uppercase tracking-tighter">Active Case</div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#d4af37] transition-all">#01: The Architect</h3>
                <p className="text-xs text-zinc-500 font-mono">Nexus Data Center Breach // GenLayer Testnet</p>
              </div>
           </div>

           {/* Case #02 Locked */}
           <div className="opacity-40 cursor-not-allowed space-y-4">
              <div className="aspect-[4/3] bg-zinc-900 border border-white/5 rounded-lg flex items-center justify-center relative">
                 <Lock className="w-16 h-16 text-zinc-800" />
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Locked Asset</div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-600">Coming Soon</h3>
                <p className="text-xs text-zinc-800 font-mono">Restricted Agency Access</p>
              </div>
           </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------------------------------------
  // SCREEN: Investigation
  // --------------------------------------------------------------------------------
  return (
    <div className="min-h-screen film-grain p-4 md:p-8">
      {/* Noir Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 pb-8 border-b border-white/10">
        <div>
          <button onClick={() => setScreen('selection')} className="text-[10px] uppercase font-mono text-[#d4af37] hover:underline mb-2 block">← Return to Database</button>
          <h1 className="text-3xl font-bold uppercase text-white tracking-widest">The Architect</h1>
          <p className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-2 mt-1">
             <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-pulse"></div> Bradbury Testnet 2026.04.24
          </p>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 text-zinc-500 hover:text-white">
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
           </button>
           <ConnectButton showBalance={false} />
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Evidence Section */}
        <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-xs font-mono uppercase text-zinc-500 mb-6 flex items-center gap-2 tracking-[0.2em]">
                 <Search size={14} /> Evidence Locker
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div onClick={() => setSelectedEvidence({ src: "/GenLayer_Game_Assets/Folder 02 Main_Evidence/crime_scene.png", title: "Evidence A: Nexus Server Room" })} className="polaroid-frame -rotate-2">
                   <img src="/GenLayer_Game_Assets/Folder 02 Main_Evidence/crime_scene.png" alt="Evidence" />
                   <div className="text-[8px] font-mono text-black/40 mt-4 uppercase">#A109 - CRIME SCENE</div>
                </div>
                <div onClick={() => setSelectedEvidence({ src: "/GenLayer_Game_Assets/Folder 02 Main_Evidence/wallet_logs.png", title: "Evidence B: Unidentified Tx Logs" })} className="polaroid-frame rotate-1">
                   <img src="/GenLayer_Game_Assets/Folder 02 Main_Evidence/wallet_logs.png" alt="Evidence" />
                   <div className="text-[8px] font-mono text-black/40 mt-4 uppercase">#B212 - WALLET LOGS</div>
                </div>
                <div onClick={() => setSelectedEvidence({ src: "/GenLayer_Game_Assets/Folder 02 Main_Evidence/police_report.png", title: "Evidence C: Agency Report" })} className="polaroid-frame -rotate-1">
                   <img src="/GenLayer_Game_Assets/Folder 02 Main_Evidence/police_report.png" alt="Evidence" />
                   <div className="text-[8px] font-mono text-black/40 mt-4 uppercase">#C441 - POLICE DOCS</div>
                </div>
              </div>
            </section>

            {/* Locked Envelopes Section */}
            <section className="space-y-6">
              <h2 className="text-xs font-mono uppercase text-zinc-500 flex items-center gap-2 tracking-[0.2em]">
                 <Lock size={14} /> Encrypted Patterns
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                 {/* Env #1 */}
                 <div className="noir-panel p-6 flex flex-col items-center">
                    {!unlockedEnvelopes[0] ? (
                      <>
                        <Lock className="text-zinc-800 mb-4" />
                        <input type="text" value={env1Code} onChange={(e)=>setEnv1Code(e.target.value)} placeholder="DECRYPT KEY" className="w-full bg-zinc-900 border-none p-2 text-[10px] font-mono text-zinc-400 mb-2 focus:ring-1 focus:ring-[#d4af37]" />
                        <button onClick={handleUnlockEnv1} className="w-full py-2 bg-transparent border border-white/10 hover:border-[#d4af37] text-[10px] uppercase font-bold transition-all">Settle Hash</button>
                      </>
                    ) : (
                      <div onClick={() => setSelectedEvidence({ src: "/GenLayer_Game_Assets/Folder 03 Locked_Envelopes/env1_clue.png", title: "Decoded Pattern #01" })} className="cursor-pointer group">
                        <img src="/GenLayer_Game_Assets/Folder 03 Locked_Envelopes/env1_clue.png" className="w-full h-16 object-cover grayscale brightness-50 group-hover:brightness-100 transition-all mb-2" />
                        <p className="text-[10px] text-[#d4af37] font-mono text-center">TIMESTAMP: 03:14:07</p>
                      </div>
                    )}
                 </div>
                 
                 {/* Env #2 */}
                 <div className="noir-panel p-6 flex flex-col items-center">
                    {!unlockedEnvelopes[1] ? (
                      <Lock className="text-zinc-900/40 mb-2" />
                    ) : (
                      <div onClick={() => setSelectedEvidence({ src: "/GenLayer_Game_Assets/Folder 03 Locked_Envelopes/env2_clue.png", title: "Subject Identified" })} className="cursor-pointer group">
                         <img src="/GenLayer_Game_Assets/Folder 03 Locked_Envelopes/env2_clue.png" className="w-full h-16 object-cover grayscale brightness-50 group-hover:brightness-100 transition-all mb-2" />
                         <p className="text-[10px] text-[#d4af37] font-mono text-center">IDENTITY: ARCHITECT</p>
                      </div>
                    )}
                    {unlockedEnvelopes[0] && !unlockedEnvelopes[1] && (
                       <div className="w-full mt-auto">
                        <input type="text" value={env2Code} onChange={(e)=>setEnv2Code(e.target.value)} placeholder="TIMESTAMP" className="w-full bg-zinc-900 border-none p-2 text-[10px] font-mono text-zinc-400 mb-2 focus:ring-1 focus:ring-[#d4af37]" />
                        <button onClick={handleUnlockEnv2} className="w-full py-2 bg-transparent border border-white/10 hover:border-[#d4af37] text-[10px] uppercase font-bold transition-all">Verify Bio</button>
                       </div>
                    )}
                 </div>
              </div>
            </section>
        </div>

        {/* Portal Column */}
        <div className="space-y-12">
            <section className="noir-panel p-8 space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                   <ShieldAlert size={18} className="text-[#d4af37]" /> Intelligence Portal
                </h3>
                
                {caseSolved ? (
                  <div className="text-center py-6 space-y-3">
                     <Trophy className="w-12 h-12 text-[#d4af37] mx-auto " />
                     <p className="text-[#d4af37] font-bold text-xs uppercase tracking-[0.2em]">Master Detective Verified</p>
                     <p className="text-[10px] text-zinc-500 font-mono">Solution established on GenLayer. SBT secured.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-[10px] font-mono text-zinc-500 line-clamp-2">Enter the true identity of the rogue operative to finalize the intelligent contract solve.</p>
                    <input 
                      type="text" 
                      value={solutionHash}
                      onChange={(e) => setSolutionHash(e.target.value)}
                      className="w-full bg-zinc-900 border-none p-4 rounded text-xs font-mono text-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30" 
                      placeholder="IDENT_UNKNOWN"
                    />
                    <button 
                      onClick={handleVerifySolution}
                      disabled={!solutionHash || isMinting || isConfirming}
                      className="w-full py-5 bg-[#d4af37] hover:bg-[#d4af37]/80 text-black font-bold uppercase tracking-[0.3em] transition-all disabled:grayscale disabled:opacity-50"
                    >
                       {isMinting ? 'Dispatching...' : isConfirming ? 'Analyzing...' : 'SUBMIT VERDICT'}
                    </button>
                  </>
                )}
            </section>

            <section className="p-8 border border-white/5 space-y-4 text-center">
               <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Out of leads?</p>
               <button onClick={() => alert("Paying 0.1 GEN for hint...")} className="text-xs uppercase font-bold text-zinc-400 hover:text-[#d4af37] transition-all underline decoration-1 underline-offset-4">Query Agency Oracle (0.1 GEN)</button>
            </section>
        </div>
      </div>

      {/* AOIR MODAL LIGHTBOX */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setSelectedEvidence(null)}>
           <div className="relative max-w-4xl w-full flex flex-col items-center" onClick={(e)=>e.stopPropagation()}>
              <button onClick={() => setSelectedEvidence(null)} className="absolute -top-12 right-0 text-[#d4af37] font-mono text-xs uppercase hover:underline underline-offset-4">/CLOSE_INTEL/</button>
              <div className="bg-[#ccc] p-4 pb-20 shadow-[0_0_100px_rgba(212,175,55,0.1)] rounded-sm border border-white/10 group cursor-zoom-out" onClick={() => setSelectedEvidence(null)}>
                <img src={selectedEvidence.src} alt="Evidence" className="max-h-[70vh] w-auto grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all duration-1000" />
                <div className="mt-8 text-black opacity-40 font-mono text-[10px] uppercase text-center">{selectedEvidence.title}</div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
