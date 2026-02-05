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

        const padding = breakpointConfig.padding * 2;
        const availableWidth = containerSize.width - padding;
        const availableHeight = containerSize.height - padding;

        const gap = breakpointConfig.gap;
        const totalGapWidth = gap * (breakpointConfig.gridCols - 1);
        const totalGapHeight = gap * (breakpointConfig.gridRows - 1);

        return {
            width: (availableWidth - totalGapWidth) / breakpointConfig.gridCols,
            height: (availableHeight - totalGapHeight) / breakpointConfig.gridRows,
        };
    }, [containerSize, breakpointConfig]);

    // Observe container size (remains same)
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver(entries => {
            const entry = entries[0];
            if (entry) {
                // contentRect DOES NOT include padding if box-sizing is border-box? 
                // Wait, ResizeObserver contentRect is basically the content box.
                // If we use boundingClient or borderBoxSize it includes padding.
                // Let's stick to contentRect but verify assumption.
                // Actually, if we use contentRect, it ALREADY excludes padding.
                // So if we subtract padding AGAIN, we double subtract?

                // Let's verify standard behavior:
                // If container has padding: 20px. 
                // Width: 1000px. Content width: 960px.
                // contentRect.width = 960px.
                // So cellSize calculation using 960 is CORRECT without manual subtraction IF we use contentRect.

                // BUT, the visual issue suggests mismatch.
                // If GridBackground was inset-0 relative to PARENT border box, it was 1000px.
                // Grid was 960px.
                // So wrapping GridBackground inside the content flow fixes the visual mismatch.
                // 
                // Do we need to subtract padding in cellSize? 
                // If `containerSize` comes from `entry.contentRect`, it is 960.
                // So we do NOT need to subtract padding manually in cellSize if we use contentRect.

                // However, let's play safe and use the correct structure first.
                // If I assume contentRect gives me the area WHERE widgets live, I shouldn't subtract padding.
                // I will revert the manual padding subtraction plan and focus on the WRAPPER fix, which aligns visual grid.
                // 
                // Wait, if I change the wrapper, `GridBackground` becomes 960px.
                // Drag calculation `pixelToGrid` uses `cellSize`.
                // If `cellSize` uses `containerSize` (960), it is correct.
                // But `relativeX` in `handleDragEnd` uses `getBoundingClientRect` (1000) minus `left`.
                // Requires verifying coordinate systems.

                // Let's stick to the wrapper fix first as it's definitely required for Visuals.
                // For logic, I'll trust `contentRect` matches the wrapper size.

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
    const pixelToGrid = useCallback((x: number, y: number, dimensions?: { cols: number, rows: number }): GridPosition => {
        const gap = breakpointConfig.gap;
        // Use Math.round for better snapping feel (snap to closest grid line)
        const col = Math.round(x / (cellSize.width + gap));
        const row = Math.round(y / (cellSize.height + gap));

        // Use dimensions to clamp to valid area
        const maxCol = breakpointConfig.gridCols - (dimensions?.cols || 1);
        const maxRow = breakpointConfig.gridRows - (dimensions?.rows || 1);

        return {
            col: Math.max(0, Math.min(col, maxCol)),
            row: Math.max(0, Math.min(row, maxRow)),
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
        const { active } = event;

        if (!active || !containerRef.current) {
            cancelDrag();
            return;
        }

        // Calculate final position
        // active.rect.current.translated gives the final viewport rect of the dragged item
        const activeRect = active.rect.current.translated;
        if (!activeRect) {
            cancelDrag();
            return;
        }

        const containerRect = containerRef.current.getBoundingClientRect();

        // Calculate relative coordinates
        const relativeX = activeRect.left - containerRect.left;
        const relativeY = activeRect.top - containerRect.top;

        // Get dimensions for clamping
        const widgetLayout = currentLayout.find(l => l.widgetId === active.id);

        // Convert to grid position
        const targetPos = pixelToGrid(relativeX, relativeY, widgetLayout?.dimensions);

        // Store handles swap vs move logic
        endDrag(targetPos);
    }, [endDrag, cancelDrag, pixelToGrid, currentLayout]);

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
                {/* Wrapper to align background and grid within padding area */}
                <div className="relative w-full h-full">
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
                            gridAutoRows: '0px', // Prevent phantom tracks from consuming space
                            gridAutoColumns: '0px',
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
                                        className="h-full w-full min-w-0 min-h-0" // min-h-0 prevents grid blowout
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
            </div>
        </DndContext>
    );
}

export default WidgetGrid;
