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
  typewriter: "/audio/typewriter.mp3",
  noir_ambient: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  success: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3",
  error: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"
};

export default function Home() {
  const { isConnected, address } = useAccount();
  const [systemInitialized, setSystemInitialized] = useState(false);
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
  const [inputValue, setInputValue] = useState("");
  const [decryptedMessage, setDecryptedMessage] = useState("");
  const [solutionHash, setSolutionHash] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState<{ src: string; title: string } | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Sounds
  const playSFX = (type: keyof typeof SFX) => {
    if (!soundEnabled) return;
    const audio = new Audio(SFX[type]);
    audio.volume = type === 'typewriter' ? 0.6 : 0.4;
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
    if (screen === 'intro' && isConnected && systemInitialized) {
      let i = 0;
      const interval = setInterval(() => {
        setIntroText(fullIntro.slice(0, i));
        // Trigger high-fidelity mechanical click on every character
        playSFX('typewriter');
        i++;
        if (i > fullIntro.length) {
          clearInterval(interval);
          setIntroFinished(true);
        }
      }, 45); // Optimally timed for the mechanical feel
      return () => clearInterval(interval);
    }
  }, [screen, isConnected, address, systemInitialized]);

  const handleDecrypt = () => {
    playSFX('click');
    const correctHash = "0x616c6565785f69735f7468655f6861636b6572";
    if (inputValue.trim() === correctHash) {
      setIsDecrypting(true);
      playSFX('success');
      let targetMsg = "SUCCESS: Admin credentials compromised. Target: ShadowAdmin.";
      let i = 0;
      const t = setInterval(() => {
        setDecryptedMessage(targetMsg.slice(0, i));
        playSFX('typewriter');
        i++;
        if (i > targetMsg.length) {
          clearInterval(t);
          setIsDecrypting(false);
          setUnlockedEnvelopes([true, unlockedEnvelopes[1], unlockedEnvelopes[2]]);
        }
      }, 50);
    } else {
      setDecryptedMessage("ERROR: ACCESS DENIED.");
      playSFX('error');
    }
  };

  const handleUnlockEnv2 = () => {
    playSFX('click');
    if (env2Code.trim() === "031407") {
      setUnlockedEnvelopes([unlockedEnvelopes[0], true, true]);
      playSFX('success');
    } else playSFX('error');
  };

  const handleVerifySolution = () => {
    if (!solutionHash || !address) return;
    playSFX('click');
    writeContract({ address: GENLAYER_CONTRACT_ADDRESS as `0x${string}`, abi: CONTRACT_ABI, functionName: 'solve_case', args: [solutionHash] });
  };

  // --------------------------------------------------------------------------------
  // SCREEN: Intro Terminal
  // --------------------------------------------------------------------------------
  if (screen === 'intro') {
    return (
      <div className="agency-wrapper monitor-lines justify-center items-center p-6">
        {!isConnected ? (
          <div className="terminal-box text-center space-y-8 max-w-lg w-full scale-100 animate-in fade-in zoom-in-95 duration-700">
            <ShieldAlert className="w-20 h-20 text-[#d4af37] mx-auto animate-flicker" />
            <h1 className="text-2xl font-mono tracking-widest uppercase">GenLayer Agency</h1>
            <p className="text-sm font-mono text-zinc-500">Restricted access protocol. Authenticate via secure link.</p>
            <div className="flex justify-center"><ConnectButton /></div>
          </div>
        ) : !systemInitialized ? (
          <div className="terminal-box text-center space-y-8 max-w-lg w-full scale-100 animate-in fade-in zoom-in-95 duration-1000">
             <div className="w-16 h-16 border-2 border-[#d4af37] rounded-full mx-auto flex items-center justify-center animate-pulse">
                <Cpu className="text-[#d4af37]" />
             </div>
             <div>
                <h2 className="text-xl font-bold uppercase tracking-widest text-white mb-2">System Ready</h2>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Bio-signature established. Awaiting deployment.</p>
             </div>
             <button 
                onClick={() => {
                  setSystemInitialized(true);
                  playSFX('click');
                }}
                className="w-full py-6 border-2 border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all font-bold uppercase tracking-[0.5em] shadow-[0_0_20px_rgba(212,175,55,0.1)]"
             >
                Initialize Terminal
             </button>
          </div>
        ) : (
          <div className="max-w-3xl w-full">
             <div className="terminal-box font-mono text-sm leading-loose whitespace-pre-wrap min-h-[400px]">
                {introText}<span className="cursor"></span>
                {introFinished && (
                  <button 
                    onClick={() => { playSFX('click'); setScreen('selection'); }}
                    className="mt-12 block w-full py-5 border-2 border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all uppercase tracking-[0.4em] font-bold"
                  >
                    View Active Case Files
                  </button>
                )}
             </div>
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------------
  // SCREEN: Case Selection
  // --------------------------------------------------------------------------------
  if (screen === 'selection') {
    return (
      <div className="agency-wrapper monitor-lines p-8 md:p-16 overflow-y-auto">
        <header className="flex justify-between items-center mb-16 pb-8 border-b border-[#d4af37]/20">
           <div>
             <h1 className="text-3xl font-bold uppercase tracking-widest">Agency Database</h1>
             <p className="text-xs font-mono opacity-50 uppercase tracking-widest">Signed in: {address?.slice(0,6)}...{address?.slice(-4)}</p>
           </div>
           <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-3 border border-[#d4af37]/20 hover:border-[#d4af37] transition-all">
              {soundEnabled ? <Volume2 /> : <VolumeX />}
           </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
           <div onClick={() => { playSFX('click'); setScreen('investigation'); }} className="group cursor-pointer">
              <div className="aspect-square terminal-box flex items-center justify-center group-hover:border-[#d4af37] transition-all relative">
                 <img src="/folder-icon.png" alt="Folder" className="w-32 h-32 grayscale brightness-50 group-hover:brightness-100 transition-all" />
                 <div className="absolute top-4 left-4 px-2 py-1 bg-[#d4af37] text-black text-[10px] font-bold uppercase">Active Case</div>
              </div>
              <h3 className="mt-4 text-lg font-bold group-hover:text-white">#01: The Architect</h3>
           </div>

           <div className="opacity-40 cursor-not-allowed">
              <div className="aspect-square terminal-box flex items-center justify-center"><Lock size={48} className="opacity-20" /></div>
              <h3 className="mt-4 text-lg font-bold">Coming Soon</h3>
           </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------------
  // SCREEN: Investigation
  // --------------------------------------------------------------------------------
  return (
    <div className="agency-wrapper monitor-lines p-4 md:p-8 overflow-y-auto">
      <header className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 pb-8 border-b border-[#d4af37]/20">
        <div>
          <button onClick={() => setScreen('selection')} className="text-[10px] uppercase font-mono hover:underline mb-2 block tracking-widest">← Return to Database</button>
          <h1 className="text-3xl font-bold uppercase tracking-widest">Case #01: The Architect</h1>
        </div>
        <div className="flex items-center gap-6">
           <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full">
              <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-pulse shadow-[0_0_8px_#d4af37]"></div>
              <span className="text-[10px] font-mono uppercase tracking-widest">GenLayer Bradbury</span>
           </div>
           <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-zinc-500 hover:text-white transition-all">{soundEnabled ? <Volume2 /> : <VolumeX />}</button>
           <ConnectButton showBalance={false} />
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Evidence & Envelopes */}
        <div className="lg:col-span-2 space-y-12">
            
            {/* Agent Discovery Section */}
            <section className="noir-panel p-6 border-l-4 border-[#d4af37]">
               <h2 className="text-[10px] font-mono uppercase text-zinc-500 mb-6 flex items-center gap-2 tracking-[0.2em]">
                 <Wallet size={14} /> Agent Identity Verified
               </h2>
               <div onClick={() => setSelectedEvidence({ src: "/field_agent_pass.jpg", title: "Field Agent Identity Pass" })} className="polaroid w-48 mx-auto sm:mx-0">
                  <img src="/field_agent_pass.jpg" alt="Identity" className="object-cover h-32 w-full" />
                  <div className="polaroid-caption">#ID-G01 // CONFIDENTIAL</div>
               </div>
            </section>

            <section>
              <h2 className="text-[10px] font-mono uppercase text-zinc-500 mb-6 flex items-center gap-2 tracking-[0.2em]">
                 <Search size={14} /> Evidence Locker: File #01
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div onClick={() => setSelectedEvidence({ src: "/crime-scene.jpg", title: "Evidence A: Nexus Server Room" })} className="polaroid -rotate-1">
                   <img src="/crime-scene.jpg" alt="A" className="object-cover h-32 w-full" />
                   <div className="polaroid-caption">SCENE // 23:44</div>
                </div>
                <div onClick={() => setSelectedEvidence({ src: "/police-report.jpg", title: "Agency Intelligence Report" })} className="polaroid rotate-2">
                   <img src="/police-report.jpg" alt="B" className="object-cover h-32 w-full" />
                   <div className="polaroid-caption">INTEL // LOGS</div>
                </div>
                <div onClick={() => setSelectedEvidence({ src: "/wallet_logs.jpg", title: "Decentralized Transaction Logs" })} className="polaroid -rotate-2">
                   <img src="/wallet_logs.jpg" alt="C" className="object-cover h-32 w-full" />
                   <div className="polaroid-caption">WALLET // 0xAF</div>
                </div>
              </div>
            </section>

            {/* Locked Envelopes Section */}
            <section className="space-y-6">
              <h2 className="text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-2 tracking-[0.2em]">
                 <Lock size={14} /> Encrypted Patterns
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                 {/* Env #1 */}
                 <div className="terminal-box p-6 flex flex-col items-center min-h-[160px]">
                    {!unlockedEnvelopes[0] ? (
                      <>
                        <input type="text" value={inputValue} onChange={(e)=>setInputValue(e.target.value)} placeholder="DECRYPT KEY" className="w-full bg-black/50 border border-[#d4af37]/30 p-3 text-[10px] font-mono text-[#d4af37] mb-3 focus:outline-none focus:border-[#d4af37]" />
                        <button onClick={handleDecrypt} disabled={isDecrypting} className="w-full py-2 border border-[#d4af37] hover:bg-[#d4af37] hover:text-black uppercase text-[10px] font-bold transition-all disabled:opacity-50 mb-4">Decrypt</button>
                        {decryptedMessage && (
                          <div className={`text-[9px] font-mono uppercase text-center leading-relaxed ${decryptedMessage.includes('ERROR') ? 'text-red-500 animate-pulse' : 'text-[#d4af37]'}`}>
                            {decryptedMessage}
                          </div>
                        )}
                      </>
                    ) : (
                      <div onClick={() => setSelectedEvidence({ src: "/env1_clue.jpg", title: "Decoded Index #01" })} className="cursor-pointer group w-full">
                        <img src="/env1_clue.jpg" className="w-full h-20 object-cover grayscale brightness-50 group-hover:brightness-100 transition-all mb-4" />
                        <p className="text-[10px] text-[#d4af37] font-mono text-center tracking-tighter">DATA BLOB #01 // RECOVERED</p>
                      </div>
                    )}
                 </div>
                 
                 {/* Env #2 */}
                 <div className="terminal-box p-6 flex flex-col items-center">
                    {!unlockedEnvelopes[1] ? (
                       unlockedEnvelopes[0] ? (
                        <div className="w-full mt-auto">
                          <input type="text" value={env2Code} onChange={(e)=>setEnv2Code(e.target.value)} placeholder="TIMESTAMP" className="w-full bg-black/50 border border-[#d4af37]/30 p-2 text-[10px] font-mono text-[#d4af37]/60 placeholder:text-[#d4af37]/40 mb-2 focus:text-[#d4af37] transition-all" />
                          <button onClick={handleUnlockEnv2} className="w-full py-2 border border-[#d4af37] hover:bg-[#d4af37] hover:text-black uppercase text-[10px] font-bold transition-all">Verify Bio</button>
                        </div>
                       ) : <Lock className="text-zinc-900/40 opacity-20" size={32} />
                    ) : (
                      <div onClick={() => setSelectedEvidence({ src: "/GenLayer_Game_Assets/Folder 03 Locked_Envelopes/env2_clue.png", title: "Operator Intel" })} className="cursor-pointer group">
                         <img src="/GenLayer_Game_Assets/Folder 03 Locked_Envelopes/env2_clue.png" className="w-full h-16 object-cover grayscale brightness-50 group-hover:brightness-100 transition-all mb-2" />
                         <p className="text-[10px] text-[#d4af37] font-mono text-center tracking-tighter">ARCHITECT ID</p>
                      </div>
                    )}
                 </div>

                 {/* Env #3 Final */}
                 <div className="terminal-box p-6 flex flex-col items-center justify-center border-dashed opacity-80">
                    {unlockedEnvelopes[1] ? (
                       <div onClick={() => setSelectedEvidence({ src: "/GenLayer_Game_Assets/Folder 03 Locked_Envelopes/env3_final.png", title: "Final Target identified" })} className="cursor-pointer group">
                         <img src="/GenLayer_Game_Assets/Folder 03 Locked_Envelopes/env3_final.png" className="w-full h-16 object-cover grayscale group-hover:grayscale-0 transition-all mb-2 border border-[#d4af37]/40" />
                         <p className="text-[10px] text-[#d4af37] font-mono text-center tracking-tighter">FINAL VERDICT</p>
                       </div>
                    ) : (
                      <Trophy className="opacity-10 text-[#d4af37]" size={32} />
                    )}
                 </div>
              </div>
            </section>
        </div>

        <aside className="space-y-8">
            <section className="terminal-box p-8 space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-[0.3em] flex items-center gap-2 text-white">Verification Portal</h3>
                {caseSolved ? (
                  <div className="text-center py-6 space-y-4"><Trophy className="w-12 h-12 mx-auto text-[#d4af37]" /><p className="text-xs font-bold uppercase">Master Detective Verified</p></div>
                ) : (
                  <>
                    <input type="text" value={solutionHash} onChange={(e)=>setSolutionHash(e.target.value)} className="w-full bg-black/50 border border-[#d4af37]/30 p-4 text-xs font-mono text-[#d4af37]/60 placeholder:text-[#d4af37]/40 focus:text-[#d4af37] transition-all" placeholder="IDENT_UNKNOWN" />
                    <button onClick={handleVerifySolution} disabled={isMinting || isConfirming} className="w-full py-5 bg-[#d4af37] text-black font-bold uppercase tracking-[0.3em] hover:bg-white transition-all disabled:opacity-50">SUBMIT VERDICT</button>
                  </>
                )}
            </section>
        </aside>
      </div>

      {selectedEvidence && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setSelectedEvidence(null)}>
           <div className="relative max-w-4xl w-full" onClick={(e)=>e.stopPropagation()}>
              <div className="bg-zinc-200 p-4 pb-20 shadow-2xl relative">
                <img src={selectedEvidence.src} alt="Evidence" className="max-h-[70vh] w-auto grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all duration-1000" />
                <p className="absolute bottom-6 left-0 right-0 text-center font-mono text-[10px] text-zinc-900 opacity-50 uppercase">{selectedEvidence.title}</p>
              </div>
              <button onClick={() => setSelectedEvidence(null)} className="mt-8 block w-full text-center text-[#d4af37] font-mono text-xs uppercase hover:underline">/ Close Intel /</button>
           </div>
        </div>
      )}
    </div>
  );
}
