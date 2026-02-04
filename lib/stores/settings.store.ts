/**
 * Settings Store V2
 * Unified Zustand store for all application settings
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
    SettingsStore,
    SettingsState,
    AppSettings,
    AppearanceSettings,
    TimerSettings,
    IntegrationSettings,
    ThemeMode,
} from '@/lib/types/settings.types';
import {
    DEFAULT_SETTINGS,
    DEFAULT_APPEARANCE,
    DEFAULT_TIMER,
    DEFAULT_INTEGRATIONS,
    DEFAULT_DATA,
} from '@/lib/types/settings.types';

// ═══════════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'lofistudio-settings-v2';

// ═══════════════════════════════════════════════════════════════════════════════
// Initial State
// ═══════════════════════════════════════════════════════════════════════════════

const initialState: SettingsState = {
    settings: DEFAULT_SETTINGS,
    isLoading: false,
};

// ═══════════════════════════════════════════════════════════════════════════════
// Store
// ═══════════════════════════════════════════════════════════════════════════════

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            // ─────────────────────────────────────────────────────────────────────────
            // Appearance Actions
            // ─────────────────────────────────────────────────────────────────────────

            setTheme: (theme: ThemeMode) => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        appearance: { ...state.settings.appearance, theme },
                    },
                }));
                // Apply theme to document
                if (typeof document !== 'undefined') {
                    document.documentElement.classList.remove('light', 'dark');
                    if (theme === 'auto') {
                        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                        document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
                    } else {
                        document.documentElement.classList.add(theme);
                    }
                }
            },

            setGlassOpacity: (glassOpacity: number) => {
                const clamped = Math.max(0, Math.min(100, glassOpacity));
                set(state => ({
                    settings: {
                        ...state.settings,
                        appearance: { ...state.settings.appearance, glassOpacity: clamped },
                    },
                }));
                // Apply to CSS variable
                if (typeof document !== 'undefined') {
                    document.documentElement.style.setProperty('--glass-opacity', `${clamped / 100}`);
                }
            },

            setShowHeaders: (showHeaders: boolean) => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        appearance: { ...state.settings.appearance, showHeaders },
                    },
                }));
            },

            setCompactMode: (compactMode: boolean) => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        appearance: { ...state.settings.appearance, compactMode },
                    },
                }));
            },

            updateAppearance: (partial: Partial<AppearanceSettings>) => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        appearance: { ...state.settings.appearance, ...partial },
                    },
                }));
            },

            // ─────────────────────────────────────────────────────────────────────────
            // Timer Actions
            // ─────────────────────────────────────────────────────────────────────────

            setWorkDuration: (workDuration: number) => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        timer: { ...state.settings.timer, workDuration: Math.max(1, workDuration) },
                    },
                }));
            },

            setBreakDuration: (breakDuration: number) => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        timer: { ...state.settings.timer, breakDuration: Math.max(1, breakDuration) },
                    },
                }));
            },

            setLongBreakDuration: (longBreakDuration: number) => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        timer: { ...state.settings.timer, longBreakDuration: Math.max(1, longBreakDuration) },
                    },
                }));
            },

            setSessionsBeforeLongBreak: (sessionsBeforeLongBreak: number) => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        timer: { ...state.settings.timer, sessionsBeforeLongBreak: Math.max(1, sessionsBeforeLongBreak) },
                    },
                }));
            },

            setAutoStartBreaks: (autoStartBreaks: boolean) => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        timer: { ...state.settings.timer, autoStartBreaks },
                    },
                }));
            },

            setAutoStartWork: (autoStartWork: boolean) => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        timer: { ...state.settings.timer, autoStartWork },
                    },
                }));
            },

            setSoundEnabled: (soundEnabled: boolean) => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        timer: { ...state.settings.timer, soundEnabled },
                    },
                }));
            },

            setNotificationsEnabled: (notificationsEnabled: boolean) => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        timer: { ...state.settings.timer, notificationsEnabled },
                    },
                }));
            },

            updateTimer: (partial: Partial<TimerSettings>) => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        timer: { ...state.settings.timer, ...partial },
                    },
                }));
            },

            // ─────────────────────────────────────────────────────────────────────────
            // Integration Actions
            // ─────────────────────────────────────────────────────────────────────────

            setGoogleCalendarEnabled: (enabled: boolean) => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        integrations: {
                            ...state.settings.integrations,
                            googleCalendar: { ...state.settings.integrations.googleCalendar, enabled },
                        },
                    },
                }));
            },

            setGoogleCalendarId: (selectedCalendarId: string | null) => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        integrations: {
                            ...state.settings.integrations,
                            googleCalendar: { ...state.settings.integrations.googleCalendar, selectedCalendarId },
                        },
                    },
                }));
            },

            setGoogleTasksEnabled: (enabled: boolean) => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        integrations: {
                            ...state.settings.integrations,
                            googleTasks: { ...state.settings.integrations.googleTasks, enabled },
                        },
                    },
                }));
            },

            setGoogleTasksListId: (selectedListId: string | null) => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        integrations: {
                            ...state.settings.integrations,
                            googleTasks: { ...state.settings.integrations.googleTasks, selectedListId },
                        },
                    },
                }));
            },

            setSyncTasks: (syncTasks: boolean) => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        integrations: {
                            ...state.settings.integrations,
                            googleCalendar: { ...state.settings.integrations.googleCalendar, syncTasks },
                        },
                    },
                }));
            },

            updateIntegrations: (partial: Partial<IntegrationSettings>) => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        integrations: { ...state.settings.integrations, ...partial },
                    },
                }));
            },

            // ─────────────────────────────────────────────────────────────────────────
            // Data Actions
            // ─────────────────────────────────────────────────────────────────────────

            setAutoSave: (autoSaveEnabled: boolean) => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        data: { ...state.settings.data, autoSaveEnabled },
                    },
                }));
            },

            setCloudSync: (cloudSyncEnabled: boolean) => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        data: { ...state.settings.data, cloudSyncEnabled },
                    },
                }));
            },

            markExported: () => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        data: { ...state.settings.data, lastExportDate: Date.now() },
                    },
                }));
            },

            markImported: () => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        data: { ...state.settings.data, lastImportDate: Date.now() },
                    },
                }));
            },

            // ─────────────────────────────────────────────────────────────────────────
            // Reset Actions
            // ─────────────────────────────────────────────────────────────────────────

            resetToDefaults: () => {
                set({ settings: DEFAULT_SETTINGS });
            },

            resetSection: (section: keyof AppSettings) => {
                const defaults: Record<keyof AppSettings, unknown> = {
                    appearance: DEFAULT_APPEARANCE,
                    timer: DEFAULT_TIMER,
                    integrations: DEFAULT_INTEGRATIONS,
                    data: DEFAULT_DATA,
                };
                set(state => ({
                    settings: {
                        ...state.settings,
                        [section]: defaults[section],
                    },
                }));
            },
        }),
        {
            name: STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
            skipHydration: true,
            partialize: (state) => ({
                settings: state.settings,
            }),
        }
    )
);

// ═══════════════════════════════════════════════════════════════════════════════
// Selector Hooks
// ═══════════════════════════════════════════════════════════════════════════════

export function useTheme(): [ThemeMode, (theme: ThemeMode) => void] {
    const theme = useSettingsStore(s => s.settings.appearance.theme);
    const setTheme = useSettingsStore(s => s.setTheme);
    return [theme, setTheme];
}

export function useTimerSettings(): TimerSettings {
    return useSettingsStore(s => s.settings.timer);
}

export function useAppearanceSettings(): AppearanceSettings {
    return useSettingsStore(s => s.settings.appearance);
}

export function useIntegrationSettings() {
    return useSettingsStore(s => s.settings.integrations);
}

export function useGlassOpacity(): [number, (opacity: number) => void] {
    const opacity = useSettingsStore(s => s.settings.appearance.glassOpacity);
    const setOpacity = useSettingsStore(s => s.setGlassOpacity);
    return [opacity, setOpacity];
}
