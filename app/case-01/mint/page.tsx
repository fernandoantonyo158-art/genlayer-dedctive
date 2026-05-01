"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { useRouter } from "next/navigation";
import { Shield, Fingerprint, Award } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";

const CONTRACT_ABI = [
  {
    name: 'mint_agent_card',
    type: 'function',
    stateMutability: 'payable',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const;

const GENLAYER_CONTRACT_ADDRESS = "0x868ef59CBA2857bD930F3849E0d3Fdb001F914Fa";

const SFX = {
  success: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3",
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"
};

export default function MintPage() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const { soundEnabled } = useAudio();
  
  const { data: hash, writeContract, isPending: isMinting } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  
  const [mintError, setMintError] = useState<string | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [signatureComplete, setSignatureComplete] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Generate unique serial from wallet address
  const generateSerial = (addr: string | undefined) => {
    if (!addr) return 'GLA-2026-PENDING';
    const last4 = addr.slice(-4);
    return `GLA-2026-${last4.toUpperCase()}`;
  };

  // Get current date formatted
  const getIssueDate = () => {
    const date = new Date();
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // 3D Tilt Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * 15, y: -x * 15 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const playSFX = (type: keyof typeof SFX) => {
    if (!soundEnabled) return;
    const audio = new Audio(SFX[type]);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const handleMint = () => {
    if (!address) return;
    setMintError(null);
    playSFX('click');
    
    writeContract({
      address: GENLAYER_CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'mint_agent_card',
      value: parseEther('0.55')
    });
  };

  // Trigger signature animation on mint confirmation
  useEffect(() => {
    if (isConfirmed && !signatureComplete) {
      setTimeout(() => setSignatureComplete(true), 500);
    }
  }, [isConfirmed, signatureComplete]);

  // Deployment animation
  useEffect(() => {
    if (isConfirmed && signatureComplete) {
      setTimeout(() => setDeploying(true), 1500);
      setTimeout(() => {
        router.push('/');
      }, 500);
    }
  }, [isConfirmed, signatureComplete, router]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center space-y-6">
          <div className="text-[#d4af37] text-6xl">🔒</div>
          <h1 className="text-2xl font-bold text-white tracking-widest">RESTRICTED ACCESS</h1>
          <p className="text-zinc-400 font-mono text-sm">Connect your wallet to mint your Agent Card</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 border border-[#d4af37] text-[#d4af37] font-bold uppercase tracking-[0.2em] hover:bg-[#d4af37] hover:text-black transition-all"
          >
            Return to Cases
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 opacity-50"></div>
      <div className="absolute inset-0 bg-[url('/GenLayer_Game_Assets/Folder_01_Access_and_UI/field_agent_pass.png')] bg-cover bg-center opacity-10 blur-sm"></div>
      
      {/* Gold Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#d4af37] rounded-full blur-[150px] opacity-20"></div>

      <div className="relative z-10 max-w-3xl w-full">
        {/* Professional ID Card with 3D Tilt */}
        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={`relative transition-all duration-300 ${deploying ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: deploying ? 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'transform 0.1s ease-out'
          }}
        >
          {/* Card Body - Obsidian Glass with Carbon Fiber */}
          <div 
            className="relative rounded-2xl overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.85) 0%, rgba(20, 20, 30, 0.9) 50%, rgba(10, 10, 15, 0.85) 100%)',
              backdropFilter: 'blur(4px)',
              border: '3px solid transparent',
              backgroundClip: 'padding-box',
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.7), 0 0 80px rgba(212, 175, 55, 0.15), inset 0 0 40px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Carbon Fiber Texture */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(30, 30, 40, 0.5) 1px, rgba(30, 30, 40, 0.5) 2px),
                  repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(30, 30, 40, 0.5) 1px, rgba(30, 30, 40, 0.5) 2px)
                `
              }}
            ></div>

            {/* Gold Laser Border Tracing Animation */}
            <div 
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                padding: '3px',
                background: 'conic-gradient(from 0deg, transparent 0deg, #d4af37 90deg, transparent 180deg, #d4af37 270deg, transparent 360deg)',
                backgroundSize: '400% 400%',
                animation: 'laserTrace 4s linear infinite',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude'
              }}
            ></div>

            {/* Holographic Sheen Overlay on Hover */}
            <div 
              className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(135deg, transparent 0%, rgba(212, 175, 55, 0.1) 50%, transparent 100%)',
                transform: 'skewX(-20deg) translateX(-100%)',
                animation: 'sheenMove 3s ease-in-out infinite'
              }}
            ></div>

            {/* Micro-print Background Pattern */}
            <div 
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #d4af37 0, #d4af37 1px, transparent 1px, transparent 10px), repeating-linear-gradient(-45deg, #d4af37 0, #d4af37 1px, transparent 1px, transparent 10px)'
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-[#d4af37] font-mono text-[8px] tracking-[0.5em] opacity-30 transform -rotate-45 whitespace-nowrap">
                  GENLAYER INTEL GENLAYER INTEL GENLAYER INTEL GENLAYER INTEL GENLAYER INTEL
                </div>
              </div>
            </div>

            {/* 3D Metallic Badge with Y-Axis Rotation */}
            <div 
              className="absolute top-4 right-4 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500"
              style={{
                background: 'linear-gradient(145deg, #d4af37 0%, #b8860b 30%, #d4af37 50%, #8b6914 70%, #d4af37 100%)',
                backgroundSize: '200% 200%',
                boxShadow: '0 0 40px rgba(212, 175, 55, 0.7), inset 0 0 30px rgba(255, 255, 255, 0.2), 0 10px 30px rgba(0, 0, 0, 0.5)',
                transform: `perspective(500px) rotateY(${tilt.y * 2}deg) rotateX(${tilt.x * 0.5}deg)`,
                animation: 'metallicShine 3s ease-in-out infinite'
              }}
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md border-2 border-[#d4af37]/50">
                <Shield className="w-12 h-12 text-white drop-shadow-2xl" style={{ filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.8))' }} />
              </div>
            </div>

            {/* Card Content */}
            <div className="relative p-8">
              {/* Header - Military-Grade Serif */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 
                    className="text-4xl font-black text-white tracking-[0.15em] uppercase"
                    style={{ 
                      fontFamily: '"Times New Roman", Times, serif',
                      textShadow: '0 0 20px rgba(212, 175, 55, 0.5), 0 4px 8px rgba(0, 0, 0, 0.8)',
                      letterSpacing: '0.2em'
                    }}
                  >
                    CERTIFIED AGENT
                  </h1>
                  <p 
                    className="text-[#d4af37] font-mono text-xs tracking-[0.3em] mt-2 uppercase"
                    style={{ 
                      textShadow: '0 0 15px rgba(212, 175, 55, 0.6)',
                      letterSpacing: '0.25em'
                    }}
                  >
                    GENLAYER INTELLIGENCE AGENCY
                  </p>
                </div>
                <div 
                  className="w-16 h-16 border-2 border-[#d4af37] rounded-full flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(0, 0, 0, 0.5))',
                    boxShadow: '0 0 25px rgba(212, 175, 55, 0.5), inset 0 0 15px rgba(212, 175, 55, 0.2)'
                  }}
                >
                  <Award className="w-8 h-8 text-[#d4af37]" style={{ filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.8))' }} />
                </div>
              </div>

              {/* Data Fields - Glowing Green/Gold Monospace */}
              <div className="space-y-4">
                {/* Agent Serial */}
                <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Fingerprint className="w-4 h-4 text-[#d4af37]" />
                      <div 
                        className="absolute inset-0 w-4 h-4 rounded-full animate-ping"
                        style={{ 
                          background: 'radial-gradient(circle, rgba(212,175,55,0.8) 0%, transparent 70%)',
                          animationDuration: '2s'
                        }}
                      ></div>
                    </div>
                    <span className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider">Agent Serial</span>
                  </div>
                  <span 
                    className="text-[#d4af37] font-mono text-sm tracking-widest font-bold"
                    style={{ 
                      fontFamily: 'Courier New, monospace',
                      textShadow: '0 0 15px rgba(212, 175, 55, 0.8), 0 0 30px rgba(212, 175, 55, 0.4)',
                      letterSpacing: '0.2em',
                      color: '#d4af37'
                    }}
                  >
                    {generateSerial(address)}
                  </span>
                </div>

                {/* Field Agent */}
                <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Fingerprint className="w-4 h-4 text-[#d4af37]" />
                      <div 
                        className="absolute inset-0 w-4 h-4 rounded-full animate-ping"
                        style={{ 
                          background: 'radial-gradient(circle, rgba(212,175,55,0.8) 0%, transparent 70%)',
                          animationDuration: '2s',
                          animationDelay: '0.3s'
                        }}
                      ></div>
                    </div>
                    <span className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider">Field Agent</span>
                  </div>
                  <span 
                    className="text-white font-mono text-xs tracking-widest"
                    style={{ 
                      textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                      letterSpacing: '0.15em'
                    }}
                  >
                    {address?.slice(0, 8)}...{address?.slice(-6)}
                  </span>
                </div>

                {/* Issue Date */}
                <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Fingerprint className="w-4 h-4 text-[#d4af37]" />
                      <div 
                        className="absolute inset-0 w-4 h-4 rounded-full animate-ping"
                        style={{ 
                          background: 'radial-gradient(circle, rgba(212,175,55,0.8) 0%, transparent 70%)',
                          animationDuration: '2s',
                          animationDelay: '0.6s'
                        }}
                      ></div>
                    </div>
                    <span className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider">Issue Date</span>
                  </div>
                  <span 
                    className="text-white font-mono text-xs tracking-widest"
                    style={{ 
                      textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                      letterSpacing: '0.15em'
                    }}
                  >
                    {getIssueDate()}
                  </span>
                </div>

                {/* Clearance Level */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Fingerprint className="w-4 h-4 text-[#d4af37]" />
                      <div 
                        className="absolute inset-0 w-4 h-4 rounded-full animate-ping"
                        style={{ 
                          background: 'radial-gradient(circle, rgba(212,175,55,0.8) 0%, transparent 70%)',
                          animationDuration: '2s',
                          animationDelay: '0.9s'
                        }}
                      ></div>
                    </div>
                    <span className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider">Clearance Level</span>
                  </div>
                  <span 
                    className="text-green-400 font-mono text-xs tracking-widest font-bold"
                    style={{ 
                      textShadow: '0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.4)',
                      letterSpacing: '0.2em'
                    }}
                  >
                    LEVEL 01 - FIELD AGENT
                  </span>
                </div>
              </div>

              {/* Digital Signature - Cursive Wallet Address */}
              <div className="mt-6 pt-4 border-t border-[#d4af37]/30">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider">Digital Signature</span>
                  <div className="h-10 flex-1 ml-4 relative overflow-hidden">
                    {signatureComplete ? (
                      <div 
                        className="text-[#d4af37] font-serif italic text-lg"
                        style={{ 
                          fontFamily: '"Brush Script MT", cursive',
                          textShadow: '0 0 10px rgba(212, 175, 55, 0.6)',
                          animation: 'signatureFadeIn 1s ease-out forwards',
                          opacity: 0
                        }}
                      >
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </div>
                    ) : (
                      <div className="w-full h-full border-b border-dashed border-zinc-600"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-6 flex justify-center">
                <div 
                  className={`px-6 py-2 rounded-full border font-mono text-xs uppercase tracking-widest transition-all ${
                    isConfirmed 
                      ? 'border-green-500/60 text-green-400 bg-green-500/10 shadow-[0 0 30px_rgba(34,197,94,0.4)]' 
                      : 'border-[#d4af37]/60 text-[#d4af37] bg-[#d4af37]/10'
                  }`}
                  style={{ 
                    boxShadow: isConfirmed ? '0 0 30px rgba(34, 197, 94, 0.4), inset 0 0 20px rgba(34, 197, 94, 0.1)' : '0 0 20px rgba(212, 175, 55, 0.2)'
                  }}
                >
                  {isConfirmed ? '✓ CERTIFIED' : 'PENDING CERTIFICATION'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mint Button Section */}
        <div className={`mt-8 space-y-4 transition-all duration-500 ${deploying ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {!isConfirmed ? (
            <button
              onClick={handleMint}
              disabled={isMinting || isConfirming}
              className="w-full py-4 bg-[#d4af37] text-black font-bold uppercase tracking-[0.3em] hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border-2 border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_50px_rgba(212,175,55,0.6)]"
            >
              {isMinting || isConfirming ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  MINTING AGENT ID...
                </>
              ) : (
                'MINT AGENT ID'
              )}
            </button>
          ) : (
            <div className="text-center space-y-3">
              <div className="text-green-400 font-mono text-sm animate-pulse tracking-widest" style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.5)' }}>
                ✓ AGENT ID CERTIFIED
              </div>
              <p className="text-zinc-400 font-mono text-xs">
                Deploying to Investigation Dashboard...
              </p>
            </div>
          )}

          {mintError && (
            <p className="text-red-500 font-mono text-xs text-center animate-pulse">
              {mintError}
            </p>
          )}

          <p className="text-zinc-600 font-mono text-[10px] text-center">
            Minting Cost: 0.55 GEN. Grants access to Case #02: Mansion Homicide.
          </p>
        </div>
      </div>

      {/* Animation Keyframes */}
      <style jsx>{`
        @keyframes laserTrace {
          0% { background-position: 0% 0%; }
          100% { background-position: 400% 0%; }
        }

        @keyframes sheenMove {
          0% { transform: skewX(-20deg) translateX(-100%); }
          50% { transform: skewX(-20deg) translateX(100%); }
          100% { transform: skewX(-20deg) translateX(-100%); }
        }

        @keyframes metallicShine {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes signatureFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
