"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

interface AudioContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
  playSFX: (type: string) => void;
  startBGM: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const SFX = {
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  mechanical: "https://assets.mixkit.co/active_storage/sfx/2576/2576-preview.mp3",
  success: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3",
  error: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  paper: "https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3",
  typewriter: "/audio/typewriter.mp3",
  investigation_theme: "/investigation-theme.mp3"
};

export function AudioProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const bgm = useRef<HTMLAudioElement | null>(null);

  /* Create the BGM Audio object exactly once */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const audio = new Audio('/investigation-theme.mp3');
    audio.loop = true;
    audio.volume = 0.3;
    bgm.current = audio;
    return () => { audio.pause(); bgm.current = null; };
  }, []); // ← empty deps: never re-creates

  /* React to mute toggle — immediately stop or resume BGM */
  useEffect(() => {
    const audio = bgm.current;
    if (!audio) return;
    if (!soundEnabled) {
      audio.pause();
    } else if (audio.currentTime > 0) {
      audio.play().catch(() => {});
    }
  }, [soundEnabled]);

  const toggleSound = () => setSoundEnabled(prev => !prev);

  const playSFX = (type: string) => {
    if (!soundEnabled) return;
    const audioUrl = SFX[type as keyof typeof SFX];
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const startBGM = () => {
    const audio = bgm.current;
    if (!audio || !soundEnabled) return;
    audio.play().catch(() => {});
  };

  return (
    <AudioContext.Provider value={{ soundEnabled, toggleSound, playSFX, startBGM }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
