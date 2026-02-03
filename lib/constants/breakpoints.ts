/**
 * Breakpoint Constants v2
 * Defines responsive breakpoints and grid configurations
 */

import type { BreakpointId, BreakpointConfig, GridConstraints } from '../types/layout.types';

/**
 * All breakpoint configurations
 * Ordered from smallest to largest
 */
export const BREAKPOINTS: Record<BreakpointId, BreakpointConfig> = {
    xs: {
        id: 'xs',
        minWidth: 0,
        maxWidth: 479,
        gridCols: 1,
        gridRows: 4,
        gap: 12,
        padding: 12,
    },
    sm: {
        id: 'sm',
        minWidth: 480,
        maxWidth: 767,
        gridCols: 1,
        gridRows: 5,
        gap: 12,
        padding: 16,
    },
    md: {
        id: 'md',
        minWidth: 768,
        maxWidth: 1023,
        gridCols: 2,
        gridRows: 3,
        gap: 16,
        padding: 20,
    },
    lg: {
        id: 'lg',
        minWidth: 1024,
        maxWidth: 1439,
        gridCols: 3,
        gridRows: 3,
        gap: 16,
        padding: 24,
    },
    xl: {
        id: 'xl',
        minWidth: 1440,
        maxWidth: null,
        gridCols: 3,
        gridRows: 3,
        gap: 20,
        padding: 32,
    },
};

/**
 * Breakpoint IDs ordered from smallest to largest
 */
export const BREAKPOINT_ORDER: BreakpointId[] = ['xs', 'sm', 'md', 'lg', 'xl'];

/**
 * Grid constraints per breakpoint
 */
export const GRID_CONSTRAINTS: Record<BreakpointId, GridConstraints> = {
    xs: {
        maxCols: 1,
        maxRows: 4,
        minWidgetWidth: 1,
        minWidgetHeight: 1,
        maxWidgetWidth: 1,
        maxWidgetHeight: 3,
    },
    sm: {
        maxCols: 1,
        maxRows: 5,
        minWidgetWidth: 1,
        minWidgetHeight: 1,
        maxWidgetWidth: 1,
        maxWidgetHeight: 3,
    },
    md: {
        maxCols: 2,
        maxRows: 3,
        minWidgetWidth: 1,
        minWidgetHeight: 1,
        maxWidgetWidth: 2,
        maxWidgetHeight: 3,
    },
    lg: {
        maxCols: 3,
        maxRows: 3,
        minWidgetWidth: 1,
        minWidgetHeight: 1,
        maxWidgetWidth: 3,
        maxWidgetHeight: 3,
    },
    xl: {
        maxCols: 3,
        maxRows: 3,
        minWidgetWidth: 1,
        minWidgetHeight: 1,
        maxWidgetWidth: 3,
        maxWidgetHeight: 3,
    },
};

/**
 * CSS media query strings for each breakpoint
 */
export const MEDIA_QUERIES: Record<BreakpointId, string> = {
    xs: '(max-width: 479px)',
    sm: '(min-width: 480px) and (max-width: 767px)',
    md: '(min-width: 768px) and (max-width: 1023px)',
    lg: '(min-width: 1024px) and (max-width: 1439px)',
    xl: '(min-width: 1440px)',
};

/**
 * Get the current breakpoint based on window width
 */
export function getCurrentBreakpoint(width: number): BreakpointId {
    if (width >= BREAKPOINTS.xl.minWidth) return 'xl';
    if (width >= BREAKPOINTS.lg.minWidth) return 'lg';
    if (width >= BREAKPOINTS.md.minWidth) return 'md';
    if (width >= BREAKPOINTS.sm.minWidth) return 'sm';
    return 'xs';
}

/**
 * Get breakpoint config by ID
 */
export function getBreakpointConfig(id: BreakpointId): BreakpointConfig {
    return BREAKPOINTS[id];
}

/**
 * Check if current breakpoint is mobile
 */
export function isMobileBreakpoint(id: BreakpointId): boolean {
    return id === 'xs' || id === 'sm';
}

/**
 * Check if current breakpoint is tablet
 */
export function isTabletBreakpoint(id: BreakpointId): boolean {
    return id === 'md';
}

/**
 * Check if current breakpoint is desktop
 */
export function isDesktopBreakpoint(id: BreakpointId): boolean {
    return id === 'lg' || id === 'xl';
}

/**
 * Get total grid capacity for a breakpoint
 */
export function getGridCapacity(id: BreakpointId): number {
    const config = BREAKPOINTS[id];
    return config.gridCols * config.gridRows;
}
