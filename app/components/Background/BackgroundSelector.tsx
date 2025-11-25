import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Video, Box, Palette, Image } from 'lucide-react'
import type { BackgroundConfig } from './index';
import { SCENES } from '@/lib/data/scenes';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

interface BackgroundSelectorProps {
  current: BackgroundConfig;
  onChange: (config: BackgroundConfig) => void;
  onClose: () => void;
}

export default function BackgroundSelector({ current, onChange, onClose }: BackgroundSelectorProps) {
  const [unsplashQuery, setUnsplashQuery] = useState('')
  const [unsplashSeed, setUnsplashSeed] = useState(0)
  const [selectedSceneId, setSelectedSceneId] = useLocalStorage<string>('selectedSceneId', SCENES[0]?.id || 'study')
  if (typeof window === 'undefined') return null
  const buildUnsplashQuery = (q: string) => {
    const base = (q || 'lofi,study').trim()
    const parts = base.split(',').map((p) => p.trim().replace(/\s+/g, '+')).filter(Boolean)
    return parts.join(',')
  }
  const queryStr = useMemo(() => buildUnsplashQuery(unsplashQuery), [unsplashQuery])
  const unsplashResults = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => `https://source.unsplash.com/400x300/?${queryStr}&sig=${unsplashSeed * 100 + i + 1}`)
  }, [queryStr, unsplashSeed])
  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-200">
      <Card className="w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-foreground">
            <span>Customize Atmosphere</span>
            <Button onClick={onClose} size="icon" variant="ghost" className="hover:bg-accent hover:text-accent-foreground">
              <X className="w-5 h-5" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
          <h3 className="text-muted-foreground text-sm font-medium mb-3 flex items-center gap-2">
            <Video className="w-4 h-4" /> Scenes & Animated Loops
          </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {SCENES.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => setSelectedSceneId(scene.id)}
                  className={`relative group overflow-hidden rounded-xl border transition-all text-left aspect-video ${selectedSceneId === scene.id ? 'border-primary ring-2 ring-primary/50' : 'glass-button'}`}
                >
                  <img
                    src={scene.thumbnail}
                    alt={scene.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 font-medium text-foreground text-sm">
                    {scene.name}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              {(SCENES.find((s) => s.id === selectedSceneId)?.variants || []).map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => onChange({ type: 'video', videoId: variant.youtubeId })}
                  className={`relative group overflow-hidden rounded-xl border transition-all text-left aspect-video ${current.type === 'video' && current.videoId === variant.youtubeId ? 'border-primary ring-2 ring-primary/50' : 'glass-button'}`}
                >
                  <img
                    src={`https://img.youtube.com/vi/${variant.youtubeId}/mqdefault.jpg`}
                    alt={variant.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 font-medium text-foreground text-sm">
                    {variant.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-muted-foreground text-sm font-medium mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Minimalist
            </h3>
            <button
              onClick={() => onChange({ type: 'gradient' })}
              className={`w-full p-4 rounded-xl border transition-all text-left ${current.type === 'gradient' ? 'border-primary bg-primary/20' : 'glass-button'
                }`}
            >
              <div className="font-medium text-foreground">Deep Gradient</div>
              <div className="text-xs text-muted-foreground">Simple, distraction-free colors</div>
            </button>
          </div>

          <div>
            <h3 className="text-muted-foreground text-sm font-medium mb-3 flex items-center gap-2">
              <Image className="w-4 h-4" /> Unsplash Backgrounds
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Search Unsplash (e.g., cozy room, rainy day)"
                className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border text-foreground text-sm"
                onChange={(e) => setUnsplashQuery(e.target.value)}
              />
              <Button onClick={() => onChange({ type: 'image', imageUrl: `https://source.unsplash.com/1920x1080/?${queryStr}&sig=${Date.now()}` })} className="w-full" variant="secondary">Load Random Unsplash Image</Button>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                {unsplashResults.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => onChange({ type: 'image', imageUrl: url })}
                    className={`relative group overflow-hidden rounded-xl border transition-all text-left aspect-video ${current.type === 'image' && current.imageUrl === url ? 'border-primary ring-2 ring-primary/50' : 'glass-button'}`}
                    aria-label={`Unsplash result ${idx + 1}`}
                  >
                    <img src={url} alt={unsplashQuery || 'unsplash'} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                  </button>
                ))}
              </div>
              <Button onClick={() => setUnsplashSeed((v) => v + 1)} className="w-full" variant="outline">Regenerate Results</Button>
              <Button
                onClick={() => window.open('https://unsplash.com/wallpapers', '_blank', 'noopener')}
                className="w-full"
                variant="outline"
              >
                Open Unsplash Wallpapers
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>,
    document.body
  );
}
