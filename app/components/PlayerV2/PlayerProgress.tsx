/**
 * PlayerProgress Component
 * Seekable progress bar with time display
 */

'use client';

import { memo, useCallback, useState, useRef, useEffect } from 'react';
import { usePlayerStore } from '@/lib/stores/player.store';
import { cn } from '@/lib/utils';

interface PlayerProgressProps {
    showTime?: boolean;
    size?: 'sm' | 'md';
    className?: string;
}

function formatTime(seconds: number): string {
    if (!seconds || !isFinite(seconds)) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export const PlayerProgress = memo(function PlayerProgress({
    showTime = true,
    size = 'md',
    className,
}: PlayerProgressProps) {
    const progress = usePlayerStore(s => s.progress);
    const currentItem = usePlayerStore(s => s.currentItem);
    const seekTo = usePlayerStore(s => s.seekTo);

    const [isDragging, setIsDragging] = useState(false);
    const [hoverPosition, setHoverPosition] = useState<number | null>(null);
    const [dragPosition, setDragPosition] = useState<number | null>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    const isRadio = currentItem?.source === 'radio';
    const duration = progress.duration || 0;
    const currentTime = isDragging && dragPosition !== null
        ? dragPosition
        : progress.currentTime;
    const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;
    const bufferedPercentage = duration > 0 ? (progress.buffered / duration) * 100 : 0;

    const getTimeFromPosition = useCallback((clientX: number): number => {
        if (!progressRef.current || duration <= 0) return 0;

        const rect = progressRef.current.getBoundingClientRect();
        const position = (clientX - rect.left) / rect.width;
        return Math.max(0, Math.min(duration, position * duration));
    }, [duration]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (isRadio || duration <= 0) return;

        setIsDragging(true);
        const time = getTimeFromPosition(e.clientX);
        setDragPosition(time);
    }, [isRadio, duration, getTimeFromPosition]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!progressRef.current) return;

        const time = getTimeFromPosition(e.clientX);
        setHoverPosition(time);

        if (isDragging) {
            setDragPosition(time);
        }
    }, [isDragging, getTimeFromPosition]);

    const handleMouseUp = useCallback(() => {
        if (isDragging && dragPosition !== null) {
            seekTo(dragPosition);
        }
        setIsDragging(false);
        setDragPosition(null);
    }, [isDragging, dragPosition, seekTo]);

    const handleMouseLeave = useCallback(() => {
        setHoverPosition(null);
        if (isDragging) {
            handleMouseUp();
        }
    }, [isDragging, handleMouseUp]);

    // Global mouse up handler for drag
    useEffect(() => {
        if (!isDragging) return;

        const handleGlobalMouseUp = () => {
            handleMouseUp();
        };

        const handleGlobalMouseMove = (e: MouseEvent) => {
            const time = getTimeFromPosition(e.clientX);
            setDragPosition(time);
        };

        document.addEventListener('mouseup', handleGlobalMouseUp);
        document.addEventListener('mousemove', handleGlobalMouseMove);

        return () => {
            document.removeEventListener('mouseup', handleGlobalMouseUp);
            document.removeEventListener('mousemove', handleGlobalMouseMove);
        };
    }, [isDragging, handleMouseUp, getTimeFromPosition]);

    const trackHeight = size === 'sm' ? 'h-1' : 'h-1.5';
    const thumbSize = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3';

    return (
        <div className={cn('flex items-center gap-2 w-full', className)}>
            {/* Current time */}
            {showTime && (
                <span className="text-xs text-muted-foreground min-w-[40px] text-right tabular-nums">
                    {formatTime(currentTime)}
                </span>
            )}

            {/* Progress bar */}
            <div
                ref={progressRef}
                className={cn(
                    'relative flex-1 group cursor-pointer',
                    trackHeight,
                    isRadio && 'opacity-50 cursor-not-allowed'
                )}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                {/* Track background */}
                <div className={cn(
                    'absolute inset-0 rounded-full bg-muted/50',
                    trackHeight
                )} />

                {/* Buffered */}
                <div
                    className={cn(
                        'absolute inset-y-0 left-0 rounded-full bg-muted',
                        trackHeight
                    )}
                    style={{ width: `${bufferedPercentage}%` }}
                />

                {/* Progress */}
                <div
                    className={cn(
                        'absolute inset-y-0 left-0 rounded-full bg-primary transition-all',
                        trackHeight,
                        isDragging && 'transition-none'
                    )}
                    style={{ width: `${percentage}%` }}
                />

                {/* Thumb */}
                {!isRadio && (
                    <div
                        className={cn(
                            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-primary shadow-sm',
                            'opacity-0 group-hover:opacity-100 transition-opacity',
                            thumbSize,
                            isDragging && 'opacity-100 scale-125'
                        )}
                        style={{ left: `${percentage}%` }}
                    />
                )}

                {/* Hover time tooltip */}
                {hoverPosition !== null && !isRadio && duration > 0 && (
                    <div
                        className="absolute -top-7 -translate-x-1/2 px-1.5 py-0.5 rounded bg-popover text-popover-foreground text-xs shadow-sm"
                        style={{ left: `${(hoverPosition / duration) * 100}%` }}
                    >
                        {formatTime(hoverPosition)}
                    </div>
                )}
            </div>

            {/* Duration */}
            {showTime && (
                <span className="text-xs text-muted-foreground min-w-[40px] tabular-nums">
                    {isRadio ? 'LIVE' : formatTime(duration)}
                </span>
            )}
        </div>
    );
});
