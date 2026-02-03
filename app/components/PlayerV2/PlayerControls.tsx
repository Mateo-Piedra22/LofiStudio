/**
 * PlayerControls Component
 * Unified playback controls for YouTube and Radio
 */

'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Shuffle,
    Repeat,
    Repeat1,
    Radio,
    Music,
} from 'lucide-react';
import { usePlayerStore } from '@/lib/stores/player.store';
import { cn } from '@/lib/utils';
import type { RepeatMode } from '@/lib/types/player.types';

interface PlayerControlsProps {
    size?: 'sm' | 'md' | 'lg';
    showExtras?: boolean;
    className?: string;
}

const REPEAT_ICONS: Record<RepeatMode, typeof Repeat> = {
    'off': Repeat,
    'all': Repeat,
    'one': Repeat1,
};

export const PlayerControls = memo(function PlayerControls({
    size = 'md',
    showExtras = true,
    className,
}: PlayerControlsProps) {
    const state = usePlayerStore(s => s.state);
    const shuffle = usePlayerStore(s => s.shuffle);
    const repeat = usePlayerStore(s => s.repeat);
    const playlist = usePlayerStore(s => s.playlist);
    const currentItem = usePlayerStore(s => s.currentItem);

    const togglePlay = usePlayerStore(s => s.togglePlay);
    const next = usePlayerStore(s => s.next);
    const previous = usePlayerStore(s => s.previous);
    const toggleShuffle = usePlayerStore(s => s.toggleShuffle);
    const cycleRepeat = usePlayerStore(s => s.cycleRepeat);
    const toggleRadioBrowser = usePlayerStore(s => s.toggleRadioBrowser);

    const isPlaying = state === 'playing';
    const isLoading = state === 'loading' || state === 'buffering';
    const isRadio = currentItem?.source === 'radio';
    const hasPlaylist = playlist.length > 0;

    const RepeatIcon = REPEAT_ICONS[repeat];

    const buttonSize = {
        sm: 'h-7 w-7',
        md: 'h-9 w-9',
        lg: 'h-11 w-11',
    }[size];

    const iconSize = {
        sm: 'h-3.5 w-3.5',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
    }[size];

    const playButtonSize = {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
    }[size];

    const playIconSize = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    }[size];

    return (
        <div className={cn('flex items-center justify-center gap-1', className)}>
            {/* Shuffle (left extra) */}
            {showExtras && (
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(buttonSize, shuffle && 'text-primary')}
                    onClick={toggleShuffle}
                    disabled={isRadio}
                    title={shuffle ? 'Shuffle on' : 'Shuffle off'}
                >
                    <Shuffle className={iconSize} />
                </Button>
            )}

            {/* Previous */}
            <Button
                variant="ghost"
                size="icon"
                className={buttonSize}
                onClick={previous}
                disabled={!hasPlaylist || isRadio}
                title="Previous"
            >
                <SkipBack className={iconSize} />
            </Button>

            {/* Play/Pause */}
            <Button
                variant="default"
                size="icon"
                className={cn(
                    playButtonSize,
                    'rounded-full',
                    isLoading && 'animate-pulse'
                )}
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
            >
                {isPlaying ? (
                    <Pause className={playIconSize} />
                ) : (
                    <Play className={cn(playIconSize, 'ml-0.5')} />
                )}
            </Button>

            {/* Next */}
            <Button
                variant="ghost"
                size="icon"
                className={buttonSize}
                onClick={next}
                disabled={!hasPlaylist || isRadio}
                title="Next"
            >
                <SkipForward className={iconSize} />
            </Button>

            {/* Repeat (right extra) */}
            {showExtras && (
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        buttonSize,
                        repeat !== 'off' && 'text-primary'
                    )}
                    onClick={cycleRepeat}
                    disabled={isRadio}
                    title={`Repeat: ${repeat}`}
                >
                    <RepeatIcon className={iconSize} />
                </Button>
            )}
        </div>
    );
});
