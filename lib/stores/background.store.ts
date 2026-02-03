/**
 * Background Store
 * Zustand store for background configuration and settings
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export type BackgroundType = 'gradient' | 'video' | 'image';

export interface BackgroundConfig {
    type: BackgroundType;
    videoId?: string;
    videoUrl?: string;
    imageUrl?: string;
    imageKey?: string;
    videoKey?: string;
}

export interface BackgroundState {
    config: BackgroundConfig;
    blur: number;
    opacity: number;
    showSelector: boolean;
    currentSceneId: string | null;
    currentVariantId: string | null;
}

export interface BackgroundActions {
    // Config management
    setConfig: (config: BackgroundConfig) => void;
    setType: (type: BackgroundType) => void;
    setVideoBackground: (videoId: string) => void;
    setImageBackground: (imageUrl: string) => void;
    setGradientBackground: () => void;

    // Style settings
    setBlur: (blur: number) => void;
    setOpacity: (opacity: number) => void;

    // UI state
    openSelector: () => void;
    closeSelector: () => void;
    toggleSelector: () => void;

    // Scene tracking
    setCurrentScene: (sceneId: string | null, variantId: string | null) => void;

    // Reset
    reset: () => void;
}

export type BackgroundStore = BackgroundState & BackgroundActions;

// ═══════════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'lofistudio-background-v2';
const DEFAULT_VIDEO_ID = 'jfKfPfyJRdk';

// ═══════════════════════════════════════════════════════════════════════════════
// Initial State
// ═══════════════════════════════════════════════════════════════════════════════

const initialState: BackgroundState = {
    config: { type: 'gradient' },
    blur: 0,
    opacity: 1,
    showSelector: false,
    currentSceneId: null,
    currentVariantId: null,
};

// ═══════════════════════════════════════════════════════════════════════════════
// Store
// ═══════════════════════════════════════════════════════════════════════════════

export const useBackgroundStore = create<BackgroundStore>()(
    persist(
        (set) => ({
            ...initialState,

            // ─────────────────────────────────────────────────────────────────────────
            // Config Management
            // ─────────────────────────────────────────────────────────────────────────

            setConfig: (config: BackgroundConfig) => {
                set({ config });
            },

            setType: (type: BackgroundType) => {
                set(prev => ({
                    config: { ...prev.config, type },
                }));
            },

            setVideoBackground: (videoId: string) => {
                set({
                    config: { type: 'video', videoId },
                });
            },

            setImageBackground: (imageUrl: string) => {
                set({
                    config: { type: 'image', imageUrl },
                });
            },

            setGradientBackground: () => {
                set({
                    config: { type: 'gradient' },
                });
            },

            // ─────────────────────────────────────────────────────────────────────────
            // Style Settings
            // ─────────────────────────────────────────────────────────────────────────

            setBlur: (blur: number) => {
                set({ blur: Math.max(0, Math.min(20, blur)) });
            },

            setOpacity: (opacity: number) => {
                set({ opacity: Math.max(0, Math.min(1, opacity)) });
            },

            // ─────────────────────────────────────────────────────────────────────────
            // UI State
            // ─────────────────────────────────────────────────────────────────────────

            openSelector: () => set({ showSelector: true }),
            closeSelector: () => set({ showSelector: false }),
            toggleSelector: () => set(prev => ({ showSelector: !prev.showSelector })),

            // ─────────────────────────────────────────────────────────────────────────
            // Scene Tracking
            // ─────────────────────────────────────────────────────────────────────────

            setCurrentScene: (sceneId, variantId) => {
                set({ currentSceneId: sceneId, currentVariantId: variantId });
            },

            // ─────────────────────────────────────────────────────────────────────────
            // Reset
            // ─────────────────────────────────────────────────────────────────────────

            reset: () => {
                set(initialState);
            },
        }),
        {
            name: STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                config: state.config,
                blur: state.blur,
                opacity: state.opacity,
                currentSceneId: state.currentSceneId,
                currentVariantId: state.currentVariantId,
            }),
        }
    )
);

// ═══════════════════════════════════════════════════════════════════════════════
// Selector Hooks
// ═══════════════════════════════════════════════════════════════════════════════

export function useBackgroundConfig(): [BackgroundConfig, (config: BackgroundConfig) => void] {
    const config = useBackgroundStore(s => s.config);
    const setConfig = useBackgroundStore(s => s.setConfig);
    return [config, setConfig];
}

export function useBackgroundBlur(): [number, (blur: number) => void] {
    const blur = useBackgroundStore(s => s.blur);
    const setBlur = useBackgroundStore(s => s.setBlur);
    return [blur, setBlur];
}

export function useBackgroundSelector(): {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
} {
    return {
        isOpen: useBackgroundStore(s => s.showSelector),
        open: useBackgroundStore(s => s.openSelector),
        close: useBackgroundStore(s => s.closeSelector),
        toggle: useBackgroundStore(s => s.toggleSelector),
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Default Export
// ═══════════════════════════════════════════════════════════════════════════════

export { DEFAULT_VIDEO_ID };
