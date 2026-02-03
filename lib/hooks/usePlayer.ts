/**
 * usePlayer hook
 * Provides a simplified interface to the player store with additional utilities
 */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePlayerStore } from '@/lib/stores/player.store';
import type { PlayableItem, YouTubeItem, RadioItem, PlayerState } from '@/lib/types/player.types';

export function usePlayer() {
    const store = usePlayerStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const youtubePlayerRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize on mount
    useEffect(() => {
        store.initialize();
    }, []);

    // Set YouTube player reference
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setYouTubePlayer = useCallback((player: any) => {
        youtubePlayerRef.current = player;
    }, []);

    // Set Audio element reference (for radio)
    const setAudioElement = useCallback((audio: HTMLAudioElement | null) => {
        audioRef.current = audio;
    }, []);

    // Unified play control
    const handlePlay = useCallback(() => {
        const item = store.currentItem;
        if (!item) return;

        if (item.source === 'youtube' && youtubePlayerRef.current) {
            youtubePlayerRef.current.playVideo();
        } else if (item.source === 'radio' && audioRef.current) {
            audioRef.current.play().catch(console.error);
        }
    }, [store.currentItem]);

    // Unified pause control
    const handlePause = useCallback(() => {
        const item = store.currentItem;
        if (!item) return;

        if (item.source === 'youtube' && youtubePlayerRef.current) {
            youtubePlayerRef.current.pauseVideo();
        } else if (item.source === 'radio' && audioRef.current) {
            audioRef.current.pause();
        }
    }, [store.currentItem]);

    // Unified seek control
    const handleSeek = useCallback((time: number) => {
        const item = store.currentItem;
        if (!item) return;

        if (item.source === 'youtube' && youtubePlayerRef.current) {
            youtubePlayerRef.current.seekTo(time, true);
        }
        // Radio doesn't support seeking
    }, [store.currentItem]);

    // Unified volume control
    const handleVolumeChange = useCallback((volume: number) => {
        store.setVolume(volume);

        if (youtubePlayerRef.current) {
            youtubePlayerRef.current.setVolume(volume);
        }
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [store.setVolume]);

    // Sync volume on mute toggle
    useEffect(() => {
        if (youtubePlayerRef.current) {
            if (store.muted) {
                youtubePlayerRef.current.mute();
            } else {
                youtubePlayerRef.current.unMute();
                youtubePlayerRef.current.setVolume(store.volume);
            }
        }
        if (audioRef.current) {
            audioRef.current.muted = store.muted;
        }
    }, [store.muted, store.volume]);

    return {
        // State
        currentItem: store.currentItem,
        state: store.state,
        error: store.error,
        progress: store.progress,
        volume: store.volume,
        muted: store.muted,
        playlist: store.playlist,
        currentIndex: store.currentIndex,
        shuffle: store.shuffle,
        repeat: store.repeat,
        history: store.history,
        isInitialized: store.isInitialized,

        // UI State
        isExpanded: store.isExpanded,
        isSearchOpen: store.isSearchOpen,
        isPlaylistOpen: store.isPlaylistOpen,
        isRadioBrowserOpen: store.isRadioBrowserOpen,

        // Search State
        searchQuery: store.searchQuery,
        searchResults: store.searchResults,
        isSearching: store.isSearching,

        // Radio State
        radioStations: store.radioStations,
        radioSearchQuery: store.radioSearchQuery,
        isLoadingRadio: store.isLoadingRadio,

        // Background
        syncToBackground: store.syncToBackground,

        // Refs
        setYouTubePlayer,
        setAudioElement,

        // Playback Actions
        play: store.play,
        pause: store.pause,
        togglePlay: store.togglePlay,
        stop: store.stop,
        next: store.next,
        previous: store.previous,
        playAtIndex: store.playAtIndex,
        seekTo: store.seekTo,
        seekByPercent: store.seekByPercent,

        // Volume Actions
        setVolume: handleVolumeChange,
        toggleMute: store.toggleMute,

        // Playlist Actions
        addToPlaylist: store.addToPlaylist,
        addMultipleToPlaylist: store.addMultipleToPlaylist,
        removeFromPlaylist: store.removeFromPlaylist,
        reorderPlaylist: store.reorderPlaylist,
        clearPlaylist: store.clearPlaylist,

        // Repeat/Shuffle
        setRepeat: store.setRepeat,
        cycleRepeat: store.cycleRepeat,
        toggleShuffle: store.toggleShuffle,

        // Search Actions
        searchYouTube: store.searchYouTube,
        clearSearch: store.clearSearch,
        importYouTubeUrl: store.importYouTubeUrl,
        selectSearchResult: store.selectSearchResult,

        // Radio Actions
        searchRadio: store.searchRadio,
        loadTopRadioStations: store.loadTopRadioStations,
        playRadioStation: store.playRadioStation,

        // Progress Updates
        updateProgress: store.updateProgress,
        setState: store.setState,
        setError: store.setError,

        // UI Actions
        setExpanded: store.setExpanded,
        toggleExpanded: store.toggleExpanded,
        setSearchOpen: store.setSearchOpen,
        toggleSearch: store.toggleSearch,
        setPlaylistOpen: store.setPlaylistOpen,
        togglePlaylist: store.togglePlaylist,
        setRadioBrowserOpen: store.setRadioBrowserOpen,
        toggleRadioBrowser: store.toggleRadioBrowser,

        // History
        clearHistory: store.clearHistory,

        // Helpers
        getCurrentSource: store.getCurrentSource,
        getPlaylistDuration: store.getPlaylistDuration,
        formatDuration: store.getFormattedDuration,
    };
}

export type UsePlayerReturn = ReturnType<typeof usePlayer>;
