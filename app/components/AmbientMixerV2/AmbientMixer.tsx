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
        isMixerOpen,
        setMixerOpen,
    } = useAmbientAudio();

    // Determine open state (prop overrides store)
    const showMixer = isOpen ?? isMixerOpen;
    const handleClose = onClose ?? (() => setMixerOpen(false));

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
        <AnimatePresence>
            {showMixer && (
                <>
                    {/* Backdrop for mobile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] md:hidden"
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={cn(
                            'fixed top-0 right-0 h-full w-full md:w-[400px]',
                            'bg-[#09090b]/90 backdrop-blur-2xl',
                            'border-l border-white/10',
                            'shadow-2xl z-[60]',
                            'flex flex-col',
                            className
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                                    <Volume2 className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white tracking-tight">Ambient Mixer</h2>
                                    <p className="text-xs text-muted-foreground font-medium">
                                        {activeCount > 0 ? `${activeCount} active sound${activeCount > 1 ? 's' : ''}` : 'Create your atmosphere'}
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleClose}
                                className="h-9 w-9 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Master controls */}
                        <div className="p-6 border-b border-white/5 space-y-5 bg-black/20">
                            {/* Master volume */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                    <span>Master Volume</span>
                                    <span>{isMasterMuted ? 'Muted' : `${masterVolume}%`}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-white"
                                        onClick={toggleMasterMute}
                                    >
                                        {isMasterMuted ? (
                                            <VolumeX className="w-5 h-5" />
                                        ) : (
                                            <Volume2 className="w-5 h-5" />
                                        )}
                                    </Button>

                                    <Slider
                                        value={[isMasterMuted ? 0 : masterVolume]}
                                        onValueChange={([value]) => setMasterVolume(value)}
                                        max={100}
                                        step={1}
                                        className="flex-1 [&>.absolute]:bg-primary"
                                        aria-label="Master volume"
                                    />
                                </div>
                            </div>

                            {/* Quick actions */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full h-9 border-white/10 hover:bg-white/5 hover:text-white text-muted-foreground transition-all"
                                onClick={isAnyPlaying ? stopAll : undefined}
                                disabled={!isAnyPlaying}
                            >
                                {isAnyPlaying ? (
                                    <>
                                        <Pause className="w-3 h-3 mr-2" />
                                        Stop All Sounds
                                    </>
                                ) : (
                                    <span className="opacity-50">No sounds playing</span>
                                )}
                            </Button>
                        </div>

                        {/* Category tabs */}
                        <div className="p-2 border-b border-white/5">
                            <div className="flex bg-black/20 p-1 rounded-xl overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={cn(
                                        'px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0',
                                        !categoryToShow
                                            ? 'bg-white/10 text-white shadow-sm'
                                            : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                    )}
                                >
                                    All
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={cn(
                                            'px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0',
                                            categoryToShow === cat
                                                ? 'bg-white/10 text-white shadow-sm'
                                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                        )}
                                    >
                                        {categoryLabels[cat]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Presets - Only show on 'All' */}
                        {!categoryToShow && (
                            <div className="p-4 border-b border-white/5">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">Quick Presets</p>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                    {presets.map((preset) => (
                                        <button
                                            key={preset.id}
                                            onClick={() => applyPreset(preset.id)}
                                            className={cn(
                                                'flex items-center gap-2 px-3 py-2 rounded-xl border border-white/5',
                                                'bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10',
                                                'text-xs font-medium text-muted-foreground hover:text-white',
                                                'transition-all whitespace-nowrap shrink-0'
                                            )}
                                        >
                                            <WidgetIcon name={preset.icon} className="w-4 h-4 opacity-70" />
                                            <span>{preset.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sound list */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-3 pb-8">
                                {displaySounds.map((sound) => (
                                    <AmbientSoundCard key={sound.id} soundId={sound.id} />
                                ))}
                            </div>
                        </div>

                        {/* Active sounds footer (if any playing) */}
                        {activeSoundsList.length > 0 && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md sticky bottom-0"
                            >
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Now Playing</p>
                                <div className="flex flex-wrap gap-2">
                                    {activeSoundsList.map((sound) => (
                                        <span
                                            key={sound.id}
                                            className="px-2.5 py-1 text-[10px] uppercase tracking-wide font-bold rounded-md bg-primary/20 text-primary border border-primary/20"
                                        >
                                            {sound.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default AmbientMixer;
