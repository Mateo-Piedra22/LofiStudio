/**
 * WidgetSlot v2
 * Individual slot/container for each widget in the grid
 */

'use client';

import React, { forwardRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { GripVertical, X, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWidgetGrid } from '@/lib/hooks/useWidgetGrid';
import type { WidgetType } from '@/lib/types/widget.types';

interface WidgetSlotProps {
    id: string;
    type: WidgetType;
    isEditing: boolean;
    isDragging: boolean;
    children: React.ReactNode;
    className?: string;
}

/**
 * Slot component that wraps each widget
 * Handles drag handles, remove button, and edit mode UI
 */
export const WidgetSlot = forwardRef<HTMLDivElement, WidgetSlotProps>(({
    id,
    type,
    isEditing,
    isDragging,
    children,
    className,
}, ref) => {
    const { removeWidget } = useWidgetGrid();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isOver,
    } = useSortable({
        id,
        disabled: !isEditing,
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition: transition || undefined,
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        removeWidget(id);
    };

    return (
        <div
            ref={(node) => {
                setNodeRef(node);
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }
            }}
            style={style}
            className={cn(
                'relative h-full w-full group',
                'transition-all duration-200',
                isEditing && 'ring-2 ring-transparent hover:ring-primary/50 rounded-xl',
                isDragging && 'opacity-50 scale-95',
                isOver && 'ring-2 ring-primary/70',
                className
            )}
            data-widget-id={id}
            data-widget-type={type}
            {...attributes}
        >
            {/* Main widget content */}
            <div className={cn(
                'h-full w-full overflow-hidden rounded-xl',
                'transition-all duration-300',
                !isEditing && 'hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20',
            )}>
                {children}
            </div>

            {/* Edit mode overlay and controls */}
            {isEditing && (
                <>
                    {/* Drag handle */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                            'absolute top-2 left-1/2 -translate-x-1/2 z-20',
                            'p-1.5 rounded-full',
                            'bg-background/80 backdrop-blur-md border border-border',
                            'opacity-0 group-hover:opacity-100',
                            'transition-opacity duration-200',
                            'cursor-grab active:cursor-grabbing',
                            'touch-none'
                        )}
                        {...listeners}
                    >
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </motion.div>

                    {/* Remove button */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={handleRemove}
                        className={cn(
                            'absolute -top-2 -right-2 z-30',
                            'p-1.5 rounded-full',
                            'bg-destructive text-destructive-foreground',
                            'shadow-lg',
                            'hover:bg-destructive/90',
                            'transition-colors duration-200',
                            'opacity-0 group-hover:opacity-100'
                        )}
                        type="button"
                        aria-label={`Remove ${type} widget`}
                    >
                        <X className="w-3 h-3" />
                    </motion.button>

                    {/* Invisible overlay to prevent widget interaction during edit */}
                    <div
                        className="absolute inset-0 z-10 pointer-events-none"
                        style={{ pointerEvents: isEditing ? 'auto' : 'none' }}
                    />
                </>
            )}

            {/* Drop indicator */}
            {isOver && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-5 rounded-xl bg-primary/20 border-2 border-primary border-dashed pointer-events-none"
                />
            )}
        </div>
    );
});

WidgetSlot.displayName = 'WidgetSlot';

export default WidgetSlot;
