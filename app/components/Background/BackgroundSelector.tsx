import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Video, Box, Palette, Image } from 'lucide-react'
import type { BackgroundConfig } from './index';

interface BackgroundSelectorProps {
  current: BackgroundConfig;
  onChange: (config: BackgroundConfig) => void;
  onClose: () => void;
  loops: { id: string; name: string }[];
}

export default function BackgroundSelector({ current, onChange, onClose, loops }: BackgroundSelectorProps) {
  const [unsplashQuery, setUnsplashQuery] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-200">
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
          {/* 3D Scenes */}
          <div>
            <h3 className="text-muted-foreground text-sm font-medium mb-3 flex items-center gap-2">
              <Box className="w-4 h-4" /> 3D Scenes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => onChange({ type: 'room' })}
                className={`p-4 rounded-xl border transition-all text-left ${current.type === 'room' ? 'border-primary bg-primary/20' : 'glass-button'
                  }`}
              >
                <div className="font-medium text-foreground">Study Room</div>
                <div className="text-xs text-muted-foreground">Interactive 3D environment</div>
              </button>
              <button
                onClick={() => onChange({ type: 'cafe' })}
                className={`p-4 rounded-xl border transition-all text-left ${current.type === 'cafe' ? 'border-primary bg-primary/20' : 'glass-button'
                  }`}
              >
                <div className="font-medium text-foreground">Cozy Cafe</div>
                <div className="text-xs text-muted-foreground">Warm coffee shop vibes</div>
              </button>
            </div>
          </div>

          {/* Animated Loops */}
          <div>
            <h3 className="text-muted-foreground text-sm font-medium mb-3 flex items-center gap-2">
              <Video className="w-4 h-4" /> Animated Loops
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {loops.map((loop) => (
                <button
                  key={loop.id}
                  onClick={() => onChange({ type: 'video', videoId: loop.id })}
                  className={`relative group overflow-hidden rounded-xl border transition-all text-left aspect-video ${current.type === 'video' && current.videoId === loop.id
                      ? 'border-primary ring-2 ring-primary/50'
                      : 'glass-button'
                    }`}
                >
                  <img
                    src={`https://img.youtube.com/vi/${loop.id}/mqdefault.jpg`}
                    alt={loop.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 font-medium text-foreground text-sm">
                    {loop.name}
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
              <Button
                onClick={() => onChange({ type: 'image', imageUrl: `https://source.unsplash.com/random/1920x1080/?${unsplashQuery || 'lofi,study'}` })}
                className="w-full"
                variant="secondary"
              >
                Load Random Unsplash Image
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
