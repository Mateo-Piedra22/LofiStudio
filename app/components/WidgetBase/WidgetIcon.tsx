/**
 * WidgetIcon v2
 * Dynamic icon component for widgets
 * Renders Lucide icons by name
 */

'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface WidgetIconProps {
    /** Lucide icon name */
    name: string;
    /** Additional className */
    className?: string;
    /** Size in pixels (optional, use className for more control) */
    size?: number;
}

/**
 * Renders a Lucide icon by name
 * Falls back to a generic icon if not found
 */
export function WidgetIcon({ name, className, size }: WidgetIconProps) {
    // Get icon component by name - using type assertion for dynamic lookup
    const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; size?: number }>>;
    const IconComponent = icons[name];

    // Fallback icon
    if (!IconComponent) {
        return <LucideIcons.HelpCircle className={className} size={size} />;
    }

    return <IconComponent className={className} size={size} />;
}

/**
 * Get animated icon with fallback
 * For widgets that support Lottie animations
 */
export function AnimatedWidgetIcon({
    animationSrc,
    fallbackIcon,
    className,
}: {
    animationSrc?: string;
    fallbackIcon: string;
    className?: string;
}) {
    // For now, just render the static icon
    // TODO: Add Lottie support
    return <WidgetIcon name={fallbackIcon} className={className} />;
}

export default WidgetIcon;
