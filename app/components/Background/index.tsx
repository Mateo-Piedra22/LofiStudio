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
  imageKey?: string;
  videoKey?: string;
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
  const [imgErrorCount, setImgErrorCount] = useState(0);
  const [cachedImageUrl, setCachedImageUrl] = useState<string | null>(null);
  const [cachedVideoUrl, setCachedVideoUrl] = useState<string | null>(null);
  const [backgroundBlur] = useLocalStorage('backgroundBlur', 0);

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

  useEffect(() => {
    let active = true
    const openDB = () => new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open('lofi-cache', 1)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains('background')) db.createObjectStore('background')
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    const putBlob = async (key: string, blob: Blob) => {
      const db = await openDB()
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('background', 'readwrite')
        const store = tx.objectStore('background')
        const r = store.put(blob, key)
        r.onsuccess = () => resolve()
        r.onerror = () => reject(r.error)
      })
      db.close()
    }
    const getBlob = async (key: string) => {
      const db = await openDB()
      const blob = await new Promise<Blob | null>((resolve, reject) => {
        const tx = db.transaction('background')
        const store = tx.objectStore('background')
        const r = store.get(key)
        r.onsuccess = () => resolve((r.result as Blob) || null)
        r.onerror = () => reject(r.error)
      })
      db.close()
      return blob
    }
    const cacheImage = async () => {
      if (config.type !== 'image') return
      const key = config.imageKey || 'background_image'
      if (config.imageKey) {
        const blob = await getBlob(key)
        if (blob && active) setCachedImageUrl(URL.createObjectURL(blob))
        return
      }
      const url = config.imageUrl
      if (!url) return
      try {
        const u = new URL(url, typeof window !== 'undefined' ? window.location.href : 'http://localhost')
        if (u.origin !== (typeof window !== 'undefined' ? window.location.origin : 'http://localhost')) {
          return
        }
        const res = await fetch(url)
        if (!res.ok) return
        const blob = await res.blob()
        await putBlob(key, blob)
        if (active) {
          setCachedImageUrl(URL.createObjectURL(blob))
          setConfig({ ...config, imageKey: key })
        }
      } catch {}
    }
    const cacheVideo = async () => {
      if (config.type !== 'video') return
      if (config.videoId) return
      const key = config.videoKey || 'background_video'
      if (config.videoKey) {
        const blob = await getBlob(key)
        if (blob && active) setCachedVideoUrl(URL.createObjectURL(blob))
        return
      }
      const url = config.videoUrl
      if (!url) return
      try {
        const res = await fetch(url)
        if (!res.ok) return
        const blob = await res.blob()
        await putBlob(key, blob)
        if (active) {
          setCachedVideoUrl(URL.createObjectURL(blob))
          setConfig({ ...config, videoKey: key })
        }
      } catch {}
    }
    cacheImage()
    cacheVideo()
    return () => { active = false }
  }, [config])

  if (!isLoaded) return null;

  return (
    <>
      <div className="fixed inset-0 -z-50 overflow-hidden">
        {config.type === 'gradient' && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 animate-gradient-xy" style={{ filter: `blur(${Number(backgroundBlur) || 0}px)` }} />
        )}

        {config.type === 'video' && config.videoId && (
          <div className="yt-bg-container">
            <div className="yt-bg-iframe opacity-60" style={{ filter: `blur(${Number(backgroundBlur) || 0}px)` }}>
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
      {config.type === 'video' && (config.videoUrl || cachedVideoUrl) && (
        <video src={cachedVideoUrl || config.videoUrl} autoPlay muted loop playsInline preload="auto" className="fixed inset-0 -z-50 w-full h-full object-cover opacity-60" style={{ filter: `blur(${Number(backgroundBlur) || 0}px)` }} />
      )}
      {config.type === 'image' && (cachedImageUrl || (config.imageUrl && !config.imageKey)) && (
        <img
          src={cachedImageUrl || config.imageUrl}
          className="fixed inset-0 -z-50 w-full h-full object-cover"
          style={{ filter: `blur(${Number(backgroundBlur) || 0}px)` }}
          onError={() => {
            try {
              if (imgErrorCount < 2) {
                setImgErrorCount((v) => v + 1);
                const fallback = `https://source.unsplash.com/1920x1080/?${encodeURIComponent('lofi,study')}&sig=${Date.now()}`;
                setConfig({ type: 'image', imageUrl: fallback });
              } else {
                setConfig({ type: 'gradient' });
              }
            } catch {}
          }}
        />
      )}
    </>
  );
}
