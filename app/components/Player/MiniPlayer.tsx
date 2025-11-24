'use client';

import AnimatedIcon from '@/app/components/ui/animated-icon';
import { Music, Maximize2 } from 'lucide-react'

interface MiniPlayerProps {
  video: {
    title: string;
    thumbnail: string;
  };
  onExpand: () => void;
}

export default function MiniPlayer({ video, onExpand }: MiniPlayerProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100]">
      <div className="glass-widget border-t px-4 py-3 flex items-center gap-3">
      <div className="relative flex-shrink-0">
        <img 
          src={video.thumbnail || "/placeholder.svg"} 
          alt={video.title} 
          className="w-12 h-12 object-cover rounded shadow-md" 
        />
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded">
          <AnimatedIcon animationSrc="/lottie/Music.json" fallbackIcon={Music} className="w-4 h-4 text-foreground animate-pulse" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-foreground text-sm font-medium truncate">{video.title}</p>
        <p className="text-muted-foreground text-xs">Now Playing</p>
      </div>
      <button
        onClick={onExpand}
        className="text-muted-foreground hover:text-foreground hover:bg-accent/10 p-2 rounded-lg transition-all flex-shrink-0"
        aria-label="Expand player"
        title="Expand Player"
      >
        <AnimatedIcon animationSrc="/lottie/Maximize2.json" fallbackIcon={Maximize2} className="w-5 h-5" />
      </button>
      </div>
    </div>
  );
}
