/**
 * RadioBrowser Component
 * Browse and play radio stations
 */

'use client';

import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Search,
    Play,
    Radio,
    Loader2,
    Globe,
    Signal,
    Music,
} from 'lucide-react';
import { usePlayerStore } from '@/lib/stores/player.store';
import { cn } from '@/lib/utils';
import type { RadioBrowserStation } from '@/lib/types/player.types';

// Popular radio genre presets
const GENRE_PRESETS = [
    { label: 'Lofi', query: 'lofi' },
    { label: 'Jazz', query: 'jazz' },
    { label: 'Classical', query: 'classical' },
    { label: 'Ambient', query: 'ambient' },
    { label: 'Chill', query: 'chill' },
    { label: 'Electronic', query: 'electronic' },
] as const;

export const RadioBrowser = memo(function RadioBrowser() {
    const isOpen = usePlayerStore(s => s.isRadioBrowserOpen);
    const radioStations = usePlayerStore(s => s.radioStations);
    const isLoading = usePlayerStore(s => s.isLoadingRadio);
    const currentItem = usePlayerStore(s => s.currentItem);
    const state = usePlayerStore(s => s.state);
    const error = usePlayerStore(s => s.error);

    const setRadioBrowserOpen = usePlayerStore(s => s.setRadioBrowserOpen);
    const searchRadio = usePlayerStore(s => s.searchRadio);
    const playRadioStation = usePlayerStore(s => s.playRadioStation);
    const loadTopRadioStations = usePlayerStore(s => s.loadTopRadioStations);

    const [inputValue, setInputValue] = useState('');
    const [activeGenre, setActiveGenre] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load top stations on first open
    useEffect(() => {
        if (isOpen && radioStations.length === 0) {
            loadTopRadioStations();
        }
    }, [isOpen, radioStations.length, loadTopRadioStations]);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setInputValue('');
            setActiveGenre(null);
        }
    }, [isOpen]);

    // Debounced search
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (inputValue.trim()) {
            setActiveGenre(null);
            searchTimeoutRef.current = setTimeout(() => {
                searchRadio(inputValue);
            }, 300);
        } else if (!activeGenre) {
            loadTopRadioStations();
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [inputValue, activeGenre, searchRadio, loadTopRadioStations]);

    const handleGenreClick = useCallback((genre: typeof GENRE_PRESETS[number]) => {
        setInputValue('');
        setActiveGenre(genre.query);
        searchRadio(genre.query);
    }, [searchRadio]);

    const handlePlayStation = useCallback((station: RadioBrowserStation) => {
        playRadioStation(station);
    }, [playRadioStation]);

    const isStationPlaying = useCallback((station: RadioBrowserStation) => {
        return currentItem?.source === 'radio' &&
            'stationUuid' in currentItem &&
            currentItem.stationUuid === station.stationuuid &&
            state === 'playing';
    }, [currentItem, state]);

    return (
        <Dialog open={isOpen} onOpenChange={setRadioBrowserOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Radio className="h-5 w-5 text-primary" />
                        Radio Browser
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Search and play radio stations from around the world
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Search radio stations..."
                            className="pl-10 pr-10"
                        />
                        {isLoading && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                    </div>

                    {/* Genre Presets */}
                    <div className="flex flex-wrap gap-2">
                        {GENRE_PRESETS.map((genre) => (
                            <Button
                                key={genre.query}
                                variant="outline"
                                size="sm"
                                className={cn(
                                    'text-xs',
                                    activeGenre === genre.query && 'bg-primary text-primary-foreground'
                                )}
                                onClick={() => handleGenreClick(genre)}
                            >
                                {genre.label}
                            </Button>
                        ))}
                    </div>

                    {/* Results */}
                    <ScrollArea className="flex-1 -mx-6 px-6">
                        {radioStations.length === 0 && !isLoading && !error && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Radio className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-sm">No stations found</p>
                                <p className="text-xs mt-1">Try a different search term</p>
                            </div>
                        )}

                        {error && !isLoading && (
                            <div className="text-center py-8 text-destructive">
                                <Signal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-sm font-medium">Failed to load stations</p>
                                <p className="text-xs mt-1 mb-3 opacity-80">{error}</p>
                                <Button size="sm" variant="outline" onClick={() => loadTopRadioStations()}>
                                    Retry
                                </Button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {radioStations.map((station) => {
                                const isPlaying = isStationPlaying(station);

                                return (
                                    <div
                                        key={station.stationuuid}
                                        className={cn(
                                            'flex items-center gap-3 p-3 rounded-lg cursor-pointer group transition-colors',
                                            isPlaying
                                                ? 'bg-primary/10 border border-primary/20'
                                                : 'hover:bg-accent/50'
                                        )}
                                        onClick={() => handlePlayStation(station)}
                                    >
                                        {/* Station icon/image */}
                                        <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                                            {station.favicon ? (
                                                <img
                                                    src={station.favicon}
                                                    alt={station.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <Music className="h-6 w-6 text-muted-foreground" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className={cn(
                                                'font-medium text-sm truncate',
                                                isPlaying && 'text-primary'
                                            )}>
                                                {station.name}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                                {station.country && (
                                                    <span className="flex items-center gap-1 truncate">
                                                        <Globe className="h-3 w-3 flex-shrink-0" />
                                                        {station.country}
                                                    </span>
                                                )}
                                                {station.bitrate > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <Signal className="h-3 w-3" />
                                                        {station.bitrate}kbps
                                                    </span>
                                                )}
                                            </div>
                                            {station.tags && (
                                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                    {station.tags.split(',').slice(0, 3).join(', ')}
                                                </p>
                                            )}
                                        </div>

                                        {/* Play indicator */}
                                        <div className="flex-shrink-0">
                                            {isPlaying ? (
                                                <div className="flex items-center justify-center gap-0.5 w-8 h-8">
                                                    <span className="w-0.5 h-3 bg-primary rounded-full animate-pulse" />
                                                    <span className="w-0.5 h-4 bg-primary rounded-full animate-pulse delay-75" />
                                                    <span className="w-0.5 h-2 bg-primary rounded-full animate-pulse delay-150" />
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Play"
                                                >
                                                    <Play className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog >
    );
});
