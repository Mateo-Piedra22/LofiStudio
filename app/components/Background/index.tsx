'use client';

import { useState, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import variants from '@/lib/config/background-variants.json';
import BackgroundSelector from './BackgroundSelector';
import loopsJson from '@/lib/config/background-loops.json';

export type BackgroundType = 'gradient' | 'video' | 'image';

export interface BackgroundConfig {
  type: BackgroundType;
  videoId?: string; // For YouTube video backgrounds
  videoUrl?: string; // For direct video URLs
  imageUrl?: string;
}

const DEFAULT_VIDEO_ID = 'jfKfPfyJRdk';
const SCENIC_LOOPS = (loopsJson as any).loops as Array<{ id: string; name: string }>;
const ROOM_VARIANTS = (variants as any).room as Array<{ id: string; name: string }>;
const CAFE_VARIANTS = (variants as any).cafe as Array<{ id: string; name: string }>;

export default function Background() {
  const [config, setConfig] = useLocalStorage<BackgroundConfig>('backgroundConfig', { type: 'gradient' });
  const [showSelector, setShowSelector] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [roomIdx, setRoomIdx] = useLocalStorage('roomVariantIndex', 0);
  const [cafeIdx, setCafeIdx] = useLocalStorage('cafeVariantIndex', 0);
  const [playerSize, setPlayerSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const t = (config as any)?.type as string | undefined;
    if (t === 'room') {
      const next = (Number(roomIdx) + 1) % (ROOM_VARIANTS?.length || 1);
      setRoomIdx(next as any);
      const id = ROOM_VARIANTS[next]?.id || ROOM_VARIANTS[0]?.id || DEFAULT_VIDEO_ID;
      setConfig({ type: 'video', videoId: id });
    } else if (t === 'cafe') {
      const next = (Number(cafeIdx) + 1) % (CAFE_VARIANTS?.length || 1);
      setCafeIdx(next as any);
      const id = CAFE_VARIANTS[next]?.id || CAFE_VARIANTS[0]?.id || DEFAULT_VIDEO_ID;
      setConfig({ type: 'video', videoId: id });
    }
  }, [config?.type]);

  useEffect(() => {
    const ratio = 16 / 9;
    const compute = () => {
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1920;
      const vh = typeof window !== 'undefined' ? window.innerHeight : 1080;
      const width = Math.max(vw, Math.ceil(ratio * vh));
      const height = Math.max(vh, Math.ceil(vw / ratio));
      setPlayerSize({ w: width, h: height });
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  useEffect(() => {
    const id = config?.videoId;
    if (config.type === 'video' && id) {
      const ri = ROOM_VARIANTS.findIndex((v) => v.id === id);
      if (ri >= 0 && ri !== Number(roomIdx)) setRoomIdx(ri as any);
      const ci = CAFE_VARIANTS.findIndex((v) => v.id === id);
      if (ci >= 0 && ci !== Number(cafeIdx)) setCafeIdx(ci as any);
    }
  }, [config.type, config.videoId]);

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
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60"
              style={{ width: `${playerSize.w}px`, height: `${playerSize.h}px` }}
            >
              <div className="absolute inset-0">
                <YouTube
                  videoId={config.videoId}
                  opts={{
                    height: '100%',
                    width: '100%',
                    playerVars: {
                      autoplay: 1,
                      controls: 0,
                      rel: 0,
                      mute: 1,
                      playsinline: 1,
                      loop: 1,
                      playlist: config.videoId,
                      iv_load_policy: 3,
                      disablekb: 1,
                    },
                  } as YouTubeProps['opts']}
                  onReady={(e: Parameters<NonNullable<YouTubeProps['onReady']>>[0]) => {
                    try {
                      const iframe = e.target.getIframe();
                      if (iframe && iframe.style) {
                        iframe.style.position = 'absolute';
                        iframe.style.top = '0';
                        iframe.style.left = '0';
                        iframe.style.width = '100%';
                        iframe.style.height = '100%';
                      }
                      e.target.mute();
                      e.target.setPlaybackQuality('hd1080');
                      e.target.playVideo();
                    } catch {}
                  }}
                  onError={() => { try { setConfig({ type: 'video', videoId: DEFAULT_VIDEO_ID }); } catch {} }}
                />
              </div>
            </div>
            <div className="absolute inset-0" style={{ backgroundColor: 'hsl(var(--background) / var(--glass-opacity))' }} />
          </div>
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
