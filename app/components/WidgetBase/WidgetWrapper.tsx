/**
 * WidgetWrapper v2
 * Standardized wrapper for all widgets
 * Provides consistent header, actions, and styling
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { WidgetHeader } from './WidgetHeader';
import { WidgetContent } from './WidgetContent';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import type { WidgetAction } from '@/lib/types/widget.types';

export interface WidgetWrapperProps {
    /** Unique widget ID */
    id: string;
    /** Widget title for header */
    title: string;
    /** Lucide icon name for header */
    icon: string;
    /** Actions to display in header */
    actions?: WidgetAction[];
    /** Whether to show the header */
    showHeader?: boolean;
    /** Handler for settings button */
    onSettings?: () => void;
    /** Handler for refresh (if applicable) */
    onRefresh?: () => void;
    /** Whether widget is loading */
    isLoading?: boolean;
    /** Error message to display */
    error?: string | null;
    /** Additional wrapper className */
    className?: string;
    /** Content className */
    contentClassName?: string;
    /** Whether to enable content alignment controls */
    allowAlignment?: boolean;
    /** Children components */
    children: React.ReactNode;
}

/**
 * Universal wrapper component for all widgets
 * Ensures consistent look and behavior across the app
 */
export function WidgetWrapper({
    id,
    title,
    icon,
    actions = [],
    showHeader = true,
    onSettings,
    onRefresh,
    isLoading = false,
    error = null,
    className,
    contentClassName,
    allowAlignment = false,
    children,
}: WidgetWrapperProps) {
    const updateWidgetStyle = useWidgetGridStore(state => state.updateWidgetStyle);
    const widget = useWidgetGridStore(state => state.widgets.find(w => w.id === id));

    // Style handling
    const style = widget?.style;
    const justifyContent = style?.justifyContent || 'center'; // Default logical vertical alignment
    const alignItems = style?.alignItems || 'center';         // Default logical horizontal alignment

    // Map abstract alignment to Tailwind classes
    // Note: The container is flex-col
    const alignmentClasses = React.useMemo(() => {
        if (!allowAlignment) return '';

        const classes = [];

        // Vertical alignment (Main axis)
        switch (justifyContent) {
            case 'start': classes.push('justify-start'); break;
            case 'center': classes.push('justify-center'); break;
            case 'end': classes.push('justify-end'); break;
        }

        // Horizontal alignment (Cross axis)
        switch (alignItems) {
            case 'start': classes.push('items-start text-left'); break;
            case 'center': classes.push('items-center text-center'); break;
            case 'end': classes.push('items-end text-right'); break;
        }

        return classes.join(' ');
    }, [allowAlignment, justifyContent, alignItems]);

    const handleStyleUpdate = React.useCallback((newStyle: any) => {
        updateWidgetStyle(id, newStyle);
    }, [id, updateWidgetStyle]);

    return (
        <div
            data-ui="widget"
            data-widget-id={id}
            className={cn(
                // Base styles
                'h-full w-full flex flex-col',
                'rounded-xl overflow-hidden',
                // Glass effect
                'glass border',
                'text-card-foreground',
                // Shadows
                'shadow-sm',
                className
            )}
        >
            {/* Header */}
            {showHeader && (
                <WidgetHeader
                    title={title}
                    icon={icon}
                    actions={actions}
                    onSettings={onSettings}
                    onRefresh={onRefresh}
                    isLoading={isLoading}
                    allowAlignment={allowAlignment}
                    currentStyle={style}
                    onStyleUpdate={handleStyleUpdate}
                />
            )}

            {/* Content */}
            <WidgetContent
                error={error}
                isLoading={isLoading}
                className={cn(
                    // Base relative positioning
                    'relative',
                    // Apply alignment if enabled, otherwise respect default/passed classes
                    allowAlignment ? ['flex flex-col h-full w-full', alignmentClasses] : '',
                    contentClassName
                )}
            >
                {children}
            </WidgetContent>
        </div>
    );
}

export default WidgetWrapper;
