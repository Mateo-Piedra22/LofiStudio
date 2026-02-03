/**
 * GridBackground v2
 * Visual background grid for edit mode
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GridBackgroundProps {
    cols: number;
    rows: number;
    gap: number;
    className?: string;
}

/**
 * Displays a grid background during edit mode
 * Shows drop zones visually
 */
export function GridBackground({ cols, rows, gap, className }: GridBackgroundProps) {
    const cells = Array.from({ length: cols * rows }, (_, i) => i);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
                'absolute inset-0 z-0 pointer-events-none',
                className
            )}
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                gap,
            }}
        >
            {cells.map((index) => {
                const col = index % cols;
                const row = Math.floor(index / cols);

                return (
                    <motion.div
                        key={`cell-${col}-${row}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            delay: index * 0.02,
                            duration: 0.15,
                        }}
                        className={cn(
                            'rounded-xl',
                            'border border-dashed',
                            'border-white/10 dark:border-white/5',
                            'bg-white/5 dark:bg-black/10',
                        )}
                    />
                );
            })}
        </motion.div>
    );
}

export default GridBackground;
