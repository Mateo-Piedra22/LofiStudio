/**
 * WidgetDragOverlay v2
 * Visual overlay during widget drag operation
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WidgetDragOverlayProps {
    width: number;
    height: number;
    children: React.ReactNode;
    className?: string;
}

/**
 * Overlay component shown during drag
 * Provides visual feedback of the widget being dragged
 */
export function WidgetDragOverlay({
    width,
    height,
    children,
    className
}: WidgetDragOverlayProps) {
    return (
        <motion.div
            initial={{ scale: 1.05, opacity: 0.8 }}
            animate={{ scale: 1.05, opacity: 0.9 }}
            exit={{ scale: 1, opacity: 0 }}
            className={cn(
                'relative rounded-xl overflow-hidden',
                'shadow-2xl shadow-black/30',
                'ring-2 ring-primary/50',
                'cursor-grabbing',
                className
            )}
            style={{
                width,
                height,
            }}
        >
            {/* Widget content */}
            <div className="h-full w-full pointer-events-none">
                {children}
            </div>

            {/* Overlay tint */}
            <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
        </motion.div>
    );
}

export default WidgetDragOverlay;
