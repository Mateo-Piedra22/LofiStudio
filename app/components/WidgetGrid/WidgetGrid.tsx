/**
 * WidgetGrid v2
 * Main container component for the widget grid system
 */

'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverEvent, PointerSensor, TouchSensor, useSensor, useSensors, DragOverlay, pointerWithin } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useWidgetGrid } from '@/lib/hooks/useWidgetGrid';
import { getBreakpointConfig } from '@/lib/constants/breakpoints';
import { WidgetSlot } from './WidgetSlot';
import { GridBackground } from './GridBackground';
import { WidgetDragOverlay } from './WidgetDragOverlay';
import type { WidgetLayoutEntry, BreakpointId } from '@/lib/types/layout.types';
import type { GridPosition } from '@/lib/types/widget.types';

interface WidgetGridProps {
    className?: string;
    children?: React.ReactNode;
    renderWidget: (widgetId: string, type: string) => React.ReactNode;
}

/**
 * Main widget grid container
 * Handles layout, drag & drop, and responsive behavior
 */
export function WidgetGrid({ className, renderWidget }: WidgetGridProps) {
    const {
        visibleWidgets,
        currentLayout,
        breakpoint,
        breakpointConfig,
        isEditMode,
        dragState,
        startDrag,
        endDrag,
        cancelDrag,
        swapWidgets,
        moveWidget,
        getWidgetAtPosition,
    } = useWidgetGrid();

    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    // DnD-Kit sensors optimized for touch
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 8,
            },
        })
    );

    // Calculate cell size based on container
    const cellSize = useMemo(() => {
        if (!containerSize.width || !containerSize.height) {
            return { width: 200, height: 150 };
        }

        const gap = breakpointConfig.gap;
        const totalGapWidth = gap * (breakpointConfig.gridCols - 1);
        const totalGapHeight = gap * (breakpointConfig.gridRows - 1);

        return {
            width: (containerSize.width - totalGapWidth) / breakpointConfig.gridCols,
            height: (containerSize.height - totalGapHeight) / breakpointConfig.gridRows,
        };
    }, [containerSize, breakpointConfig]);

    // Observe container size
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver(entries => {
            const entry = entries[0];
            if (entry) {
                setContainerSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Convert pixel position to grid position
    const pixelToGrid = useCallback((x: number, y: number): GridPosition => {
        const gap = breakpointConfig.gap;
        const col = Math.floor(x / (cellSize.width + gap));
        const row = Math.floor(y / (cellSize.height + gap));

        return {
            col: Math.max(0, Math.min(col, breakpointConfig.gridCols - 1)),
            row: Math.max(0, Math.min(row, breakpointConfig.gridRows - 1)),
        };
    }, [cellSize, breakpointConfig]);

    // Handle drag start
    const handleDragStart = useCallback((event: DragStartEvent) => {
        const widgetId = event.active.id as string;
        startDrag(widgetId);
    }, [startDrag]);

    // Handle drag over
    const handleDragOver = useCallback((event: DragOverEvent) => {
        // Could use for hover effects
    }, []);

    // Handle drag end
    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        if (!active) {
            cancelDrag();
            return;
        }

        if (over && over.id !== active.id) {
            // Swap widgets
            swapWidgets(active.id as string, over.id as string);
        }

        endDrag(null);
    }, [swapWidgets, endDrag, cancelDrag]);

    // Handle drag cancel
    const handleDragCancel = useCallback(() => {
        cancelDrag();
    }, [cancelDrag]);

    // Get widget layout for positioning
    const getLayoutStyle = useCallback((layout: WidgetLayoutEntry): React.CSSProperties => {
        const gap = breakpointConfig.gap;

        return {
            gridColumn: `${layout.position.col + 1} / span ${layout.dimensions.cols}`,
            gridRow: `${layout.position.row + 1} / span ${layout.dimensions.rows}`,
        };
    }, [breakpointConfig]);

    // Active widget for drag overlay
    const activeWidget = useMemo(() => {
        if (!dragState.isDragging || !dragState.activeWidgetId) return null;
        return visibleWidgets.find(w => w.id === dragState.activeWidgetId);
    }, [dragState, visibleWidgets]);

    const activeLayout = useMemo(() => {
        if (!activeWidget) return null;
        return currentLayout.find(l => l.widgetId === activeWidget.id);
    }, [activeWidget, currentLayout]);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div
                ref={containerRef}
                className={cn(
                    'relative w-full h-full',
                    className
                )}
                style={{
                    padding: breakpointConfig.padding,
                }}
            >
                {/* Grid background (edit mode) */}
                <AnimatePresence>
                    {isEditMode && (
                        <GridBackground
                            cols={breakpointConfig.gridCols}
                            rows={breakpointConfig.gridRows}
                            gap={breakpointConfig.gap}
                        />
                    )}
                </AnimatePresence>

                {/* Widget grid */}
                <div
                    className="relative w-full h-full grid"
                    style={{
                        gridTemplateColumns: `repeat(${breakpointConfig.gridCols}, 1fr)`,
                        gridTemplateRows: `repeat(${breakpointConfig.gridRows}, 1fr)`,
                        gap: breakpointConfig.gap,
                    }}
                >
                    <AnimatePresence mode="popLayout">
                        {currentLayout.map(layout => {
                            const widget = visibleWidgets.find(w => w.id === layout.widgetId);
                            if (!widget) return null;

                            const isDragging = dragState.activeWidgetId === widget.id;

                            return (
                                <motion.div
                                    key={widget.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{
                                        opacity: isDragging ? 0.5 : 1,
                                        scale: 1,
                                    }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{
                                        layout: { duration: 0.3, ease: 'easeOut' },
                                        opacity: { duration: 0.2 },
                                        scale: { duration: 0.2 },
                                    }}
                                    style={getLayoutStyle(layout)}
                                    className="h-full w-full"
                                >
                                    <WidgetSlot
                                        id={widget.id}
                                        type={widget.type}
                                        isEditing={isEditMode}
                                        isDragging={isDragging}
                                    >
                                        {renderWidget(widget.id, widget.type)}
                                    </WidgetSlot>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Drag overlay */}
            <DragOverlay dropAnimation={{
                duration: 200,
                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}>
                {activeWidget && activeLayout && (
                    <WidgetDragOverlay
                        width={cellSize.width * activeLayout.dimensions.cols + breakpointConfig.gap * (activeLayout.dimensions.cols - 1)}
                        height={cellSize.height * activeLayout.dimensions.rows + breakpointConfig.gap * (activeLayout.dimensions.rows - 1)}
                    >
                        {renderWidget(activeWidget.id, activeWidget.type)}
                    </WidgetDragOverlay>
                )}
            </DragOverlay>
        </DndContext>
    );
}

export default WidgetGrid;
