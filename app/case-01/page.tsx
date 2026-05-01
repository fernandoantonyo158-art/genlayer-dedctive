"use client";

import { useState, useEffect, useRef } from "react";
import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { useRouter } from "next/navigation";
import { Lock, Trophy } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";

const CONTRACT_ABI = [
  {
    name: 'solve_case',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'solution_attempt', type: 'string' }],
    outputs: [{ name: '', type: 'string' }]
  },
  {
    name: 'decrypt_case',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'decrypt_key', type: 'string' }],
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
  investigation_theme: "/investigation-theme.mp3",
  success: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3",
  error: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"
};

export default function Case01() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const { soundEnabled, toggleSound, startBGM } = useAudio();
  const [audioContextInitialized, setAudioContextInitialized] = useState(false);
  const typewriterRef = useRef<HTMLAudioElement | null>(null);

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

  const caseSolved = isMasterDetective;

  // Investigation State
  const [inputValue, setInputValue] = useState("");
  const [decryptedMessage, setDecryptedMessage] = useState("");
  const [solutionHash, setSolutionHash] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState<{ src: string; title: string } | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isPatternLoading, setIsPatternLoading] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [unlockedEnvelopes, setUnlockedEnvelopes] = useState([false, false, false]);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [transactionPurpose, setTransactionPurpose] = useState<'decrypt' | 'verify' | null>(null);
  const [isPatternDecrypted, setIsPatternDecrypted] = useState(false);

  // Sounds
  const playSFX = (type: keyof typeof SFX) => {
    if (!soundEnabled) return;
    if (type === 'typewriter') {
      if (!typewriterRef.current) {
        typewriterRef.current = new Audio(SFX.typewriter);
        typewriterRef.current.volume = 0.8;
      }
      typewriterRef.current.currentTime = 0;
      typewriterRef.current.play().catch(() => {});
    } else {
      const audio = new Audio(SFX[type]);
      audio.volume = 0.4;
      audio.play().catch(() => {});
    }
  };

  // Initialize audio context on first user interaction
  const initializeAudioContext = () => {
    if (!audioContextInitialized) {
      setAudioContextInitialized(true);
      if (typewriterRef.current) {
        typewriterRef.current.play().catch(() => {});
      }
    }
  };

  useEffect(() => {
    startBGM();
  }, [startBGM]);

  // Handle transaction confirmation for decrypt
  useEffect(() => {
    if (isConfirmed && transactionPurpose === 'decrypt') {
      setIsPatternLoading(false);
      setIsPatternDecrypted(true);
      setUnlockedEnvelopes([true, true, true]);
      playSFX('success');
      setTransactionPurpose(null);
    }
  }, [isConfirmed, transactionPurpose]);

  // Handle transaction confirmation for verify
  useEffect(() => {
    if (isConfirmed && transactionPurpose === 'verify') {
      setIsPortalLoading(false);
      setTransactionPurpose(null);
      router.push('/case-01/mint');
    }
  }, [isConfirmed, transactionPurpose, router]);

  // Handle transaction errors
  useEffect(() => {
    if (hash && transactionPurpose) {
      const timeout = setTimeout(() => {
        if (!isConfirmed && !isConfirming) {
          if (transactionPurpose === 'decrypt') {
            setIsPatternLoading(false);
          }
          setTransactionError("AUTHENTICATION FAILED: Transaction required for decryption.");
          setTransactionPurpose(null);
        }
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [hash, isConfirming, isConfirmed, transactionPurpose]);

  const handleDecrypt = () => {
    if (!isConnected) { setTransactionError("Connect wallet to decrypt evidence."); return; }
    if (!inputValue || !address) return;
    setDecryptedMessage("");
    setTransactionError(null);
    playSFX('click');
    setIsPatternLoading(true);
    setTransactionPurpose('decrypt');
    
    writeContract({
      address: GENLAYER_CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'decrypt_case',
      args: [inputValue],
      value: parseEther('0.2'),
    });
  };

  const handleVerifySolution = () => {
    if (!isConnected) { setTransactionError("Connect wallet to submit verdict."); return; }
    if (!solutionHash || !address) return;
    
    setTransactionError(null);
    setIsPortalLoading(true);
    setTransactionPurpose('verify');

    // shadowadmin answer → 0.2 GEN gate; all others → 0.3 GEN
    const txValue = solutionHash.toLowerCase() === 'shadowadmin'
      ? parseEther('0.2')
      : parseEther('0.3');
    
    writeContract({
      address: GENLAYER_CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'solve_case',
      args: [solutionHash],
      value: txValue,
    });
  };

  return (
    <div className="agency-wrapper monitor-lines investigation-area p-0 overflow-y-auto">
      {/* Main Content Area */}
      <div className="flex pt-20 min-h-screen pb-20">
        {/* Center: Dynamic Evidence Board */}
        <div className="flex-1 p-8 pt-12">
          <div className="evidence-board relative flex flex-col" style={{ minHeight: '700px' }}>
            {/* SVG Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <line x1="20%" y1="25%" x2="50%" y2="40%" className="connection-line" />
              <line x1="50%" y1="40%" x2="80%" y2="25%" className="connection-line" />
              <line x1="20%" y1="25%" x2="80%" y2="55%" className="connection-line" />
              <line x1="50%" y1="40%" x2="80%" y2="55%" className="connection-line" />
              <circle cx="20%" cy="25%" r="6" className="connection-point" />
              <circle cx="50%" cy="40%" r="6" className="connection-point" />
              <circle cx="80%" cy="25%" r="6" className="connection-point" />
              <circle cx="80%" cy="55%" r="6" className="connection-point" />
            </svg>

            {/* Evidence Items - Tilted and Overlapping */}
            <div 
              onClick={() => setSelectedEvidence({ src: "/GenLayer_Game_Assets/Folder 01 Access_and_UI/field_agent_pass.png", title: "#ID-G01 // CONFIDENTIAL" })}
              className="evidence-item polaroid w-48"
              style={{ top: '10%', left: '15%', transform: 'rotate(-8deg)' }}
            >
              <img src="/GenLayer_Game_Assets/Folder 01 Access_and_UI/field_agent_pass.png" alt="Agent ID" className="object-cover h-32 w-full" />
              <div className="polaroid-caption">#ID-G01 // CONFIDENTIAL</div>
            </div>

            <div 
              onClick={() => setSelectedEvidence({ src: "/GenLayer_Game_Assets/Folder 02 Main_Evidence/crime_scene.png", title: "SCENE // 23:44" })}
              className="evidence-item polaroid w-48"
              style={{ top: '25%', left: '45%', transform: 'rotate(5deg)' }}
            >
              <img src="/GenLayer_Game_Assets/Folder 02 Main_Evidence/crime_scene.png" alt="Crime Scene" className="object-cover h-32 w-full" />
              <div className="polaroid-caption">SCENE // 23:44</div>
            </div>

            <div 
              onClick={() => setSelectedEvidence({ src: "/GenLayer_Game_Assets/Folder 02 Main_Evidence/police_report.png", title: "INTEL // LOGS" })}
              className="evidence-item polaroid w-48"
              style={{ top: '15%', left: '70%', transform: 'rotate(-3deg)' }}
            >
              <img src="/GenLayer_Game_Assets/Folder 02 Main_Evidence/police_report.png" alt="Police Report" className="object-cover h-32 w-full" />
              <div className="polaroid-caption">INTEL // LOGS</div>
            </div>

            <div 
              onClick={() => setSelectedEvidence({ src: "/GenLayer_Game_Assets/Folder 02 Main_Evidence/wallet_logs.png", title: "WALLET // 0xAF" })}
              className="evidence-item polaroid w-48"
              style={{ top: '40%', left: '65%', transform: 'rotate(7deg)' }}
            >
              <img src="/GenLayer_Game_Assets/Folder 02 Main_Evidence/wallet_logs.png" alt="Wallet Logs" className="object-cover h-32 w-full" />
              <div className="polaroid-caption">WALLET // 0xAF</div>
            </div>

            {/* Locked Envelopes */}
            <div className="mt-auto pb-8 px-8 z-10">
              <h2 className="text-[10px] font-mono uppercase text-zinc-500 mb-4 flex items-center gap-2 tracking-[0.2em]">
                 <Lock size={14} /> Encrypted Patterns
              </h2>
              <div className="grid grid-cols-3 gap-4">
                 <div className="terminal-box p-4 flex flex-col items-center justify-center min-h-[120px]">
                    {!isPatternDecrypted ? (
                      <>
                        <input type="text" value={inputValue} onChange={(e)=>{setInputValue(e.target.value); setDecryptedMessage(""); setTransactionError(null);}} placeholder="ENTER THE MISSING VALUE" className="w-full bg-black/50 border border-[#d4af37]/30 p-2 text-[10px] font-mono text-[#d4af37] mb-2 focus:outline-none focus:border-[#d4af37] text-center" />
                        {decryptedMessage && (
                          <p className={`text-[9px] font-mono uppercase text-center leading-relaxed mb-2 ${decryptedMessage.includes('ERROR') || decryptedMessage.includes('FAILED') ? 'text-red-500 animate-pulse' : 'text-[#d4af37]'}`}>
                            {decryptedMessage}
                          </p>
                        )}
                        {transactionError && (
                          <p className="text-[9px] font-mono text-red-500 animate-pulse text-center mb-2">{transactionError}</p>
                        )}
                        <button onClick={handleDecrypt} disabled={isDecrypting || isPatternLoading} className="w-full py-2 border border-[#d4af37] hover:bg-[#d4af37] hover:text-black uppercase text-[10px] font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                          {isPatternLoading ? (
                            <>
                              <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                              VERIFYING...
                            </>
                          ) : (
                            'SUBMIT VALUE'
                          )}
                        </button>
                        <p className="text-[8px] font-mono text-zinc-600 text-center mt-1">Cost: 0.2 GEN per action</p>
                      </>
                    ) : (
                      <div onClick={() => { playSFX('typewriter'); setSelectedEvidence({ src: "/GenLayer_Game_Assets/Folder 03 Locked_Envelopes/env1_clue.png", title: "ENV #01 // RECOVERED" }); }} className="cursor-pointer group w-full">
                        <img src="/GenLayer_Game_Assets/Folder 03 Locked_Envelopes/env1_clue.png" alt="" className="w-full h-16 object-cover grayscale brightness-50 group-hover:brightness-100 transition-all mb-2" />
                        <p className="text-[10px] text-[#d4af37] font-mono text-center tracking-tighter">ENV #01 // RECOVERED</p>
                      </div>
                    )}
                  </div>
                 
                 <div className="terminal-box p-4 flex flex-col items-center justify-center min-h-[120px]">
                    {isPatternDecrypted ? (
                      <div onClick={() => { playSFX('typewriter'); setSelectedEvidence({ src: "/GenLayer_Game_Assets/Folder 03 Locked_Envelopes/env2_clue.png", title: "ENV #02 // RECOVERED" }); }} className="cursor-pointer group animate-in fade-in duration-500">
                         <img src="/GenLayer_Game_Assets/Folder 03 Locked_Envelopes/env2_clue.png" alt="" className="w-full h-16 object-cover grayscale brightness-50 group-hover:brightness-100 transition-all mb-2" />
                         <p className="text-[10px] text-[#d4af37] font-mono text-center tracking-tighter">ENV #02 // RECOVERED</p>
                      </div>
                    ) : (
                       <div className="flex flex-col items-center justify-center gap-2 animate-pulse" style={{ animationDuration: '3s' }}>
                         <Lock className="text-[#d4af37]/30" size={28} style={{ filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.3))' }} />
                         <p className="text-[8px] font-mono text-[#d4af37]/30 tracking-widest">RESTRICTED - ENCRYPTED</p>
                       </div>
                    )}
                 </div>

                 <div className="terminal-box p-4 flex flex-col items-center justify-center min-h-[120px]">
                    {isPatternDecrypted ? (
                       <div onClick={() => { playSFX('typewriter'); setSelectedEvidence({ src: "/GenLayer_Game_Assets/Folder 03 Locked_Envelopes/env3_final.png", title: "FINAL VERDICT" }); }} className="cursor-pointer group animate-in fade-in duration-500">
                         <img src="/GenLayer_Game_Assets/Folder 03 Locked_Envelopes/env3_final.png" alt="" className="w-full h-16 object-cover grayscale group-hover:grayscale-0 transition-all mb-2 border border-[#d4af37]/40" />
                         <p className="text-[10px] text-[#d4af37] font-mono text-center tracking-tighter">FINAL VERDICT</p>
                       </div>
                    ) : (
                       <div className="flex flex-col items-center justify-center gap-2 animate-pulse" style={{ animationDuration: '3s' }}>
                         <Lock className="text-[#d4af37]/30" size={28} style={{ filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.3))' }} />
                         <p className="text-[8px] font-mono text-[#d4af37]/30 tracking-widest">RESTRICTED - ENCRYPTED</p>
                       </div>
                    )}
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Verification Portal */}
        <aside className="w-80 bg-black/60 p-6 flex flex-col gap-5 pt-8">
            <section className="terminal-box p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.3em] flex items-center gap-2 text-white">Verification Portal</h3>
                {caseSolved ? (
                  <div className="text-center py-6 space-y-4"><Trophy className="w-12 h-12 mx-auto text-[#d4af37]" /><p className="text-xs font-bold uppercase">Master Detective Verified</p></div>
                ) : (
                  <>
                    <input 
                      type="text" 
                      value={solutionHash} 
                      onChange={(e)=>setSolutionHash(e.target.value)} 
                      className="w-full bg-black/50 border border-[#d4af37]/30 p-3 text-xs font-mono text-[#d4af37]/60 placeholder:text-[#d4af37]/40 focus:text-[#d4af37] transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                      placeholder="IDENT_UNKNOWN" 
                      disabled={!isPatternDecrypted}
                    />
                    {transactionError && (
                      <p className="text-[10px] font-mono text-red-500 animate-pulse text-center">{transactionError}</p>
                    )}
                    <button 
                      onClick={handleVerifySolution} 
                      disabled={isPortalLoading || !isPatternDecrypted} 
                      className="w-full py-4 bg-[#d4af37] text-black font-bold uppercase tracking-[0.3em] hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isPortalLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                          VERIFYING ON-CHAIN...
                        </>
                      ) : (
                        !isPatternDecrypted ? 'LOCKED - DECRYPT FIRST' : 'SUBMIT VERDICT'
                      )}
                    </button>
                    <p className="text-[8px] font-mono text-zinc-600 text-center mt-1">Cost: 0.3 GEN per action</p>
                  </>
                )}
            </section>
            
            <section className="terminal-box p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Wallet Info</h3>
                <div className="text-[10px] font-mono text-zinc-500 space-y-2">
                  <p>Connected: {address?.slice(0,8)}...{address?.slice(-6)}</p>
                  <p>Network: GenLayer Bradbury</p>
                </div>
            </section>
        </aside>
      </div>

      {selectedEvidence && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 animate-in fade-in duration-500" onClick={() => setSelectedEvidence(null)}>
           <div className="relative max-w-4xl w-full" onClick={(e)=>e.stopPropagation()}>
              <div className="bg-zinc-200 p-4 pb-20 shadow-2xl relative">
                <img src={selectedEvidence.src} alt="Evidence" className="max-h-[70vh] w-auto grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all duration-1000" />
                <p className="absolute bottom-6 left-0 right-0 text-center font-mono text-[10px] text-zinc-900 opacity-50 uppercase">{selectedEvidence.title}</p>
              </div>
              <button onClick={() => setSelectedEvidence(null)} className="mt-8 block w-full text-center text-[#d4af37] font-mono text-xs uppercase hover:underline">/ Close Intel /</button>
           </div>
        </div>
      )}

      {caseSolved && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="max-w-2xl w-full">
            <div className="text-center space-y-4">
              <Trophy className="w-24 h-24 mx-auto text-[#d4af37] animate-bounce" />
              <h1 className="text-3xl font-bold uppercase tracking-widest text-white">Case Solved</h1>
              <p className="text-sm font-mono text-zinc-400">Master Detective Verified</p>
            </div>
            <button 
              onClick={() => router.push('/case-01/mint')}
              className="mt-8 block w-full py-4 border border-[#d4af37] text-[#d4af37] font-bold uppercase tracking-[0.3em] hover:bg-[#d4af37] hover:text-black transition-all"
            >
              Mint Agent Badge
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
