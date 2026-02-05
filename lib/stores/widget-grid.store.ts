/**
 * Widget Grid Store v2
 * Zustand store for widget grid state management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
    WidgetInstance,
    WidgetType,
    WidgetLayout,
    GridPosition,
    GridDimensions,
    WidgetStyle
} from '../types/widget.types';
import type {
    BreakpointId,
    WidgetLayoutEntry,
    DragState
} from '../types/layout.types';
import {
    getCurrentBreakpoint,
    getBreakpointConfig,
    BREAKPOINTS
} from '../constants/breakpoints';
import {
    getWidgetDefinition,
    getWidgetDimensions
} from '../constants/widgets';

// ============================================
// Store Types
// ============================================

interface WidgetGridState {
    // Widget instances
    widgets: WidgetInstance[];

    // Layouts per breakpoint
    layouts: Record<BreakpointId, WidgetLayoutEntry[]>;

    // Current breakpoint
    currentBreakpoint: BreakpointId;

    // Drag state
    drag: DragState;

    // UI state
    isEditMode: boolean;
    showHeaders: boolean;

    // Initialization flag
    isInitialized: boolean;
}

interface WidgetGridActions {
    // Initialization
    initialize: () => void;
    validateLayouts: () => void;

    // Widget CRUD
    addWidget: (type: WidgetType, position?: GridPosition) => string | null;
    removeWidget: (id: string) => void;
    updateWidgetSettings: (id: string, settings: Record<string, unknown>) => void;
    updateWidgetStyle: (id: string, style: WidgetStyle) => void;
    toggleWidgetVisibility: (id: string) => void;

    // Layout operations
    moveWidget: (id: string, position: GridPosition) => boolean;
    resizeWidget: (id: string, dimensions: GridDimensions) => boolean;
    swapWidgets: (id1: string, id2: string) => void;

    // Breakpoint handling
    setBreakpoint: (breakpoint: BreakpointId) => void;
    syncLayoutToBreakpoint: (fromBreakpoint: BreakpointId, toBreakpoint: BreakpointId) => void;

    // Drag & Drop
    startDrag: (widgetId: string) => void;
    updateDragPosition: (position: GridPosition) => void;
    endDrag: (targetPosition: GridPosition | null) => void;
    cancelDrag: () => void;

    // Edit mode
    setEditMode: (enabled: boolean) => void;
    toggleEditMode: () => void;

    // Headers
    setShowHeaders: (show: boolean) => void;
    toggleShowHeaders: () => void;

    // Presets
    applyPreset: (widgets: Array<{ type: WidgetType; layout: WidgetLayout; settings?: Record<string, unknown> }>) => void;
    clearAllWidgets: () => void;

    // Helpers
    getWidgetById: (id: string) => WidgetInstance | undefined;
    getWidgetAtPosition: (position: GridPosition, breakpoint?: BreakpointId) => string | null;
    canPlaceWidget: (dimensions: GridDimensions, position: GridPosition, excludeId?: string) => boolean;
    findAvailablePosition: (dimensions: GridDimensions) => GridPosition | null;
    getGridCapacity: () => number;
    getUsedCapacity: () => number;
}

type WidgetGridStore = WidgetGridState & WidgetGridActions;

// ============================================
// Helper Functions
// ============================================

function generateId(): string {
    return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createGridMatrix(breakpoint: BreakpointId): boolean[][] {
    const config = getBreakpointConfig(breakpoint);
    return Array(config.gridRows).fill(null).map(() =>
        Array(config.gridCols).fill(false)
    );
}

function isPositionValid(
    position: GridPosition,
    dimensions: GridDimensions,
    breakpoint: BreakpointId
): boolean {
    const config = getBreakpointConfig(breakpoint);
    return (
        position.col >= 0 &&
        position.row >= 0 &&
        position.col + dimensions.cols <= config.gridCols &&
        position.row + dimensions.rows <= config.gridRows
    );
}

function adaptDimensionsToBreakpoint(
    dimensions: GridDimensions,
    breakpoint: BreakpointId
): GridDimensions {
    const config = getBreakpointConfig(breakpoint);
    return {
        cols: Math.min(dimensions.cols, config.gridCols),
        rows: Math.min(dimensions.rows, config.gridRows),
    };
}

// ============================================
// Store Creation
// ============================================

export const useWidgetGridStore = create<WidgetGridStore>()(
    persist(
        immer((set, get) => ({
            // Initial state
            widgets: [],
            layouts: {
                xs: [],
                sm: [],
                md: [],
                lg: [],
                xl: [],
            },
            currentBreakpoint: 'lg',
            drag: {
                isDragging: false,
                activeWidgetId: null,
                sourcePosition: null,
                currentPosition: null,
                isValidDrop: false,
            },
            isEditMode: false,
            showHeaders: true,
            isInitialized: false,

            // ============================================
            // Initialization
            // ============================================

            validateLayouts: () => {
                set((state) => {
                    for (const bp of Object.keys(state.layouts) as BreakpointId[]) {
                        const originalLayouts = state.layouts[bp];
                        const validLayouts: WidgetLayoutEntry[] = [];
                        const config = getBreakpointConfig(bp);

                        for (const layout of originalLayouts) {
                            // 1. Clamp dimensions to grid size (sanity check)
                            const safeRows = Math.min(layout.dimensions.rows, config.gridRows);
                            const safeCols = Math.min(layout.dimensions.cols, config.gridCols);
                            const safeDimensions = { rows: safeRows, cols: safeCols };

                            // 2. Clamp position to bounds
                            const clampedRow = Math.max(0, Math.min(layout.position.row, config.gridRows - safeRows));
                            const clampedCol = Math.max(0, Math.min(layout.position.col, config.gridCols - safeCols));
                            let proposedPos = { col: clampedCol, row: clampedRow };

                            // 3. Check for collisions with already validated widgets
                            let hasCollision = false;
                            for (const valid of validLayouts) {
                                const overlap = !(
                                    proposedPos.col + safeDimensions.cols <= valid.position.col ||
                                    valid.position.col + valid.dimensions.cols <= proposedPos.col ||
                                    proposedPos.row + safeDimensions.rows <= valid.position.row ||
                                    valid.position.row + valid.dimensions.rows <= proposedPos.row
                                );
                                if (overlap) {
                                    hasCollision = true;
                                    break;
                                }
                            }

                            // 4. If collision or invalid, find new spot
                            if (hasCollision) {
                                const newPos = findAvailablePositionInLayout(
                                    validLayouts,
                                    safeDimensions,
                                    bp
                                );
                                if (newPos) {
                                    proposedPos = newPos;
                                    hasCollision = false;
                                }
                            }

                            // 5. If valid and safe, add to list
                            if (!hasCollision) {
                                validLayouts.push({
                                    ...layout,
                                    position: proposedPos,
                                    dimensions: safeDimensions
                                });
                            } else {
                                console.warn(`Widget ${layout.widgetId} removed during validation (no space/collision).`);
                            }
                        }

                        state.layouts[bp] = validLayouts;
                    }
                });
            },

            // ============================================
            // Initialization
            // ============================================

            initialize: () => {
                if (typeof window === 'undefined') return;

                const width = window.innerWidth;
                const breakpoint = getCurrentBreakpoint(width);

                // Run validation first to clean up any bad persisted state
                get().validateLayouts();

                set((state) => {
                    state.currentBreakpoint = breakpoint;
                    state.isInitialized = true;
                });
            },

            // ============================================
            // Widget CRUD
            // ============================================

            addWidget: (type, position) => {
                const state = get();
                const definition = getWidgetDefinition(type);
                const breakpoint = state.currentBreakpoint;
                const config = getBreakpointConfig(breakpoint);

                // Get dimensions adapted to current breakpoint
                const dimensions = adaptDimensionsToBreakpoint(
                    getWidgetDimensions(definition.defaultSize),
                    breakpoint
                );

                // Find position if not provided
                let targetPosition = position;
                if (!targetPosition) {
                    targetPosition = get().findAvailablePosition(dimensions) ?? undefined;
                    if (!targetPosition) {
                        console.warn('No available position for widget');
                        return null;
                    }
                }

                // Validate position
                if (!get().canPlaceWidget(dimensions, targetPosition)) {
                    console.warn('Invalid position for widget');
                    return null;
                }

                const id = generateId();

                const newWidget: WidgetInstance = {
                    id,
                    type,
                    layout: {
                        position: targetPosition,
                        dimensions,
                    },
                    settings: { ...definition.defaultSettings },
                    isVisible: true,
                };

                const layoutEntry: WidgetLayoutEntry = {
                    widgetId: id,
                    position: targetPosition,
                    dimensions,
                };

                set((state) => {
                    state.widgets.push(newWidget);
                    state.layouts[breakpoint].push(layoutEntry);

                    // Also add to other breakpoints with adapted dimensions
                    for (const bp of Object.keys(state.layouts) as BreakpointId[]) {
                        if (bp !== breakpoint) {
                            const adaptedDims = adaptDimensionsToBreakpoint(dimensions, bp);
                            const availablePos = findAvailablePositionInLayout(
                                state.layouts[bp],
                                adaptedDims,
                                bp
                            );
                            if (availablePos) {
                                state.layouts[bp].push({
                                    widgetId: id,
                                    position: availablePos,
                                    dimensions: adaptedDims,
                                });
                            }
                        }
                    }
                });

                return id;
            },

            removeWidget: (id) => {
                set((state) => {
                    state.widgets = state.widgets.filter(w => w.id !== id);
                    for (const bp of Object.keys(state.layouts) as BreakpointId[]) {
                        state.layouts[bp] = state.layouts[bp].filter(l => l.widgetId !== id);
                    }
                });
            },

            updateWidgetSettings: (id, settings) => {
                set((state) => {
                    const widget = state.widgets.find(w => w.id === id);
                    if (widget) {
                        widget.settings = { ...widget.settings, ...settings };
                    }
                });
            },

            updateWidgetStyle: (id, style) => {
                set((state) => {
                    const widget = state.widgets.find(w => w.id === id);
                    if (widget) {
                        widget.style = { ...widget.style, ...style };
                    }
                });
            },

            toggleWidgetVisibility: (id) => {
                set((state) => {
                    const widget = state.widgets.find(w => w.id === id);
                    if (widget) {
                        widget.isVisible = !widget.isVisible;
                    }
                });
            },

            // ============================================
            // Layout Operations
            // ============================================

            moveWidget: (id, position) => {
                const state = get();
                const breakpoint = state.currentBreakpoint;
                const layout = state.layouts[breakpoint].find(l => l.widgetId === id);

                if (!layout) return false;
                if (!state.canPlaceWidget(layout.dimensions, position, id)) return false;

                set((draft) => {
                    const layoutEntry = draft.layouts[breakpoint].find(l => l.widgetId === id);
                    if (layoutEntry) {
                        layoutEntry.position = position;
                    }
                });

                return true;
            },

            resizeWidget: (id, dimensions) => {
                const state = get();
                const breakpoint = state.currentBreakpoint;
                const layout = state.layouts[breakpoint].find(l => l.widgetId === id);

                if (!layout) return false;
                if (!state.canPlaceWidget(dimensions, layout.position, id)) return false;

                set((draft) => {
                    const layoutEntry = draft.layouts[breakpoint].find(l => l.widgetId === id);
                    if (layoutEntry) {
                        layoutEntry.dimensions = dimensions;
                    }
                });

                return true;
            },

            swapWidgets: (id1, id2) => {
                const state = get();
                const breakpoint = state.currentBreakpoint;

                set((draft) => {
                    const layout1 = draft.layouts[breakpoint].find(l => l.widgetId === id1);
                    const layout2 = draft.layouts[breakpoint].find(l => l.widgetId === id2);

                    if (layout1 && layout2) {
                        const tempPos = { ...layout1.position };
                        layout1.position = { ...layout2.position };
                        layout2.position = tempPos;
                    }
                });
            },

            // ============================================
            // Breakpoint Handling
            // ============================================

            setBreakpoint: (breakpoint) => {
                set((state) => {
                    state.currentBreakpoint = breakpoint;
                });
            },

            syncLayoutToBreakpoint: (fromBreakpoint, toBreakpoint) => {
                set((state) => {
                    const sourceLayout = state.layouts[fromBreakpoint];
                    state.layouts[toBreakpoint] = sourceLayout.map(entry => ({
                        ...entry,
                        dimensions: adaptDimensionsToBreakpoint(entry.dimensions, toBreakpoint),
                    }));
                });
            },

            // ============================================
            // Drag & Drop
            // ============================================

            startDrag: (widgetId) => {
                const state = get();
                const layout = state.layouts[state.currentBreakpoint].find(
                    l => l.widgetId === widgetId
                );

                set((draft) => {
                    draft.drag = {
                        isDragging: true,
                        activeWidgetId: widgetId,
                        sourcePosition: layout?.position ?? null,
                        currentPosition: layout?.position ?? null,
                        isValidDrop: true,
                    };
                });
            },

            updateDragPosition: (position) => {
                const state = get();
                const layout = state.layouts[state.currentBreakpoint].find(
                    l => l.widgetId === state.drag.activeWidgetId
                );

                const isValid = layout
                    ? state.canPlaceWidget(layout.dimensions, position, state.drag.activeWidgetId!)
                    : false;

                set((draft) => {
                    draft.drag.currentPosition = position;
                    draft.drag.isValidDrop = isValid;
                });
            },

            endDrag: (targetPosition) => {
                const state = get();
                const { activeWidgetId, sourcePosition } = state.drag;

                if (activeWidgetId && targetPosition && state.drag.isValidDrop) {
                    // Check if there's a widget at target position to swap with
                    const targetWidgetId = state.getWidgetAtPosition(targetPosition);

                    if (targetWidgetId && targetWidgetId !== activeWidgetId) {
                        state.swapWidgets(activeWidgetId, targetWidgetId);
                    } else {
                        state.moveWidget(activeWidgetId, targetPosition);
                    }
                }

                set((draft) => {
                    draft.drag = {
                        isDragging: false,
                        activeWidgetId: null,
                        sourcePosition: null,
                        currentPosition: null,
                        isValidDrop: false,
                    };
                });
            },

            cancelDrag: () => {
                set((draft) => {
                    draft.drag = {
                        isDragging: false,
                        activeWidgetId: null,
                        sourcePosition: null,
                        currentPosition: null,
                        isValidDrop: false,
                    };
                });
            },

            // ============================================
            // Edit Mode
            // ============================================

            setEditMode: (enabled) => {
                set((state) => {
                    state.isEditMode = enabled;
                });
            },

            toggleEditMode: () => {
                set((state) => {
                    state.isEditMode = !state.isEditMode;
                });
            },

            // ============================================
            // Headers
            // ============================================

            setShowHeaders: (show) => {
                set((state) => {
                    state.showHeaders = show;
                });
            },

            toggleShowHeaders: () => {
                set((state) => {
                    state.showHeaders = !state.showHeaders;
                });
            },

            // ============================================
            // Presets
            // ============================================

            applyPreset: (presetWidgets) => {
                set((state) => {
                    // Clear existing widgets
                    state.widgets = [];
                    for (const bp of Object.keys(state.layouts) as BreakpointId[]) {
                        state.layouts[bp] = [];
                    }

                    // Add preset widgets
                    for (const pw of presetWidgets) {
                        const id = generateId();
                        const definition = getWidgetDefinition(pw.type);

                        state.widgets.push({
                            id,
                            type: pw.type,
                            layout: pw.layout,
                            settings: pw.settings ?? { ...definition.defaultSettings },
                            isVisible: true,
                        });

                        // Add to all breakpoints with adaptation
                        for (const bp of Object.keys(state.layouts) as BreakpointId[]) {
                            const adaptedDims = adaptDimensionsToBreakpoint(pw.layout.dimensions, bp);
                            state.layouts[bp].push({
                                widgetId: id,
                                position: pw.layout.position,
                                dimensions: adaptedDims,
                            });
                        }
                    }
                });
            },

            clearAllWidgets: () => {
                set((state) => {
                    state.widgets = [];
                    for (const bp of Object.keys(state.layouts) as BreakpointId[]) {
                        state.layouts[bp] = [];
                    }
                });
            },

            // ============================================
            // Helpers
            // ============================================

            getWidgetById: (id) => {
                return get().widgets.find(w => w.id === id);
            },

            getWidgetAtPosition: (position, breakpoint) => {
                const bp = breakpoint ?? get().currentBreakpoint;
                const layouts = get().layouts[bp];

                for (const layout of layouts) {
                    if (
                        position.col >= layout.position.col &&
                        position.col < layout.position.col + layout.dimensions.cols &&
                        position.row >= layout.position.row &&
                        position.row < layout.position.row + layout.dimensions.rows
                    ) {
                        return layout.widgetId;
                    }
                }
                return null;
            },

            canPlaceWidget: (dimensions, position, excludeId) => {
                const state = get();
                const breakpoint = state.currentBreakpoint;
                const config = getBreakpointConfig(breakpoint);

                // Check bounds
                if (!isPositionValid(position, dimensions, breakpoint)) {
                    return false;
                }

                // Check collisions
                const layouts = state.layouts[breakpoint].filter(
                    l => l.widgetId !== excludeId
                );

                for (const layout of layouts) {
                    // Check if rectangles overlap
                    const noOverlap =
                        position.col + dimensions.cols <= layout.position.col ||
                        layout.position.col + layout.dimensions.cols <= position.col ||
                        position.row + dimensions.rows <= layout.position.row ||
                        layout.position.row + layout.dimensions.rows <= position.row;

                    if (!noOverlap) {
                        return false;
                    }
                }

                return true;
            },

            findAvailablePosition: (dimensions) => {
                const state = get();
                const breakpoint = state.currentBreakpoint;
                const config = getBreakpointConfig(breakpoint);

                // Scan row by row, column by column
                for (let row = 0; row <= config.gridRows - dimensions.rows; row++) {
                    for (let col = 0; col <= config.gridCols - dimensions.cols; col++) {
                        const position = { col, row };
                        if (state.canPlaceWidget(dimensions, position)) {
                            return position;
                        }
                    }
                }

                return null;
            },

            getGridCapacity: () => {
                const config = getBreakpointConfig(get().currentBreakpoint);
                return config.gridCols * config.gridRows;
            },

            getUsedCapacity: () => {
                const state = get();
                const layouts = state.layouts[state.currentBreakpoint];
                return layouts.reduce((sum, l) => sum + l.dimensions.cols * l.dimensions.rows, 0);
            },
        })),
        {
            name: 'lofi-widget-grid-v2',
            storage: createJSONStorage(() => localStorage),
            skipHydration: true,
            partialize: (state) => ({
                widgets: state.widgets,
                layouts: state.layouts,
                showHeaders: state.showHeaders,
            }),
        }
    )
);

// ============================================
// Helper for finding position in layout array
// ============================================

function findAvailablePositionInLayout(
    layouts: WidgetLayoutEntry[],
    dimensions: GridDimensions,
    breakpoint: BreakpointId
): GridPosition | null {
    const config = getBreakpointConfig(breakpoint);

    for (let row = 0; row <= config.gridRows - dimensions.rows; row++) {
        for (let col = 0; col <= config.gridCols - dimensions.cols; col++) {
            const position = { col, row };
            let canPlace = true;

            for (const layout of layouts) {
                const noOverlap =
                    position.col + dimensions.cols <= layout.position.col ||
                    layout.position.col + layout.dimensions.cols <= position.col ||
                    position.row + dimensions.rows <= layout.position.row ||
                    layout.position.row + layout.dimensions.rows <= position.row;

                if (!noOverlap) {
                    canPlace = false;
                    break;
                }
            }

            if (canPlace) {
                return position;
            }
        }
    }

    return null;
}

// ============================================
// Selectors (for performance)
// ============================================

export const selectWidgets = (state: WidgetGridState) => state.widgets;
export const selectCurrentBreakpoint = (state: WidgetGridState) => state.currentBreakpoint;
export const selectIsEditMode = (state: WidgetGridState) => state.isEditMode;
export const selectShowHeaders = (state: WidgetGridState) => state.showHeaders;
export const selectDragState = (state: WidgetGridState) => state.drag;

export const selectCurrentLayout = (state: WidgetGridState) =>
    state.layouts[state.currentBreakpoint];

export const selectVisibleWidgets = (state: WidgetGridState) =>
    state.widgets.filter(w => w.isVisible);

export const selectWidgetLayout = (widgetId: string) => (state: WidgetGridState) =>
    state.layouts[state.currentBreakpoint].find(l => l.widgetId === widgetId);
