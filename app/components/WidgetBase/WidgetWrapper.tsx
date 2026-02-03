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
    children,
}: WidgetWrapperProps) {
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
                />
            )}

            {/* Content */}
            <WidgetContent
                error={error}
                isLoading={isLoading}
                className={contentClassName}
            >
                {children}
            </WidgetContent>
        </div>
    );
}

export default WidgetWrapper;
