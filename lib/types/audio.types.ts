/**
 * Audio System Types v2
 * Type definitions for the ambient audio system
 */

// ============================================
// Ambient Sound Definitions
// ============================================

/**
 * Category of ambient sounds
 */
export type SoundCategory =
    | 'nature'
    | 'weather'
    | 'urban'
    | 'indoor'
    | 'abstract';

/**
 * Ambient sound definition (static metadata)
 */
export interface AmbientSoundDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;  // Lucide icon name
    category: SoundCategory;
    src: string;  // Path to audio file
    defaultVolume: number;  // 0-100
    tags: string[];
}

// ============================================
// Audio State
// ============================================

/**
 * State of a single ambient sound
 */
export interface AmbientSoundState {
    id: string;
    isPlaying: boolean;
    volume: number;  // 0-100
    isMuted: boolean;
    isLoading: boolean;
    error: string | null;
}

/**
 * Global audio system state
 */
export interface AudioSystemState {
    isUnlocked: boolean;  // Has user interacted to unlock audio?
    masterVolume: number;  // 0-100
    isMasterMuted: boolean;
    activeSounds: Record<string, AmbientSoundState>;
    isAnyPlaying: boolean;
}

// ============================================
// Audio Operations
// ============================================

/**
 * Fade configuration for volume transitions
 */
export interface FadeConfig {
    duration: number;  // Duration in milliseconds
    easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

/**
 * Crossfade configuration between sounds
 */
export interface CrossfadeConfig {
    fadeOutDuration: number;
    fadeInDuration: number;
    overlap: number;  // Overlap time in ms
}

/**
 * Audio preset for quick configuration
 */
export interface AudioPreset {
    id: string;
    name: string;
    description: string;
    icon: string;
    sounds: Array<{
        id: string;
        volume: number;
    }>;
}

// ============================================
// Audio Manager Interface
// ============================================

/**
 * Interface for the audio manager singleton
 */
export interface IAudioManager {
    // Lifecycle
    init(): Promise<void>;
    dispose(): void;
    unlock(): Promise<boolean>;

    // Playback control
    play(soundId: string): Promise<void>;
    pause(soundId: string): void;
    stop(soundId: string): void;
    stopAll(): void;

    // Volume control
    setVolume(soundId: string, volume: number, fade?: FadeConfig): void;
    setMasterVolume(volume: number): void;
    mute(soundId: string): void;
    unmute(soundId: string): void;
    toggleMute(soundId: string): void;
    muteAll(): void;
    unmuteAll(): void;

    // Fade operations
    fadeIn(soundId: string, targetVolume: number, duration: number): Promise<void>;
    fadeOut(soundId: string, duration: number): Promise<void>;
    crossfade(fromId: string, toId: string, config: CrossfadeConfig): Promise<void>;

    // State
    getState(): AudioSystemState;
    isPlaying(soundId: string): boolean;
    getVolume(soundId: string): number;
}

// ============================================
// Persistence
// ============================================

/**
 * Serializable audio state for persistence
 */
export interface PersistedAudioState {
    masterVolume: number;
    isMasterMuted: boolean;
    activeSounds: Array<{
        id: string;
        volume: number;
        isPlaying: boolean;
    }>;
    lastUpdated: number;
}

// ============================================
// Events
// ============================================

/**
 * Audio event types
 */
export type AudioEventType =
    | 'play'
    | 'pause'
    | 'stop'
    | 'volume-change'
    | 'mute'
    | 'unmute'
    | 'error'
    | 'loading'
    | 'loaded'
    | 'unlock';

/**
 * Audio event payload
 */
export interface AudioEvent {
    type: AudioEventType;
    soundId?: string;
    data?: unknown;
    timestamp: number;
}

/**
 * Audio event listener
 */
export type AudioEventListener = (event: AudioEvent) => void;
