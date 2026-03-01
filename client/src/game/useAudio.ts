import { useEffect, useRef, useState, useMemo } from 'react';

// Using local reliable audio assets from public/sounds
const basePath = import.meta.env.BASE_URL;

const SOUND_URLS = {
  select: `${basePath}sounds/button-16a.mp3`,
  move: `${basePath}sounds/marching.mp3`,
  attack: `${basePath}sounds/clong-2.mp3`,
  victory: `${basePath}sounds/button-21.mp3`,
  defeat: `${basePath}sounds/button-19.mp3`,
  siege: `${basePath}sounds/bomb-falling-and-exploding-01.mp3`,
  menu: `${basePath}sounds/page-flip-03.mp3`,
};

const AMBIENT_URLS = {
  wood: `${basePath}sounds/wood-chop-axe-hit-02.mp3`,
  wind: `${basePath}sounds/wind-howl-01.mp3`,
  shovel: `${basePath}sounds/shovel-into-snow-1.mp3`,
};

const BGM_URL = `${basePath}sounds/fire-1.mp3`;

export const useAudio = () => {
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const [isMusicStarted, setIsMusicStarted] = useState(false);

  // Pre-load SFX
  const sfxObjects = useMemo(() => {
    const objs: Record<string, HTMLAudioElement> = {};
    Object.entries(SOUND_URLS).forEach(([name, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      objs[name] = audio;
    });
    return objs;
  }, []);

  // Pre-load Ambient sounds
  const ambientObjects = useMemo(() => {
    const objs: Record<string, HTMLAudioElement> = {};
    Object.entries(AMBIENT_URLS).forEach(([name, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      objs[name] = audio;
    });
    return objs;
  }, []);

  useEffect(() => {
    bgmRef.current = new Audio(BGM_URL);
    bgmRef.current.loop = true;
    bgmRef.current.volume = volume;
    
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    };
  }, []);

  // Ambient sound scheduler
  useEffect(() => {
    if (!isMusicStarted || isMuted) {
      // If muted, stop all active ambient sounds immediately
      Object.values(ambientObjects).forEach(amb => {
        amb.pause();
        amb.currentTime = 0;
      });
      return;
    }

    const playRandomAmbient = () => {
      if (isMuted) return;
      
      const keys = Object.keys(ambientObjects);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const audio = ambientObjects[randomKey];
      
      if (audio) {
        audio.currentTime = 0;
        audio.volume = volume * 0.6;
        audio.play().catch(() => {});
      }

      // Schedule next sound between 15 and 45 seconds
      const nextDelay = 15000 + Math.random() * 30000;
      return setTimeout(playRandomAmbient, nextDelay);
    };

    const timer = setTimeout(playRandomAmbient, 10000); // Start first one after 10s
    return () => clearTimeout(timer);
  }, [isMusicStarted, isMuted, ambientObjects]); // Remove volume from deps to avoid restarting timer on volume change

  useEffect(() => {
    const currentVol = isMuted ? 0 : volume;
    if (bgmRef.current) bgmRef.current.volume = currentVol;
    
    // Update all SFX volumes
    Object.values(sfxObjects).forEach(sfx => {
      sfx.volume = currentVol;
    });
    
    // Update all Ambient volumes
    Object.values(ambientObjects).forEach(amb => {
      amb.volume = currentVol * 0.6;
    });
  }, [volume, isMuted, sfxObjects, ambientObjects]);

  const playSound = (soundName: keyof typeof SOUND_URLS) => {
    if (isMuted) return;
    const audio = sfxObjects[soundName];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  const startMusic = () => {
    if (bgmRef.current && bgmRef.current.paused) {
      bgmRef.current.play().then(() => {
        setIsMusicStarted(true);
      }).catch(_e => console.log("BGM play blocked by browser policy"));
    }
  };

  return {
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    playSound,
    startMusic
  };
};
