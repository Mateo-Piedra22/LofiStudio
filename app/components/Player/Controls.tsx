'use client';

import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface ControlsProps {
  isPlaying: boolean;
  volume: number;
  onPlayPause: () => void;
  onVolumeChange: (volume: number) => void;
}

export default function Controls({ isPlaying, volume, onPlayPause, onVolumeChange }: ControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={onPlayPause}
        size="icon"
        className="rounded-full bg-primary hover:bg-primary/90 w-12 h-12"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
      </Button>

      <div className="flex items-center gap-2 flex-1 max-w-xs">
        <button
          onClick={() => onVolumeChange(volume === 0 ? 50 : 0)}
          className="text-foreground hover:text-primary transition-colors"
        >
          {volume === 0 ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="flex-1 h-1 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
        />
        <span className="text-foreground text-sm min-w-[3ch] text-right">{volume}</span>
      </div>
    </div>
  );
}
