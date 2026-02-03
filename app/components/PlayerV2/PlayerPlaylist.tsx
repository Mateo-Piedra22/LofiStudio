/**
 * PlayerPlaylist Component
 * Playlist management panel
 */

'use client';

import { memo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Play,
    Trash2,
    ListMusic,
    Music,
    Radio,
    Clock,
    Disc,
    X,
} from 'lucide-react';
import { usePlayerStore } from '@/lib/stores/player.store';
import { cn } from '@/lib/utils';
import type { PlayableItem } from '@/lib/types/player.types';
import { isYouTubeItem } from '@/lib/types/player.types';

function formatDuration(seconds?: number): string {
    if (!seconds || !isFinite(seconds)) return '';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export const PlayerPlaylist = memo(function PlayerPlaylist() {
    const isOpen = usePlayerStore(s => s.isPlaylistOpen);
    const playlist = usePlayerStore(s => s.playlist);
    const currentIndex = usePlayerStore(s => s.currentIndex);
    const currentItem = usePlayerStore(s => s.currentItem);
    const state = usePlayerStore(s => s.state);

    const setPlaylistOpen = usePlayerStore(s => s.setPlaylistOpen);
    const playAtIndex = usePlayerStore(s => s.playAtIndex);
    const removeFromPlaylist = usePlayerStore(s => s.removeFromPlaylist);
    const clearPlaylist = usePlayerStore(s => s.clearPlaylist);

    const totalDuration = playlist.reduce((acc, item) => acc + (item.duration || 0), 0);
    const isPlaying = state === 'playing';

    const handlePlayItem = useCallback((index: number) => {
        playAtIndex(index);
    }, [playAtIndex]);

    const handleRemoveItem = useCallback((index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        removeFromPlaylist(index);
    }, [removeFromPlaylist]);

    const getItemIcon = (item: PlayableItem) => {
        if (item.source === 'radio') return Radio;
        if (isYouTubeItem(item) && item.kind === 'playlist') return ListMusic;
        return Music;
    };

    return (
        <Dialog open={isOpen} onOpenChange={setPlaylistOpen}>
            <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <ListMusic className="h-5 w-5" />
                            Playlist
                        </span>
                        <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
                            <span>{playlist.length} items</span>
                            {totalDuration > 0 && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDuration(totalDuration)}
                                    </span>
                                </>
                            )}
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col -mx-6">
                    {playlist.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Disc className="h-12 w-12 mb-4 opacity-50" />
                            <p className="text-sm">Your playlist is empty</p>
                            <p className="text-xs mt-1">Search for videos or browse radio stations</p>
                        </div>
                    ) : (
                        <>
                            <ScrollArea className="flex-1 px-6">
                                <div className="space-y-1 py-2">
                                    {playlist.map((item, index) => {
                                        const isCurrentItem = index === currentIndex;
                                        const ItemIcon = getItemIcon(item);

                                        return (
                                            <div
                                                key={`${item.id}-${index}`}
                                                className={cn(
                                                    'flex items-center gap-3 p-2 rounded-lg cursor-pointer group transition-colors',
                                                    isCurrentItem
                                                        ? 'bg-primary/10 border border-primary/20'
                                                        : 'hover:bg-accent/50'
                                                )}
                                                onClick={() => handlePlayItem(index)}
                                            >
                                                {/* Index/Playing indicator */}
                                                <div className="w-6 text-center flex-shrink-0">
                                                    {isCurrentItem && isPlaying ? (
                                                        <div className="flex items-center justify-center gap-0.5">
                                                            <span className="w-0.5 h-3 bg-primary rounded-full animate-pulse" />
                                                            <span className="w-0.5 h-4 bg-primary rounded-full animate-pulse delay-75" />
                                                            <span className="w-0.5 h-2 bg-primary rounded-full animate-pulse delay-150" />
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground group-hover:hidden">
                                                            {index + 1}
                                                        </span>
                                                    )}
                                                    {!isCurrentItem && (
                                                        <Play className="h-4 w-4 hidden group-hover:block text-muted-foreground" />
                                                    )}
                                                </div>

                                                {/* Thumbnail */}
                                                <div className="w-10 h-10 flex-shrink-0 rounded bg-muted overflow-hidden">
                                                    {item.thumbnail ? (
                                                        <img
                                                            src={item.thumbnail}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ItemIcon className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn(
                                                        'text-sm font-medium truncate',
                                                        isCurrentItem && 'text-primary'
                                                    )}>
                                                        {item.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        {item.source === 'radio' ? (
                                                            <span className="flex items-center gap-1">
                                                                <Radio className="h-3 w-3" />
                                                                Radio
                                                            </span>
                                                        ) : (
                                                            item.duration && (
                                                                <span>{formatDuration(item.duration)}</span>
                                                            )
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Remove button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => handleRemoveItem(index, e)}
                                                    title="Remove from playlist"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>

                            {/* Footer */}
                            <div className="px-6 py-3 border-t">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={clearPlaylist}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Clear Playlist
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
});
