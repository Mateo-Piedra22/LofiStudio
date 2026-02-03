/**
 * ThemeProvider v2
 * Enhanced theme provider with smooth transitions, system detection,
 * and persistence
 */

'use client';

import React, { useEffect, useCallback, createContext, useContext, useMemo } from 'react';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
    theme: Theme;
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    isSystemTheme: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Context
// ═══════════════════════════════════════════════════════════════════════════════

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get current system theme preference
 */
function getSystemTheme(): ResolvedTheme {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Apply theme to document with smooth transition
 */
function applyTheme(resolvedTheme: ResolvedTheme, withTransition = true): void {
    const root = document.documentElement;

    if (withTransition) {
        // Add class to enable smooth transition
        root.style.setProperty('--theme-transition', '1');
    } else {
        // Disable transitions briefly to prevent flash
        root.classList.add('theme-changing');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                root.classList.remove('theme-changing');
            });
        });
    }

    // Remove both classes first
    root.classList.remove('light', 'dark');

    // Add the new theme class
    root.classList.add(resolvedTheme);

    // Update color-scheme for native elements
    root.style.colorScheme = resolvedTheme;

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute(
            'content',
            resolvedTheme === 'dark' ? '#0a0a0f' : '#f8fafc'
        );
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Provider Component
// ═══════════════════════════════════════════════════════════════════════════════

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
}

export function ThemeProvider({
    children,
    defaultTheme = 'system',
    storageKey = 'lofi-theme',
}: ThemeProviderProps) {
    // Persist theme preference
    const [theme, setThemeState] = useLocalStorage<Theme>(storageKey, defaultTheme);

    // Resolve the actual theme (handling 'system')
    const resolvedTheme = useMemo((): ResolvedTheme => {
        if (theme === 'system') {
            return getSystemTheme();
        }
        return theme;
    }, [theme]);

    // Apply theme on mount and change
    useEffect(() => {
        applyTheme(resolvedTheme, false);
    }, [resolvedTheme]);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            applyTheme(e.matches ? 'dark' : 'light', true);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    // Set theme with optional transition
    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
    }, [setThemeState]);

    // Toggle between light and dark
    const toggleTheme = useCallback(() => {
        if (theme === 'system') {
            // If system, switch to opposite of current resolved theme
            setThemeState(resolvedTheme === 'dark' ? 'light' : 'dark');
        } else {
            setThemeState(theme === 'dark' ? 'light' : 'dark');
        }
    }, [theme, resolvedTheme, setThemeState]);

    // Context value
    const value = useMemo((): ThemeContextValue => ({
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        isSystemTheme: theme === 'system',
    }), [theme, resolvedTheme, setTheme, toggleTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Theme Script (for preventing flash)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inline script to prevent theme flash
 * Add this to the <head> of your document
 */
export const ThemeScript = `
(function() {
  try {
    const stored = localStorage.getItem('lofi-theme');
    const theme = stored ? JSON.parse(stored) : 'system';
    const resolved = theme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    document.documentElement.classList.add(resolved);
    document.documentElement.style.colorScheme = resolved;
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

// ═══════════════════════════════════════════════════════════════════════════════
// Theme Toggle Component
// ═══════════════════════════════════════════════════════════════════════════════

import { Moon, Sun, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
    className?: string;
    showLabel?: boolean;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'default' | 'lg';
}

/**
 * Theme toggle button component
 */
export function ThemeToggle({
    className,
    showLabel = false,
    variant = 'ghost',
    size = 'default',
}: ThemeToggleProps) {
    const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme();

    const icons = {
        light: Sun,
        dark: Moon,
        system: Monitor,
    };

    const Icon = icons[theme === 'system' ? 'system' : resolvedTheme];

    return (
        <Button
            variant={variant}
            size={size}
            className={cn('relative', className)}
            onClick={toggleTheme}
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`}
        >
            <AnimatePresence mode="wait">
                <motion.span
                    key={resolvedTheme}
                    initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                >
                    <Icon className="h-4 w-4" />
                    {showLabel && (
                        <span className="capitalize">
                            {theme === 'system' ? `System (${resolvedTheme})` : resolvedTheme}
                        </span>
                    )}
                </motion.span>
            </AnimatePresence>
        </Button>
    );
}

/**
 * Theme selector with all options
 */
export function ThemeSelector({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();

    const options: { value: Theme; label: string; icon: typeof Sun }[] = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor },
    ];

    return (
        <div className={cn('flex gap-1 p-1 bg-muted rounded-lg', className)}>
            {options.map(({ value, label, icon: Icon }) => (
                <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                        theme === value
                            ? 'bg-background shadow text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                </button>
            ))}
        </div>
    );
}

export default ThemeProvider;
