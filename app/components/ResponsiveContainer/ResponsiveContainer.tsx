/**
 * ResponsiveContainer v2
 * Adaptive container that adjusts layout based on breakpoint
 */

'use client';

import React, { forwardRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/lib/hooks/useBreakpoint';
import type { BreakpointId, BreakpointConfig } from '@/lib/types/layout.types';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

interface ResponsiveContainerProps {
    children: React.ReactNode;
    className?: string;
    /** Apply padding based on breakpoint */
    applyPadding?: boolean;
    /** Apply safe area insets (for mobile) */
    applySafeArea?: boolean;
    /** Max width constraint */
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | number;
    /** Center content horizontally */
    centered?: boolean;
    /** Full height of viewport */
    fullHeight?: boolean;
    /** Animate layout changes */
    animate?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_WIDTHS = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    full: '100%',
};

// ═══════════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Container that adapts to current breakpoint
 */
export const ResponsiveContainer = forwardRef<HTMLDivElement, ResponsiveContainerProps>(
    function ResponsiveContainer(
        {
            children,
            className,
            applyPadding = true,
            applySafeArea = true,
            maxWidth = 'full',
            centered = false,
            fullHeight = false,
            animate = false,
        },
        ref
    ) {
        const { config, breakpoint, isMobile } = useBreakpoint();

        // Compute max width
        const maxWidthValue = useMemo(() => {
            if (typeof maxWidth === 'number') return `${maxWidth}px`;
            return MAX_WIDTHS[maxWidth];
        }, [maxWidth]);

        // Compute padding
        const padding = useMemo(() => {
            if (!applyPadding) return 0;
            return config.padding;
        }, [applyPadding, config.padding]);

        const containerStyle = useMemo(() => ({
            maxWidth: maxWidthValue,
            paddingLeft: padding,
            paddingRight: padding,
            paddingTop: isMobile ? padding / 2 : padding,
            paddingBottom: isMobile ? padding : padding,
        }), [maxWidthValue, padding, isMobile]);

        const content = (
            <div
                ref={ref}
                className={cn(
                    'w-full',
                    centered && 'mx-auto',
                    fullHeight && 'min-h-screen',
                    applySafeArea && isMobile && 'safe-area-inset',
                    className
                )}
                style={containerStyle}
                data-breakpoint={breakpoint}
            >
                {children}
            </div>
        );

        if (animate) {
            return (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={breakpoint}
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0.8 }}
                        transition={{ duration: 0.2 }}
                    >
                        {content}
                    </motion.div>
                </AnimatePresence>
            );
        }

        return content;
    }
);

// ═══════════════════════════════════════════════════════════════════════════════
// Responsive Value Utilities
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get a value based on current breakpoint
 */
export function useResponsiveValue<T>(values: Partial<Record<BreakpointId, T>>, defaultValue: T): T {
    const { breakpoint } = useBreakpoint();

    // Try to find value for current breakpoint, then fall back to smaller breakpoints
    const order: BreakpointId[] = ['xl', 'lg', 'md', 'sm', 'xs'];
    const startIndex = order.indexOf(breakpoint);

    for (let i = startIndex; i < order.length; i++) {
        const bp = order[i];
        if (values[bp] !== undefined) {
            return values[bp]!;
        }
    }

    return defaultValue;
}

/**
 * Conditionally render based on breakpoint
 */
export function useShowAt(
    condition: 'mobile' | 'tablet' | 'desktop' | BreakpointId | BreakpointId[]
): boolean {
    const { breakpoint, isMobile, isTablet, isDesktop } = useBreakpoint();

    if (condition === 'mobile') return isMobile;
    if (condition === 'tablet') return isTablet;
    if (condition === 'desktop') return isDesktop;

    if (Array.isArray(condition)) {
        return condition.includes(breakpoint);
    }

    return breakpoint === condition;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Responsive Visibility Components
// ═══════════════════════════════════════════════════════════════════════════════

interface ShowAtProps {
    children: React.ReactNode;
    breakpoints: BreakpointId[];
    fallback?: React.ReactNode;
}

/**
 * Show content only at specific breakpoints
 */
export function ShowAt({ children, breakpoints, fallback = null }: ShowAtProps) {
    const show = useShowAt(breakpoints);
    return <>{show ? children : fallback}</>;
}

/**
 * Show content only on mobile
 */
export function MobileOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    return <ShowAt breakpoints={['xs', 'sm']} fallback={fallback}>{children}</ShowAt>;
}

/**
 * Show content only on tablet
 */
export function TabletOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    return <ShowAt breakpoints={['md']} fallback={fallback}>{children}</ShowAt>;
}

/**
 * Show content only on desktop
 */
export function DesktopOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    return <ShowAt breakpoints={['lg', 'xl']} fallback={fallback}>{children}</ShowAt>;
}

/**
 * Hide content on mobile
 */
export function HideOnMobile({ children }: { children: React.ReactNode }) {
    return <ShowAt breakpoints={['md', 'lg', 'xl']}>{children}</ShowAt>;
}

/**
 * Hide content on desktop
 */
export function HideOnDesktop({ children }: { children: React.ReactNode }) {
    return <ShowAt breakpoints={['xs', 'sm', 'md']}>{children}</ShowAt>;
}

export default ResponsiveContainer;
