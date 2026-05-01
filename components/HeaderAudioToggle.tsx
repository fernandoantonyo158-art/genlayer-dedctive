"use client";

import { useAudio } from "@/contexts/AudioContext";
import { Volume2, VolumeX } from "lucide-react";

export default function HeaderAudioToggle() {
  const { soundEnabled, toggleSound } = useAudio();

  return (
    <button
      onClick={() => toggleSound()}
      className={`flex items-center justify-center w-8 h-8 border rounded-full transition-all hover:shadow-[0_0_12px_rgba(212,175,55,0.4)] bg-transparent ${
        soundEnabled
          ? 'border-[#d4af37]/40 text-[#d4af37]'
          : 'border-zinc-700 text-zinc-600'
      }`}
    >
      {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
    </button>
  );
}
