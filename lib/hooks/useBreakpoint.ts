/**
 * useBreakpoint v2
 * Enhanced responsive breakpoint detection hook
 * Features: debounced resize, orientation detection, SSR safe
 */

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    BREAKPOINTS,
    BREAKPOINT_ORDER,
    getCurrentBreakpoint,
    isMobileBreakpoint,
    isTabletBreakpoint,
    isDesktopBreakpoint,
    getBreakpointConfig,
    getGridCapacity,
} from '@/lib/constants/breakpoints';
import type { BreakpointId, BreakpointConfig } from '@/lib/types/layout.types';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export type Orientation = 'portrait' | 'landscape';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface BreakpointState {
    /** Current breakpoint ID */
    breakpoint: BreakpointId;
    /** Current breakpoint config */
    config: BreakpointConfig;
    /** Window width */
    width: number;
    /** Window height */
    height: number;
    /** Current orientation */
    orientation: Orientation;
    /** Device type */
    deviceType: DeviceType;
    /** Is mobile (xs or sm) */
    isMobile: boolean;
    /** Is tablet (md) */
    isTablet: boolean;
    /** Is desktop (lg or xl) */
    isDesktop: boolean;
    /** Is touch device */
    isTouch: boolean;
    /** Grid capacity for current breakpoint */
    gridCapacity: number;
    /** Check if current breakpoint is at least the given one */
    isAtLeast: (bp: BreakpointId) => boolean;
    /** Check if current breakpoint is at most the given one */
    isAtMost: (bp: BreakpointId) => boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_DEBOUNCE_MS = 100;
const SSR_DEFAULT_WIDTH = 1024;
const SSR_DEFAULT_HEIGHT = 768;

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if running in browser
 */
function isBrowser(): boolean {
    return typeof window !== 'undefined';
}

/**
 * Get window dimensions
 */
function getWindowDimensions(): { width: number; height: number } {
    if (!isBrowser()) {
        return { width: SSR_DEFAULT_WIDTH, height: SSR_DEFAULT_HEIGHT };
    }
    return {
        width: window.innerWidth,
        height: window.innerHeight,
    };
}

/**
 * Get orientation from dimensions
 */
function getOrientation(width: number, height: number): Orientation {
    return width >= height ? 'landscape' : 'portrait';
}

/**
 * Get device type from breakpoint
 */
function getDeviceType(breakpoint: BreakpointId): DeviceType {
    if (isMobileBreakpoint(breakpoint)) return 'mobile';
    if (isTabletBreakpoint(breakpoint)) return 'tablet';
    return 'desktop';
}

/**
 * Detect if device has touch capability
 */
function detectTouch(): boolean {
    if (!isBrowser()) return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Compare breakpoint order
 */
function breakpointIndex(bp: BreakpointId): number {
    return BREAKPOINT_ORDER.indexOf(bp);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Hook
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook for responsive breakpoint detection
 */
export function useBreakpoint(debounceMs = DEFAULT_DEBOUNCE_MS): BreakpointState {
    // Get initial dimensions
    const initialDimensions = useMemo(() => getWindowDimensions(), []);
    const initialBreakpoint = useMemo(
        () => getCurrentBreakpoint(initialDimensions.width),
        [initialDimensions.width]
    );

    // State
    const [dimensions, setDimensions] = useState(initialDimensions);
    const [breakpoint, setBreakpoint] = useState<BreakpointId>(initialBreakpoint);
    const [isTouch] = useState(() => detectTouch());

    // Debounce timeout ref
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Handle resize with debouncing
    const handleResize = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            const newDimensions = getWindowDimensions();
            const newBreakpoint = getCurrentBreakpoint(newDimensions.width);

            setDimensions(newDimensions);
            setBreakpoint(newBreakpoint);
        }, debounceMs);
    }, [debounceMs]);

    // Setup resize listener
    useEffect(() => {
        if (!isBrowser()) return;

        // Update immediately on mount
        handleResize();

        window.addEventListener('resize', handleResize, { passive: true });

        return () => {
            window.removeEventListener('resize', handleResize);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [handleResize]);

    // Setup orientation change listener (for mobile)
    useEffect(() => {
        if (!isBrowser()) return;

        const handleOrientationChange = () => {
            // Small delay to let browser update dimensions
            setTimeout(handleResize, 50);
        };

        window.addEventListener('orientationchange', handleOrientationChange);

        return () => {
            window.removeEventListener('orientationchange', handleOrientationChange);
        };
    }, [handleResize]);

    // Compute derived values
    const orientation = useMemo(
        () => getOrientation(dimensions.width, dimensions.height),
        [dimensions.width, dimensions.height]
    );

    const deviceType = useMemo(() => getDeviceType(breakpoint), [breakpoint]);
    const config = useMemo(() => getBreakpointConfig(breakpoint), [breakpoint]);
    const gridCapacity = useMemo(() => getGridCapacity(breakpoint), [breakpoint]);

    // Comparison functions
    const isAtLeast = useCallback((bp: BreakpointId): boolean => {
        return breakpointIndex(breakpoint) >= breakpointIndex(bp);
    }, [breakpoint]);

    const isAtMost = useCallback((bp: BreakpointId): boolean => {
        return breakpointIndex(breakpoint) <= breakpointIndex(bp);
    }, [breakpoint]);

    // Return state object
    return useMemo((): BreakpointState => ({
        breakpoint,
        config,
        width: dimensions.width,
        height: dimensions.height,
        orientation,
        deviceType,
        isMobile: isMobileBreakpoint(breakpoint),
        isTablet: isTabletBreakpoint(breakpoint),
        isDesktop: isDesktopBreakpoint(breakpoint),
        isTouch,
        gridCapacity,
        isAtLeast,
        isAtMost,
    }), [
        breakpoint, config, dimensions, orientation, deviceType,
        isTouch, gridCapacity, isAtLeast, isAtMost,
    ]);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Simplified Hooks
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Simple hook that just returns the current breakpoint
 */
export function useCurrentBreakpoint(): BreakpointId {
    const { breakpoint } = useBreakpoint();
    return breakpoint;
}

/**
 * Hook that returns true if on mobile
 */
export function useIsMobile(): boolean {
    const { isMobile } = useBreakpoint();
    return isMobile;
}

/**
 * Hook that returns true if device has touch
 */
export function useIsTouch(): boolean {
    const { isTouch } = useBreakpoint();
    return isTouch;
}

/**
 * Hook that returns current orientation
 */
export function useOrientation(): Orientation {
    const { orientation } = useBreakpoint();
    return orientation;
}

/**
 * Hook that returns grid config for current breakpoint
 */
export function useGridConfig(): BreakpointConfig {
    const { config } = useBreakpoint();
    return config;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Media Query Hook
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook that matches a media query
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(() => {
        if (!isBrowser()) return false;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        if (!isBrowser()) return;

        const mediaQuery = window.matchMedia(query);

        const handleChange = (e: MediaQueryListEvent) => {
            setMatches(e.matches);
        };

        // Initial check
        setMatches(mediaQuery.matches);

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [query]);

    return matches;
}

/**
 * Hook for reduced motion preference
 */
export function usePrefersReducedMotion(): boolean {
    return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Hook for dark mode system preference
 */
export function usePrefersDarkMode(): boolean {
    return useMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * Hook for high contrast preference
 */
export function usePrefersHighContrast(): boolean {
    return useMediaQuery('(prefers-contrast: more)');
}

export default useBreakpoint;
