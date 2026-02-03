/**
 * AmbientMixer v2
 * Main ambient sound mixer component
 */

'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, X, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useAmbientAudio } from '@/lib/hooks/useAmbientAudio';
import { AmbientSoundCard } from './AmbientSoundCard';
import { WidgetIcon } from '@/app/components/WidgetBase';
import type { SoundCategory } from '@/lib/types/audio.types';

interface AmbientMixerProps {
    className?: string;
    isOpen?: boolean;
    onClose?: () => void;
}

/**
 * Ambient sound mixer panel
 */
export function AmbientMixer({ className, isOpen, onClose }: AmbientMixerProps) {
    const {
        isAnyPlaying,
        masterVolume,
        isMasterMuted,
        activeSoundsList,
        activeCount,
        soundsByCategory,
        categories,
        categoryLabels,
        presets,
        setMasterVolume,
        toggleMasterMute,
        stopAll,
        applyPreset,
        selectedCategory,
        setSelectedCategory,
    } = useAmbientAudio();

    // Category to show (null = all)
    const categoryToShow = selectedCategory as SoundCategory | null;

    // Sounds to display
    const displaySounds = useMemo(() => {
        if (!categoryToShow) {
            // Show active sounds first, then a few from each category
            return Object.entries(soundsByCategory).flatMap(([cat, sounds]) =>
                sounds.slice(0, 4)
            );
        }
        return soundsByCategory[categoryToShow] || [];
    }, [categoryToShow, soundsByCategory]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={cn(
                'flex flex-col h-full w-full max-w-md',
                'bg-background/95 backdrop-blur-xl',
                'border-l border-border',
                'shadow-2xl',
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Volume2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Ambient Mixer</h2>
                        <p className="text-xs text-muted-foreground">
                            {activeCount > 0 ? `${activeCount} sound${activeCount > 1 ? 's' : ''} playing` : 'No sounds playing'}
                        </p>
                    </div>
                </div>

                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {/* Master controls */}
            <div className="p-4 border-b border-border space-y-4">
                {/* Master volume */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={toggleMasterMute}
                    >
                        {isMasterMuted ? (
                            <VolumeX className="w-4 h-4 text-muted-foreground" />
                        ) : (
                            <Volume2 className="w-4 h-4" />
                        )}
                    </Button>

                    <Slider
                        value={[isMasterMuted ? 0 : masterVolume]}
                        onValueChange={([value]) => setMasterVolume(value)}
                        max={100}
                        step={1}
                        className="flex-1"
                        aria-label="Master volume"
                    />

                    <span className="text-xs text-muted-foreground w-8 text-right">
                        {isMasterMuted ? '0' : masterVolume}%
                    </span>
                </div>

                {/* Quick actions */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={isAnyPlaying ? stopAll : undefined}
                        disabled={!isAnyPlaying}
                    >
                        {isAnyPlaying ? (
                            <>
                                <Pause className="w-3 h-3 mr-1" />
                                Stop All
                            </>
                        ) : (
                            'No sounds'
                        )}
                    </Button>
                </div>
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 p-3 border-b border-border overflow-x-auto">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap',
                        !categoryToShow
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                    )}
                >
                    All
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap',
                            categoryToShow === cat
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {categoryLabels[cat]}
                    </button>
                ))}
            </div>

            {/* Presets */}
            {!categoryToShow && (
                <div className="p-3 border-b border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Quick Presets</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {presets.map((preset) => (
                            <button
                                key={preset.id}
                                onClick={() => applyPreset(preset.id)}
                                className={cn(
                                    'flex items-center gap-2 px-3 py-2 rounded-lg',
                                    'bg-muted/50 hover:bg-muted',
                                    'text-sm text-foreground whitespace-nowrap',
                                    'transition-colors'
                                )}
                            >
                                <WidgetIcon name={preset.icon} className="w-4 h-4" />
                                <span>{preset.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Sound list */}
            <div className="flex-1 overflow-y-auto p-3">
                <div className="grid grid-cols-2 gap-2">
                    {displaySounds.map((sound) => (
                        <AmbientSoundCard key={sound.id} soundId={sound.id} />
                    ))}
                </div>
            </div>

            {/* Active sounds indicator */}
            {activeSoundsList.length > 0 && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-3 border-t border-border bg-muted/30"
                >
                    <p className="text-xs font-medium text-muted-foreground mb-2">Now Playing</p>
                    <div className="flex flex-wrap gap-1">
                        {activeSoundsList.map((sound) => (
                            <span
                                key={sound.id}
                                className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                            >
                                {sound.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </span>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

export default AmbientMixer;
