/**
 * WidgetHeader v2
 * Standardized header component for widgets
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Settings, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { WidgetIcon } from './WidgetIcon';
import { WidgetAlignmentControl } from './WidgetAlignmentControl';
import type { WidgetAction, WidgetStyle } from '@/lib/types/widget.types';

interface WidgetHeaderProps {
    /** Widget title */
    title: string;
    /** Lucide icon name */
    icon: string;
    /** Custom actions */
    actions?: WidgetAction[];
    /** Settings button handler */
    onSettings?: () => void;
    /** Refresh button handler */
    onRefresh?: () => void;
    /** Loading state */
    isLoading?: boolean;
    /** Whether to show alignment controls */
    allowAlignment?: boolean;
    /** Current widget style */
    currentStyle?: WidgetStyle;
    /** Handler for style updates */
    onStyleUpdate?: (style: WidgetStyle) => void;
    /** Additional className */
    className?: string;
}

/** Standard header height in pixels */
export const WIDGET_HEADER_HEIGHT = 44;

/**
 * Standardized widget header
 * Consistent across all widgets
 */
export function WidgetHeader({
    title,
    icon,
    actions = [],
    onSettings,
    onRefresh,
    isLoading = false,
    allowAlignment,
    currentStyle,
    onStyleUpdate,
    className,
}: WidgetHeaderProps) {
    return (
        <div
            data-slot="header"
            className={cn(
                'flex items-center justify-between',
                'px-3 py-2',
                'border-b border-border/50',
                'flex-shrink-0',
                className
            )}
            style={{ height: WIDGET_HEADER_HEIGHT }}
        >
            {/* Left side: Icon + Title */}
            <div className="flex items-center gap-2 min-w-0">
                <WidgetIcon name={icon} className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">
                    {title}
                </span>
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
                {/* Custom actions */}
                {actions.map((action) => (
                    <Button
                        key={action.id}
                        variant="ghost"
                        size="sm"
                        onClick={action.onClick}
                        disabled={action.disabled || isLoading}
                        className={cn(
                            'h-7 w-7 p-0',
                            'text-muted-foreground hover:text-foreground',
                            action.variant === 'destructive' && 'hover:text-destructive'
                        )}
                        aria-label={action.label}
                    >
                        <WidgetIcon name={action.icon} className="w-3.5 h-3.5" />
                    </Button>
                ))}

                {/* Refresh button */}
                {onRefresh && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRefresh}
                        disabled={isLoading}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        aria-label="Refresh"
                    >
                        {isLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                        )}
                    </Button>
                )}

                {/* Alignment Control */}
                {allowAlignment && onStyleUpdate && (
                    <WidgetAlignmentControl
                        currentStyle={currentStyle}
                        onUpdate={onStyleUpdate}
                        isLoading={isLoading}
                    />
                )}

                {/* Settings button */}
                {onSettings && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onSettings}
                        disabled={isLoading}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        aria-label="Settings"
                    >
                        <Settings className="w-3.5 h-3.5" />
                    </Button>
                )}
            </div>
        </div>
    );
}

export default WidgetHeader;
