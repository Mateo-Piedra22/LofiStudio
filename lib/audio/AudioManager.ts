/**
 * AudioManager v2
 * Singleton class for managing ambient audio using Web Audio API
 */

import type {
    IAudioManager,
    FadeConfig,
    CrossfadeConfig,
    AudioSystemState,
    AmbientSoundState,
    AudioEvent,
    AudioEventListener,
    AudioEventType
} from '../types/audio.types';
import { DEFAULT_FADE_CONFIG, getSoundById } from '../constants/audio';

/**
 * Audio Manager Singleton
 * Handles all audio operations with Web Audio API for professional control
 */
class AudioManagerClass implements IAudioManager {
    private static instance: AudioManagerClass | null = null;

    // Web Audio API
    private audioContext: AudioContext | null = null;
    private masterGain: GainNode | null = null;

    // Audio elements and gain nodes per sound
    private audioElements: Map<string, HTMLAudioElement> = new Map();
    private gainNodes: Map<string, GainNode> = new Map();
    private sourceNodes: Map<string, MediaElementAudioSourceNode> = new Map();

    // State
    private state: AudioSystemState = {
        isUnlocked: false,
        masterVolume: 80,
        isMasterMuted: false,
        activeSounds: {},
        isAnyPlaying: false,
    };

    // Event listeners
    private listeners: Set<AudioEventListener> = new Set();

    // Fade animations
    private fadeAnimations: Map<string, number> = new Map();

    private constructor() { }

    static getInstance(): AudioManagerClass {
        if (!AudioManagerClass.instance) {
            AudioManagerClass.instance = new AudioManagerClass();
        }
        return AudioManagerClass.instance;
    }

    // ============================================
    // Lifecycle
    // ============================================

    async init(): Promise<void> {
        if (typeof window === 'undefined') return;

        // Create audio context (suspended by default on most browsers)
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.state.masterVolume / 100;
        }

