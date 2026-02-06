/**
 * Timer Store V2
 * Zustand store for Pomodoro timer state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useStatisticsStore } from './statistics.store';
import { useSettingsStore } from './settings.store';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export type TimerMode = 'work' | 'break' | 'longBreak';

export interface TimerState {
    mode: TimerMode;
    secondsRemaining: number;
    isActive: boolean;
    isPaused: boolean;
    sessionsCompleted: number;
    currentTaskId: string | null;
    currentTaskTitle: string | null;
    lastUpdated: number;
}

export interface TimerActions {
    // Control
    start: () => void;
    pause: () => void;
    resume: () => void;
    reset: () => void;
    skip: () => void;

    // Mode
    setMode: (mode: TimerMode) => void;
    switchToWork: () => void;
    switchToBreak: () => void;

    // Task association
    setCurrentTask: (taskId: string | null, taskTitle: string | null) => void;

    // Timer tick (called every second)
    tick: () => void;

    // Sync function to catch up time after reload
    sync: () => void;

    // Session complete
    completeSession: () => void;

    // Reset sessions
    resetSessions: () => void;
}

export type TimerStore = TimerState & TimerActions;

// ═══════════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'lofistudio-timer-v2';

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════

function getModeDuration(mode: TimerMode): number {
    const settings = useSettingsStore.getState().settings.timer;
    switch (mode) {
        case 'work':
            return settings.workDuration * 60;
        case 'break':
            return settings.breakDuration * 60;
        case 'longBreak':
            return settings.longBreakDuration * 60;
    }
}

function shouldTakeLongBreak(sessionsCompleted: number): boolean {
    const settings = useSettingsStore.getState().settings.timer;
    return sessionsCompleted > 0 && sessionsCompleted % settings.sessionsBeforeLongBreak === 0;
}

function playNotificationSound(): void {
    const settings = useSettingsStore.getState().settings.timer;
    if (!settings.soundEnabled) return;

    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKXh8bllHAU2jdXy0n0vBSh+zPLaizsKGGS56uu0YRwFN5HY88p8MAcbPt4N');
        audio.volume = 0.5;
        audio.play().catch(() => { });
    } catch { }
}

function showBrowserNotification(title: string, body: string): void {
    const settings = useSettingsStore.getState().settings.timer;
    if (!settings.notificationsEnabled) return;

    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            const notification = new Notification(title, {
                body,
                icon: '/icon-192x192.png',
                silent: !settings.soundEnabled,
            });
            setTimeout(() => notification.close(), 5000);
        } catch { }
    }
}

// Map TimerMode to SessionMode for statistics
function timerModeToSessionMode(mode: TimerMode): 'work' | 'break' | 'long_break' {
    switch (mode) {
        case 'work': return 'work';
        case 'break': return 'break';
        case 'longBreak': return 'long_break';
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Initial State
// ═══════════════════════════════════════════════════════════════════════════════

const initialState: TimerState = {
    mode: 'work',
    secondsRemaining: 25 * 60, // Will be overwritten by settings on init
    isActive: false,
    isPaused: false,
    sessionsCompleted: 0,
    currentTaskId: null,
    currentTaskTitle: null,
    lastUpdated: Date.now(),
};

// ═══════════════════════════════════════════════════════════════════════════════
// Store
// ═══════════════════════════════════════════════════════════════════════════════

export const useTimerStore = create<TimerStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            start: () => {
                const state = get();
                if (state.isActive && !state.isPaused) return;

                // Request notification permission on first start
                if ('Notification' in window && Notification.permission === 'default') {
                    Notification.requestPermission();
                }

                set({
                    isActive: true,
                    isPaused: false,
                    secondsRemaining: state.secondsRemaining || getModeDuration(state.mode),
                    lastUpdated: Date.now(),
                });
            },

            pause: () => {
                set({ isPaused: true, lastUpdated: Date.now() });
            },

            resume: () => {
                set({ isPaused: false, lastUpdated: Date.now() });
            },

            reset: () => {
                const mode = get().mode;
                set({
                    isActive: false,
                    isPaused: false,
                    secondsRemaining: getModeDuration(mode),
                    lastUpdated: Date.now(),
                });
            },

            skip: () => {
                const state = get();
                if (state.mode === 'work') {
                    // Skip work session - go to break
                    const nextMode = shouldTakeLongBreak(state.sessionsCompleted + 1) ? 'longBreak' : 'break';
                    set({
                        mode: nextMode,
                        secondsRemaining: getModeDuration(nextMode),
                        isActive: false,
                        isPaused: false,
                        lastUpdated: Date.now(),
                    });
                } else {
                    // Skip break - go to work
                    set({
                        mode: 'work',
                        secondsRemaining: getModeDuration('work'),
                        isActive: false,
                        isPaused: false,
                        lastUpdated: Date.now(),
                    });
                }
            },

            setMode: (mode: TimerMode) => {
                set({
                    mode,
                    secondsRemaining: getModeDuration(mode),
                    isActive: false,
                    isPaused: false,
                    lastUpdated: Date.now(),
                });
            },

            switchToWork: () => {
                set({
                    mode: 'work',
                    secondsRemaining: getModeDuration('work'),
                    isActive: false,
                    isPaused: false,
                    lastUpdated: Date.now(),
                });
            },

            switchToBreak: () => {
                const state = get();
                const nextMode = shouldTakeLongBreak(state.sessionsCompleted) ? 'longBreak' : 'break';
                set({
                    mode: nextMode,
                    secondsRemaining: getModeDuration(nextMode),
                    isActive: false,
                    isPaused: false,
                    lastUpdated: Date.now(),
                });
            },

            setCurrentTask: (taskId, taskTitle) => {
                set({ currentTaskId: taskId, currentTaskTitle: taskTitle });
            },

            tick: () => {
                const state = get();
                if (!state.isActive || state.isPaused) return;

                const now = Date.now();
                // If we drifted significantly (e.g. tab background throttling), calculate delta provided it's reasonable
                // But for simple tick called by interval, just -1 is fine.
                // However, to support "Offline catchup" inside tick or via sync:

                const newSeconds = state.secondsRemaining - 1;

                if (newSeconds <= 0) {
                    get().completeSession();
                } else {
                    set({ secondsRemaining: newSeconds, lastUpdated: now });
                }
            },

            sync: () => {
                const state = get();
                if (state.isActive && !state.isPaused) {
                    const now = Date.now();
                    const elapsedSeconds = Math.floor((now - state.lastUpdated) / 1000);

                    if (elapsedSeconds > 0) {
                        const newSeconds = state.secondsRemaining - elapsedSeconds;
                        if (newSeconds <= 0) {
                            // If time passed completely, trigger complete (or just stop at 0)
                            // For simplicity, just reset to 0 and let next tick handle complete or handle it here
                            set({ secondsRemaining: 0, lastUpdated: now });
                            // Optionally trigger complete immediately if desirable
                            // get().completeSession(); 
                        } else {
                            set({ secondsRemaining: newSeconds, lastUpdated: now });
                        }
                    } else {
                        // Just update lastUpdated to now to avoid huge jumps if clock skewed
                        set({ lastUpdated: now });
                    }
                }
            },

            completeSession: () => {
                const state = get();
                const settings = useSettingsStore.getState().settings.timer;
                const duration = getModeDuration(state.mode);

                useStatisticsStore.getState().logSession({
                    mode: timerModeToSessionMode(state.mode),
                    duration,
                    plannedDuration: duration,
                    taskId: state.currentTaskId || undefined,
                    taskTitle: state.currentTaskTitle || undefined,
                });

                playNotificationSound();

                if (state.mode === 'work') {
                    const newSessionsCompleted = state.sessionsCompleted + 1;
                    const nextMode = shouldTakeLongBreak(newSessionsCompleted) ? 'longBreak' : 'break';
                    showBrowserNotification(
                        'Work Session Complete!',
                        nextMode === 'longBreak'
                            ? 'Great job! Time for a long break.'
                            : 'Great work! Time for a short break.'
                    );

                    set({
                        mode: nextMode,
                        secondsRemaining: getModeDuration(nextMode),
                        sessionsCompleted: newSessionsCompleted,
                        isActive: settings.autoStartBreaks,
                        isPaused: false,
                        lastUpdated: Date.now(),
                    });
                } else {
                    showBrowserNotification(
                        'Break Complete!',
                        'Ready to focus again?'
                    );
                    set({
                        mode: 'work',
                        secondsRemaining: getModeDuration('work'),
                        isActive: settings.autoStartWork,
                        isPaused: false,
                        lastUpdated: Date.now(),
                    });
                }
            },

            resetSessions: () => {
                set({ sessionsCompleted: 0 });
            },
        }),
        {
            name: STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
            skipHydration: false,
            // Persist EVERYTHING except non-state if any
            // We remove partialize to persist all fields
            onRehydrateStorage: () => (state) => {
                state?.sync();
            },
        }
    )
);

// ═══════════════════════════════════════════════════════════════════════════════
// Selector Hooks
// ═══════════════════════════════════════════════════════════════════════════════

export function useTimerMode(): TimerMode {
    return useTimerStore(s => s.mode);
}

export function useTimerActive(): boolean {
    const isActive = useTimerStore(s => s.isActive);
    const isPaused = useTimerStore(s => s.isPaused);
    return isActive && !isPaused;
}

export function useTimerProgress(): number {
    const secondsRemaining = useTimerStore(s => s.secondsRemaining);
    const mode = useTimerStore(s => s.mode);
    const total = getModeDuration(mode);
    return ((total - secondsRemaining) / total) * 100;
}

export function useSessionsCompleted(): number {
    return useTimerStore(s => s.sessionsCompleted);
}
