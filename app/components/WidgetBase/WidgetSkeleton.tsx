/**
 * WidgetSkeleton v2
 * Loading skeleton for widgets
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface WidgetSkeletonProps {
    /** Type of skeleton layout */
    variant?: 'default' | 'text' | 'list' | 'chart';
    /** Additional className */
    className?: string;
}

/**
 * Skeleton component for widget loading states
 */
export function WidgetSkeleton({
    variant = 'default',
    className
}: WidgetSkeletonProps) {
    return (
        <div className={cn('h-full w-full animate-pulse', className)}>
            {variant === 'default' && <DefaultSkeleton />}
            {variant === 'text' && <TextSkeleton />}
            {variant === 'list' && <ListSkeleton />}
            {variant === 'chart' && <ChartSkeleton />}
        </div>
    );
}

function DefaultSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-12 h-12 rounded-full bg-muted/50" />
            <div className="w-24 h-4 rounded bg-muted/50" />
            <div className="w-16 h-3 rounded bg-muted/30" />
        </div>
    );
}

function TextSkeleton() {
    return (
        <div className="space-y-3 p-2">
            <div className="w-full h-4 rounded bg-muted/50" />
            <div className="w-4/5 h-4 rounded bg-muted/40" />
            <div className="w-3/5 h-4 rounded bg-muted/30" />
        </div>
    );
}

function ListSkeleton() {
    return (
        <div className="space-y-2 p-2">
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-2"
                    style={{ opacity: 1 - i * 0.15 }}
                >
                    <div className="w-4 h-4 rounded bg-muted/50" />
                    <div className="flex-1 h-4 rounded bg-muted/50" />
                </div>
            ))}
        </div>
    );
}

function ChartSkeleton() {
    return (
        <div className="flex items-end justify-evenly h-full gap-2 p-4">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className="flex-1 rounded-t bg-muted/50"
                    style={{
                        height: `${30 + Math.random() * 50}%`,
                    }}
                />
            ))}
        </div>
    );
}

export default WidgetSkeleton;
