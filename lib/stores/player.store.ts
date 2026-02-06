/**
 * Player Store v2
 * Zustand store for global player state management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
    PlayerStore,
    PlayerStoreState,
    PlayerState,
    PlayableItem,
    YouTubeItem,
    RadioItem,
    YouTubeSearchResult,
    RadioBrowserStation,
    RepeatMode,
    PlayerPersistedState,
    YouTubeUrlParseResult,
} from '@/lib/types/player.types';

// ═══════════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'lofi-player-v2';
const MAX_HISTORY_ITEMS = 50;
const MAX_PLAYLIST_ITEMS = 200;


// ═══════════════════════════════════════════════════════════════════════════════
// Initial State
// ═══════════════════════════════════════════════════════════════════════════════

const initialState: PlayerStoreState = {
    // Current playback
    currentItem: null,
    state: 'idle',
    error: null,

    // Progress
    progress: {
        currentTime: 0,
        duration: 0,
        buffered: 0,
        percentage: 0,
    },

    // Volume
    volume: 50,
    muted: false,

    // Playlist
    playlist: [],
    currentIndex: -1,
    shuffle: false,
    repeat: 'off',

    // History
    history: [],

    // UI State
    isExpanded: false,
    isSearchOpen: false,
    isPlaylistOpen: false,
    isRadioBrowserOpen: false,

    // Search
    searchQuery: '',
    searchResults: [],
    isSearching: false,

    // Radio
    radioStations: [],
    radioSearchQuery: '',
    isLoadingRadio: false,

    // Background sync
    syncToBackground: true,

    // Initialization
    isInitialized: false,
};

// ═══════════════════════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════════════════════

function parseYouTubeUrl(url: string): YouTubeUrlParseResult | null {
    try {
        const urlObj = new URL(url);

        // YouTube video URLs
        if (urlObj.hostname.includes('youtube.com')) {
            const videoId = urlObj.searchParams.get('v');
            const listId = urlObj.searchParams.get('list');

            if (listId) {
                return { type: 'playlist', id: listId };
            }
            if (videoId) {
                return { type: 'video', id: videoId };
            }
        }

        // youtu.be short URLs
        if (urlObj.hostname === 'youtu.be') {
            const videoId = urlObj.pathname.slice(1);
            if (videoId) {
                return { type: 'video', id: videoId };
            }
        }

        return null;
    } catch {
        return null;
    }
}

function formatDuration(seconds: number): string {
    if (!seconds || !isFinite(seconds)) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function parseIsoDuration(iso: string): number {
    if (!iso) return 0;
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
}

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Store Creation
// ═══════════════════════════════════════════════════════════════════════════════

export const usePlayerStore = create<PlayerStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            // ═══════════════════════════════════════════════════════════════
            // Initialization
            // ═══════════════════════════════════════════════════════════════

            initialize: () => {
                const state = get();
                if (state.isInitialized) return;

                // Restore currentItem from playlist if available, but Force IDLE state
                if (state.playlist.length > 0 && state.currentIndex >= 0) {
                    set({
                        isInitialized: true,
                        currentItem: state.playlist[state.currentIndex] || null,
                        state: 'idle', // Ensure we don't autoplay
                    });
                } else {
                    set({
                        isInitialized: true,
                        state: 'idle'
                    });
                }
            },

            // ═══════════════════════════════════════════════════════════════
            // Playback Control
            // ═══════════════════════════════════════════════════════════════

            play: (item) => {
                const state = get();

                if (item) {
                    // Play specific item
                    const existingIndex = state.playlist.findIndex(
                        p => p.id === item.id && p.source === item.source
                    );

                    if (existingIndex >= 0) {
                        // Item already in playlist, play from there
                        set({
                            currentItem: item,
                            currentIndex: existingIndex,
                            state: 'loading',
                            error: null,
                        });
                    } else {
                        // Add to playlist and play
                        const newPlaylist = [...state.playlist, item];
                        set({
                            currentItem: item,
                            playlist: newPlaylist.slice(-MAX_PLAYLIST_ITEMS),
                            currentIndex: newPlaylist.length - 1,
                            state: 'loading',
                            error: null,
                        });
                    }

                    // Add to history
                    get().addToHistory(item);
                } else if (state.currentItem) {
                    // Resume current
                    set({ state: 'loading' });
                } else if (state.playlist.length > 0) {
                    // Play first in playlist
                    const firstItem = state.playlist[0];
                    set({
                        currentItem: firstItem,
                        currentIndex: 0,
                        state: 'loading',
                        error: null,
                    });
                    get().addToHistory(firstItem);
                }
            },

            pause: () => {
                set({ state: 'paused' });
            },

            togglePlay: () => {
                const state = get();
                // Treat buffering/loading as "active" so we can pause/cancel it
                if (state.state === 'playing' || state.state === 'buffering' || state.state === 'loading') {
                    get().pause();
                } else {
                    get().play();
                }
            },

            stop: () => {
                set({
                    state: 'idle',
                    progress: { currentTime: 0, duration: 0, buffered: 0, percentage: 0 },
                });
            },

            // ═══════════════════════════════════════════════════════════════
            // Navigation
            // ═══════════════════════════════════════════════════════════════

            next: () => {
                const state = get();
                if (state.playlist.length === 0) return;

                let nextIndex: number;

                if (state.shuffle) {
                    // Random next (not current)
                    const available = state.playlist
                        .map((_, i) => i)
                        .filter(i => i !== state.currentIndex);
                    if (available.length === 0) return;
                    nextIndex = available[Math.floor(Math.random() * available.length)];
                } else if (state.repeat === 'one') {
                    // Repeat same track
                    nextIndex = state.currentIndex;
                } else {
                    nextIndex = state.currentIndex + 1;
                    if (nextIndex >= state.playlist.length) {
                        if (state.repeat === 'all') {
                            nextIndex = 0;
                        } else {
                            // End of playlist
                            set({ state: 'idle' });
                            return;
                        }
                    }
                }

                const nextItem = state.playlist[nextIndex];
                if (nextItem) {
                    set({
                        currentItem: nextItem,
                        currentIndex: nextIndex,
                        state: 'loading',
                        progress: { currentTime: 0, duration: 0, buffered: 0, percentage: 0 },
                    });
                    get().addToHistory(nextItem);
                }
            },

            previous: () => {
                const state = get();
                if (state.playlist.length === 0) return;

                // If more than 3 seconds in, restart current track
                if (state.progress.currentTime > 3) {
                    set({
                        progress: { ...state.progress, currentTime: 0, percentage: 0 },
                    });
                    // Player core will handle actual seek
                    return;
                }

                let prevIndex = state.currentIndex - 1;
                if (prevIndex < 0) {
                    if (state.repeat === 'all') {
                        prevIndex = state.playlist.length - 1;
                    } else {
                        prevIndex = 0;
                    }
                }

                const prevItem = state.playlist[prevIndex];
                if (prevItem) {
                    set({
                        currentItem: prevItem,
                        currentIndex: prevIndex,
                        state: 'loading',
                        progress: { currentTime: 0, duration: 0, buffered: 0, percentage: 0 },
                    });
                }
            },

            playAtIndex: (index) => {
                const state = get();
                if (index < 0 || index >= state.playlist.length) return;

                const item = state.playlist[index];
                set({
                    currentItem: item,
                    currentIndex: index,
                    state: 'loading',
                    progress: { currentTime: 0, duration: 0, buffered: 0, percentage: 0 },
                });
                get().addToHistory(item);
            },

            seekTo: (time) => {
                const state = get();
                const duration = state.progress.duration;
                const clampedTime = Math.max(0, Math.min(time, duration));
                set({
                    progress: {
                        ...state.progress,
                        currentTime: clampedTime,
                        percentage: duration > 0 ? (clampedTime / duration) * 100 : 0,
                    },
                });
            },

            seekByPercent: (percent) => {
                const duration = get().progress.duration;
                if (duration > 0) {
                    get().seekTo((percent / 100) * duration);
                }
            },

            // ═══════════════════════════════════════════════════════════════
            // Volume
            // ═══════════════════════════════════════════════════════════════

            setVolume: (volume) => {
                set({ volume: Math.max(0, Math.min(100, volume)) });
            },

            toggleMute: () => {
                set(state => ({ muted: !state.muted }));
            },

            // ═══════════════════════════════════════════════════════════════
            // Playlist Management
            // ═══════════════════════════════════════════════════════════════

            addToPlaylist: (item) => {
                const state = get();
                // Don't add duplicates
                const exists = state.playlist.some(
                    p => p.id === item.id && p.source === item.source
                );
                if (exists) return;

                const newPlaylist = [...state.playlist, item].slice(-MAX_PLAYLIST_ITEMS);
                set({ playlist: newPlaylist });
            },

            addMultipleToPlaylist: (items) => {
                const state = get();
                const existingIds = new Set(state.playlist.map(p => `${p.source}:${p.id}`));
                const newItems = items.filter(item => !existingIds.has(`${item.source}:${item.id}`));

                if (newItems.length > 0) {
                    const newPlaylist = [...state.playlist, ...newItems].slice(-MAX_PLAYLIST_ITEMS);
                    set({ playlist: newPlaylist });
                }
            },

            removeFromPlaylist: (index) => {
                const state = get();
                if (index < 0 || index >= state.playlist.length) return;

                const newPlaylist = state.playlist.filter((_, i) => i !== index);
                let newIndex = state.currentIndex;

                if (index < state.currentIndex) {
                    newIndex--;
                } else if (index === state.currentIndex) {
                    // Currently playing item removed
                    if (newPlaylist.length === 0) {
                        set({
                            playlist: [],
                            currentItem: null,
                            currentIndex: -1,
                            state: 'idle',
                        });
                        return;
                    }
                    newIndex = Math.min(index, newPlaylist.length - 1);
                    const nextItem = newPlaylist[newIndex];
                    set({
                        playlist: newPlaylist,
                        currentItem: nextItem,
                        currentIndex: newIndex,
                        state: 'loading',
                    });
                    return;
                }

                set({ playlist: newPlaylist, currentIndex: newIndex });
            },

            reorderPlaylist: (fromIndex, toIndex) => {
                const state = get();
                if (fromIndex === toIndex) return;
                if (fromIndex < 0 || fromIndex >= state.playlist.length) return;
                if (toIndex < 0 || toIndex >= state.playlist.length) return;

                const newPlaylist = [...state.playlist];
                const [removed] = newPlaylist.splice(fromIndex, 1);
                newPlaylist.splice(toIndex, 0, removed);

                // Update currentIndex if needed
                let newCurrentIndex = state.currentIndex;
                if (fromIndex === state.currentIndex) {
                    newCurrentIndex = toIndex;
                } else if (fromIndex < state.currentIndex && toIndex >= state.currentIndex) {
                    newCurrentIndex--;
                } else if (fromIndex > state.currentIndex && toIndex <= state.currentIndex) {
                    newCurrentIndex++;
                }

                set({ playlist: newPlaylist, currentIndex: newCurrentIndex });
            },

            clearPlaylist: () => {
                set({
                    playlist: [],
                    currentItem: null,
                    currentIndex: -1,
                    state: 'idle',
                    progress: { currentTime: 0, duration: 0, buffered: 0, percentage: 0 },
                });
            },

            // ═══════════════════════════════════════════════════════════════
            // Repeat & Shuffle
            // ═══════════════════════════════════════════════════════════════

            setRepeat: (mode) => {
                set({ repeat: mode });
            },

            cycleRepeat: () => {
                const modes: RepeatMode[] = ['off', 'all', 'one'];
                const current = get().repeat;
                const currentIndex = modes.indexOf(current);
                const nextIndex = (currentIndex + 1) % modes.length;
                set({ repeat: modes[nextIndex] });
            },

            toggleShuffle: () => {
                set(state => ({ shuffle: !state.shuffle }));
            },

            // ═══════════════════════════════════════════════════════════════
            // YouTube Search
            // ═══════════════════════════════════════════════════════════════

            searchYouTube: async (query) => {
                if (!query.trim()) {
                    set({ searchResults: [], searchQuery: '' });
                    return;
                }

                set({ isSearching: true, searchQuery: query });

                try {
                    const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
                    if (!res.ok) throw new Error('Search failed');

                    const data = await res.json();
                    set({
                        searchResults: data.items || [], // Fixed: API returns 'items'
                        isSearching: false,
                    });
                } catch (error) {
                    console.error('YouTube search error:', error);
                    set({ isSearching: false, searchResults: [] });
                }
            },

            clearSearch: () => {
                set({ searchQuery: '', searchResults: [], isSearching: false });
            },

            importYouTubeUrl: async (url) => {
                const parsed = parseYouTubeUrl(url);
                if (!parsed) return null;

                set({ isSearching: true });

                try {
                    const endpoint = parsed.type === 'playlist'
                        ? `/api/youtube/playlist?id=${parsed.id}`
                        : `/api/youtube/video?id=${parsed.id}`;

                    const res = await fetch(endpoint);
                    if (!res.ok) throw new Error('Failed to fetch');

                    const data = await res.json();

                    if (parsed.type === 'playlist' && data.playlist) {
                        // Add all items from playlist
                        const items: YouTubeItem[] = (data.items || []).map((item: any) => ({
                            id: crypto.randomUUID(),
                            source: 'youtube' as const,
                            title: item.title,
                            thumbnail: item.thumbnail,
                            youtubeId: item.id,
                            kind: 'video' as const,
                            channelTitle: item.channelTitle,
                            duration: item.duration ? parseIsoDuration(item.duration) : undefined,
                            addedAt: Date.now(),
                        }));

                        get().addMultipleToPlaylist(items);
                        set({ isSearching: false });
                        return items[0] || null;
                    } else if (data.video) {
                        const item: YouTubeItem = {
                            id: crypto.randomUUID(),
                            source: 'youtube',
                            title: data.video.title,
                            thumbnail: data.video.thumbnail,
                            youtubeId: data.video.id,
                            kind: 'video',
                            channelTitle: data.video.channelTitle,
                            viewCount: data.video.viewCount,
                            duration: data.video.duration ? parseIsoDuration(data.video.duration) : undefined,
                            addedAt: Date.now(),
                        };

                        get().addToPlaylist(item);
                        set({ isSearching: false });
                        return item;
                    }

                    set({ isSearching: false });
                    return null;
                } catch (error) {
                    console.error('Import URL error:', error);
                    set({ isSearching: false });
                    return null;
                }
            },

            selectSearchResult: (result) => {
                const item: YouTubeItem = {
                    id: crypto.randomUUID(),
                    source: 'youtube',
                    title: result.title,
                    thumbnail: result.thumbnail,
                    youtubeId: result.id,
                    kind: result.kind,
                    channelTitle: result.channelTitle,
                    viewCount: result.viewCount,
                    isOfficial: result.isOfficial,
                    duration: result.duration ? parseIsoDuration(result.duration) : undefined,
                    itemCount: result.itemCount,
                    addedAt: Date.now(),
                };

                get().addToPlaylist(item);
                get().play(item);
                set({ isSearchOpen: false });
            },

            // ═══════════════════════════════════════════════════════════════
            // Radio
            // ═══════════════════════════════════════════════════════════════

            searchRadio: async (query) => {
                set({ isLoadingRadio: true, radioSearchQuery: query });

                try {
                    const url = query
                        ? `https://de1.api.radio-browser.info/json/stations/byname/${encodeURIComponent(query)}?limit=30`
                        : `https://de1.api.radio-browser.info/json/stations/topvote?limit=30`;

                    const res = await fetch(url);
                    if (!res.ok) throw new Error('Radio search failed');

                    const data: RadioBrowserStation[] = await res.json();
                    set({
                        radioStations: data.filter(s => s.url_resolved),
                        isLoadingRadio: false,
                    });
                } catch (error) {
                    console.error('Radio search error:', error);
                    set({ isLoadingRadio: false, radioStations: [] });
                }
            },

            loadTopRadioStations: async () => {
                await get().searchRadio('');
            },

            playRadioStation: (station) => {
                const item: RadioItem = {
                    id: crypto.randomUUID(),
                    source: 'radio',
                    title: station.name,
                    thumbnail: station.favicon || undefined,
                    streamUrl: station.url_resolved,
                    stationUuid: station.stationuuid,
                    country: station.country,
                    tags: station.tags ? station.tags.split(',').map(t => t.trim()) : undefined,
                    codec: station.codec,
                    bitrate: station.bitrate,
                    favicon: station.favicon,
                    addedAt: Date.now(),
                };

                get().play(item);
                set({ isRadioBrowserOpen: false });
            },

            // ═══════════════════════════════════════════════════════════════
            // Progress Updates
            // ═══════════════════════════════════════════════════════════════

            updateProgress: (currentTime, duration, buffered = 0) => {
                set({
                    progress: {
                        currentTime,
                        duration,
                        buffered,
                        percentage: duration > 0 ? (currentTime / duration) * 100 : 0,
                    },
                });
            },

            setState: (state) => {
                set({ state, error: state === 'error' ? get().error : null });
            },

            setError: (error) => {
                set({ error, state: error ? 'error' : get().state });
            },

            // ═══════════════════════════════════════════════════════════════
            // UI Toggles
            // ═══════════════════════════════════════════════════════════════

            setExpanded: (expanded) => set({ isExpanded: expanded }),
            toggleExpanded: () => set(s => ({ isExpanded: !s.isExpanded })),
            setSearchOpen: (open) => set({ isSearchOpen: open }),
            toggleSearch: () => set(s => ({ isSearchOpen: !s.isSearchOpen })),
            setPlaylistOpen: (open) => set({ isPlaylistOpen: open }),
            togglePlaylist: () => set(s => ({ isPlaylistOpen: !s.isPlaylistOpen })),
            setRadioBrowserOpen: (open) => set({ isRadioBrowserOpen: open }),
            toggleRadioBrowser: () => set(s => ({ isRadioBrowserOpen: !s.isRadioBrowserOpen })),

            // ═══════════════════════════════════════════════════════════════
            // Background Sync
            // ═══════════════════════════════════════════════════════════════

            setSyncToBackground: (sync) => set({ syncToBackground: sync }),

            // ═══════════════════════════════════════════════════════════════
            // History
            // ═══════════════════════════════════════════════════════════════

            addToHistory: (item) => {
                set(state => {
                    // Remove if already in history
                    const filtered = state.history.filter(
                        h => !(h.id === item.id && h.source === item.source)
                    );
                    // Add to front
                    return {
                        history: [item, ...filtered].slice(0, MAX_HISTORY_ITEMS),
                    };
                });
            },

            clearHistory: () => set({ history: [] }),

            // ═══════════════════════════════════════════════════════════════
            // Helpers
            // ═══════════════════════════════════════════════════════════════

            getCurrentSource: () => {
                const item = get().currentItem;
                return item ? item.source : null;
            },

            getPlaylistDuration: () => {
                return get().playlist.reduce((acc, item) => acc + (item.duration || 0), 0);
            },

            getFormattedDuration: formatDuration,
        }),
        {
            name: STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
            skipHydration: true,
            partialize: (state): PlayerPersistedState => ({
                currentItem: state.currentItem,
                playlist: state.playlist,
                currentIndex: state.currentIndex,
                volume: state.volume,
                muted: state.muted,
                shuffle: state.shuffle,
                repeat: state.repeat,
                syncToBackground: state.syncToBackground,
                history: state.history,
            }),
        }
    )
);

// ═══════════════════════════════════════════════════════════════════════════════
// Selector Hooks for Performance
// ═══════════════════════════════════════════════════════════════════════════════

export const usePlayerState = () => usePlayerStore(s => s.state);
export const usePlayerProgress = () => usePlayerStore(s => s.progress);
export const usePlayerVolume = () => usePlayerStore(s => ({ volume: s.volume, muted: s.muted }));
export const usePlayerPlaylist = () => usePlayerStore(s => s.playlist);
export const usePlayerCurrentItem = () => usePlayerStore(s => s.currentItem);
export const usePlayerIsPlaying = () => usePlayerStore(s => s.state === 'playing');
