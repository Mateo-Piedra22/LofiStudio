/**
 * Layout System Types v2
 * Type definitions for the responsive grid layout system
 */

import type { WidgetInstance, GridPosition, GridDimensions } from './widget.types';

// ============================================
// Breakpoint Definitions
// ============================================

/**
 * Available breakpoint identifiers
 */
export type BreakpointId = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Breakpoint configuration
 */
export interface BreakpointConfig {
    id: BreakpointId;
    minWidth: number;
    maxWidth: number | null;  // null for the largest breakpoint
    gridCols: number;
    gridRows: number;
    gap: number;  // Gap in pixels
    padding: number;  // Container padding in pixels
}

/**
 * Current breakpoint state
 */
export interface BreakpointState {
    current: BreakpointId;
    isDesktop: boolean;
    isMobile: boolean;
    isTablet: boolean;
    isLandscape: boolean;
}

// ============================================
// Grid Layout
// ============================================

/**
 * Layout for a specific breakpoint
 */
export interface BreakpointLayout {
    breakpoint: BreakpointId;
    widgets: WidgetLayoutEntry[];
}

/**
 * Individual widget layout entry
 */
export interface WidgetLayoutEntry {
    widgetId: string;
    position: GridPosition;
    dimensions: GridDimensions;
}

/**
 * Complete layout state (all breakpoints)
 */
export interface LayoutState {
    layouts: Record<BreakpointId, WidgetLayoutEntry[]>;
    activeBreakpoint: BreakpointId;
}

// ============================================
// Grid Operations
// ============================================

/**
 * Result of a grid placement operation
 */
export interface PlacementResult {
    success: boolean;
    position?: GridPosition;
    error?: PlacementError;
}

/**
 * Placement error types
 */
export type PlacementError =
    | 'no_space'
    | 'invalid_dimensions'
    | 'out_of_bounds'
    | 'collision';

/**
 * Grid cell state
 */
export type CellState = 'empty' | 'occupied' | 'reserved';

/**
 * 2D grid representation for collision detection
 */
export type GridMatrix = CellState[][];

// ============================================
// Drag & Drop
// ============================================

/**
 * Drag operation state
 */
export interface DragState {
    isDragging: boolean;
    activeWidgetId: string | null;
    sourcePosition: GridPosition | null;
    currentPosition: GridPosition | null;
    isValidDrop: boolean;
}

/**
 * Drop target information
 */
export interface DropTarget {
    position: GridPosition;
    isValid: boolean;
    wouldSwapWith: string | null;  // Widget ID that would be swapped
}

// ============================================
// Grid Constraints
// ============================================

/**
 * Constraints for widget placement
 */
export interface GridConstraints {
    maxCols: number;
    maxRows: number;
    minWidgetWidth: number;
    minWidgetHeight: number;
    maxWidgetWidth: number;
    maxWidgetHeight: number;
}

/**
 * Validation result for layout changes
 */
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

/**
 * Individual validation error
 */
export interface ValidationError {
    type: 'collision' | 'out_of_bounds' | 'invalid_size' | 'constraint_violation';
    widgetId: string;
    message: string;
}

// ============================================
// Animation
// ============================================

/**
 * Animation configuration for layout transitions
 */
export interface LayoutAnimation {
    duration: number;
    easing: string;
    stagger: number;  // Delay between each widget animation
}

/**
 * Widget animation state
 */
export interface WidgetAnimationState {
    isAnimating: boolean;
    from: GridPosition | null;
    to: GridPosition | null;
}
