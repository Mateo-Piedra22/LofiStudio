/**
 * useWidgetGrid Hook v2
 * Main hook for interacting with the widget grid system
 */

'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useWidgetGridStore, selectWidgets, selectCurrentBreakpoint, selectCurrentLayout, selectIsEditMode, selectShowHeaders, selectDragState, selectVisibleWidgets } from '../stores/widget-grid.store';
import { getCurrentBreakpoint, getBreakpointConfig, isMobileBreakpoint, isDesktopBreakpoint } from '../constants/breakpoints';
import type { WidgetType, GridPosition, GridDimensions } from '../types/widget.types';
import type { BreakpointId, BreakpointState } from '../types/layout.types';

/**
 * Main hook for the widget grid system
 * Provides all necessary state and actions for managing widgets
 */
export function useWidgetGrid() {
    const store = useWidgetGridStore();

    // Selectors for optimized renders
    const widgets = useWidgetGridStore(selectWidgets);
    const currentBreakpoint = useWidgetGridStore(selectCurrentBreakpoint);
    const currentLayout = useWidgetGridStore(selectCurrentLayout);
    const isEditMode = useWidgetGridStore(selectIsEditMode);
    const showHeaders = useWidgetGridStore(selectShowHeaders);
    const dragState = useWidgetGridStore(selectDragState);
    const visibleWidgets = useWidgetGridStore(selectVisibleWidgets);

    // Get breakpoint config
    const breakpointConfig = useMemo(() =>
        getBreakpointConfig(currentBreakpoint),
        [currentBreakpoint]
    );

    // Breakpoint state computed
    const breakpointState: BreakpointState = useMemo(() => ({
        current: currentBreakpoint,
        isDesktop: isDesktopBreakpoint(currentBreakpoint),
        isMobile: isMobileBreakpoint(currentBreakpoint),
        isTablet: currentBreakpoint === 'md',
        isLandscape: typeof window !== 'undefined'
            ? window.innerWidth > window.innerHeight
            : true,
    }), [currentBreakpoint]);

    // Initialize on mount and handle resize
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Initialize
        store.initialize();

        // Handle resize
        const handleResize = () => {
            const newBreakpoint = getCurrentBreakpoint(window.innerWidth);
            if (newBreakpoint !== store.currentBreakpoint) {
                store.setBreakpoint(newBreakpoint);
            }
        };

        // Debounced resize handler
        let timeoutId: NodeJS.Timeout;
        const debouncedResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleResize, 100);
        };

        window.addEventListener('resize', debouncedResize);

        return () => {
            window.removeEventListener('resize', debouncedResize);
            clearTimeout(timeoutId);
        };
    }, []);

    // ============================================
    // Actions with callbacks for stability
    // ============================================

    const addWidget = useCallback((type: WidgetType, position?: GridPosition) => {
        return store.addWidget(type, position);
    }, [store]);

    const removeWidget = useCallback((id: string) => {
        store.removeWidget(id);
    }, [store]);

    const updateWidgetSettings = useCallback((id: string, settings: Record<string, unknown>) => {
        store.updateWidgetSettings(id, settings);
    }, [store]);

    const moveWidget = useCallback((id: string, position: GridPosition) => {
        return store.moveWidget(id, position);
    }, [store]);

    const resizeWidget = useCallback((id: string, dimensions: GridDimensions) => {
        return store.resizeWidget(id, dimensions);
    }, [store]);

    const swapWidgets = useCallback((id1: string, id2: string) => {
        store.swapWidgets(id1, id2);
    }, [store]);

    const toggleEditMode = useCallback(() => {
        store.toggleEditMode();
    }, [store]);

    const setEditMode = useCallback((enabled: boolean) => {
        store.setEditMode(enabled);
    }, [store]);

    const toggleShowHeaders = useCallback(() => {
        store.toggleShowHeaders();
    }, [store]);

    const applyPreset = useCallback((widgets: Parameters<typeof store.applyPreset>[0]) => {
        store.applyPreset(widgets);
    }, [store]);

    const clearAllWidgets = useCallback(() => {
        store.clearAllWidgets();
    }, [store]);

    // ============================================
    // Drag & Drop
    // ============================================

    const startDrag = useCallback((widgetId: string) => {
        store.startDrag(widgetId);
    }, [store]);

    const updateDragPosition = useCallback((position: GridPosition) => {
        store.updateDragPosition(position);
    }, [store]);

    const endDrag = useCallback((targetPosition: GridPosition | null) => {
        store.endDrag(targetPosition);
    }, [store]);

    const cancelDrag = useCallback(() => {
        store.cancelDrag();
    }, [store]);

    // ============================================
    // Helpers
    // ============================================

    const getWidgetById = useCallback((id: string) => {
        return store.getWidgetById(id);
    }, [store]);

    const getWidgetAtPosition = useCallback((position: GridPosition) => {
        return store.getWidgetAtPosition(position);
    }, [store]);

    const canPlaceWidget = useCallback((dimensions: GridDimensions, position: GridPosition, excludeId?: string) => {
        return store.canPlaceWidget(dimensions, position, excludeId);
    }, [store]);

    const findAvailablePosition = useCallback((dimensions: GridDimensions) => {
        return store.findAvailablePosition(dimensions);
    }, [store]);

    // Capacity info
    const gridCapacity = store.getGridCapacity();
    const usedCapacity = store.getUsedCapacity();
    const availableCapacity = gridCapacity - usedCapacity;
    const isAtCapacity = availableCapacity <= 0;

    return {
        // State
        widgets,
        visibleWidgets,
        currentLayout,
        breakpoint: breakpointState,
        breakpointConfig,
        isEditMode,
        showHeaders,
        dragState,
        isInitialized: store.isInitialized,

        // Capacity
        gridCapacity,
        usedCapacity,
        availableCapacity,
        isAtCapacity,

        // Widget actions
        addWidget,
        removeWidget,
        updateWidgetSettings,
        moveWidget,
        resizeWidget,
        swapWidgets,

        // Mode actions
        toggleEditMode,
        setEditMode,
        toggleShowHeaders,

        // Preset actions
        applyPreset,
        clearAllWidgets,

        // Drag & Drop
        startDrag,
        updateDragPosition,
        endDrag,
        cancelDrag,

        // Helpers
        getWidgetById,
        getWidgetAtPosition,
        canPlaceWidget,
        findAvailablePosition,
    };
}

