/**
 * Player Component (V2)
 * Main player container that orchestrates all player components
 */

'use client';

import { memo, useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePlayerStore } from '@/lib/stores/player.store';
import { PlayerCore } from './PlayerCore';
import { PlayerMini } from './PlayerMini';
import { PlayerControls } from './PlayerControls';
import { PlayerProgress } from './PlayerProgress';
import { PlayerVolume } from './PlayerVolume';
import { PlayerSearch } from './PlayerSearch';
import { PlayerPlaylist } from './PlayerPlaylist';
import { RadioBrowser } from './RadioBrowser';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    X,
    Minimize2,
    ExternalLink,
    Music,
    Radio,
    Youtube,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isRadioItem, isYouTubeItem } from '@/lib/types/player.types';

interface PlayerProps {
    className?: string;
    showMini?: boolean;
}

export const Player = memo(function Player({ className, showMini = true }: PlayerProps) {
    const isInitialized = usePlayerStore(s => s.isInitialized);
    const isExpanded = usePlayerStore(s => s.isExpanded);
    const currentItem = usePlayerStore(s => s.currentItem);
    const state = usePlayerStore(s => s.state);
    const progress = usePlayerStore(s => s.progress);

    const initialize = usePlayerStore(s => s.initialize);
    const setExpanded = usePlayerStore(s => s.setExpanded);

    const [mounted, setMounted] = useState(false);

    // Initialize store on mount
    useEffect(() => {
        initialize();
        setMounted(true);
    }, [initialize]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            const store = usePlayerStore.getState();

            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    store.togglePlay();
                    break;
                case 'ArrowLeft':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        store.previous();
                    } else {
                        store.seekTo(store.progress.currentTime - 10);
                    }
                    break;
                case 'ArrowRight':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        store.next();
                    } else {
                        store.seekTo(store.progress.currentTime + 10);
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    store.setVolume(Math.min(100, store.volume + 5));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    store.setVolume(Math.max(0, store.volume - 5));
                    break;
                case 'm':
                case 'M':
                    store.toggleMute();
                    break;
                case 's':
                case 'S':
                    if (!e.ctrlKey && !e.metaKey) {
                        store.toggleShuffle();
                    }
                    break;
                case 'r':
                case 'R':
                    store.cycleRepeat();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleClose = useCallback(() => {
        setExpanded(false);
    }, [setExpanded]);

    // Get the source icon
    const getSourceIcon = () => {
        if (!currentItem) return Music;
        if (isRadioItem(currentItem)) return Radio;
        return Youtube;
    };

    const SourceIcon = getSourceIcon();

    // Format duration helper
    const formatTime = (seconds: number) => {
        if (!seconds || !isFinite(seconds)) return '0:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (!mounted) return null;

    return (
        <>
            {/* Hidden Player Core (for YouTube iframe) */}
            <PlayerCore />

            {/* Mini Player (fixed at bottom) */}
            {showMini && (
                <div className={cn('fixed bottom-0 left-0 right-0 z-40', className)}>
                    <PlayerMini />
                </div>
            )}

            {/* Expanded Player Modal */}
            <Dialog open={isExpanded} onOpenChange={setExpanded}>
                <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <SourceIcon className="h-5 w-5" />
                            Now Playing
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Expanded player controls
                        </DialogDescription>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleClose}
                        >
                            <Minimize2 className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Album Art / Video */}
                    <div className="relative aspect-video bg-muted">
                        {currentItem?.thumbnail ? (
                            <img
                                src={currentItem.thumbnail}
                                alt={currentItem.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <SourceIcon className="h-24 w-24 text-muted-foreground/30" />
                            </div>
                        )}

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        {/* Track info overlay */}
                        <div className="absolute bottom-4 left-4 right-4">
                            <h2 className="text-white text-xl font-semibold line-clamp-2 drop-shadow-lg">
                                {currentItem?.title || 'Nothing playing'}
                            </h2>
                            {currentItem && isYouTubeItem(currentItem) && currentItem.channelTitle && (
                                <p className="text-white/80 text-sm mt-1 drop-shadow">
                                    {currentItem.channelTitle}
                                </p>
                            )}
                            {currentItem && isRadioItem(currentItem) && currentItem.country && (
                                <p className="text-white/80 text-sm mt-1 drop-shadow">
                                    {currentItem.country}
                                    {currentItem.tags && currentItem.tags.length > 0 && (
                                        <> • {currentItem.tags.slice(0, 3).join(', ')}</>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Controls Section */}
                    <div className="p-6 space-y-4">
                        {/* Progress */}
                        <PlayerProgress showTime={true} size="md" />

                        {/* Main Controls */}
                        <div className="flex items-center justify-between">
                            <PlayerVolume showSlider={true} />
                            <PlayerControls size="lg" showExtras={true} />
                            <div className="w-24" /> {/* Spacer for balance */}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Search Modal */}
            <PlayerSearch />

            {/* Playlist Modal */}
            <PlayerPlaylist />

            {/* Radio Browser Modal */}
            <RadioBrowser />
        </>
    );
});
