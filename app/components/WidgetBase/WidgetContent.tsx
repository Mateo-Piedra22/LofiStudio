/**
 * WidgetContent v2
 * Standardized content area for widgets
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { WidgetSkeleton } from './WidgetSkeleton';

interface WidgetContentProps {
    /** Loading state */
    isLoading?: boolean;
    /** Error message */
    error?: string | null;
    /** Retry handler for errors */
    onRetry?: () => void;
    /** Additional className */
    className?: string;
    /** Children components */
    children: React.ReactNode;
    /** Whether to center content */
    centered?: boolean;
    /** Padding style */
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
};

/**
 * Standardized content area for widgets
 * Handles loading, error, and content states
 */
export function WidgetContent({
    isLoading = false,
    error = null,
    onRetry,
    className,
    children,
    centered = false,
    padding = 'md',
}: WidgetContentProps) {
    return (
        <div
            data-slot="content"
            className={cn(
                'flex-1 min-h-0 overflow-hidden',
                paddingClasses[padding],
                centered && 'flex items-center justify-center',
                className
            )}
        >
            <AnimatePresence mode="wait">
                {/* Loading state */}
                {isLoading && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full w-full"
                    >
                        <WidgetSkeleton />
                    </motion.div>
                )}

                {/* Error state */}
                {!isLoading && error && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="h-full w-full flex flex-col items-center justify-center gap-3 text-center"
                    >
                        <div className="p-3 rounded-full bg-destructive/10">
                            <AlertCircle className="w-6 h-6 text-destructive" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">
                                Something went wrong
                            </p>
                            <p className="text-xs text-muted-foreground max-w-[200px]">
                                {error}
                            </p>
                        </div>
                        {onRetry && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onRetry}
                                className="mt-2"
                            >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Try again
                            </Button>
                        )}
                    </motion.div>
                )}

                {/* Content */}
                {!isLoading && !error && (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full w-full"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default WidgetContent;
