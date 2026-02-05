/**
 * useWidgetGrid Hook v2
 * Main hook for interacting with the widget grid system
 */

'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useWidgetGridStore, selectWidgets, selectCurrentBreakpoint, selectCurrentLayout, selectIsEditMode, selectShowHeaders, selectDragState, selectVisibleWidgets } from '../stores/widget-grid.store';
import { getCurrentBreakpoint, getBreakpointConfig, isMobileBreakpoint, isDesktopBreakpoint } from '../constants/breakpoints';
import type { WidgetType, GridPosition, GridDimensions } from '../types/widget.types';
import type { BreakpointState } from '../types/layout.types';
import { useShallow } from 'zustand/react/shallow';

/**
 * Main hook for the widget grid system
 * Provides all necessary state and actions for managing widgets
 */
export function useWidgetGrid() {
    // Select state atomically using useShallow where appropriate to prevent unnecessary re-renders
    const widgets = useWidgetGridStore(selectWidgets);
    const currentBreakpoint = useWidgetGridStore(selectCurrentBreakpoint);
    const currentLayout = useWidgetGridStore(selectCurrentLayout);
    const isEditMode = useWidgetGridStore(selectIsEditMode);
    const showHeaders = useWidgetGridStore(selectShowHeaders);
    const dragState = useWidgetGridStore(selectDragState);
    // selectVisibleWidgets returns a .filter() result (new array), so we MUST use useShallow
    const visibleWidgets = useWidgetGridStore(useShallow(selectVisibleWidgets));
    const isInitialized = useWidgetGridStore(state => state.isInitialized);

    // Get actions (stable references, no need to select)
    const initialize = useWidgetGridStore(state => state.initialize);
    const setBreakpoint = useWidgetGridStore(state => state.setBreakpoint);
    const addWidgetAction = useWidgetGridStore(state => state.addWidget);
    const removeWidgetAction = useWidgetGridStore(state => state.removeWidget);
    const updateWidgetSettingsAction = useWidgetGridStore(state => state.updateWidgetSettings);
    const moveWidgetAction = useWidgetGridStore(state => state.moveWidget);
    const resizeWidgetAction = useWidgetGridStore(state => state.resizeWidget);
    const swapWidgetsAction = useWidgetGridStore(state => state.swapWidgets);
    const toggleEditModeAction = useWidgetGridStore(state => state.toggleEditMode);
    const setEditModeAction = useWidgetGridStore(state => state.setEditMode);
    const toggleShowHeadersAction = useWidgetGridStore(state => state.toggleShowHeaders);
    const applyPresetAction = useWidgetGridStore(state => state.applyPreset);
    const clearAllWidgetsAction = useWidgetGridStore(state => state.clearAllWidgets);

    // Drag actions
    const startDragAction = useWidgetGridStore(state => state.startDrag);
    const updateDragPositionAction = useWidgetGridStore(state => state.updateDragPosition);
    const endDragAction = useWidgetGridStore(state => state.endDrag);
    const cancelDragAction = useWidgetGridStore(state => state.cancelDrag);

    // Helper accessors via getState() to avoid subscription loops for calculated values
    // that don't need to be reactive state in the render cycle themselves unless their dependencies change
    const getWidgetById = useCallback((id: string) => {
        return useWidgetGridStore.getState().getWidgetById(id);
    }, []);

    const getWidgetAtPosition = useCallback((position: GridPosition) => {
        return useWidgetGridStore.getState().getWidgetAtPosition(position);
    }, []);

    const canPlaceWidget = useCallback((dimensions: GridDimensions, position: GridPosition, excludeId?: string) => {
        return useWidgetGridStore.getState().canPlaceWidget(dimensions, position, excludeId);
    }, []);

    const findAvailablePosition = useCallback((dimensions: GridDimensions) => {
        return useWidgetGridStore.getState().findAvailablePosition(dimensions);
    }, []);

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

        // Initialize and rehydrate
        useWidgetGridStore.persist.rehydrate();
        initialize();

        // Handle resize
        const handleResize = () => {
            const newBreakpoint = getCurrentBreakpoint(window.innerWidth);
            // We use getState() here to check current value without dependency
            if (newBreakpoint !== useWidgetGridStore.getState().currentBreakpoint) {
                setBreakpoint(newBreakpoint);
            }
        };

        // Check immediately
        handleResize();

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
    }, [initialize, setBreakpoint]);

    // Derived values calculation using memoization to avoid loop
    const { gridCapacity, usedCapacity, availableCapacity, isAtCapacity } = useMemo(() => {
        // We recalculate these when relevant state changes
        const config = getBreakpointConfig(currentBreakpoint);
        const capacity = config.gridCols * config.gridRows;

        let used = 0;
        // Access layout directly from store state for calculation
        // but we need the specific layout for this breakpoint
        const layoutsInStore = useWidgetGridStore.getState().layouts;
        const layoutForBp = layoutsInStore[currentBreakpoint] || [];

        layoutForBp.forEach(l => {
            used += l.dimensions.cols * l.dimensions.rows;
        });

        return {
            gridCapacity: capacity,
            usedCapacity: used,
            availableCapacity: capacity - used,
            isAtCapacity: capacity - used <= 0
        };
    }, [currentBreakpoint, widgets, currentLayout]); // Recalculate when layout/widgets change

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
        isInitialized,

        // Capacity
        gridCapacity,
        usedCapacity,
        availableCapacity,
        isAtCapacity,

        // Widget actions
        addWidget: addWidgetAction,
        removeWidget: removeWidgetAction,
        updateWidgetSettings: updateWidgetSettingsAction,
        moveWidget: moveWidgetAction,
        resizeWidget: resizeWidgetAction,
        swapWidgets: swapWidgetsAction,

        // Mode actions
        toggleEditMode: toggleEditModeAction,
        setEditMode: setEditModeAction,
        toggleShowHeaders: toggleShowHeadersAction,

        // Preset actions
        applyPreset: applyPresetAction,
        clearAllWidgets: clearAllWidgetsAction,

        // Drag & Drop
        startDrag: startDragAction,
        updateDragPosition: updateDragPositionAction,
        endDrag: endDragAction,
        cancelDrag: cancelDragAction,

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
