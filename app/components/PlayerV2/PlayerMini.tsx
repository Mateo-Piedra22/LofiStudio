/**
 * PlayerMini Component
 * Compact mini-player for bottom of screen
 */

'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Play,
    Pause,
    SkipForward,
    ChevronUp,
    Search,
    ListMusic,
    Radio,
    Music,
    Loader2,
} from 'lucide-react';
import { usePlayerStore } from '@/lib/stores/player.store';
import { cn } from '@/lib/utils';
import { PlayerProgress } from './PlayerProgress';
import { PlayerVolume } from './PlayerVolume';
import { isRadioItem } from '@/lib/types/player.types';

interface PlayerMiniProps {
    className?: string;
    onExpand?: () => void;
}

export const PlayerMini = memo(function PlayerMini({ className, onExpand }: PlayerMiniProps) {
    const currentItem = usePlayerStore(s => s.currentItem);
    const state = usePlayerStore(s => s.state);
    const playlist = usePlayerStore(s => s.playlist);

    const togglePlay = usePlayerStore(s => s.togglePlay);
    const next = usePlayerStore(s => s.next);
    const toggleSearch = usePlayerStore(s => s.toggleSearch);
    const togglePlaylist = usePlayerStore(s => s.togglePlaylist);
    const toggleRadioBrowser = usePlayerStore(s => s.toggleRadioBrowser);
    const toggleExpanded = usePlayerStore(s => s.toggleExpanded);

    const isPlaying = state === 'playing';
    const isLoading = state === 'loading' || state === 'buffering';
    const isRadio = currentItem && isRadioItem(currentItem);

    const handleExpand = () => {
        toggleExpanded();
        onExpand?.();
    };

    // Don't render if no content
    if (!currentItem && playlist.length === 0) {
        return (
            <div className={cn(
                'w-full bg-card/95 backdrop-blur-lg border-t px-4 py-3',
                className
            )}>
                <div className="flex items-center justify-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleSearch}
                        className="gap-2"
                    >
                        <Search className="h-4 w-4" />
                        Search YouTube
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleRadioBrowser}
                        className="gap-2"
                    >
                        <Radio className="h-4 w-4" />
                        Browse Radio
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            'w-full bg-card/95 backdrop-blur-lg border-t',
            className
        )}>
            {/* Progress bar at top */}
            <div className="px-4 pt-1">
                <PlayerProgress showTime={false} size="sm" />
            </div>

            <div className="flex items-center gap-3 px-4 py-2">
                {/* Thumbnail / Expand button */}
                <button
                    onClick={handleExpand}
                    className="relative w-12 h-12 flex-shrink-0 rounded-lg bg-muted overflow-hidden group"
                >
                    {currentItem?.thumbnail ? (
                        <img
                            src={currentItem.thumbnail}
                            alt={currentItem.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            {isRadio ? (
                                <Radio className="h-6 w-6 text-muted-foreground" />
                            ) : (
                                <Music className="h-6 w-6 text-muted-foreground" />
                            )}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ChevronUp className="h-6 w-6 text-white" />
                    </div>
                </button>

                {/* Track info */}
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                        {currentItem?.title || 'Nothing playing'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                        {isRadio ? (
                            <span className="flex items-center gap-1">
                                <Radio className="h-3 w-3" />
                                Live Radio
                            </span>
                        ) : (
                            <span>
                                {playlist.length > 0
                                    ? `${playlist.findIndex(p => p.id === currentItem?.id) + 1} of ${playlist.length}`
                                    : 'Queue empty'
                                }
                            </span>
                        )}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1">
                    {/* Play/Pause */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={togglePlay}
                        disabled={!currentItem}
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : isPlaying ? (
                            <Pause className="h-5 w-5" />
                        ) : (
                            <Play className="h-5 w-5 ml-0.5" />
                        )}
                    </Button>

                    {/* Next */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 hidden sm:flex"
                        onClick={next}
                        disabled={!playlist.length || !!isRadio}
                    >
                        <SkipForward className="h-4 w-4" />
                    </Button>

                    {/* Volume (hidden on mobile) */}
                    <div className="hidden md:block">
                        <PlayerVolume showSlider={true} />
                    </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-1 pl-2 border-l">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={toggleSearch}
                        title="Search"
                    >
                        <Search className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={togglePlaylist}
                        title="Playlist"
                    >
                        <ListMusic className="h-4 w-4" />
                        {playlist.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                                {playlist.length}
                            </span>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={toggleRadioBrowser}
                        title="Radio"
                    >
                        <Radio className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
});
