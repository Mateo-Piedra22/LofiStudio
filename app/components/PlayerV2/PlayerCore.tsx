/**
 * PlayerCore Component
 * Handles the actual media playback (YouTube iframe and Audio element)
 */

'use client';

import { useEffect, useRef, useCallback, memo, useState } from 'react';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import { usePlayerStore } from '@/lib/stores/player.store';
import { isYouTubeItem, isRadioItem } from '@/lib/types/player.types';

interface PlayerCoreProps {
    className?: string;
    onPlayerReady?: (player: YouTubePlayer) => void;
}

export const PlayerCore = memo(function PlayerCore({ className, onPlayerReady }: PlayerCoreProps) {
    const currentItem = usePlayerStore(s => s.currentItem);
    const state = usePlayerStore(s => s.state);
    const volume = usePlayerStore(s => s.volume);
    const muted = usePlayerStore(s => s.muted);
    const syncToBackground = usePlayerStore(s => s.syncToBackground);

    const updateProgress = usePlayerStore(s => s.updateProgress);
    const setState = usePlayerStore(s => s.setState);
    const setError = usePlayerStore(s => s.setError);
    const next = usePlayerStore(s => s.next);

    const youtubePlayerRef = useRef<YouTubePlayer | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isUnmountedRef = useRef(false);

    // Clean up interval on unmount
    useEffect(() => {
        isUnmountedRef.current = false;
        return () => {
            isUnmountedRef.current = true;
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            // Cleanup audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
                audioRef.current = null;
            }
        };
    }, []);

    // ═══════════════════════════════════════════════════════════════
    // YouTube Player Handlers
    // ═══════════════════════════════════════════════════════════════

    const handleYouTubeReady = useCallback((event: { target: YouTubePlayer }) => {
        if (isUnmountedRef.current) return;

        youtubePlayerRef.current = event.target;
        event.target.setVolume(volume);
        if (muted) event.target.mute();

        onPlayerReady?.(event.target);

        // Start playing if state demands it
        if (state === 'loading' || state === 'playing') {
            try {
                event.target.playVideo();
            } catch (e) {
                console.warn('[PlayerCore] Safe play failed on ready', e);
            }
        }
    }, [volume, muted, state, onPlayerReady]);

    const handleYouTubeStateChange = useCallback((event: { data: number }) => {
        if (isUnmountedRef.current) return;

        const YT_STATES = {
            UNSTARTED: -1,
            ENDED: 0,
            PLAYING: 1,
            PAUSED: 2,
            BUFFERING: 3,
            CUED: 5,
        };

        switch (event.data) {
            case YT_STATES.PLAYING:
                setState('playing');
                setError(null);

                // Start progress tracking
                if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                }
                progressIntervalRef.current = setInterval(() => {
                    if (isUnmountedRef.current) return;
                    if (youtubePlayerRef.current && typeof youtubePlayerRef.current.getCurrentTime === 'function') {
                        try {
                            const currentTime = youtubePlayerRef.current.getCurrentTime() || 0;
                            const duration = youtubePlayerRef.current.getDuration() || 0;
                            const fraction = youtubePlayerRef.current.getVideoLoadedFraction ? youtubePlayerRef.current.getVideoLoadedFraction() : 0;
                            const buffered = fraction * duration;
                            updateProgress(currentTime, duration, buffered);
                        } catch (e) {
                            // Ignore API errors during seek/unload
                        }
                    }
                }, 250);
                break;

            case YT_STATES.PAUSED:
                setState('paused');
                if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                }
                break;

            case YT_STATES.BUFFERING:
                setState('buffering');
                break;

            case YT_STATES.ENDED:
                if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                }
                next();
                break;
        }
    }, [setState, setError, updateProgress, next]);

    const handleYouTubeError = useCallback((event: { data: number }) => {
        if (isUnmountedRef.current) return;
        console.error('YouTube error:', event.data);
        setError(`YouTube error: ${event.data}`);
        setState('error');
    }, [setError, setState]);

    // ═══════════════════════════════════════════════════════════════
    // Audio Element Handlers (for Radio)
    // ═══════════════════════════════════════════════════════════════

    const handleAudioPlay = useCallback(() => {
        if (isUnmountedRef.current) return;
        setState('playing');
        setError(null);
    }, [setState, setError]);

    const handleAudioPause = useCallback(() => {
        if (isUnmountedRef.current) return;
        setState('paused');
    }, [setState]);

    const handleAudioError = useCallback((e: Event | string) => {
        if (isUnmountedRef.current) return;
        console.error('Audio error:', e);
        setError('Failed to load radio stream');
        setState('error');
    }, [setError, setState]);

    const handleAudioWaiting = useCallback(() => {
        if (isUnmountedRef.current) return;
        setState('buffering');
    }, [setState]);

    // ═══════════════════════════════════════════════════════════════
    // Sync volume/mute to players
    // ═══════════════════════════════════════════════════════════════

    useEffect(() => {
        if (youtubePlayerRef.current && typeof youtubePlayerRef.current.setVolume === 'function') {
            try {
                youtubePlayerRef.current.setVolume(volume);
                if (muted) {
                    youtubePlayerRef.current.mute();
                } else {
                    youtubePlayerRef.current.unMute();
                }
            } catch (e) {
                // Ignore
            }
        }
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
            audioRef.current.muted = muted;
        }
    }, [volume, muted]);

    // ═══════════════════════════════════════════════════════════════
    // Handle item changes (Switching Sources)
    // ═══════════════════════════════════════════════════════════════

    useEffect(() => {
        // Safe cleanup when switching modes
        if (currentItem && isYouTubeItem(currentItem)) {
            // STOP Audio if playing
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
                // Don't nullify ref, just clear src
            }
        }

        if (currentItem && isRadioItem(currentItem)) {
            // PAUSE YouTube if playing (don't stop/destroy to avoid iframe errors)
            if (youtubePlayerRef.current && typeof youtubePlayerRef.current.pauseVideo === 'function') {
                try {
                    youtubePlayerRef.current.pauseVideo();
                } catch (e) {
                    console.warn('[PlayerCore] Failed to pause YouTube on switch', e);
                }
            }

            // Initialize Audio if needed
            if (!audioRef.current) {
                audioRef.current = new Audio();
                // Attach listeners
                audioRef.current.addEventListener('playing', handleAudioPlay);
                audioRef.current.addEventListener('pause', handleAudioPause);
                audioRef.current.addEventListener('error', handleAudioError);
                audioRef.current.addEventListener('waiting', handleAudioWaiting);
            }

            // If new stream or not set
            if (audioRef.current.src !== currentItem.streamUrl) {
                audioRef.current.src = currentItem.streamUrl;
                audioRef.current.volume = volume / 100;
                audioRef.current.muted = muted;

                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        if (error.name === 'NotAllowedError') {
                            console.debug('[PlayerCore] Autoplay prevented (Audio)');
                            setState('paused');
                        } else {
                            console.error('[PlayerCore] Stream play failed', error);
                            // handleAudioError(error); // Optional
                        }
                    });
                }
            }
        }
    }, [currentItem, volume, muted, handleAudioPlay, handleAudioPause, handleAudioError, handleAudioWaiting]);

    // ═══════════════════════════════════════════════════════════════
    // Handle play/pause commands from store
    // ═══════════════════════════════════════════════════════════════

    useEffect(() => {
        if (!currentItem || isUnmountedRef.current) return;

        if (state === 'playing') {
            if (isYouTubeItem(currentItem) && youtubePlayerRef.current) {
                try {
                    // Check if actually playing to avoid loop
                    const state = youtubePlayerRef.current.getPlayerState();
                    if (state !== 1 && state !== 3) {
                        youtubePlayerRef.current.playVideo();
                    }
                } catch (e) { }
            } else if (isRadioItem(currentItem) && audioRef.current) {
                if (audioRef.current.paused) {
                    audioRef.current.play().catch(() => setState('paused'));
                }
            }
        } else if (state === 'paused') {
            if (isYouTubeItem(currentItem) && youtubePlayerRef.current) {
                try {
                    youtubePlayerRef.current.pauseVideo();
                } catch (e) { }
            } else if (isRadioItem(currentItem) && audioRef.current) {
                audioRef.current.pause();
            }
        }
    }, [state, currentItem, setState]);


    // ═══════════════════════════════════════════════════════════════
    // Render
    // ═══════════════════════════════════════════════════════════════

    const youtubeId = currentItem && isYouTubeItem(currentItem) ? currentItem.youtubeId : null;

    // We can ALWAYS render the YouTube component but hide it when unnecessary.
    // This keeps the iframe alive and prevents "this.g is null" errors on remount/unmount.
    // However, if we change ID, it reloads.

    // OPTION: Only render if we have an ID.
    // React-YouTube handles ID changes well.
    // The issue is likely unmounting the component while it's active.

    const opts: YouTubeProps['opts'] = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            origin: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
        },
    };

    // If no YouTube ID ever, we can return null, but best to keep structure stable if possible.
    if (!youtubeId && state === 'idle') return null;

    // If radio is active, we still want to keep YouTube mounted but hidden IF we were just watching it?
    // No, if we switch to radio, currentItem is Radio. youtubeId is null.
    // So YouTube component UNMOUNTS.
    // This is where "this.g is null" happens if we called a method on it right before unmount.

    // To solve this, we can check `youtubeId`.

    if (!youtubeId) {
        // If unmounting, ensure we don't have pending calls.
        // returns null unmounts it.
        return null;
    }

    return (
        <div
            className={className}
            style={{
                position: syncToBackground ? 'fixed' : 'relative',
                opacity: syncToBackground ? 0 : 1,
                pointerEvents: syncToBackground ? 'none' : 'auto',
                zIndex: syncToBackground ? -1 : 1,
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
            }}
        >
            <YouTube
                videoId={youtubeId}
                opts={opts}
                onReady={handleYouTubeReady}
                onStateChange={handleYouTubeStateChange}
                onError={handleYouTubeError}
                className="w-full h-full"
                iframeClassName="w-full h-full"
            />
        </div>
    );
});
