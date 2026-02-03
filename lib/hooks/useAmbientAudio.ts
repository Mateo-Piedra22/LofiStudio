/**
 * useAmbientAudio Hook v2
 * Hook for consuming the ambient audio system
 */

'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useAudioStore, selectIsAnyPlaying, selectMasterVolume, selectActiveSounds, selectActiveSoundsList, selectIsMixerOpen } from '../stores/audio.store';
import { AMBIENT_SOUNDS, AUDIO_PRESETS, getSoundById, getSoundsGroupedByCategory, SOUND_CATEGORY_LABELS } from '../constants/audio';
import type { AmbientSoundDefinition, AudioPreset, SoundCategory } from '../types/audio.types';

/**
 * Main hook for the ambient audio system
 */
export function useAmbientAudio() {
    const store = useAudioStore();

    // Selectors
    const isAnyPlaying = useAudioStore(selectIsAnyPlaying);
    const masterVolume = useAudioStore(selectMasterVolume);
    const activeSounds = useAudioStore(selectActiveSounds);
    const activeSoundsList = useAudioStore(selectActiveSoundsList);
    const isMixerOpen = useAudioStore(selectIsMixerOpen);

    // Initialize on mount
    useEffect(() => {
        store.initialize();
    }, []);

    // Memoized data
    const allSounds = useMemo(() => AMBIENT_SOUNDS, []);
    const soundsByCategory = useMemo(() => getSoundsGroupedByCategory(), []);
    const categories = useMemo(() => Object.keys(soundsByCategory) as SoundCategory[], [soundsByCategory]);
    const presets = useMemo(() => AUDIO_PRESETS, []);

    // Actions
    const toggleSound = useCallback((soundId: string) => {
        store.toggleSound(soundId);
    }, [store]);

    const playSound = useCallback((soundId: string) => {
        store.playSound(soundId);
    }, [store]);

    const pauseSound = useCallback((soundId: string) => {
        store.pauseSound(soundId);
    }, [store]);

    const stopSound = useCallback((soundId: string) => {
        store.stopSound(soundId);
    }, [store]);

    const stopAll = useCallback(() => {
        store.stopAllSounds();
    }, [store]);

    const setSoundVolume = useCallback((soundId: string, volume: number) => {
        store.setSoundVolume(soundId, volume);
    }, [store]);

    const setMasterVolume = useCallback((volume: number) => {
        store.setMasterVolume(volume);
    }, [store]);

    const toggleMasterMute = useCallback(() => {
        store.toggleMasterMute();
    }, [store]);

    const applyPreset = useCallback((presetId: string) => {
        store.applyAudioPreset(presetId);
    }, [store]);

    const toggleMixer = useCallback(() => {
        store.toggleMixer();
    }, [store]);

    const setMixerOpen = useCallback((open: boolean) => {
        store.setMixerOpen(open);
    }, [store]);

    // Helpers
    const getSoundInfo = useCallback((soundId: string) => {
        return getSoundById(soundId);
    }, []);

    const isSoundPlaying = useCallback((soundId: string) => {
        return activeSounds[soundId]?.isPlaying ?? false;
    }, [activeSounds]);

    const getSoundVolume = useCallback((soundId: string) => {
        return activeSounds[soundId]?.volume ?? getSoundById(soundId)?.defaultVolume ?? 50;
    }, [activeSounds]);

    const getActiveCount = useMemo(() => activeSoundsList.length, [activeSoundsList]);

    return {
        // State
        isAnyPlaying,
        masterVolume,
        isMasterMuted: store.isMasterMuted,
        activeSounds,
        activeSoundsList,
        activeCount: getActiveCount,
        isUnlocked: store.isUnlocked,

        // UI state
        isMixerOpen,
        selectedCategory: store.selectedCategory,

        // Data
        allSounds,
        soundsByCategory,
        categories,
        categoryLabels: SOUND_CATEGORY_LABELS,
        presets,

        // Actions
        toggleSound,
        playSound,
        pauseSound,
        stopSound,
        stopAll,
        setSoundVolume,
        setMasterVolume,
        toggleMasterMute,
        applyPreset,

        // UI actions
        toggleMixer,
        setMixerOpen,
        setSelectedCategory: store.setSelectedCategory,

        // Helpers
        getSoundInfo,
        isSoundPlaying,
        getSoundVolume,
    };
}

/**
 * Lightweight hook for just the playing state
 */
export function useIsAudioPlaying() {
    return useAudioStore(selectIsAnyPlaying);
}

/**
 * Hook for a specific sound's state
 */
export function useSoundState(soundId: string) {
    const activeSounds = useAudioStore(selectActiveSounds);
    const store = useAudioStore();

    const state = activeSounds[soundId] ?? null;
    const soundInfo = useMemo(() => getSoundById(soundId), [soundId]);

    const toggle = useCallback(() => {
        store.toggleSound(soundId);
    }, [store, soundId]);

    const setVolume = useCallback((volume: number) => {
        store.setSoundVolume(soundId, volume);
    }, [store, soundId]);

    return {
        info: soundInfo,
        state,
        isPlaying: state?.isPlaying ?? false,
        volume: state?.volume ?? soundInfo?.defaultVolume ?? 50,
        isMuted: state?.isMuted ?? false,
        isLoading: state?.isLoading ?? false,
        toggle,
        setVolume,
    };
}

export default useAmbientAudio;
