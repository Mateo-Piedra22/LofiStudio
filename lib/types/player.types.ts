/**
 * Player Types v2
 * Complete type definitions for the player system
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Core Types
// ═══════════════════════════════════════════════════════════════════════════════

export type PlayerSource = 'youtube' | 'radio';
export type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'buffering' | 'error';
export type RepeatMode = 'off' | 'one' | 'all';
export type YouTubeKind = 'video' | 'playlist';

// ═══════════════════════════════════════════════════════════════════════════════
// Media Items
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Base interface for all playable media
 */
export interface MediaItem {
    id: string;
    source: PlayerSource;
    title: string;
    thumbnail?: string;
    duration?: number; // in seconds
    addedAt: number;
}

/**
 * YouTube-specific media item
 */
export interface YouTubeItem extends MediaItem {
    source: 'youtube';
    youtubeId: string;
    kind: YouTubeKind;
    channelTitle?: string;
    viewCount?: number;
    isOfficial?: boolean;
    publishedAt?: string;
    // For playlists
    itemCount?: number;
}

/**
 * Radio station media item
 */
export interface RadioItem extends MediaItem {
    source: 'radio';
    streamUrl: string;
    stationUuid: string;
    country?: string;
    tags?: string[];
    codec?: string;
    bitrate?: number;
    favicon?: string;
}

/**
 * Union type for any playable item
 */
export type PlayableItem = YouTubeItem | RadioItem;

// ═══════════════════════════════════════════════════════════════════════════════
// Radio Browser API Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface RadioBrowserStation {
    stationuuid: string;
    name: string;
    url: string;
    url_resolved: string;
    favicon: string;
    country: string;
    countrycode: string;
    language: string;
    tags: string;
    codec: string;
    bitrate: number;
    votes: number;
    clickcount: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// YouTube API Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface YouTubeSearchResult {
    id: string;
    kind: YouTubeKind;
    title: string;
    thumbnail: string;
    channelTitle?: string;
    duration?: string; // ISO 8601 duration
    viewCount?: number;
    publishedAt?: string;
    isOfficial?: boolean;
    itemCount?: number;
}

export interface YouTubeVideoDetails {
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    viewCount: number;
    channelTitle: string;
    publishedAt: string;
}

export interface YouTubePlaylistDetails {
    id: string;
    title: string;
    thumbnail: string;
    itemCount: number;
    channelTitle: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Player Progress
// ═══════════════════════════════════════════════════════════════════════════════

export interface PlayerProgress {
    currentTime: number;
    duration: number;
    buffered: number;
    percentage: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Player Store State
// ═══════════════════════════════════════════════════════════════════════════════

export interface PlayerStoreState {
    // Current playback
    currentItem: PlayableItem | null;
    state: PlayerState;
    error: string | null;

    // Progress
    progress: PlayerProgress;

    // Volume
    volume: number;
    muted: boolean;

    // Playlist
    playlist: PlayableItem[];
    currentIndex: number;
    shuffle: boolean;
    repeat: RepeatMode;

    // History (recently played)
    history: PlayableItem[];

    // UI State
    isExpanded: boolean;
    isSearchOpen: boolean;
    isPlaylistOpen: boolean;
    isRadioBrowserOpen: boolean;

    // Search
    searchQuery: string;
    searchResults: YouTubeSearchResult[];
    isSearching: boolean;

    // Radio
    radioStations: RadioBrowserStation[];
    radioSearchQuery: string;
    isLoadingRadio: boolean;

    // Background sync
    syncToBackground: boolean;

    // Initialization
    isInitialized: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Player Store Actions
// ═══════════════════════════════════════════════════════════════════════════════

export interface PlayerStoreActions {
    // Initialization
    initialize: () => void;

    // Playback control
    play: (item?: PlayableItem) => void;
    pause: () => void;
    togglePlay: () => void;
    stop: () => void;

    // Navigation
    next: () => void;
    previous: () => void;
    playAtIndex: (index: number) => void;
    seekTo: (time: number) => void;
    seekByPercent: (percent: number) => void;

    // Volume
    setVolume: (volume: number) => void;
    toggleMute: () => void;

    // Playlist management
    addToPlaylist: (item: PlayableItem) => void;
    addMultipleToPlaylist: (items: PlayableItem[]) => void;
    removeFromPlaylist: (index: number) => void;
    reorderPlaylist: (fromIndex: number, toIndex: number) => void;
    clearPlaylist: () => void;

    // Repeat & Shuffle
    setRepeat: (mode: RepeatMode) => void;
    cycleRepeat: () => void;
    toggleShuffle: () => void;

    // YouTube search
    searchYouTube: (query: string) => Promise<void>;
    clearSearch: () => void;
    importYouTubeUrl: (url: string) => Promise<PlayableItem | null>;
    selectSearchResult: (result: YouTubeSearchResult) => void;

    // Radio
    searchRadio: (query: string) => Promise<void>;
    loadTopRadioStations: () => Promise<void>;
    playRadioStation: (station: RadioBrowserStation) => void;

    // Progress updates (called by player core)
    updateProgress: (currentTime: number, duration: number, buffered?: number) => void;
    setState: (state: PlayerState) => void;
    setError: (error: string | null) => void;

    // UI toggles
    setExpanded: (expanded: boolean) => void;
    toggleExpanded: () => void;
    setSearchOpen: (open: boolean) => void;
    toggleSearch: () => void;
    setPlaylistOpen: (open: boolean) => void;
    togglePlaylist: () => void;
    setRadioBrowserOpen: (open: boolean) => void;
    toggleRadioBrowser: () => void;

    // Background sync
    setSyncToBackground: (sync: boolean) => void;

    // History
    addToHistory: (item: PlayableItem) => void;
    clearHistory: () => void;

    // Helpers
    getCurrentSource: () => PlayerSource | null;
    getPlaylistDuration: () => number;
    getFormattedDuration: (seconds: number) => string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Combined Store Type
// ═══════════════════════════════════════════════════════════════════════════════

export type PlayerStore = PlayerStoreState & PlayerStoreActions;

// ═══════════════════════════════════════════════════════════════════════════════
// Type Guards
// ═══════════════════════════════════════════════════════════════════════════════

export function isYouTubeItem(item: PlayableItem): item is YouTubeItem {
    return item.source === 'youtube';
}

export function isRadioItem(item: PlayableItem): item is RadioItem {
    return item.source === 'radio';
}

// ═══════════════════════════════════════════════════════════════════════════════
// Utility Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface YouTubeUrlParseResult {
    type: YouTubeKind;
    id: string;
}

export interface PlayerKeyboardShortcut {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    action: keyof PlayerStoreActions;
    description: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Persisted State (subset that gets saved)
// ═══════════════════════════════════════════════════════════════════════════════

export interface PlayerPersistedState {
    currentItem: PlayableItem | null;
    playlist: PlayableItem[];
    currentIndex: number;
    volume: number;
    muted: boolean;
    shuffle: boolean;
    repeat: RepeatMode;
    syncToBackground: boolean;
    history: PlayableItem[];
}
