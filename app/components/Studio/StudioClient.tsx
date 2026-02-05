/**
 * StudioClient v2
 * Main application component with fully integrated v2 systems
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useSettingsStore, useTheme } from '@/lib/stores/settings.store';
import { useCloudSync } from '@/lib/hooks/useCloudSync';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { useBreakpoint } from '@/lib/hooks/useBreakpoint';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import { useAudioStore } from '@/lib/stores/audio.store';
import { getBreakpointConfig } from '@/lib/constants/breakpoints';
import { useToast, ToastContainer } from '@/app/components/Toast';
import { Player } from '@/app/components/PlayerV2';
import TopNavbar from '@/app/components/TopNavbar';
import KeyboardShortcutsHelp from '@/app/components/KeyboardShortcutsHelp';
import CommandPalette from '@/app/components/CommandPalette';
import Background from '@/app/components/Background';
import { Settings } from '@/app/components/SettingsV2';
import { StatsOverview } from '@/app/components/StatisticsV2';
import { TaskList } from '@/app/components/TasksV2';
import { WidgetManager } from '@/app/components/WidgetManagerV2';
import { AmbientMixer } from '@/app/components/AmbientMixerV2';
import { WidgetGrid } from '@/app/components/WidgetGrid';

// Widget imports from v2
import {
    ClockWidget,
    WorldTimeWidget,
    QuoteWidget,
    NotesWidget,
    WeatherWidget,
    GifWidget,
    CalculatorWidget,
    TimerWidget,
    DictionaryWidget,
    BreathingWidget,
    DailyFocusWidget,
    QuickLinksWidget,
    CalendarWidget,
    TasksWidget,
    HabitTrackerWidget,
    FlashcardWidget,
    EmbedWidget,
} from '@/app/components/WidgetsV2';

import { Eye, Check, Layout, X, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
// VideoInfo type no longer needed - PlayerV2 uses its own store
import { cn } from '@/lib/utils';
import type { WidgetType } from '@/lib/types/widget.types';

// ═══════════════════════════════════════════════════════════════════════════════
// Widget Renderer
// ═══════════════════════════════════════════════════════════════════════════════

function renderWidgetByType(id: string, type: string, settings?: Record<string, unknown>) {
    const props = { id, settings };

    switch (type as WidgetType) {
        case 'clock': return <ClockWidget {...props} />;
        case 'worldtime': return <WorldTimeWidget {...props} />;
        case 'weather': return <WeatherWidget {...props} />;
        case 'gif': return <GifWidget {...props} />;
        case 'tasks': return <TasksWidget {...props} />;
        case 'timer': return <TimerWidget {...props} />;
        case 'notes': return <NotesWidget {...props} />;
        case 'quote': return <QuoteWidget {...props} />;
        case 'calendar': return <CalendarWidget {...props} />;
        case 'breathing': return <BreathingWidget {...props} />;
        case 'dictionary': return <DictionaryWidget {...props} />;
        case 'habit': return <HabitTrackerWidget {...props} />;
        case 'focus': return <DailyFocusWidget {...props} />;
        case 'calculator': return <CalculatorWidget {...props} />;
        case 'quicklinks': return <QuickLinksWidget {...props} />;
        case 'flashcard': return <FlashcardWidget {...props} />;
        case 'embed': return <EmbedWidget {...props} />;
        default: return null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function StudioClient() {
    // Theme from settings store
    const [theme, setTheme] = useTheme();

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
    const [privacyNoticeAccepted, setPrivacyNoticeAccepted] = useState(true); // true initially to match server

    // Get editing state from store (correct property names)
    const isEditingLayout = useWidgetGridStore(state => state.isEditMode);
    const setIsEditingLayout = useWidgetGridStore(state => state.setEditMode);
    const showWidgetHeaders = useWidgetGridStore(state => state.showHeaders);
    const setShowWidgetHeaders = useWidgetGridStore(state => state.setShowHeaders);
    const widgets = useWidgetGridStore(state => state.widgets);
    const currentBreakpoint = useWidgetGridStore(state => state.currentBreakpoint);

    // Breakpoint
    const { breakpoint, isMobile, isDesktop } = useBreakpoint();
    const breakpointConfig = getBreakpointConfig(currentBreakpoint);

    // Session
    const { data: session } = useSession();
    const integrations = useSettingsStore(s => s.settings.integrations);
    const googleCalendarEnabled = integrations.googleCalendar.enabled;
    const googleTasksEnabled = integrations.googleTasks.enabled;
    const grantedScopes = ((session as any)?.scope as string | undefined)?.split(' ') || [];
    const requiredScopes = [
        ...(googleCalendarEnabled ? ['https://www.googleapis.com/auth/calendar.events'] : []),
        ...(googleTasksEnabled ? ['https://www.googleapis.com/auth/tasks'] : []),
    ];
    const needsReauth = requiredScopes.some(sc => !grantedScopes.includes(sc));

    const handleReauth = useCallback(() => {
        signIn('google', { callbackUrl: '/studio' });
    }, []);

    // Toast
    const toast = useToast();

    // Video state now managed by PlayerV2 store (lib/stores/player.store.ts)

    // Refs
    const touchStartYRef = useRef<number | null>(null);
    const touchDeltaYRef = useRef<number>(0);

    // Cloud sync
    useCloudSync();

    // Computed
    const anyModalOpenRender = showSettings || showStats || showLogs || (showWidgetManager && !isEditingLayout);

    // ═══════════════════════════════════════════════════════════════════════════
    // Effects
    // ═══════════════════════════════════════════════════════════════════════════

    // Initial video now handled by PlayerV2 store initialization

    // Welcome message and privacy notice
    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisited');
        if (!hasVisited) {
            toast.success('Welcome to LofiStudio! Press Shift + ? for keyboard shortcuts', 6000);
            localStorage.setItem('hasVisited', 'true');
        }
        // Load privacy notice state from localStorage
        const accepted = localStorage.getItem('privacyNoticeAccepted');
        setPrivacyNoticeAccepted(accepted === 'true');
    }, [toast]);

    // Glass opacity from settings store
    const glassOpacity = useSettingsStore(s => s.settings.appearance.glassOpacity) / 100;

    useEffect(() => {
        const globalVal = Math.max(0.25, Math.min(1, glassOpacity));
        const widgetVal = Math.max(0, Math.min(1, glassOpacity));
        document.documentElement.style.setProperty('--glass-opacity', String(globalVal));
        document.documentElement.style.setProperty('--widget-glass-opacity', String(widgetVal));
    }, [glassOpacity]);

    // Zen mode toggle
    const toggleZenMode = useCallback(() => {
        setIsZenMode(!isZenMode);
        if (!isZenMode) {
            toast.success('Zen Mode Enabled. Press Esc to exit.', 3000);
        }
    }, [isZenMode, toast]);

    // ═══════════════════════════════════════════════════════════════════════════
    // Keyboard shortcuts
    // ═══════════════════════════════════════════════════════════════════════════

    useKeyboardShortcuts([
        { key: ',', ctrl: true, callback: () => setShowSettings(!showSettings), description: 'Toggle settings' },
        { key: 's', ctrl: true, callback: () => setShowStats(!showStats), description: 'Toggle statistics' },
        { key: 'l', ctrl: true, callback: () => setShowLogs(!showLogs), description: 'Toggle activity log' },
        { key: '?', shift: true, callback: () => setShowKeyboardHelp(true), description: 'Show keyboard shortcuts' },
        { key: 'e', ctrl: true, callback: () => setIsEditingLayout(!isEditingLayout), description: 'Toggle Edit Layout' },
    ]);

    // Escape key handling
    useEffect(() => {
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
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [showKeyboardHelp, showSettings, showStats, showLogs, showWidgetManager, isEditingLayout, isZenMode, setIsEditingLayout]);

    // Alt+Z for zen mode
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'z' && e.altKey) {
                toggleZenMode();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleZenMode]);

    // ═══════════════════════════════════════════════════════════════════════════
    // Event listeners for custom events
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        const toggle = () => setIsZenMode(prev => !prev);
        window.addEventListener('toggle-zen-mode', toggle as EventListener);
        return () => window.removeEventListener('toggle-zen-mode', toggle as EventListener);
    }, []);

    useEffect(() => {
        const handler = (e: Event) => {
            try { setHideBackground(!!((e as CustomEvent)?.detail)); } catch { }
        };
        window.addEventListener('player:show-video-bg', handler);
        return () => window.removeEventListener('player:show-video-bg', handler);
    }, []);

    useEffect(() => {
        const toggleEdit = () => setIsEditingLayout(!isEditingLayout);
        const toggleHeaders = () => setShowWidgetHeaders(!showWidgetHeaders);
        const reauth = () => handleReauth();
        const openStats = () => setShowStats(true);
        const openLogs = () => setShowLogs(true);
        const openSettingsEv = () => setShowSettings(true);
        const openWM = () => setShowWidgetManager(true);

        window.addEventListener('toggle-edit-layout', toggleEdit as EventListener);
        window.addEventListener('toggle-hide-headers', toggleHeaders as EventListener);
        window.addEventListener('open-reauth', reauth as EventListener);
        window.addEventListener('open-stats', openStats as EventListener);
        window.addEventListener('open-logs', openLogs as EventListener);
        window.addEventListener('open-settings', openSettingsEv as EventListener);
        window.addEventListener('open-widget-manager', openWM as EventListener);
        window.addEventListener('open-ambient-mixer', () => useAudioStore.getState().setMixerOpen(true));

        return () => {
            window.removeEventListener('toggle-edit-layout', toggleEdit as EventListener);
            window.removeEventListener('toggle-hide-headers', toggleHeaders as EventListener);
            window.removeEventListener('open-reauth', reauth as EventListener);
            window.removeEventListener('open-stats', openStats as EventListener);
            window.removeEventListener('open-logs', openLogs as EventListener);
            window.removeEventListener('open-settings', openSettingsEv as EventListener);
            window.removeEventListener('open-widget-manager', openWM as EventListener);
            window.removeEventListener('open-ambient-mixer', () => useAudioStore.getState().setMixerOpen(true));
        };
    }, [isEditingLayout, showWidgetHeaders, handleReauth, setIsEditingLayout, setShowWidgetHeaders]);

    useEffect(() => {
        try {
            window.dispatchEvent(new CustomEvent('editing-layout-change', { detail: isEditingLayout }));
        } catch { }
    }, [isEditingLayout]);

    // Modal overflow handling
    useEffect(() => {
        const anyModalOpen = showSettings || showStats || showLogs || (showWidgetManager && !isEditingLayout);
        document.body.style.overflow = anyModalOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [showSettings, showStats, showLogs, showWidgetManager, isEditingLayout]);

    // ═══════════════════════════════════════════════════════════════════════════
    // Render Widget (callback for WidgetGrid)
    // ═══════════════════════════════════════════════════════════════════════════

    const renderWidget = useCallback((widgetId: string, type: string) => {
        const widget = widgets.find(w => w.id === widgetId);
        return renderWidgetByType(widgetId, type, widget?.settings);
    }, [widgets]);

    // ═══════════════════════════════════════════════════════════════════════════
    // Render
    // ═══════════════════════════════════════════════════════════════════════════

    return (
        <>
            <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

            <main className="h-screen w-full flex flex-col overflow-hidden font-sans selection:bg-primary/30">
                <TopNavbar />
                <CommandPalette />

                {/* Background */}
                <div className="absolute inset-0 z-0">
                    {!hideBackground && <Background />}
                </div>

                {/* Edit Layout Dock */}
                {isEditingLayout && !isZenMode && !isTopbarHidden && (
                    <div data-ui="edit-dock" className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
                        <div className="flex items-center gap-4 glass border px-6 py-3 rounded-full shadow-2xl">
                            <span className="font-medium text-sm text-foreground">Editing Layout</span>
                            <div className="h-4 w-px bg-border" />
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Grid</span>
                                <Button variant="default" size="sm" className="h-8">
                                    {breakpointConfig.gridCols}x{breakpointConfig.gridRows}
                                </Button>
                            </div>
                            <div className="h-4 w-px bg-border" />
                            <Button
                                onClick={() => setShowWidgetManager(!showWidgetManager)}
                                variant="ghost"
                                size="sm"
                                className="text-foreground hover:bg-accent hover:text-accent-foreground h-8"
                            >
                                <Layout className="w-4 h-4 mr-2" />
                                {showWidgetManager ? 'Hide Widgets' : 'Add Widgets'}
                            </Button>
                            <Button
                                onClick={() => setIsTopbarHidden(!isTopbarHidden)}
                                variant="ghost"
                                size="sm"
                                className="text-foreground hover:bg-accent hover:text-accent-foreground h-8"
                            >
                                {isTopbarHidden ? 'Show Topbar' : 'Hide Topbar'}
                            </Button>
                            <Button
                                onClick={() => setIsEditingLayout(false)}
                                size="sm"
                                variant="secondary"
                                className="h-8 rounded-full px-4"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Done
                            </Button>
                        </div>
                    </div>
                )}

                {isEditingLayout && isTopbarHidden && (
                    <div className="fixed top-3 left-3 z-50">
                        <Button
                            onClick={() => setIsTopbarHidden(false)}
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full glass border"
                        >
                            <Eye className="w-5 h-5" />
                        </Button>
                    </div>
                )}

                {/* Main Grid Area */}
                <div
                    className="relative z-10 flex-1 w-full overflow-hidden"
                    data-ui="main-grid"
                >
                    <WidgetGrid renderWidget={renderWidget} />
                </div>

                {/* Floating Player V2 (Hidden by default, reveal on hover) */}
                {!isEditingLayout && !isZenMode && (
                    <div className="group fixed bottom-0 left-0 right-0 z-40 hover:h-auto transition-all duration-300 isolate">
                        {/* Trigger Area - Invisible strip at bottom with visual hint */}
                        <div className="absolute bottom-0 left-0 right-0 h-6 bg-transparent z-[60] cursor-pointer flex justify-center items-end pb-1">
                            <div className="w-24 h-1 bg-foreground/20 rounded-t-full shadow-sm backdrop-blur-sm transition-opacity duration-300 opacity-50 group-hover:opacity-0" />
                        </div>

                        {/* Player Container */}
                        <div className="translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
                            <Player
                                showMini={true}
                                className="relative !bottom-auto !left-auto !right-auto border-t bg-background/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.2)]"
                            />
                        </div>
                    </div>
                )}

                {/* Modals */}
                {!isZenMode && showKeyboardHelp && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
                        onTouchStart={(e) => { touchStartYRef.current = e.touches[0]?.clientY || 0; }}
                        onTouchMove={(e) => { if (touchStartYRef.current == null) return; touchDeltaYRef.current = (e.touches[0]?.clientY || 0) - (touchStartYRef.current || 0); }}
                        onTouchEnd={() => { if ((touchDeltaYRef.current || 0) > 80) setShowKeyboardHelp(false); touchStartYRef.current = null; touchDeltaYRef.current = 0; }}
                    >
                        <KeyboardShortcutsHelp onClose={() => setShowKeyboardHelp(false)} />
                    </div>
                )}

                {!isZenMode && showWidgetManager && (
                    <div className={`fixed ${isEditingLayout ? 'inset-0 flex items-start justify-end pt-24' : 'inset-0 flex items-center justify-center'} z-50 transition-all duration-300`}>
                        <div className={`${isEditingLayout ? 'w-[680px] lg:w-[760px] max-w-[calc(100vw-8px)] glass-panel rounded-2xl p-4 shadow-2xl max-h-[70vh] overflow-y-auto' : 'w-full max-w-4xl glass-panel rounded-2xl p-6 max-h-[85vh] overflow-y-auto'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className={`font-bold text-foreground ${isEditingLayout ? 'text-sm' : 'text-2xl'}`}>
                                    {isEditingLayout ? 'Add Widgets' : 'Customize Layout'}
                                </h2>
                                <Button
                                    onClick={() => setShowWidgetManager(false)}
                                    variant="ghost"
                                    size="icon"
                                    className="text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <WidgetManager compact={isEditingLayout} />
                        </div>
                        {!isEditingLayout && (
                            <div
                                className="fixed inset-0 -z-10 bg-black/60 backdrop-blur-md"
                                onClick={() => setShowWidgetManager(false)}
                            />
                        )}
                    </div>
                )}

                {!isZenMode && showSettings && (
                    <Settings onClose={() => setShowSettings(false)} />
                )}

                {!isZenMode && showStats && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
                        onTouchStart={(e) => { touchStartYRef.current = e.touches[0]?.clientY || 0; }}
                        onTouchMove={(e) => { if (touchStartYRef.current == null) return; touchDeltaYRef.current = (e.touches[0]?.clientY || 0) - (touchStartYRef.current || 0); }}
                        onTouchEnd={() => { if ((touchDeltaYRef.current || 0) > 80) setShowStats(false); touchStartYRef.current = null; touchDeltaYRef.current = 0; }}
                    >
                        <div className="w-full max-w-5xl glass-panel rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-foreground">Your Statistics</h2>
                                <Button onClick={() => setShowStats(false)} variant="ghost" size="icon" className="text-foreground">
                                    <X />
                                </Button>
                            </div>
                            <StatsOverview />
                        </div>
                    </div>
                )}

                {!isZenMode && showLogs && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
                        onTouchStart={(e) => { touchStartYRef.current = e.touches[0]?.clientY || 0; }}
                        onTouchMove={(e) => { if (touchStartYRef.current == null) return; touchDeltaYRef.current = (e.touches[0]?.clientY || 0) - (touchStartYRef.current || 0); }}
                        onTouchEnd={() => { if ((touchDeltaYRef.current || 0) > 80) setShowLogs(false); touchStartYRef.current = null; touchDeltaYRef.current = 0; }}
                    >
                        <div className="w-full max-w-2xl glass-panel rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-foreground">Activity Log</h2>
                                <Button onClick={() => setShowLogs(false)} variant="ghost" size="icon" className="text-foreground">
                                    <X />
                                </Button>
                            </div>
                            <TaskList />
                        </div>
                    </div>
                )}

                {isZenMode && (
                    <div className="fixed top-4 right-4 z-[100]">
                        <Button
                            onClick={() => setIsZenMode(false)}
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full glass border"
                        >
                            <Eye className="w-5 h-5" />
                        </Button>
                        {needsReauth && (
                            <Button
                                onClick={handleReauth}
                                variant="secondary"
                                size="sm"
                                className="mt-2 glass border h-8"
                            >
                                Complete permissions
                            </Button>
                        )}
                    </div>
                )}

                {!isZenMode && !isEditingLayout && !anyModalOpenRender && (
                    <div className="fixed bottom-3 right-3 z-[30]">
                        <div className="md:hidden mt-3 flex items-center justify-center gap-3">
                            <Button
                                onClick={() => setShowSettings(true)}
                                variant="secondary"
                                size="icon"
                                className="h-10 w-10 rounded-full"
                            >
                                <SettingsIcon className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Privacy notice */}
                {!!session?.user && !isZenMode && !privacyNoticeAccepted && (
                    <div className="fixed top-20 right-4 z-[50]">
                        <div className="glass-panel rounded-2xl border px-4 py-3 w-[340px]">
                            <p className="text-sm font-medium text-foreground">Privacy</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                We store the minimum necessary: session and preferences.
                                You can review Legal and Cookies in the footer.
                            </p>
                            <div className="mt-3 flex items-center justify-end gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        localStorage.setItem('privacyNoticeAccepted', 'true');
                                        setPrivacyNoticeAccepted(true);
                                    }}
                                >
                                    Close
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        localStorage.setItem('privacyNoticeAccepted', 'true');
                                        setPrivacyNoticeAccepted(true);
                                    }}
                                >
                                    Accept
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <AmbientMixer
                    className="fixed bottom-24 right-4 z-40 max-h-[60vh] w-80 shadow-2xl rounded-2xl border"
                />
            </main>
        </>
    );
}
