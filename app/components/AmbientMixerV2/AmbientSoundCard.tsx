/**
 * AmbientSoundCard v2
 * Individual sound card with playback and volume controls
 */

'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useSoundState } from '@/lib/hooks/useAmbientAudio';
import { WidgetIcon } from '@/app/components/WidgetBase';

interface AmbientSoundCardProps {
    soundId: string;
    className?: string;
}

/**
 * Card for controlling an individual ambient sound
 */
export function AmbientSoundCard({ soundId, className }: AmbientSoundCardProps) {
    const { info, isPlaying, volume, isMuted, isLoading, toggle, setVolume } = useSoundState(soundId);

    if (!info) return null;

    const handleVolumeChange = useCallback((values: number[]) => {
        setVolume(values[0]);
    }, [setVolume]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                'relative p-3 rounded-xl transition-all cursor-pointer',
                'border',
                isPlaying
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-muted/30 border-border hover:bg-muted/50',
                className
            )}
            onClick={toggle}
        >
            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl z-10">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Content */}
            <div className="flex items-start gap-2">
                {/* Icon */}
                <div className={cn(
                    'p-2 rounded-lg transition-colors',
                    isPlaying ? 'bg-primary/20' : 'bg-muted'
                )}>
                    <WidgetIcon
                        name={info.icon}
                        className={cn(
                            'w-4 h-4 transition-colors',
                            isPlaying ? 'text-primary' : 'text-muted-foreground'
                        )}
                    />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className={cn(
                        'text-sm font-medium truncate',
                        isPlaying ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                        {info.name}
                    </p>
                    <p className="text-xs text-muted-foreground/70 truncate">
                        {info.description}
                    </p>
                </div>

                {/* Play indicator */}
                <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center transition-colors',
                    isPlaying ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                    {isPlaying ? (
                        <Pause className="w-3 h-3" />
                    ) : (
                        <Play className="w-3 h-3 ml-0.5" />
                    )}
                </div>
            </div>

            {/* Volume slider (show when playing) */}
            {isPlaying && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-2 border-t border-border/50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center gap-2">
                        <Volume2 className="w-3 h-3 text-muted-foreground" />
                        <Slider
                            value={[isMuted ? 0 : volume]}
                            onValueChange={handleVolumeChange}
                            max={100}
                            step={1}
                            className="flex-1"
                            aria-label={`${info.name} volume`}
                        />
                        <span className="text-xs text-muted-foreground w-6 text-right">
                            {isMuted ? 0 : volume}
                        </span>
                    </div>
                </motion.div>
            )}

            {/* Playing animation */}
            {isPlaying && !isLoading && (
                <motion.div
                    className="absolute top-1 right-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                >
                    <div className="flex items-end gap-0.5 h-3">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-0.5 bg-primary rounded-full"
                                animate={{
                                    height: ['30%', '100%', '50%', '80%', '30%'],
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.15,
                                    ease: 'easeInOut',
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

export default AmbientSoundCard;