        this.emit({ type: 'loading', timestamp: Date.now() });
    }

    dispose(): void {
        this.stopAll();

        // Clean up all audio elements
        this.audioElements.forEach((audio) => {
            audio.pause();
            audio.src = '';
        });
        this.audioElements.clear();
        this.gainNodes.clear();
        this.sourceNodes.clear();

        // Close audio context
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        this.audioContext = null;
        this.masterGain = null;

        // Clear fade animations
        this.fadeAnimations.forEach((id) => cancelAnimationFrame(id));
        this.fadeAnimations.clear();
    }

    async unlock(): Promise<boolean> {
        if (this.state.isUnlocked) return true;

        try {
            if (!this.audioContext) {
                await this.init();
            }

            if (this.audioContext?.state === 'suspended') {
                await this.audioContext.resume();
            }

            // Create and play a silent buffer to unlock on iOS
            if (this.audioContext) {
                const buffer = this.audioContext.createBuffer(1, 1, 22050);
                const source = this.audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(this.audioContext.destination);
                source.start(0);
            }

            this.state.isUnlocked = true;
            this.emit({ type: 'unlock', timestamp: Date.now() });
            return true;
        } catch (error) {
            console.error('Failed to unlock audio:', error);
            return false;
        }
    }

    // ============================================
    // Playback Control
    // ============================================

    async play(soundId: string): Promise<void> {
        if (!this.state.isUnlocked) {
            await this.unlock();
        }

        const sound = getSoundById(soundId);
        if (!sound) {
            console.warn(`Sound not found: ${soundId}`);
            return;
        }

        let audio = this.audioElements.get(soundId);

        // Create audio element if it doesn't exist
        if (!audio) {
            audio = new Audio(sound.src);
            audio.loop = true;
            audio.preload = 'auto';

            // Connect to Web Audio API for gain control
            if (this.audioContext && this.masterGain) {
                const source = this.audioContext.createMediaElementSource(audio);
                const gain = this.audioContext.createGain();

                source.connect(gain);
                gain.connect(this.masterGain);

                this.sourceNodes.set(soundId, source);
                this.gainNodes.set(soundId, gain);

                // Set initial volume
                const currentState = this.state.activeSounds[soundId];
                const volume = currentState?.volume ?? sound.defaultVolume;
                gain.gain.value = volume / 100;
            }

            this.audioElements.set(soundId, audio);
        }

        try {
            // Update state
            const currentState = this.state.activeSounds[soundId] || {
                id: soundId,
                isPlaying: false,
                volume: sound.defaultVolume,
                isMuted: false,
                isLoading: true,
                error: null,
            };

            currentState.isLoading = true;
            this.state.activeSounds[soundId] = currentState;
            this.emit({ type: 'loading', soundId, timestamp: Date.now() });

            await audio.play();

            currentState.isPlaying = true;
            currentState.isLoading = false;
            this.updateIsAnyPlaying();

            this.emit({ type: 'play', soundId, timestamp: Date.now() });
        } catch (error) {
            console.error(`Failed to play sound ${soundId}:`, error);
            const currentState = this.state.activeSounds[soundId];
            if (currentState) {
                currentState.isPlaying = false;
                currentState.isLoading = false;
                currentState.error = 'Failed to play';
            }
            this.emit({ type: 'error', soundId, data: error, timestamp: Date.now() });
        }
    }

    pause(soundId: string): void {
        const audio = this.audioElements.get(soundId);
        if (audio) {
            audio.pause();
            const state = this.state.activeSounds[soundId];
            if (state) {
                state.isPlaying = false;
            }
            this.updateIsAnyPlaying();
            this.emit({ type: 'pause', soundId, timestamp: Date.now() });
        }
    }

    stop(soundId: string): void {
        const audio = this.audioElements.get(soundId);
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }

        delete this.state.activeSounds[soundId];
        this.updateIsAnyPlaying();
        this.emit({ type: 'stop', soundId, timestamp: Date.now() });
    }

    stopAll(): void {
        this.audioElements.forEach((audio, id) => {
            audio.pause();
            audio.currentTime = 0;
            delete this.state.activeSounds[id];
        });
        this.updateIsAnyPlaying();
        this.emit({ type: 'stop', timestamp: Date.now() });
    }

    // ============================================
    // Volume Control
    // ============================================

    setVolume(soundId: string, volume: number, fade?: FadeConfig): void {
        const clampedVolume = Math.max(0, Math.min(100, volume));

        if (fade && fade.duration > 0) {
            this.animateVolume(soundId, clampedVolume, fade);
        } else {
            this.setVolumeImmediate(soundId, clampedVolume);
        }

        // Update state
        const state = this.state.activeSounds[soundId];
        if (state) {
            state.volume = clampedVolume;
        }

        this.emit({ type: 'volume-change', soundId, data: clampedVolume, timestamp: Date.now() });
    }

    private setVolumeImmediate(soundId: string, volume: number): void {
        const gain = this.gainNodes.get(soundId);
        if (gain) {
            gain.gain.value = volume / 100;
        }
    }

    private animateVolume(soundId: string, targetVolume: number, fade: FadeConfig): void {
        // Cancel existing animation
        const existingAnimation = this.fadeAnimations.get(soundId);
        if (existingAnimation) {
            cancelAnimationFrame(existingAnimation);
        }

        const gain = this.gainNodes.get(soundId);
        if (!gain) return;

        const startVolume = gain.gain.value * 100;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / fade.duration, 1);

            // Apply easing
            const easedProgress = this.applyEasing(progress, fade.easing);

            // Interpolate volume
            const currentVolume = startVolume + (targetVolume - startVolume) * easedProgress;
            gain.gain.value = currentVolume / 100;

            if (progress < 1) {
                this.fadeAnimations.set(soundId, requestAnimationFrame(animate));
            } else {
                this.fadeAnimations.delete(soundId);
            }
        };

        this.fadeAnimations.set(soundId, requestAnimationFrame(animate));
    }

    private applyEasing(t: number, easing: FadeConfig['easing']): number {
        switch (easing) {
            case 'ease-in':
                return t * t;
            case 'ease-out':
                return t * (2 - t);
            case 'ease-in-out':
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            case 'linear':
            default:
                return t;
        }
    }

    setMasterVolume(volume: number): void {
        this.state.masterVolume = Math.max(0, Math.min(100, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.state.masterVolume / 100;
        }
        this.emit({ type: 'volume-change', data: volume, timestamp: Date.now() });
    }

    mute(soundId: string): void {
        const state = this.state.activeSounds[soundId];
        if (state) {
            state.isMuted = true;
            this.setVolumeImmediate(soundId, 0);
        }
        this.emit({ type: 'mute', soundId, timestamp: Date.now() });
    }

    unmute(soundId: string): void {
        const state = this.state.activeSounds[soundId];
        if (state) {
            state.isMuted = false;
            this.setVolumeImmediate(soundId, state.volume);
        }
        this.emit({ type: 'unmute', soundId, timestamp: Date.now() });
    }

    toggleMute(soundId: string): void {
        const state = this.state.activeSounds[soundId];
        if (state?.isMuted) {
            this.unmute(soundId);
        } else {
            this.mute(soundId);
        }
    }

    muteAll(): void {
        this.state.isMasterMuted = true;
        if (this.masterGain) {
            this.masterGain.gain.value = 0;
        }
        this.emit({ type: 'mute', timestamp: Date.now() });
    }

    unmuteAll(): void {
        this.state.isMasterMuted = false;
        if (this.masterGain) {
            this.masterGain.gain.value = this.state.masterVolume / 100;
        }
        this.emit({ type: 'unmute', timestamp: Date.now() });
    }

    // ============================================
    // Fade Operations
    // ============================================

    async fadeIn(soundId: string, targetVolume: number, duration: number): Promise<void> {
        // Start at 0 volume
        this.setVolumeImmediate(soundId, 0);

        // Start playing if not already
        const state = this.state.activeSounds[soundId];
        if (!state?.isPlaying) {
            await this.play(soundId);
        }

        // Fade to target
        this.setVolume(soundId, targetVolume, { duration, easing: 'ease-out' });

        // Wait for fade to complete
        return new Promise(resolve => setTimeout(resolve, duration));
    }

    async fadeOut(soundId: string, duration: number): Promise<void> {
        // Fade to 0
        this.setVolume(soundId, 0, { duration, easing: 'ease-in' });

        // Wait and then stop
        return new Promise(resolve => {
            setTimeout(() => {
                this.stop(soundId);
                resolve();
            }, duration);
        });
    }

    async crossfade(fromId: string, toId: string, config: CrossfadeConfig): Promise<void> {
        // Start fade out of current
        const fadeOutPromise = this.fadeOut(fromId, config.fadeOutDuration);

        // Wait for overlap period then start fade in
        await new Promise(resolve => setTimeout(resolve, config.fadeOutDuration - config.overlap));

        const sound = getSoundById(toId);
        const targetVolume = sound?.defaultVolume ?? 50;
        const fadeInPromise = this.fadeIn(toId, targetVolume, config.fadeInDuration);

        await Promise.all([fadeOutPromise, fadeInPromise]);
    }

    // ============================================
    // State
    // ============================================

    getState(): AudioSystemState {
        return { ...this.state };
    }

    isPlaying(soundId: string): boolean {
        return this.state.activeSounds[soundId]?.isPlaying ?? false;
    }

    getVolume(soundId: string): number {
        return this.state.activeSounds[soundId]?.volume ?? 0;
    }

    private updateIsAnyPlaying(): void {
        this.state.isAnyPlaying = Object.values(this.state.activeSounds)
            .some(s => s.isPlaying);
    }

    // ============================================
    // Events
    // ============================================

    addEventListener(listener: AudioEventListener): void {
        this.listeners.add(listener);
    }

    removeEventListener(listener: AudioEventListener): void {
        this.listeners.delete(listener);
    }

    private emit(event: AudioEvent): void {
        this.listeners.forEach(listener => listener(event));
    }

    // ============================================
    // Persistence Helpers
    // ============================================

    /**
     * Get current state for persistence
     */
    getPersistedState() {
        return {
            masterVolume: this.state.masterVolume,
            isMasterMuted: this.state.isMasterMuted,
            activeSounds: Object.values(this.state.activeSounds).map(s => ({
                id: s.id,
                volume: s.volume,
                isPlaying: s.isPlaying,
            })),
            lastUpdated: Date.now(),
        };
    }

    /**
     * Restore state from persistence
     */
    async restoreState(persisted: ReturnType<typeof this.getPersistedState>): Promise<void> {
        this.state.masterVolume = persisted.masterVolume;
        this.state.isMasterMuted = persisted.isMasterMuted;

        if (this.masterGain) {
            this.masterGain.gain.value = persisted.isMasterMuted
                ? 0
                : persisted.masterVolume / 100;
        }

        // Restore active sounds
        for (const sound of persisted.activeSounds) {
            this.state.activeSounds[sound.id] = {
                id: sound.id,
                isPlaying: false, // Will be set by play()
                volume: sound.volume,
                isMuted: false,
                isLoading: false,
                error: null,
            };

            if (sound.isPlaying) {
                await this.play(sound.id);
                this.setVolume(sound.id, sound.volume);
            }
        }
    }
}

// Export singleton instance
export const AudioManager = AudioManagerClass.getInstance();

// Export type for testing
export type { AudioManagerClass };
