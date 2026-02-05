'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSettingsStore } from '@/lib/stores/settings.store';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import { useAudioStore } from '@/lib/stores/audio.store';
import { useStudioAuth } from './hooks/useStudioAuth';
import { useToast } from '@/app/components/Toast';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';

interface StudioContextType {
    // Modals
    showSettings: boolean;
    setShowSettings: (v: boolean) => void;
    showLogs: boolean;
    setShowLogs: (v: boolean) => void;
    showStats: boolean;
    setShowStats: (v: boolean) => void;
    showWidgetManager: boolean;
    setShowWidgetManager: (v: boolean) => void;
    showKeyboardHelp: boolean;
    setShowKeyboardHelp: (v: boolean) => void;

    // States
    isZenMode: boolean;
    toggleZenMode: () => void;
    isTopbarHidden: boolean;
    setIsTopbarHidden: (v: boolean) => void;
    hideBackground: boolean;

    // Auth
    needsReauth: boolean;
    handleReauth: () => void;

    // Overlays
    privacyNoticeAccepted: boolean;
    acceptPrivacyNotice: () => void;
}

const StudioContext = createContext<StudioContextType | null>(null);

export function useStudio() {
    const ctx = useContext(StudioContext);
    if (!ctx) throw new Error('useStudio must be used within a StudioProvider');
    return ctx;
}

