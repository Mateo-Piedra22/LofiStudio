/**
 * PlayerCore Component
 * Handles the actual media playback (YouTube iframe and Audio element)
 */

'use client';

import { useEffect, useRef, useCallback, memo } from 'react';
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

    // Clean up interval on unmount
    useEffect(() => {
        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, []);

    // ═══════════════════════════════════════════════════════════════
    // YouTube Player Handlers
    // ═══════════════════════════════════════════════════════════════

    const handleYouTubeReady = useCallback((event: { target: YouTubePlayer }) => {
        youtubePlayerRef.current = event.target;
        event.target.setVolume(volume);
        if (muted) event.target.mute();

        onPlayerReady?.(event.target);

        // Start playing
        if (state === 'loading') {
            event.target.playVideo();
        }
    }, [volume, muted, state, onPlayerReady]);

    const handleYouTubeStateChange = useCallback((event: { data: number }) => {
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
                    if (youtubePlayerRef.current) {
                        const currentTime = youtubePlayerRef.current.getCurrentTime() || 0;
                        const duration = youtubePlayerRef.current.getDuration() || 0;
                        const buffered = youtubePlayerRef.current.getVideoLoadedFraction() * duration;
                        updateProgress(currentTime, duration, buffered);
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
        console.error('YouTube error:', event.data);
        setError(`YouTube error: ${event.data}`);
        setState('error');
    }, [setError, setState]);

    // ═══════════════════════════════════════════════════════════════
    // Audio Element Handlers (for Radio)
    // ═══════════════════════════════════════════════════════════════

    const handleAudioPlay = useCallback(() => {
        setState('playing');
        setError(null);
    }, [setState, setError]);

    const handleAudioPause = useCallback(() => {
        setState('paused');
    }, [setState]);

    const handleAudioError = useCallback((e: Event) => {
        console.error('Audio error:', e);
        setError('Failed to load radio stream');
        setState('error');
    }, [setError, setState]);

    const handleAudioWaiting = useCallback(() => {
        setState('buffering');
    }, [setState]);

    // ═══════════════════════════════════════════════════════════════
    // Sync volume/mute to players
    // ═══════════════════════════════════════════════════════════════

    useEffect(() => {
        if (youtubePlayerRef.current) {
            youtubePlayerRef.current.setVolume(volume);
            if (muted) {
                youtubePlayerRef.current.mute();
            } else {
                youtubePlayerRef.current.unMute();
            }
        }
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
            audioRef.current.muted = muted;
        }
    }, [volume, muted]);

    // ═══════════════════════════════════════════════════════════════
    // Handle item changes
    // ═══════════════════════════════════════════════════════════════

    useEffect(() => {
        // Stop audio when switching to YouTube
        if (currentItem && isYouTubeItem(currentItem) && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }

        // Handle radio playback
        if (currentItem && isRadioItem(currentItem)) {
            if (youtubePlayerRef.current) {
                youtubePlayerRef.current.stopVideo();
            }

            if (!audioRef.current) {
                audioRef.current = new Audio();
                audioRef.current.addEventListener('play', handleAudioPlay);
                audioRef.current.addEventListener('pause', handleAudioPause);
                audioRef.current.addEventListener('error', handleAudioError);
                audioRef.current.addEventListener('waiting', handleAudioWaiting);
            }

            audioRef.current.src = currentItem.streamUrl;
            audioRef.current.volume = volume / 100;
            audioRef.current.muted = muted;
            audioRef.current.play().catch(console.error);
        }
    }, [currentItem, volume, muted, handleAudioPlay, handleAudioPause, handleAudioError, handleAudioWaiting]);

    // ═══════════════════════════════════════════════════════════════
    // Handle play/pause from store
    // ═══════════════════════════════════════════════════════════════

    useEffect(() => {
        if (!currentItem) return;

        if (state === 'loading') {
            if (isYouTubeItem(currentItem) && youtubePlayerRef.current) {
                youtubePlayerRef.current.playVideo();
            } else if (isRadioItem(currentItem) && audioRef.current) {
                audioRef.current.play().catch(console.error);
            }
        }
    }, [state, currentItem]);

    // ═══════════════════════════════════════════════════════════════
    // Cleanup on unmount
    // ═══════════════════════════════════════════════════════════════

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.removeEventListener('play', handleAudioPlay);
                audioRef.current.removeEventListener('pause', handleAudioPause);
                audioRef.current.removeEventListener('error', handleAudioError);
                audioRef.current.removeEventListener('waiting', handleAudioWaiting);
            }
        };
    }, [handleAudioPlay, handleAudioPause, handleAudioError, handleAudioWaiting]);

    // ═══════════════════════════════════════════════════════════════
    // Render
    // ═══════════════════════════════════════════════════════════════

    const youtubeId = currentItem && isYouTubeItem(currentItem) ? currentItem.youtubeId : null;

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
        },
    };

    if (!youtubeId) {
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
