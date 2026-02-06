'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useLocalStorage } from './useLocalStorage';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';

export function useCloudSync() {
    const { data: session } = useSession();

    // Use the new widget grid store
    const widgets = useWidgetGridStore(state => state.widgets);
    const layouts = useWidgetGridStore(state => state.layouts);

    // Track local state to sync
    const [theme] = useLocalStorage('theme', 'dark');
    const [pomodoroWork] = useLocalStorage('pomodoroWork', 25);
    const [pomodoroBreak] = useLocalStorage('pomodoroBreak', 5);
    const [backgroundConfig] = useLocalStorage('backgroundConfig', { type: 'gradient' });

    // Debounce ref
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialMount = useRef(true);

    // Load settings on login
    useEffect(() => {
        if (session?.user) {
            fetch('/api/user/settings')
                .then(async res => {
                    if (!res.ok) throw new Error('Failed to fetch settings');
                    const text = await res.text();
                    try {
                        return JSON.parse(text);
                    } catch {
                        throw new Error('Invalid JSON response');
                    }
                })
                .then(data => {
                    if (data) {
                        // Update localStorage directly for key items
                        if (data.theme) window.localStorage.setItem('theme', JSON.stringify(data.theme));
                        if (data.pomodoroWork) window.localStorage.setItem('pomodoroWork', JSON.stringify(data.pomodoroWork));
                        if (data.pomodoroBreak) window.localStorage.setItem('pomodoroBreak', JSON.stringify(data.pomodoroBreak));

                        if (data.preferences) {
                            try {
                                const prefs = JSON.parse(data.preferences);
                                // Sync widgets from cloud (v2 format)
                                if (prefs.widgets && prefs.layouts) {
                                    const storeData = {
                                        widgets: prefs.widgets,
                                        layouts: prefs.layouts,
                                        showHeaders: prefs.showHeaders ?? true
                                    };
                                    window.localStorage.setItem('lofi-widget-grid-v2', JSON.stringify({
                                        state: storeData,
                                        version: 0
                                    }));
                                }
                                if (prefs.background) {
                                    try {
                                        const current = JSON.parse(window.localStorage.getItem('backgroundConfig') || 'null');
                                        const hasUserChoice = current && (current.imageKey || current.videoKey || current.imageUrl || current.videoUrl || current.videoId);
                                        if (!hasUserChoice || current.type === 'gradient') {
                                            window.localStorage.setItem('backgroundConfig', JSON.stringify(prefs.background));
                                        }
                                    } catch {
                                        window.localStorage.setItem('backgroundConfig', JSON.stringify(prefs.background));
                                    }
                                }
                            } catch (e) {
                                console.error("Failed to parse preferences", e);
                            }
                        }
                        console.log("Settings synced from cloud");
                    }
                })
                .catch(err => console.error("Failed to fetch settings", err));
        }
    }, [session?.user?.id]);

    // Save settings on change
    useEffect(() => {
        if (!session?.user) return;
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            const preferences = {
                widgets,
                layouts,
                background: backgroundConfig
            };

            fetch('/api/user/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    theme,
                    pomodoroWork,
                    pomodoroBreak,
                    preferences: JSON.stringify(preferences)
                })
            }).catch(err => console.error("Failed to save settings", err));
        }, 2000); // Debounce 2s

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [session?.user?.id, theme, pomodoroWork, pomodoroBreak, widgets, layouts, backgroundConfig]);
}
