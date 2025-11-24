'use client';

import { useState } from 'react';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import { Play, Pause, ChevronUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { useIsMobile } from '@/hooks/use-mobile';

interface MiniPlayerProps {
  video: {
    title: string;
    thumbnail: string;
  };
  onExpand?: () => void;
}

export default function MiniPlayer({ video, onExpand }: MiniPlayerProps) {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState<number>(50);

  const togglePlay = () => setPlaying((v) => !v);
  const openExpanded = () => { setExpanded(true); if (onExpand) onExpand(); };
  const closeExpanded = () => setExpanded(false);

  if (isMobile) {
    return (
      <>
        <div className="fixed inset-x-0 bottom-0 z-40">
          <div className="mx-3 mb-3 glass-panel rounded-full border px-3 py-2 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-3 min-w-0">
              <Button onClick={togglePlay} variant="default" size="icon" className="h-11 w-11 rounded-full">
                {playing ? (
                  <AnimatedIcon animationSrc="/lottie/Pause.json" fallbackIcon={Pause} className="w-5 h-5" />
                ) : (
                  <AnimatedIcon animationSrc="/lottie/Play.json" fallbackIcon={Play} className="w-5 h-5 ml-0.5" />
                )}
              </Button>
              <p className="text-sm font-medium truncate max-w-[60vw]">{video?.title || 'Sin música'}</p>
            </div>
            <Button onClick={openExpanded} variant="ghost" size="icon" className="h-11 w-11 rounded-full">
              <AnimatedIcon animationSrc="/lottie/ChevronUp.json" fallbackIcon={ChevronUp} className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <Dialog open={expanded} onOpenChange={setExpanded}>
          <DialogContent className="fixed inset-0 m-0 p-0 w-full max-w-none h-[100dvh] rounded-none bg-background/95 backdrop-blur-md border-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                <p className="text-sm font-medium truncate">{video?.title || 'Reproductor'}</p>
                <Button onClick={closeExpanded} variant="ghost" size="icon" className="h-11 w-11">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex-1 min-h-0 px-4 py-6 space-y-6">
                <div className="flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-accent/20 flex items-center justify-center">
                    <div className="w-6 h-6 bg-primary rounded-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-6">
                  <Button onClick={togglePlay} className="h-14 w-14 rounded-full">
                    {playing ? (
                      <AnimatedIcon animationSrc="/lottie/Pause.json" fallbackIcon={Pause} className="w-6 h-6" />
                    ) : (
                      <AnimatedIcon animationSrc="/lottie/Play.json" fallbackIcon={Play} className="w-6 h-6 ml-0.5" />
                    )}
                  </Button>
                </div>
                <div className="px-8">
                  <Slider value={[volume]} onValueChange={(v) => setVolume(v[0] as number)} />
                </div>
                <div className="px-4">
                  <div className="glass-panel rounded-xl border p-4 h-48 overflow-y-auto">
                    <p className="text-sm text-muted-foreground">Lista de reproducción</p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="glass-widget p-4 flex items-center gap-3 shadow-lg">
      <div className="flex-1 min-w-0">
        <p className="text-foreground text-sm font-medium truncate">{video?.title || 'Now Playing'}</p>
        <p className="text-muted-foreground text-xs">Siempre visible</p>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={togglePlay} variant="ghost" size="icon" className="h-11 w-11">
          {playing ? (
            <AnimatedIcon animationSrc="/lottie/Pause.json" fallbackIcon={Pause} className="w-5 h-5" />
          ) : (
            <AnimatedIcon animationSrc="/lottie/Play.json" fallbackIcon={Play} className="w-5 h-5 ml-0.5" />
          )}
        </Button>
        <Button onClick={openExpanded} variant="ghost" size="icon" className="h-11 w-11">
          <AnimatedIcon animationSrc="/lottie/ChevronUp.json" fallbackIcon={ChevronUp} className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
