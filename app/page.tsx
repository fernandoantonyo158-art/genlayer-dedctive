"use client";

import { useState, useEffect, useRef } from "react";
import { ShieldAlert, Cpu } from "lucide-react";
import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import NFTMinter from "@/components/NFTMinter";
import { useBadge } from "@/contexts/BadgeContext";
import { useAudio } from "@/contexts/AudioContext";

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
  investigation_theme: "/investigation-theme.mp3",
  success: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3",
  error: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"
};

function HomeContent() {
  const { isConnected, address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { hasBadge, refreshBadge } = useBadge();
  const { soundEnabled, toggleSound, playSFX, startBGM } = useAudio();
  const router = useRouter();
  const [systemInitialized, setSystemInitialized] = useState(false);
  const [screen, setScreen] = useState<'intro' | 'selection' | 'investigation' | 'reward'>('intro');
  const [audioContextInitialized, setAudioContextInitialized] = useState(false);
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const typewriterRef = useRef<HTMLAudioElement | null>(null);

  // Auto-switch to GenLayer Bradbury if on wrong network
  useEffect(() => {
    if (isConnected && chainId && chainId !== 4221) {
      switchChain({ chainId: 4221 });
    }
  }, [isConnected, chainId, switchChain]);

  // Initialize typewriter audio ref for intro
  useEffect(() => {
    if (typeof window !== 'undefined' && !typewriterRef.current) {
      typewriterRef.current = new Audio(SFX.typewriter);
      typewriterRef.current.volume = 0.8;
    }
  }, []);

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

  const caseSolved = isMasterDetective || screen === 'reward';
  const [notification, setNotification] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [case02Unlocked, setCase02Unlocked] = useState(true); // Force unlocked for development
  const [unlockAnimating, setUnlockAnimating] = useState(false);
  const [case01Complete, setCase01Complete] = useState(false);
  const [case02Complete, setCase02Complete] = useState(false);

  // Read completion flags from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCase01Complete(localStorage.getItem('case01_complete') === 'true');
      setCase02Complete(localStorage.getItem('case02_complete') === 'true');

      /* Post-mint redirect: skip intro and land directly on case selection */
      if (localStorage.getItem('goto_selection') === 'true') {
        localStorage.removeItem('goto_selection'); // consume the flag
        setSystemInitialized(true);
        setScreen('selection');
      }
    }
  }, []);

  // Persistence: Skip intro if wallet already holds Agent ID (is_master_detective)
  useEffect(() => {
    if (isMasterDetective && screen === 'intro' && isConnected && systemInitialized) {
      setScreen('selection');
    }
  }, [isMasterDetective, screen, isConnected, systemInitialized]);

  // Auto-unlock Case #02 when badge is detected
  useEffect(() => {
    if (hasBadge && !case02Unlocked && screen === 'selection') {
      setUnlockAnimating(true);
      setCase02Unlocked(true);
      playSFX('success');
      setTimeout(() => setUnlockAnimating(false), 1000);
    }
  }, [hasBadge, case02Unlocked, screen]);

  const handleCase02Click = () => {
    playSFX('click');
    refreshBadge();
    if (hasBadge) {
      setCase02Unlocked(true);
      playSFX('success');
    } else {
      setNotification("Clearance Denied. Detective Badge #01 Required to access Case #002.");
      playSFX('error');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const restartGame = () => {
    playSFX('click');
    setScreen('intro');
    setSystemInitialized(false);
    setIntroText("");
    setIntroFinished(false);
    setCase02Unlocked(true);
    setNotification(null);
  };


  const initializeAudioContext = () => {
    if (!audioContextInitialized) {
      setAudioContextInitialized(true);
    }
  };

  useEffect(() => {
    if (screen === 'selection') {
      if (!ambientRef.current) {
        ambientRef.current = new Audio(SFX.investigation_theme);
        ambientRef.current.loop = true;
        ambientRef.current.volume = 0.2;
      }
      if (soundEnabled) {
        ambientRef.current.play().catch(() => {});
      } else {
        ambientRef.current.pause();
      }
    } else if (ambientRef.current) {
      ambientRef.current.pause();
      ambientRef.current.currentTime = 0;
    }
  }, [screen, soundEnabled]);

  // Intro Typewriter
  const [introText, setIntroText] = useState("");
  const [introFinished, setIntroFinished] = useState(false);
  const fullIntro = `GENLAYER INTELLIGENCE AGENCY // CENTRAL DATABASE\n\nSYSTEM STATUS: CRITICAL\nAccess granted to Detective: ${address || "UNIDENTIFIED"}\n\nThe digital world is bleeding. Decentralized crimes require a new breed of investigator. You are now connected to the only system capable of processing AI-driven evidence and subjective consensus.\n\nYour directive: Navigate through the data, decode encrypted patterns, and use the power of the GenLayer Intelligent Contracts to bring justice. Select an active case file to commence deployment.`;

  useEffect(() => {
    if (screen === 'intro' && isConnected && systemInitialized && audioContextInitialized) {
      let i = 0;
      if (!typewriterRef.current) {
        typewriterRef.current = new Audio(SFX.typewriter);
        typewriterRef.current.volume = 0.8;
      }
      typewriterRef.current.loop = true;
      typewriterRef.current.play().catch(() => {});
      
      const interval = setInterval(() => {
        setIntroText(fullIntro.slice(0, i));
        i++;
        if (i > fullIntro.length) {
          clearInterval(interval);
          setIntroFinished(true);
          if (typewriterRef.current) {
            typewriterRef.current.pause();
            typewriterRef.current.currentTime = 0;
            typewriterRef.current.loop = false;
          }
        }
      }, 45);
      return () => {
        clearInterval(interval);
        if (typewriterRef.current) {
          typewriterRef.current.pause();
          typewriterRef.current.currentTime = 0;
          typewriterRef.current.loop = false;
        }
      };
    } else {
      if (typewriterRef.current) {
        typewriterRef.current.pause();
        typewriterRef.current.currentTime = 0;
        typewriterRef.current.loop = false;
      }
    }
  }, [screen, isConnected, address, systemInitialized, audioContextInitialized]);

  /* Kill typewriter on unmount — fires when user navigates away mid-intro */
  useEffect(() => {
    return () => {
      if (typewriterRef.current) {
        typewriterRef.current.pause();
        typewriterRef.current.currentTime = 0;
        typewriterRef.current.loop = false;
        typewriterRef.current = null;
      }
    };
  }, []);

  // --------------------------------------------------------------------------------
  // SCREEN: Intro Terminal
  // --------------------------------------------------------------------------------
  if (screen === 'intro') {
    return (
      <div className="agency-wrapper monitor-lines justify-center items-center p-6 relative">
        <div className="pt-20">
          {!isConnected ? (
            <div className="terminal-box text-center space-y-8 max-w-lg w-full scale-100 animate-in fade-in zoom-in-95 duration-700" style={{ animation: 'breathingGlow 4s ease-in-out infinite' }}>
              <ShieldAlert className="w-20 h-20 text-[#d4af37] mx-auto animate-flicker" />
              <h2 className="text-xl font-bold uppercase tracking-widest text-white mb-2">GENLAYER AGENCY</h2>
              <p className="text-sm font-mono text-zinc-500">Authentication required to access secure terminal.</p>
              <div onClick={() => playSFX('click')}>
                <ConnectButton />
              </div>
            </div>
          ) : !systemInitialized ? (
            <div className="terminal-box text-center space-y-8 max-w-lg w-full scale-100 animate-in fade-in zoom-in-95 duration-1000" style={{ animation: 'breathingGlow 4s ease-in-out infinite' }}>
               <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full mx-auto flex items-center justify-center animate-pulse">
                  <Cpu className="text-green-500" />
               </div>
             <div>
                <h2 className="text-xl font-bold uppercase tracking-widest text-green-400 mb-2">Access Granted</h2>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Bio-signature verified. Secure connection established.</p>
                <p className="text-[10px] font-mono text-[#d4af37] mt-2">Wallet: {address?.slice(0,8)}...{address?.slice(-6)}</p>
             </div>
             <button
                onClick={() => {
                  initializeAudioContext();
                  setSystemInitialized(true);
                  playSFX('click');
                }}
                className="w-full py-6 border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-all font-bold uppercase tracking-[0.5em] shadow-[0_0_20px_rgba(34,197,94,0.2)]"
             >
                Enter Secure Portal
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

        <footer className="fixed bottom-0 left-0 w-full z-[50] bg-black/80 p-4">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6 text-xs font-mono">
              <a href="https://x.com/GenLayer" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#d4af37] transition-colors">GenLayer Twitter</a>
              <a href="https://www.genlayer.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#d4af37] transition-colors">GenLayer Website</a>
              <a href="https://x.com/danzo1r" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#d4af37] transition-colors">Lead Investigator: @danzo1r</a>
            </div>
            <div className="text-xs font-mono">
              <span className="text-zinc-500">Powered by: </span>
              <span className="text-[#d4af37] font-bold">LCHHAB 9</span>
            </div>
          </div>
        </footer>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------------
  // SCREEN: Case Selection
  // --------------------------------------------------------------------------------
  if (screen === 'selection') {
    return (
      <div className="agency-wrapper monitor-lines p-8 md:p-16 overflow-y-auto">
        <div className="flex items-center justify-center min-h-[80vh] pt-20">
          {debugMode && (
            <div className="fixed top-24 right-4 z-[300] p-4 bg-black/90 border border-[#d4af37] text-green-400 font-mono text-xs space-y-2 max-w-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#d4af37] font-bold">DEBUG MODE</span>
                <button onClick={() => setDebugMode(false)} className="text-red-400 hover:text-red-300">✕</button>
              </div>
              <div>Wallet: {address?.slice(0,8)}...{address?.slice(-6)}</div>
              <div>Contract: {GENLAYER_CONTRACT_ADDRESS.slice(0,10)}...</div>
              <div>Has Badge (Context): {hasBadge ? '✅ YES' : '❌ NO'}</div>
              <div>Case Solved: {caseSolved ? '✅ YES' : '❌ NO'}</div>
              <div>Screen: {screen}</div>
              <button 
                onClick={() => refreshBadge()}
                className="mt-2 w-full py-1 border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black"
              >
                Refresh Badge
              </button>
            </div>
          )}
          {notification && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-red-900/90 border border-red-500 text-red-100 font-mono text-sm animate-in fade-in slide-in-from-top-4">
              {notification}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
           <div onClick={() => { playSFX('click'); router.push('/case-01'); }} className="group cursor-pointer">
              <div className="aspect-square terminal-box flex items-center justify-center group-hover:border-[#d4af37] group-hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all relative overflow-hidden">
                 <img src="/folder-icon.png" alt="Folder" className="w-64 h-64 object-contain grayscale brightness-50 group-hover:brightness-100 group-hover:grayscale-0 transition-all" />
                 <div className="absolute top-2 right-2 px-3 py-1 bg-[#d4af37] text-black text-[10px] font-bold uppercase">ACTIVE CASE</div>
              </div>
              <h3 className="mt-4 text-lg font-bold group-hover:text-white uppercase tracking-widest">CASE 001: THE MYSTERIOUS CASE</h3>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  console.log("Navigating to Case 001...");
                  router.push('/case-01'); 
                }}
                className="mt-2 w-full py-2 border border-[#d4af37] text-[#d4af37] text-xs font-bold uppercase tracking-wider hover:bg-[#d4af37] hover:text-black transition-all"
              >
                ENTER
              </button>
           </div>

           <div 
             onClick={() => { playSFX('click'); router.push('/case-02'); }}
             className="group cursor-pointer transition-all"
           >
              <div className="aspect-square terminal-box flex items-center justify-center group-hover:border-[#d4af37] group-hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all relative overflow-hidden">
                 <img src="/case-02-folder.png" alt="Folder" className="w-64 h-64 object-contain grayscale brightness-50 group-hover:brightness-100 group-hover:grayscale-0 transition-all" />
                 <div className="absolute top-2 right-2 px-3 py-1 bg-[#d4af37] text-black text-[10px] font-bold uppercase">ACTIVE CASE</div>
              </div>
              <h3 className="mt-4 text-lg font-bold group-hover:text-white uppercase tracking-widest">CASE 002: THE CURSED VILLA LEDGER</h3>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  console.log("Navigating to Case 002...");
                  router.push('/case-02'); 
                }}
                className="mt-2 w-full py-2 border border-[#d4af37] text-[#d4af37] text-xs font-bold uppercase tracking-wider hover:bg-[#d4af37] hover:text-black transition-all"
              >
                ENTER
              </button>
           </div>
          </div>
        </div>

        <footer className="fixed bottom-0 left-0 w-full z-[50] bg-black/80 p-4">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6 text-xs font-mono">
              <a href="https://x.com/GenLayer" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#d4af37] transition-colors">GenLayer Twitter</a>
              <a href="https://www.genlayer.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#d4af37] transition-colors">GenLayer Website</a>
              <a href="https://x.com/danzo1r" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#d4af37] transition-colors">Lead Investigator: @danzo1r</a>
            </div>
            <div className="text-xs font-mono">
              <span className="text-zinc-500">Powered by: </span>
              <span className="text-[#d4af37] font-bold">LCHHAB 9</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // --------------------------------------------------------------------------------
  // SCREEN: Reward
  // --------------------------------------------------------------------------------
  if (screen === 'reward') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <NFTMinter onReturn={() => setScreen('selection')} />
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------------
  // SCREEN: Investigation (Removed - moved to /case-01)
  // --------------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="text-center space-y-6">
        <h1 className="text-2xl font-bold text-white tracking-widest">Route Changed</h1>
        <p className="text-zinc-400 font-mono text-sm">Case #01 investigation moved to /case-01</p>
        <button 
          onClick={() => router.push('/case-01')}
          className="px-8 py-3 border border-[#d4af37] text-[#d4af37] font-bold uppercase tracking-[0.2em] hover:bg-[#d4af37] hover:text-black transition-all"
        >
          Go to Case #01
        </button>
      </div>
    </div>
  );
}

export default HomeContent;