export function StudioProvider({ children }: { children: React.ReactNode }) {
    const toast = useToast();
    const { needsReauth, handleReauth } = useStudioAuth();

    // Modal states
    const [showSettings, setShowSettings] = useState(false);
    const [showLogs, setShowLogs] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [showWidgetManager, setShowWidgetManager] = useState(false);
    const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

    // UI states
    const [isZenMode, setIsZenMode] = useState(false);
    const [isTopbarHidden, setIsTopbarHidden] = useState(false);
    const [hideBackground, setHideBackground] = useState(false);
    const [privacyNoticeAccepted, setPrivacyNoticeAccepted] = useState(true);

    // Store Access
    const isEditingLayout = useWidgetGridStore(state => state.isEditMode);
    const setIsEditingLayout = useWidgetGridStore(state => state.setEditMode);
    const setShowWidgetHeaders = useWidgetGridStore(state => state.setShowHeaders);
    const showWidgetHeaders = useWidgetGridStore(state => state.showHeaders);

    // ─────────────────────────────────────────────────────────────────────────────
    // Effects & Listeners
    // ─────────────────────────────────────────────────────────────────────────────

    // 1. Initial Welcome & Privacy
    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisited');
        if (!hasVisited) {
            toast.success('Welcome to LofiStudio! Press Shift + ? for keyboard shortcuts', 6000);
            localStorage.setItem('hasVisited', 'true');
        }
        const accepted = localStorage.getItem('privacyNoticeAccepted');
        setPrivacyNoticeAccepted(accepted === 'true');
    }, [toast]);

    const acceptPrivacyNotice = useCallback(() => {
        localStorage.setItem('privacyNoticeAccepted', 'true');
        setPrivacyNoticeAccepted(true);
    }, []);

    // 2. Glass Opacity Sync
    const glassOpacity = useSettingsStore(s => s.settings.appearance.glassOpacity) / 100;
    useEffect(() => {
        const globalVal = Math.max(0.25, Math.min(1, glassOpacity));
        const widgetVal = Math.max(0, Math.min(1, glassOpacity));
        document.documentElement.style.setProperty('--glass-opacity', String(globalVal));
        document.documentElement.style.setProperty('--widget-glass-opacity', String(widgetVal));
    }, [glassOpacity]);

    // 3. Zen Mode Toggle Logic
    const toggleZenMode = useCallback(() => {
        setIsZenMode(prev => {
            if (!prev) toast.success('Zen Mode Enabled. Press Esc to exit.', 3000);
            return !prev;
        });
    }, [toast]);

    // 4. Keyboard Shortcuts
    useKeyboardShortcuts([
        { key: ',', ctrl: true, callback: () => setShowSettings(prev => !prev), description: 'Toggle settings' },
        { key: 's', ctrl: true, callback: () => setShowStats(prev => !prev), description: 'Toggle statistics' },
        { key: 'l', ctrl: true, callback: () => setShowLogs(prev => !prev), description: 'Toggle activity log' },
        { key: '?', shift: true, callback: () => setShowKeyboardHelp(true), description: 'Show keyboard shortcuts' },
        { key: 'e', ctrl: true, callback: () => setIsEditingLayout(!isEditingLayout), description: 'Toggle Edit Layout' },
    ]);

    // 5. Global Event Listeners (Legacy Support)
    useEffect(() => {
        const handleToggleZen = () => toggleZenMode();
        const handleShowVideoBg = (e: Event) => {
            try { setHideBackground(!!((e as CustomEvent)?.detail)); } catch { }
        };
        const handleToggleEdit = () => setIsEditingLayout(!isEditingLayout);
        const handleToggleHeaders = () => setShowWidgetHeaders(!showWidgetHeaders);
        const handleOpenStats = () => setShowStats(true);
        const handleOpenLogs = () => setShowLogs(true);
        const handleOpenSettings = () => setShowSettings(true);
        const handleOpenWM = () => setShowWidgetManager(true);
        const handleOpenMixer = () => useAudioStore.getState().setMixerOpen(true);
        const handleReauthEvent = () => handleReauth();
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (showKeyboardHelp) setShowKeyboardHelp(false);
                else if (showSettings) setShowSettings(false);
                else if (showStats) setShowStats(false);
                else if (showLogs) setShowLogs(false);
                else if (showWidgetManager) setShowWidgetManager(false);
                else if (isEditingLayout) setIsEditingLayout(false);
                else if (isZenMode) setIsZenMode(false);
            }
        };
        const handleAltZ = (e: KeyboardEvent) => {
            if (e.key === 'z' && e.altKey) toggleZenMode();
        };

        window.addEventListener('toggle-zen-mode', handleToggleZen);
        window.addEventListener('player:show-video-bg', handleShowVideoBg);
        window.addEventListener('toggle-edit-layout', handleToggleEdit);
        window.addEventListener('toggle-hide-headers', handleToggleHeaders);
        window.addEventListener('open-stats', handleOpenStats);
        window.addEventListener('open-logs', handleOpenLogs);
        window.addEventListener('open-settings', handleOpenSettings);
        window.addEventListener('open-widget-manager', handleOpenWM);
        window.addEventListener('open-ambient-mixer', handleOpenMixer);
        window.addEventListener('open-reauth', handleReauthEvent);
        window.addEventListener('keydown', handleEscape);
        window.addEventListener('keydown', handleAltZ);

        return () => {
            window.removeEventListener('toggle-zen-mode', handleToggleZen);
            window.removeEventListener('player:show-video-bg', handleShowVideoBg);
            window.removeEventListener('toggle-edit-layout', handleToggleEdit);
            window.removeEventListener('toggle-hide-headers', handleToggleHeaders);
            window.removeEventListener('open-stats', handleOpenStats);
            window.removeEventListener('open-logs', handleOpenLogs);
            window.removeEventListener('open-settings', handleOpenSettings);
            window.removeEventListener('open-widget-manager', handleOpenWM);
            window.removeEventListener('open-ambient-mixer', handleOpenMixer);
            window.removeEventListener('open-reauth', handleReauthEvent);
            window.removeEventListener('keydown', handleEscape);
            window.removeEventListener('keydown', handleAltZ);
        };
    }, [isEditingLayout, setIsEditingLayout, showWidgetHeaders, setShowWidgetHeaders, showKeyboardHelp, showSettings, showStats, showLogs, showWidgetManager, isZenMode, toggleZenMode, handleReauth]);

    // 6. Sync Edit Mode Change Event
    useEffect(() => {
        try {
            window.dispatchEvent(new CustomEvent('editing-layout-change', { detail: isEditingLayout }));
        } catch { }
    }, [isEditingLayout]);

    return (
        <StudioContext.Provider value={{
            showSettings, setShowSettings,
            showLogs, setShowLogs,
            showStats, setShowStats,
            showWidgetManager, setShowWidgetManager,
            showKeyboardHelp, setShowKeyboardHelp,
            isZenMode, toggleZenMode,
            isTopbarHidden, setIsTopbarHidden,
            hideBackground,
            needsReauth, handleReauth,
            privacyNoticeAccepted, acceptPrivacyNotice
        }}>
            {children}
        </StudioContext.Provider>
    );
}
