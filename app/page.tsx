"use client";

import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Lock, Unlock, FileImage, FileText, Database, ShieldAlert, Cpu, Trophy } from "lucide-react";
import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

const CONTRACT_ABI = [
  {
    name: 'solve_case',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'solution_attempt', type: 'string' }
    ],
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

export default function Home() {
  const { isConnected, address } = useAccount();

  // Mock State for Web3 logic
  const [hasAccessNFT, setHasAccessNFT] = useState(true); // Default true for demo
  
  // Envelopes State
  const [unlockedEnvelopes, setUnlockedEnvelopes] = useState([false, false, false]);
  
  // Verification State
  const [solutionHash, setSolutionHash] = useState("");
  
  // GenLayer Contract Hooks
  const { data: hash, writeContract, isPending: isMinting } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const { data: isMasterDetective } = useReadContract({
     address: GENLAYER_CONTRACT_ADDRESS as `0x${string}`,
     abi: CONTRACT_ABI,
     functionName: 'is_master_detective',
     args: [address as `0x${string}`],
     query: {
       enabled: !!address && GENLAYER_CONTRACT_ADDRESS !== "0xYOUR_DEPLOYED_CONTRACT_ADDRESS",
     }
  });

  const caseSolved = isConfirmed || !!isMasterDetective;

  // Lightbox State
  const [selectedEvidence, setSelectedEvidence] = useState<{ src: string; title: string } | null>(null);

  // Envelope unlock codes
  const [env1Code, setEnv1Code] = useState("");
  const [env2Code, setEnv2Code] = useState("");

  const handleUnlockEnv1 = () => {
    if (env1Code.toUpperCase().trim() === "LEGEND") {
      setUnlockedEnvelopes([true, unlockedEnvelopes[1], unlockedEnvelopes[2]]);
    } else {
      alert("Invalid decryption key. Access Denied.");
    }
  };

  const handleUnlockEnv2 = () => {
    if (env2Code.trim() === "031407") {
      setUnlockedEnvelopes([unlockedEnvelopes[0], true, true]); // Unlocks Env 2 and Env 3 automatically
    } else {
      alert("Invalid Phase 2 Code. Access Denied.");
    }
  };

  const handleVerifySolution = () => {
    if (!solutionHash || !address) return;
    
    if (GENLAYER_CONTRACT_ADDRESS === "0xYOUR_DEPLOYED_CONTRACT_ADDRESS") {
       alert("GenLayer Intelligent Contract not yet deployed. Please deploy and update the contract address in page.tsx");
       return;
    }

    writeContract({
      address: GENLAYER_CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'solve_case',
      args: [solutionHash],
    });
  };

  const handleUnlockHint = () => {
    // Simulate transaction to burn/pay tokens for hint
    // wagmi writeContract would be used here
    alert("Transaction prompted to pay 0.1 GEN for a hint...");
  };

  if (!isConnected) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-zinc-950">
        <div className="flex flex-col items-center p-12 border border-zinc-800 rounded-2xl bg-zinc-900 shadow-2xl">
          <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
          <h1 className="text-3xl font-mono text-white mb-2 uppercase tracking-widest text-center">GenLayer Access</h1>
          <p className="text-zinc-400 mb-8 max-w-md text-center">Connect your wallet to verify your Case Access NFT and enter the Genesis Hack investigation portal.</p>
          <ConnectButton />
        </div>
      </main>
    );
  }

  if (!hasAccessNFT) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-zinc-950 text-white text-center">
        <img src="/GenLayer_Game_Assets/Folder 01 Access_and_UI/field_agent_pass.png" alt="Field Agent Pass Required" className="w-48 h-48 mb-6 rounded-xl border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] object-cover" />
        <h1 className="text-3xl font-mono text-red-500 mb-4">Access Denied</h1>
        <p className="text-zinc-400">You do not hold the mandatory Field Agent Pass NFT in your wallet.</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-neonBlue selection:text-black">
      {/* Header */}
      <div className="bg-black text-white p-6 md:p-8 border-b-2 border-neonBlue flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-50">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-widest font-mono glow-blue">Case File: #01</h1>
          <p className="text-neonBlue mt-2 font-mono text-sm uppercase">Subject: The Genesis Hack</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-neonBlue/10 border border-neonBlue/30 rounded-full">
            <div className="w-2 h-2 bg-neonBlue rounded-full animate-pulse shadow-[0_0_8px_#0ea5e9]"></div>
            <span className="text-[10px] font-mono text-neonBlue uppercase tracking-widest">GenLayer Bradbury</span>
          </div>
          <div className="hidden md:block">
             <ConnectButton showBalance={false} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Evidence & Envelopes */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Evidence Locker */}
          <section className="cyber-panel p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-neonBlue"></div>
            <h2 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider flex items-center gap-2">
              <Database className="text-neonBlue" /> Evidence Locker
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => setSelectedEvidence({ src: "/GenLayer_Game_Assets/Folder 02 Main_Evidence/crime_scene.png", title: "Crime Scene Photo" })}
                className="h-40 relative rounded-lg border border-zinc-700 flex flex-col items-center justify-center text-sm p-4 hover:border-neonBlue transition-colors group cursor-pointer overflow-hidden bg-black"
              >
                <img src="/GenLayer_Game_Assets/Folder 02 Main_Evidence/crime_scene.png" alt="Crime Scene" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-80 transition-opacity" />
                <FileImage className="w-8 h-8 mb-2 text-zinc-300 group-hover:text-white transition-colors relative z-10" />
                <span className="font-mono text-zinc-300 group-hover:text-white transition-colors relative z-10 drop-shadow-lg">Crime Scene Photo</span>
              </div>
              <div 
                onClick={() => setSelectedEvidence({ src: "/GenLayer_Game_Assets/Folder 02 Main_Evidence/wallet_logs.png", title: "Wallet Transaction Log" })}
                className="h-40 relative rounded-lg border border-zinc-700 flex flex-col items-center justify-center text-sm p-4 hover:border-neonBlue transition-colors group cursor-pointer overflow-hidden bg-black"
              >
                <img src="/GenLayer_Game_Assets/Folder 02 Main_Evidence/wallet_logs.png" alt="Wallet Logs" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-80 transition-opacity" />
                <FileText className="w-8 h-8 mb-2 text-zinc-300 group-hover:text-white transition-colors relative z-10" />
                <span className="font-mono text-zinc-300 group-hover:text-white transition-colors relative z-10 drop-shadow-lg">Wallet Transaction Log</span>
              </div>
              <div 
                onClick={() => setSelectedEvidence({ src: "/GenLayer_Game_Assets/Folder 02 Main_Evidence/police_report.png", title: "Police Report" })}
                className="h-40 relative rounded-lg border border-zinc-700 flex flex-col items-center justify-center text-sm p-4 hover:border-neonBlue transition-colors group cursor-pointer overflow-hidden bg-black"
              >
                <img src="/GenLayer_Game_Assets/Folder 02 Main_Evidence/police_report.png" alt="Police Report" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-80 transition-opacity" />
                <Cpu className="w-8 h-8 mb-2 text-zinc-300 group-hover:text-white transition-colors relative z-10" />
                <span className="font-mono text-zinc-300 group-hover:text-white transition-colors relative z-10 drop-shadow-lg">Police Report</span>
              </div>
            </div>
          </section>

          {/* Envelope System */}
          <section className="cyber-panel p-6 rounded-xl relative">
             <div className="absolute top-0 left-0 w-2 h-full bg-zinc-600"></div>
             <h2 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider">Encrypted Evidence Slots</h2>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Envelope 1 */}
                <div className={`p-6 rounded-lg border flex flex-col items-center text-center transition-all ${unlockedEnvelopes[0] ? 'bg-zinc-800/50 border-neonGreen' : 'bg-black/50 border-zinc-800'}`}>
                  {unlockedEnvelopes[0] ? <Unlock className="w-10 h-10 text-neonGreen mb-4" /> : <Lock className="w-10 h-10 text-zinc-600 mb-4" />}
                  <h3 className="font-mono mb-2 text-white">Envelope 1</h3>
                  {!unlockedEnvelopes[0] ? (
                    <div className="w-full mt-auto">
                       <input 
                         type="text" 
                         value={env1Code} 
                         onChange={(e) => setEnv1Code(e.target.value)}
                         placeholder="Input Oracle Code" 
                         className="w-full bg-zinc-950 border border-zinc-700 p-2 text-xs font-mono text-neonGreen mb-2 rounded focus:outline-none focus:border-neonGreen"
                       />
                       <button onClick={handleUnlockEnv1} className="w-full px-4 py-2 bg-neonGreen/20 hover:bg-neonGreen/40 text-neonGreen border border-neonGreen/50 text-xs font-mono rounded transition-colors">
                         Decrypt Clue
                       </button>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center mt-auto">
                       <img 
                        onClick={() => setSelectedEvidence({ src: "/GenLayer_Game_Assets/Folder 03 Locked_Envelopes/env1_clue.png", title: "Decrypted Clue #1" })}
                        src="/GenLayer_Game_Assets/Folder 03 Locked_Envelopes/env1_clue.png" alt="Envelope 1 Clue" className="w-full h-20 object-cover rounded mb-2 border border-neonGreen/30 cursor-pointer hover:border-neonGreen transition-all" />
                       <p className="text-xs text-neonGreen font-mono break-all animate-pulse">DECRYPTED:<br/>The hidden hex code translates to a transaction timestamp: <span className="font-bold">03:14:07</span>.</p>
                    </div>
                  )}
                </div>

                {/* Envelope 2 */}
                <div className={`p-6 rounded-lg border flex flex-col items-center text-center transition-all ${unlockedEnvelopes[1] ? 'bg-zinc-800/50 border-neonBlue' : 'bg-black/50 border-zinc-800'}`}>
                  {unlockedEnvelopes[1] ? <Unlock className="w-10 h-10 text-neonBlue mb-4 glow-blue" /> : <Lock className="w-10 h-10 text-zinc-600 mb-4" />}
                  <h3 className="font-mono mb-2 text-white">Envelope 2</h3>
                  
                  {!unlockedEnvelopes[1] ? (
                    <div className="w-full mt-auto">
                       <input 
                         type="text" 
                         value={env2Code} 
                         onChange={(e) => setEnv2Code(e.target.value)}
                         placeholder="Input Phase 2 Code" 
                         className="w-full bg-zinc-950 border border-zinc-700 p-2 text-xs font-mono text-neonBlue mb-2 rounded focus:outline-none focus:border-neonBlue"
                       />
                       <button onClick={handleUnlockEnv2} className="w-full px-4 py-2 bg-neonBlue/20 hover:bg-neonBlue/40 text-neonBlue border border-neonBlue/50 text-xs font-mono rounded transition-colors">
                         Verify & Unlock
                       </button>
                    </div>
                  ) : (
                     <div className="w-full flex flex-col items-center mt-auto">
                       <img 
                        onClick={() => setSelectedEvidence({ src: "/GenLayer_Game_Assets/Folder 03 Locked_Envelopes/env2_clue.png", title: "Decrypted Clue #2" })}
                        src="/GenLayer_Game_Assets/Folder 03 Locked_Envelopes/env2_clue.png" alt="Envelope 2 Clue" className="w-full h-20 object-cover rounded mb-2 border border-neonBlue/30 cursor-pointer hover:border-neonBlue transition-all" />
                       <p className="text-xs text-neonBlue font-mono animate-pulse">Clue: The timestamp matches a single node operator known only as "The Architect." Submit the culprit's true identity to the portal.</p>
                     </div>
                  )}
                </div>

                {/* Envelope 3 */}
                <div className={`p-6 rounded-lg border flex flex-col items-center text-center transition-all ${unlockedEnvelopes[2] ? 'bg-zinc-800/50 border-yellow-500' : 'bg-black/50 border-zinc-800 opacity-60'}`}>
                  {unlockedEnvelopes[2] ? <Unlock className="w-10 h-10 text-yellow-500 mb-4 animate-pulse" /> : <Lock className="w-10 h-10 text-zinc-600 mb-4" />}
                  <h3 className="font-mono mb-2 text-white">Envelope 3</h3>
                  {!unlockedEnvelopes[2] ? (
                    <p className="text-xs text-zinc-500 mt-auto">Locked pending previous solves.</p>
                  ) : (
                    <div className="w-full flex flex-col items-center mt-auto">
                       <img 
                        onClick={() => setSelectedEvidence({ src: "/GenLayer_Game_Assets/Folder 03 Locked_Envelopes/env3_final.png", title: "Final Suspect Identified" })}
                        src="/GenLayer_Game_Assets/Folder 03 Locked_Envelopes/env3_final.png" alt="Envelope 3 Clue" className="w-full h-20 object-cover rounded mb-2 border border-yellow-500/30 cursor-pointer hover:border-yellow-500 transition-all" />
                       <p className="text-xs text-yellow-500 font-mono mt-auto text-balance">Profile complete. Target identified as ALEX. Proceed to Portal.</p>
                    </div>
                  )}
                </div>
             </div>
          </section>

        </div>

        {/* Right Column: Portal & Hints */}
        <div className="space-y-8">
          
          {/* Verification Portal */}
          <section className={`p-6 rounded-xl border shadow-2xl relative overflow-hidden transition-all duration-700 ${caseSolved ? 'bg-zinc-900 border-neonGreen glow-green' : 'cyber-panel border-zinc-700'}`}>
            <h3 className={`text-xl font-bold mb-6 uppercase flex items-center gap-2 ${caseSolved ? 'text-neonGreen' : 'text-neonBlue'}`}>
              <ShieldAlert /> {caseSolved ? 'Case Resolved' : 'Verification Portal'}
            </h3>
            
            {caseSolved ? (
              <div className="text-center py-8">
                <Unlock className="w-16 h-16 text-neonGreen mx-auto mb-4 glow-green" />
                <p className="text-white font-mono uppercase tracking-widest text-lg mb-2">Master Detective</p>
                <p className="text-sm text-zinc-400">SBT Minted to your connected wallet.</p>
              </div>
            ) : (
              <>
                <label className="block text-sm mb-2 text-zinc-400 font-mono">Submit the Final Hash:</label>
                <input 
                  type="text" 
                  value={solutionHash}
                  onChange={(e) => setSolutionHash(e.target.value)}
                  className="w-full bg-black border border-zinc-600 p-3 mb-6 rounded text-neonGreen font-mono focus:outline-none focus:border-neonGreen focus:ring-1 focus:ring-neonGreen transition-all" 
                  placeholder="0x..."
                />
                 <button 
                  onClick={handleVerifySolution}
                  disabled={!solutionHash || isMinting || isConfirming}
                  className="w-full bg-neonBlue hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-4 rounded uppercase tracking-widest transition-all glow-blue group relative overflow-hidden"
                >
                   {isMinting ? 'Waiting for approval...' : isConfirming ? 'AI Verification in progress...' : 'Submit Evidence'}
                </button>
              </>
            )}
          </section>

          {/* Hint System */}
          <section className="cyber-panel p-6 rounded-xl text-center">
             <h3 className="text-zinc-400 text-sm font-bold uppercase mb-4">Investigator Assistance</h3>
             <p className="text-xs text-zinc-500 mb-4">Stuck? Pay gas fees to query the GenLayer Oracle network for a hint.</p>
             <button 
                onClick={handleUnlockHint}
                className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 hover:border-zinc-500 py-3 rounded text-sm text-white font-mono flex justify-center items-center gap-2 transition-all"
             >
                <Lock className="w-4 h-4 text-zinc-400" /> Unlock Hint (0.1 GEN)
             </button>
          </section>

        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedEvidence && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
          onClick={() => setSelectedEvidence(null)}
        >
           <div className="absolute inset-0 bg-black/90 backdrop-blur-md"></div>
           
           <div 
             className="relative max-w-5xl w-full flex flex-col items-center z-10"
             onClick={(e) => e.stopPropagation()}
           >
              <button 
                onClick={() => setSelectedEvidence(null)}
                className="absolute -top-12 right-0 text-white font-mono hover:text-neonBlue transition-colors flex items-center gap-2 text-sm uppercase"
              >
                [ Close Terminal ]
              </button>
              
              <div className="cyber-panel p-2 rounded-lg glow-blue overflow-hidden relative group">
                <img 
                  src={selectedEvidence.src} 
                  alt={selectedEvidence.title} 
                  className="max-h-[80vh] w-auto rounded border border-zinc-800" 
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/80 p-4 border-t border-neonBlue translate-y-full group-hover:translate-y-0 transition-transform">
                   <p className="font-mono text-neonBlue text-sm uppercase tracking-widest">{selectedEvidence.title}</p>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
