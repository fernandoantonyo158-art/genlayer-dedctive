"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  const [bgmRef, setBgmRef] = useState<HTMLAudioElement | null>(null);
  const [autoStartBGM, setAutoStartBGM] = useState(false);

  // Initialize background music and set up first interaction listener
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const bgm = new Audio('/investigation-theme.mp3');
      bgm.loop = true;
      bgm.volume = 0.3;
      setBgmRef(bgm);

      // Set up first interaction listener to handle autoplay policies
      const handleFirstInteraction = () => {
        if (bgm.paused && soundEnabled) {
          bgm.play().catch(() => {});
          // Remove listener after first interaction
          document.removeEventListener('click', handleFirstInteraction);
          document.removeEventListener('keydown', handleFirstInteraction);
        }
      };

      // Add event listeners for first user interaction
      document.addEventListener('click', handleFirstInteraction, { once: false });
      document.addEventListener('keydown', handleFirstInteraction, { once: false });
      
      return () => {
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
      };
    }
    return () => {
      if (bgmRef) {
        bgmRef.pause();
      }
    };
  }, [soundEnabled]);

  // Handle BGM play/pause based on sound enabled state and auto-start flag
  useEffect(() => {
    if (bgmRef && autoStartBGM) {
      if (soundEnabled) {
        bgmRef.play().catch(() => {});
      } else {
        bgmRef.pause();
      }
    }
  }, [soundEnabled, bgmRef, autoStartBGM]);

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const playSFX = (type: string) => {
    if (!soundEnabled) return;
    
    const audioUrl = SFX[type as keyof typeof SFX];
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const startBGM = () => {
    setAutoStartBGM(true);
    if (bgmRef && soundEnabled) {
      bgmRef.play().catch(() => {});
    }
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
