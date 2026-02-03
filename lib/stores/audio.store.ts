/**
 * Audio Store v2
 * Zustand store for ambient audio state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AudioSystemState, AmbientSoundState, PersistedAudioState } from '../types/audio.types';
import { AudioManager } from '../audio/AudioManager';
import { getSoundById, AMBIENT_SOUNDS } from '../constants/audio';

// ============================================
// Store Types
// ============================================

interface AudioStoreState {
    // State
    isUnlocked: boolean;
    masterVolume: number;
    isMasterMuted: boolean;
    activeSounds: Record<string, AmbientSoundState>;
    isAnyPlaying: boolean;

    // UI state
    isMixerOpen: boolean;
    selectedCategory: string | null;
}

interface AudioStoreActions {
    // Initialization
    initialize: () => Promise<void>;

    // Playback
    toggleSound: (soundId: string) => Promise<void>;
    playSound: (soundId: string) => Promise<void>;
    pauseSound: (soundId: string) => void;
    stopSound: (soundId: string) => void;
    stopAllSounds: () => void;

    // Volume
    setSoundVolume: (soundId: string, volume: number) => void;
    setMasterVolume: (volume: number) => void;
    toggleMasterMute: () => void;
    toggleSoundMute: (soundId: string) => void;

    // Presets
    applyAudioPreset: (presetId: string) => Promise<void>;

    // UI
    setMixerOpen: (open: boolean) => void;
    toggleMixer: () => void;
    setSelectedCategory: (category: string | null) => void;

    // Sync
    syncFromManager: () => void;
}

type AudioStore = AudioStoreState & AudioStoreActions;

// ============================================
// Store Creation
// ============================================

export const useAudioStore = create<AudioStore>()(
    persist(
        (set, get) => ({
            // Initial state
            isUnlocked: false,
            masterVolume: 80,
            isMasterMuted: false,
            activeSounds: {},
            isAnyPlaying: false,
            isMixerOpen: false,
            selectedCategory: null,

            // ============================================
            // Initialization
            // ============================================

            initialize: async () => {
                await AudioManager.init();

                // Listen to audio events
                AudioManager.addEventListener((event) => {
                    // Sync state from manager
                    get().syncFromManager();
                });

                // Restore persisted state
                const state = get();
                if (Object.keys(state.activeSounds).length > 0) {
                    const persistedState = {
                        masterVolume: state.masterVolume,
                        isMasterMuted: state.isMasterMuted,
                        activeSounds: Object.values(state.activeSounds).map(s => ({
                            id: s.id,
                            volume: s.volume,
                            isPlaying: s.isPlaying,
                        })),
                        lastUpdated: Date.now(),
                    };
                    await AudioManager.restoreState(persistedState);
                }

                get().syncFromManager();
            },

            // ============================================
            // Playback
            // ============================================

            toggleSound: async (soundId) => {
                const state = get();
                const soundState = state.activeSounds[soundId];

                if (soundState?.isPlaying) {
                    get().pauseSound(soundId);
                } else {
                    await get().playSound(soundId);
                }
            },

            playSound: async (soundId) => {
                await AudioManager.unlock();
                await AudioManager.play(soundId);
                get().syncFromManager();
            },

            pauseSound: (soundId) => {
                AudioManager.pause(soundId);
                get().syncFromManager();
            },

            stopSound: (soundId) => {
                AudioManager.stop(soundId);
                get().syncFromManager();
            },

            stopAllSounds: () => {
                AudioManager.stopAll();
                get().syncFromManager();
            },

            // ============================================
            // Volume
            // ============================================

            setSoundVolume: (soundId, volume) => {
                AudioManager.setVolume(soundId, volume, { duration: 100, easing: 'ease-out' });

                set((state) => ({
                    activeSounds: {
                        ...state.activeSounds,
                        [soundId]: {
                            ...state.activeSounds[soundId],
                            volume,
                        },
                    },
                }));
            },

            setMasterVolume: (volume) => {
                AudioManager.setMasterVolume(volume);
                set({ masterVolume: volume });
            },

            toggleMasterMute: () => {
                const state = get();
                if (state.isMasterMuted) {
                    AudioManager.unmuteAll();
                } else {
                    AudioManager.muteAll();
                }
                set({ isMasterMuted: !state.isMasterMuted });
            },

            toggleSoundMute: (soundId) => {
                AudioManager.toggleMute(soundId);
                get().syncFromManager();
            },

            // ============================================
            // Presets
            // ============================================

            applyAudioPreset: async (presetId) => {
                const { AUDIO_PRESETS } = await import('../constants/audio');
                const preset = AUDIO_PRESETS.find(p => p.id === presetId);

                if (!preset) return;

                // Stop all current sounds
                AudioManager.stopAll();

                // Play preset sounds
                for (const sound of preset.sounds) {
                    await AudioManager.play(sound.id);
                    AudioManager.setVolume(sound.id, sound.volume);
                }

                get().syncFromManager();
            },

            // ============================================
            // UI
            // ============================================

            setMixerOpen: (open) => set({ isMixerOpen: open }),

            toggleMixer: () => set((state) => ({ isMixerOpen: !state.isMixerOpen })),

            setSelectedCategory: (category) => set({ selectedCategory: category }),

            // ============================================
            // Sync
            // ============================================

            syncFromManager: () => {
                const managerState = AudioManager.getState();

                set({
                    isUnlocked: managerState.isUnlocked,
                    masterVolume: managerState.masterVolume,
                    isMasterMuted: managerState.isMasterMuted,
                    activeSounds: managerState.activeSounds,
                    isAnyPlaying: managerState.isAnyPlaying,
                });
            },
        }),
        {
            name: 'lofi-audio-v2',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                masterVolume: state.masterVolume,
                isMasterMuted: state.isMasterMuted,
                activeSounds: Object.fromEntries(
                    Object.entries(state.activeSounds).map(([id, s]) => [
                        id,
                        { id: s.id, volume: s.volume, isPlaying: s.isPlaying, isMuted: s.isMuted, isLoading: false, error: null },
                    ])
                ),
            }),
        }
    )
);

// ============================================
// Selectors
// ============================================

export const selectIsAnyPlaying = (state: AudioStoreState) => state.isAnyPlaying;
export const selectMasterVolume = (state: AudioStoreState) => state.masterVolume;
export const selectIsMasterMuted = (state: AudioStoreState) => state.isMasterMuted;
export const selectActiveSounds = (state: AudioStoreState) => state.activeSounds;
export const selectIsMixerOpen = (state: AudioStoreState) => state.isMixerOpen;

export const selectActiveSoundsList = (state: AudioStoreState) =>
    Object.values(state.activeSounds).filter(s => s.isPlaying);

export const selectSoundState = (soundId: string) => (state: AudioStoreState) =>
    state.activeSounds[soundId];
