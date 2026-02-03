/**
 * Settings Types V2
 * Unified type definitions for all application settings
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Theme & Appearance
// ═══════════════════════════════════════════════════════════════════════════════

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface AppearanceSettings {
    theme: ThemeMode;
    glassOpacity: number; // 0-100
    showHeaders: boolean;
    compactMode: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Timer/Pomodoro Settings
// ═══════════════════════════════════════════════════════════════════════════════

export interface TimerSettings {
    workDuration: number; // minutes
    breakDuration: number; // minutes
    longBreakDuration: number; // minutes
    sessionsBeforeLongBreak: number;
    autoStartBreaks: boolean;
    autoStartWork: boolean;
    soundEnabled: boolean;
    notificationsEnabled: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Integration Settings
// ═══════════════════════════════════════════════════════════════════════════════

export interface GoogleCalendarSettings {
    enabled: boolean;
    selectedCalendarId: string | null;
    syncTasks: boolean;
}

export interface GoogleTasksSettings {
    enabled: boolean;
    selectedListId: string | null;
}

export interface IntegrationSettings {
    googleCalendar: GoogleCalendarSettings;
    googleTasks: GoogleTasksSettings;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Data Settings
// ═══════════════════════════════════════════════════════════════════════════════

export interface DataSettings {
    autoSaveEnabled: boolean;
    cloudSyncEnabled: boolean;
    lastExportDate: number | null;
    lastImportDate: number | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Unified Settings
// ═══════════════════════════════════════════════════════════════════════════════

export interface AppSettings {
    appearance: AppearanceSettings;
    timer: TimerSettings;
    integrations: IntegrationSettings;
    data: DataSettings;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Store Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface SettingsState {
    settings: AppSettings;
    isLoading: boolean;
}

export interface SettingsActions {
    // Appearance
    setTheme: (theme: ThemeMode) => void;
    setGlassOpacity: (opacity: number) => void;
    setShowHeaders: (show: boolean) => void;
    setCompactMode: (compact: boolean) => void;

    // Timer
    setWorkDuration: (minutes: number) => void;
    setBreakDuration: (minutes: number) => void;
    setLongBreakDuration: (minutes: number) => void;
    setSessionsBeforeLongBreak: (sessions: number) => void;
    setAutoStartBreaks: (auto: boolean) => void;
    setAutoStartWork: (auto: boolean) => void;
    setSoundEnabled: (enabled: boolean) => void;
    setNotificationsEnabled: (enabled: boolean) => void;

    // Integrations
    setGoogleCalendarEnabled: (enabled: boolean) => void;
    setGoogleCalendarId: (id: string | null) => void;
    setGoogleTasksEnabled: (enabled: boolean) => void;
    setGoogleTasksListId: (id: string | null) => void;
    setSyncTasks: (sync: boolean) => void;

    // Data
    setAutoSave: (enabled: boolean) => void;
    setCloudSync: (enabled: boolean) => void;
    markExported: () => void;
    markImported: () => void;

    // Bulk operations
    updateAppearance: (partial: Partial<AppearanceSettings>) => void;
    updateTimer: (partial: Partial<TimerSettings>) => void;
    updateIntegrations: (partial: Partial<IntegrationSettings>) => void;

    // Reset
    resetToDefaults: () => void;
    resetSection: (section: keyof AppSettings) => void;
}

export type SettingsStore = SettingsState & SettingsActions;

// ═══════════════════════════════════════════════════════════════════════════════
// Default Values
// ═══════════════════════════════════════════════════════════════════════════════

export const DEFAULT_APPEARANCE: AppearanceSettings = {
    theme: 'dark',
    glassOpacity: 80,
    showHeaders: true,
    compactMode: false,
};

export const DEFAULT_TIMER: TimerSettings = {
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreaks: false,
    autoStartWork: false,
    soundEnabled: true,
    notificationsEnabled: true,
};

export const DEFAULT_INTEGRATIONS: IntegrationSettings = {
    googleCalendar: {
        enabled: false,
        selectedCalendarId: null,
        syncTasks: false,
    },
    googleTasks: {
        enabled: false,
        selectedListId: null,
    },
};

export const DEFAULT_DATA: DataSettings = {
    autoSaveEnabled: true,
    cloudSyncEnabled: false,
    lastExportDate: null,
    lastImportDate: null,
};

export const DEFAULT_SETTINGS: AppSettings = {
    appearance: DEFAULT_APPEARANCE,
    timer: DEFAULT_TIMER,
    integrations: DEFAULT_INTEGRATIONS,
    data: DEFAULT_DATA,
};
