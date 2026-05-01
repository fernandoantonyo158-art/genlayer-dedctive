"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useAudio } from "@/contexts/AudioContext";
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

const SFX = {
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  success: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3",
  error: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3"
};

export default function InvestigationBoard() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { soundEnabled, playSFX } = useAudio();
  
  const { data: hash, writeContract } = useWriteContract();
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  
  const [accessCode, setAccessCode] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Pre-crime images (exact folder paths)
  const preCrimeImages = [
    { src: "/case-02/pre-crime/party-crowd.jpg", title: "PARTY CROWD", rotation: "-8deg" },
    { src: "/case-02/pre-crime/party-suspects.jpg", title: "PARTY SUSPECTS", rotation: "5deg" },
    { src: "/case-02/pre-crime/party-victim.jpg", title: "PARTY VICTIM", rotation: "-3deg" }
  ];

  // Evidence-c images (exact folder paths)
  const evidenceImages = [
    { src: "/case-02/evidence-c/broken-cameras.jpg", title: "BROKEN CAMERAS", rotation: "4deg" },
    { src: "/case-02/evidence-c/stairs-necklace.jpg", title: "STAIRS NECKLACE", rotation: "-6deg" },
    { src: "/case-02/evidence-c/villa-evidence.jpg", title: "VILLA EVIDENCE", rotation: "2deg" }
  ];

  const handleAccessCode = async () => {
    if (!isConnected) {
      alert("Connect wallet to access crime scene.");
      return;
    }
    
    if (accessCode.toUpperCase() === 'SEC-V2') {
      setIsDecrypting(true);
      setStatusMessage("DECRYPTING...");
      playSFX('success');
      
      writeContract({
        address: GENLAYER_CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'solve_case',
        args: [accessCode],
        value: parseEther('0.1'),
      });
    } else {
      playSFX('error');
      setStatusMessage("ACCESS DENIED: INVALID CODE");
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  useEffect(() => {
    if (isConfirmed && statusMessage) {
      router.push('/case-02/villa-scene');
    }
  }, [isConfirmed, statusMessage, router]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image with Cinematic Vignette */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url("/case-02/evidence-c/villa-evidence.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Heavy Dark Vignette Overlay */}
      <div 
        className="fixed inset-0 z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.8) 100%)'
        }}
      />
      
      {/* Header */}
      <div className="relative z-20 pt-16 px-8">
        <div className="text-center mb-8">
          <h1 
            className="text-4xl md:text-5xl font-bold leading-tight" 
            style={{ 
              fontFamily: '"Playfair Display", Georgia, serif',
              background: 'linear-gradient(135deg, #FFE4B5, #D4AF37, #B8860B, #D4AF37)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.9), 0 0 20px rgba(212, 175, 55, 0.3)',
              letterSpacing: '0.02em',
              filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.4))'
            }}
          >
            CASE #002: THE LAST TRANSACTION
          </h1>
          <p 
            className="text-sm mt-3 tracking-widest uppercase font-light"
            style={{
              background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
            }}
          >
            Investigation Board
          </p>
        </div>
        
      </div>
      
      {/* Main Content */}
      <div className="relative z-20 pt-16 px-8 pb-32">
        <div className="max-w-7xl mx-auto">
          
          {/* Pre-Crime Polaroids - Desk Layout */}
          <div className="mb-20 relative" style={{ minHeight: '300px' }}>
            {/* Bordered Frame Label - Pre-Crime */}
            <div className="mb-4 ml-2 inline-block">
              <div 
                className="px-4 py-2"
                style={{
                  background: 'rgba(255, 0, 0, 0.1)',
                  backdropFilter: 'blur(5px)',
                  border: '1px solid rgba(255, 0, 0, 0.5)',
                  boxShadow: '0 0 15px rgba(255, 0, 0, 0.2), inset 0 0 10px rgba(255, 0, 0, 0.05)'
                }}
              >
                <h2 
                  className="text-sm font-bold tracking-widest uppercase"
                  style={{
                    color: '#FF0000',
                    textShadow: '0 0 10px #FF0000',
                    fontFamily: 'monospace',
                    fontWeight: '700',
                    letterSpacing: '0.15em'
                  }}
                >
                  PRE-CRIME EVIDENCE
                </h2>
              </div>
            </div>
            
            <div className="relative mx-auto" style={{ width: '800px', height: '250px' }}>
              {preCrimeImages.map((image, index) => (
                <div
                  key={index}
                  className="absolute"
                  style={{
                    left: index === 0 ? '20px' : index === 1 ? '320px' : '620px',
                    top: index === 0 ? '5px' : index === 1 ? '-5px' : '10px',
                    transform: `rotate(${image.rotation})`,
                    transition: 'transform 0.3s ease',
                    zIndex: index === 1 ? 10 : 5
                  }}
                  onClick={() => setSelectedImage(image.src)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = `rotate(0deg) scale(1.05) translateY(-5px)`;
                    e.currentTarget.style.zIndex = '20';
                    e.currentTarget.style.cursor = 'pointer';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = `rotate(${image.rotation})`;
                    e.currentTarget.style.zIndex = index === 1 ? "10" : "5";
                    e.currentTarget.style.cursor = 'default';
                  }}
                >
                  {/* Physical Red Pin at Top Center */}
                  <div 
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10"
                    style={{
                      width: '10px',
                      height: '10px',
                      background: 'linear-gradient(135deg, #DC2626, #991B1B)',
                      borderRadius: '50%',
                      boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
                    }}
                  />
                  
                  {/* 3D Polaroid on Desk */}
                  <div 
                    className="bg-white"
                    style={{ 
                      width: '205px',
                      border: '14px solid white',
                      borderBottom: '70px solid white',
                      boxSizing: 'content-box',
                      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.6), 0 5px 15px rgba(0, 0, 0, 0.3)',
                      transform: 'perspective(800px) rotateX(5deg) rotateY(-3deg)'
                    }}
                  >
                    <img 
                      src={image.src} 
                      alt={image.title}
                      className="w-full h-40 object-cover"
                    />
                    <p className="text-xs font-bold uppercase tracking-wider text-center text-gray-800 mt-2">
                      {image.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Evidence Polaroids - Desk Layout */}
          <div className="mb-32 relative" style={{ minHeight: '300px' }}>
            {/* Bordered Frame Label - Crime Scene */}
            <div className="mb-4 ml-2 inline-block">
              <div 
                className="px-4 py-2"
                style={{
                  background: 'rgba(255, 215, 0, 0.1)',
                  backdropFilter: 'blur(5px)',
                  border: '1px solid rgba(255, 215, 0, 0.5)',
                  boxShadow: '0 0 15px rgba(255, 215, 0, 0.2), inset 0 0 10px rgba(255, 215, 0, 0.05)'
                }}
              >
                <h2 
                  className="text-sm font-bold tracking-widest uppercase"
                  style={{
                    color: '#FFD700',
                    textShadow: '0 0 10px #FFD700',
                    fontFamily: 'monospace',
                    fontWeight: '700',
                    letterSpacing: '0.15em'
                  }}
                >
                  CRIME SCENE EVIDENCE
                </h2>
              </div>
            </div>
            
            <div className="relative mx-auto" style={{ width: '800px', height: '250px' }}>
              {evidenceImages.map((image, index) => (
                <div
                  key={index}
                  className="absolute"
                  style={{
                    left: index === 0 ? '50px' : index === 1 ? '350px' : '650px',
                    top: index === 0 ? '10px' : index === 1 ? '0px' : '5px',
                    transform: `rotate(${image.rotation})`,
                    transition: 'transform 0.3s ease',
                    zIndex: index === 1 ? 10 : 5
                  }}
                  onClick={() => setSelectedImage(image.src)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = `rotate(0deg) scale(1.05) translateY(-5px)`;
                    e.currentTarget.style.zIndex = '20';
                    e.currentTarget.style.cursor = 'pointer';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = `rotate(${image.rotation})`;
                    e.currentTarget.style.zIndex = index === 1 ? "10" : "5";
                    e.currentTarget.style.cursor = 'default';
                  }}
                >
                  {/* Physical Red Pin at Top Center */}
                  <div 
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10"
                    style={{
                      width: '10px',
                      height: '10px',
                      background: 'linear-gradient(135deg, #DC2626, #991B1B)',
                      borderRadius: '50%',
                      boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
                    }}
                  />
                  
                  {/* 3D Polaroid on Desk */}
                  <div 
                    className="bg-white"
                    style={{ 
                      width: '205px',
                      border: '14px solid white',
                      borderBottom: '70px solid white',
                      boxSizing: 'content-box',
                      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.6), 0 5px 15px rgba(0, 0, 0, 0.3)',
                      transform: 'perspective(800px) rotateX(5deg) rotateY(-3deg)'
                    }}
                  >
                    <img 
                      src={image.src} 
                      alt={image.title}
                      className="w-full h-40 object-cover"
                    />
                    <p className="text-xs font-bold uppercase tracking-wider text-center text-gray-800 mt-2">
                      {image.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Verification Portal - Bottom Right */}
      <div className="fixed bottom-8 right-8 z-30">
        <div 
          className="p-8"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7)',
            borderRadius: '8px'
          }}
        >
          <h3 className="text-[#D4AF37] text-sm font-bold tracking-wider uppercase mb-4 text-center">
            Verification Portal
          </h3>
          <p className="text-white text-xs mb-6 opacity-90 text-center font-mono">
            ENTER CRIME SCENE ACCESS CODE
          </p>
          
          {/* Secure Terminal Input with Scanline */}
          <div className="relative mb-6 overflow-hidden">
            {/* Scanline Effect */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(0deg, transparent 0%, rgba(212, 175, 55, 0.1) 50%, transparent 100%)',
                animation: 'scanline 3s linear infinite'
              }}
            />
            
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <span 
                className="text-[#D4AF37] font-mono text-sm"
                style={{ 
                  textShadow: '0 0 8px rgba(212, 175, 55, 0.8)',
                  animation: 'pulse 2s infinite'
                }}
              >
                ▶
              </span>
            </div>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="ENTER ACCESS CODE..."
              className="w-full bg-black/80 border border-[#D4AF37]/50 p-3 pl-8 pr-8 text-white font-mono text-sm focus:outline-none focus:border-[#D4AF37] focus:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all"
              disabled={isDecrypting}
              style={{
                letterSpacing: '0.1em'
              }}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
              <span 
                className="text-[#D4AF37] font-mono text-xs"
                style={{ 
                  textShadow: '0 0 12px rgba(212, 175, 55, 1)',
                  animation: 'blink 1s infinite'
                }}
              >
                █
              </span>
            </div>
          </div>
          
          {statusMessage && (
            <p className="text-[10px] font-mono text-[#D4AF37] animate-pulse mb-4 text-center">{statusMessage}</p>
          )}
          
          {/* Modern Agency Terminal Button */}
          <button
            onClick={handleAccessCode}
            disabled={isDecrypting || !accessCode}
            className="w-full py-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group relative overflow-hidden"
            style={{
              background: 'transparent',
              border: '2px solid #D4AF37',
              outline: '1px solid #B8860B',
              outlineOffset: '2px',
              color: '#D4AF37',
              fontFamily: 'monospace',
              boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 40px rgba(212, 175, 55, 0.5)';
              e.currentTarget.style.borderColor = '#E6C547';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.2)';
              e.currentTarget.style.borderColor = '#D4AF37';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {/* Glitch Scanline Animation */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(0deg, transparent 0%, rgba(212, 175, 55, 0.3) 50%, transparent 100%)',
                animation: 'scanline 2s linear infinite'
              }}
            />
            
            {/* Blinking Red LED */}
            <div className="relative">
              <div 
                className="w-3 h-3 rounded-full"
                style={{
                  background: '#DC2626',
                  boxShadow: '0 0 10px #DC2626',
                  animation: 'blink 1s infinite'
                }}
              />
            </div>
            
            <span 
              className="font-bold text-xs tracking-wider uppercase"
              style={{ 
                letterSpacing: '0.2em',
                textShadow: '0 0 10px rgba(212, 175, 55, 0.5)'
              }}
            >
              {isDecrypting ? "DECRYPTING..." : "DECRYPT EVIDENCE"}
            </span>
            
            {/* CSS Animations */}
            <style jsx>{`
              @keyframes scanline {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(100%); }
              }
              @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0.3; }
              }
            `}</style>
          </button>
          
          <p className="text-[8px] font-mono text-zinc-600 text-center mt-3">Transaction: 0.1 GEN</p>
        </div>
      </div>
      
      {/* Lightbox Overlay */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(5px)'
          }}
          onClick={() => setSelectedImage(null)}
        >
          {/* Close Button */}
          <button
            className="absolute top-8 right-8 text-white text-4xl font-bold hover:text-gray-300 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
            style={{
              textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
            }}
          >
            ×
          </button>
          
          {/* Zoomed Image */}
          <div 
            className="relative max-w-4xl max-h-screen p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="bg-white p-6 shadow-2xl"
              style={{
                transform: 'perspective(1000px) rotateX(2deg)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)'
              }}
            >
              <img 
                src={selectedImage} 
                alt="Evidence"
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
