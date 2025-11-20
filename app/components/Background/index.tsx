'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import RoomScene from './AnimatedBackgrounds/RoomScene';
import CafeScene from './AnimatedBackgrounds/CafeScene';
import BackgroundSelector from './BackgroundSelector';
import loopsJson from '@/lib/config/background-loops.json';

export type BackgroundType = 'room' | 'cafe' | 'gradient' | 'video' | 'image';

export interface BackgroundConfig {
  type: BackgroundType;
  videoId?: string; // For YouTube video backgrounds
  videoUrl?: string; // For direct video URLs
  imageUrl?: string;
}

const DEFAULT_VIDEO_ID = 'jfKfPfyJRdk'; // Lofi Girl Radio (just as an example, or a specific loop)
// Better loop: "Lofi Hip Hop Radio - Beats to Relax/Study to" is a stream.
// Let's use some specific scenic loops.
const SCENIC_LOOPS = (loopsJson as any).loops as Array<{ id: string; name: string }>;

export default function Background() {
  const [config, setConfig] = useLocalStorage<BackgroundConfig>('backgroundConfig', { type: 'gradient' });
  const [showSelector, setShowSelector] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const open = () => setShowSelector(true)
    const close = () => setShowSelector(false)
    window.addEventListener('open-background-selector', open)
    window.addEventListener('close-background-selector', close)
    return () => {
      window.removeEventListener('open-background-selector', open)
      window.removeEventListener('close-background-selector', close)
    }
  }, [])

  if (!isLoaded) return null;

  return (
    <>
      <div className="fixed inset-0 -z-50 overflow-hidden">
        {config.type === 'gradient' && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 animate-gradient-xy" />
        )}

        {config.type === 'video' && config.videoId && (
          <div className="absolute inset-0 pointer-events-none">
            <iframe
              src={`https://www.youtube.com/embed/${config.videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${config.videoId}&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&playsinline=1&vq=highres`}
              className="w-full h-full scale-150 opacity-60"
              allow="autoplay; encrypted-media"
              style={{ pointerEvents: 'none' }}
            />
            <div className="absolute inset-0 bg-background/40" />
          </div>
        )}

        {(config.type === 'room' || config.type === 'cafe') && (
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            <Suspense fallback={null}>
              {config.type === 'room' && <RoomScene />}
              {config.type === 'cafe' && <CafeScene />}
            </Suspense>
          </Canvas>
        )}
      </div>

      {showSelector && (
        <BackgroundSelector
          current={config}
          onChange={setConfig}
          onClose={() => setShowSelector(false)}
          loops={SCENIC_LOOPS}
        />
      )}
      {config.type === 'video' && config.videoUrl && (
        <video src={config.videoUrl} autoPlay muted loop playsInline preload="auto" className="fixed inset-0 -z-50 w-full h-full object-cover opacity-60" />
      )}
      {config.type === 'image' && config.imageUrl && (
        <img src={config.imageUrl} className="fixed inset-0 -z-50 w-full h-full object-cover" />
      )}
    </>
  );
}
