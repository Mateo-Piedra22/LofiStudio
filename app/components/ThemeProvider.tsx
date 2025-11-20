'use client';

import { useEffect } from 'react';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme] = useLocalStorage<'light' | 'dark' | 'auto'>('theme', 'dark');

    useEffect(() => {
        const root = document.documentElement;

        // Remove both classes first
        root.classList.remove('light', 'dark');

        if (theme === 'auto') {
            // Check system preference
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.add(isDark ? 'dark' : 'light');
        } else {
            root.classList.add(theme);
        }
    }, [theme]);

    useEffect(() => {
        // Listen for system theme changes when in auto mode
        if (theme !== 'auto') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => {
            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [theme]);

    return <>{children}</>;
}
