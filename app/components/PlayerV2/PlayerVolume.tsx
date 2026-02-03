/**
 * PlayerVolume Component
 * Volume slider with mute toggle
 */

'use client';

import { memo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { usePlayerStore } from '@/lib/stores/player.store';
import { cn } from '@/lib/utils';

interface PlayerVolumeProps {
    showSlider?: boolean;
    vertical?: boolean;
    className?: string;
}

function getVolumeIcon(volume: number, muted: boolean) {
    if (muted || volume === 0) return VolumeX;
    if (volume < 33) return Volume;
    if (volume < 66) return Volume1;
    return Volume2;
}

export const PlayerVolume = memo(function PlayerVolume({
    showSlider = true,
    vertical = false,
    className,
}: PlayerVolumeProps) {
    const volume = usePlayerStore(s => s.volume);
    const muted = usePlayerStore(s => s.muted);
    const setVolume = usePlayerStore(s => s.setVolume);
    const toggleMute = usePlayerStore(s => s.toggleMute);

    const [isHovering, setIsHovering] = useState(false);

    const VolumeIcon = getVolumeIcon(volume, muted);

    const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseInt(e.target.value, 10);
        setVolume(newVolume);

        // Auto unmute when adjusting volume
        if (muted && newVolume > 0) {
            toggleMute();
        }
    }, [setVolume, muted, toggleMute]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -5 : 5;
        setVolume(Math.max(0, Math.min(100, volume + delta)));
    }, [volume, setVolume]);

    return (
        <div
            className={cn(
                'flex items-center gap-1',
                vertical && 'flex-col-reverse',
                className
            )}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onWheel={handleWheel}
        >
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleMute}
                title={muted ? 'Unmute' : 'Mute'}
            >
                <VolumeIcon className="h-4 w-4" />
            </Button>

            {showSlider && (
                <div
                    className={cn(
                        'overflow-hidden transition-all duration-200',
                        vertical
                            ? 'w-8 h-0 group-hover:h-24'
                            : 'h-8 w-0 group-hover:w-20',
                        (isHovering || vertical) && (vertical ? 'h-24' : 'w-20')
                    )}
                >
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={muted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className={cn(
                            'accent-primary cursor-pointer',
                            vertical
                                ? 'h-20 w-1.5 -rotate-90 origin-center ml-3'
                                : 'h-1.5 w-full'
                        )}
                        style={{
                            accentColor: 'hsl(var(--primary))',
                        }}
                    />
                </div>
            )}
        </div>
    );
});
