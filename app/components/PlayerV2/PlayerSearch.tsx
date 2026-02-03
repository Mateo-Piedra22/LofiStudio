/**
 * PlayerSearch Component
 * YouTube search modal with results
 */

'use client';

import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Play, ListPlus, Loader2, Link as LinkIcon, Youtube, Clock, Eye, X } from 'lucide-react';
import { usePlayerStore } from '@/lib/stores/player.store';
import { cn } from '@/lib/utils';
import type { YouTubeSearchResult } from '@/lib/types/player.types';

function formatViews(count?: number): string {
    if (!count) return '';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
    return `${count} views`;
}

function formatDuration(iso?: string): string {
    if (!iso) return '';
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '';
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const PlayerSearch = memo(function PlayerSearch() {
    const isOpen = usePlayerStore(s => s.isSearchOpen);
    const searchQuery = usePlayerStore(s => s.searchQuery);
    const searchResults = usePlayerStore(s => s.searchResults);
    const isSearching = usePlayerStore(s => s.isSearching);

    const setSearchOpen = usePlayerStore(s => s.setSearchOpen);
    const searchYouTube = usePlayerStore(s => s.searchYouTube);
    const clearSearch = usePlayerStore(s => s.clearSearch);
    const selectSearchResult = usePlayerStore(s => s.selectSearchResult);
    const addToPlaylist = usePlayerStore(s => s.addToPlaylist);
    const importYouTubeUrl = usePlayerStore(s => s.importYouTubeUrl);

    const [inputValue, setInputValue] = useState('');
    const [importUrl, setImportUrl] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setInputValue('');
            setImportUrl('');
            setShowImport(false);
        }
    }, [isOpen]);

    // Debounced search
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (inputValue.trim()) {
            searchTimeoutRef.current = setTimeout(() => {
                searchYouTube(inputValue);
            }, 300);
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [inputValue, searchYouTube]);

    const handleImport = useCallback(async () => {
        if (!importUrl.trim()) return;

        setIsImporting(true);
        const item = await importYouTubeUrl(importUrl);
        setIsImporting(false);

        if (item) {
            setImportUrl('');
            setShowImport(false);
        }
    }, [importUrl, importYouTubeUrl]);

    const handlePlayResult = useCallback((result: YouTubeSearchResult) => {
        selectSearchResult(result);
    }, [selectSearchResult]);

    const handleAddToPlaylist = useCallback((result: YouTubeSearchResult) => {
        const item = {
            id: crypto.randomUUID(),
            source: 'youtube' as const,
            title: result.title,
            thumbnail: result.thumbnail,
            youtubeId: result.id,
            kind: result.kind,
            channelTitle: result.channelTitle,
            viewCount: result.viewCount,
            isOfficial: result.isOfficial,
            duration: result.duration ? (() => {
                const match = result.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                if (!match) return undefined;
                const h = parseInt(match[1] || '0', 10);
                const m = parseInt(match[2] || '0', 10);
                const s = parseInt(match[3] || '0', 10);
                return h * 3600 + m * 60 + s;
            })() : undefined,
            itemCount: result.itemCount,
            addedAt: Date.now(),
        };
        addToPlaylist(item);
    }, [addToPlaylist]);

    return (
        <Dialog open={isOpen} onOpenChange={setSearchOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Youtube className="h-5 w-5 text-red-500" />
                        Search YouTube
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Search for videos, playlists, or channels..."
                            className="pl-10 pr-10"
                        />
                        {isSearching && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                    </div>

                    {/* Import URL Toggle */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowImport(!showImport)}
                            className={cn(showImport && 'bg-accent')}
                        >
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Import URL
                        </Button>
                    </div>

                    {/* Import URL Input */}
                    {showImport && (
                        <div className="flex gap-2">
                            <Input
                                value={importUrl}
                                onChange={(e) => setImportUrl(e.target.value)}
                                placeholder="Paste YouTube video or playlist URL..."
                                className="flex-1"
                                onKeyDown={(e) => e.key === 'Enter' && handleImport()}
                            />
                            <Button
                                onClick={handleImport}
                                disabled={!importUrl.trim() || isImporting}
                            >
                                {isImporting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    'Import'
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Results */}
                    <ScrollArea className="flex-1 -mx-6 px-6">
                        {searchResults.length === 0 && !isSearching && inputValue && (
                            <div className="text-center py-8 text-muted-foreground">
                                No results found for "{inputValue}"
                            </div>
                        )}

                        {searchResults.length === 0 && !inputValue && (
                            <div className="text-center py-8 text-muted-foreground">
                                Start typing to search YouTube
                            </div>
                        )}

                        <div className="space-y-2">
                            {searchResults.map((result) => (
                                <div
                                    key={result.id}
                                    className="flex gap-3 p-2 rounded-lg hover:bg-accent/50 group transition-colors"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative w-32 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                                        {result.thumbnail && (
                                            <img
                                                src={result.thumbnail}
                                                alt={result.title}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        {result.duration && (
                                            <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-xs rounded">
                                                {formatDuration(result.duration)}
                                            </span>
                                        )}
                                        {result.itemCount && (
                                            <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-xs rounded">
                                                {result.itemCount} videos
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm line-clamp-2">
                                            {result.title}
                                        </h4>
                                        {result.channelTitle && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {result.channelTitle}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                            {result.viewCount && (
                                                <span className="flex items-center gap-1">
                                                    <Eye className="h-3 w-3" />
                                                    {formatViews(result.viewCount)}
                                                </span>
                                            )}
                                            {result.kind === 'playlist' && (
                                                <span className="text-primary">Playlist</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handlePlayResult(result)}
                                            title="Play now"
                                        >
                                            <Play className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleAddToPlaylist(result)}
                                            title="Add to playlist"
                                        >
                                            <ListPlus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
});