/**
 * Hook for breakpoint-only state (lightweight)
 */
export function useBreakpoint(): BreakpointState {
    const currentBreakpoint = useWidgetGridStore(selectCurrentBreakpoint);

    return useMemo(() => ({
        current: currentBreakpoint,
        isDesktop: isDesktopBreakpoint(currentBreakpoint),
        isMobile: isMobileBreakpoint(currentBreakpoint),
        isTablet: currentBreakpoint === 'md',
        isLandscape: typeof window !== 'undefined'
            ? window.innerWidth > window.innerHeight
            : true,
    }), [currentBreakpoint]);
}

/**
 * Hook for edit mode state only
 */
export function useEditMode() {
    const isEditMode = useWidgetGridStore(selectIsEditMode);
    const toggleEditMode = useWidgetGridStore(state => state.toggleEditMode);
    const setEditMode = useWidgetGridStore(state => state.setEditMode);

    return { isEditMode, toggleEditMode, setEditMode };
}

/**
 * Hook for drag state only
 */
export function useDragState() {
    const dragState = useWidgetGridStore(selectDragState);
    const startDrag = useWidgetGridStore(state => state.startDrag);
    const updateDragPosition = useWidgetGridStore(state => state.updateDragPosition);
    const endDrag = useWidgetGridStore(state => state.endDrag);
    const cancelDrag = useWidgetGridStore(state => state.cancelDrag);

    return {
        ...dragState,
        startDrag,
        updateDragPosition,
        endDrag,
        cancelDrag,
    };
}
