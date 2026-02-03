/**
 * Grid Validation Utilities v2
 * Validation and constraint checking for the widget grid system
 */

import type { GridPosition, GridDimensions, WidgetType } from '../types/widget.types';
import type { WidgetLayoutEntry, ValidationResult, ValidationError, BreakpointId, GridConstraints } from '../types/layout.types';
import { getBreakpointConfig, GRID_CONSTRAINTS } from '../constants/breakpoints';
import { getWidgetDefinition, getWidgetDimensions, isValidWidgetSize, WIDGET_DEFINITIONS } from '../constants/widgets';

/**
 * Validate a complete layout for a breakpoint
 */
export function validateLayout(
    layouts: WidgetLayoutEntry[],
    breakpoint: BreakpointId
): ValidationResult {
    const errors: ValidationError[] = [];
    const config = getBreakpointConfig(breakpoint);
    const constraints = GRID_CONSTRAINTS[breakpoint];

    // Check each widget
    for (const layout of layouts) {
        // Check bounds
        if (
            layout.position.col < 0 ||
            layout.position.row < 0 ||
            layout.position.col + layout.dimensions.cols > config.gridCols ||
            layout.position.row + layout.dimensions.rows > config.gridRows
        ) {
            errors.push({
                type: 'out_of_bounds',
                widgetId: layout.widgetId,
                message: `Widget ${layout.widgetId} is out of grid bounds`,
            });
        }

        // Check size constraints
        if (
            layout.dimensions.cols < constraints.minWidgetWidth ||
            layout.dimensions.cols > constraints.maxWidgetWidth ||
            layout.dimensions.rows < constraints.minWidgetHeight ||
            layout.dimensions.rows > constraints.maxWidgetHeight
        ) {
            errors.push({
                type: 'invalid_size',
                widgetId: layout.widgetId,
                message: `Widget ${layout.widgetId} has invalid dimensions for breakpoint ${breakpoint}`,
            });
        }
    }

    // Check for collisions
    for (let i = 0; i < layouts.length; i++) {
        for (let j = i + 1; j < layouts.length; j++) {
            if (checkCollision(layouts[i], layouts[j])) {
                errors.push({
                    type: 'collision',
                    widgetId: layouts[i].widgetId,
                    message: `Widget ${layouts[i].widgetId} collides with widget ${layouts[j].widgetId}`,
                });
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Check if two widget layouts collide
 */
export function checkCollision(
    a: WidgetLayoutEntry,
    b: WidgetLayoutEntry
): boolean {
    const aRight = a.position.col + a.dimensions.cols;
    const aBottom = a.position.row + a.dimensions.rows;
    const bRight = b.position.col + b.dimensions.cols;
    const bBottom = b.position.row + b.dimensions.rows;

    // No collision if one is completely to the left, right, above, or below the other
    return !(
        aRight <= b.position.col ||
        bRight <= a.position.col ||
        aBottom <= b.position.row ||
        bBottom <= a.position.row
    );
}

/**
 * Check if a position is within grid bounds
 */
export function isWithinBounds(
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

/**
 * Check if widget dimensions are valid for a breakpoint
 */
export function areDimensionsValid(
    dimensions: GridDimensions,
    breakpoint: BreakpointId
): boolean {
    const constraints = GRID_CONSTRAINTS[breakpoint];
    return (
        dimensions.cols >= constraints.minWidgetWidth &&
        dimensions.cols <= constraints.maxWidgetWidth &&
        dimensions.rows >= constraints.minWidgetHeight &&
        dimensions.rows <= constraints.maxWidgetHeight
    );
}

/**
 * Adapt dimensions to fit within breakpoint constraints
 */
export function adaptDimensions(
    dimensions: GridDimensions,
    breakpoint: BreakpointId
): GridDimensions {
    const constraints = GRID_CONSTRAINTS[breakpoint];
    return {
        cols: Math.min(
            constraints.maxWidgetWidth,
            Math.max(constraints.minWidgetWidth, dimensions.cols)
        ),
        rows: Math.min(
            constraints.maxWidgetHeight,
            Math.max(constraints.minWidgetHeight, dimensions.rows)
        ),
    };
}

/**
 * Validate widget type exists
 */
export function isValidWidgetType(type: string): type is WidgetType {
    return type in WIDGET_DEFINITIONS;
}

/**
 * Get maximum allowed dimensions for a widget type at a breakpoint
 */
export function getMaxAllowedDimensions(
    type: WidgetType,
    breakpoint: BreakpointId
): GridDimensions {
    const definition = getWidgetDefinition(type);
    const maxSize = getWidgetDimensions(definition.maxSize);
    const constraints = GRID_CONSTRAINTS[breakpoint];

    return {
        cols: Math.min(maxSize.cols, constraints.maxWidgetWidth),
        rows: Math.min(maxSize.rows, constraints.maxWidgetHeight),
    };
}

/**
 * Get minimum allowed dimensions for a widget type at a breakpoint
 */
export function getMinAllowedDimensions(
    type: WidgetType,
    breakpoint: BreakpointId
): GridDimensions {
    const definition = getWidgetDefinition(type);
    const minSize = getWidgetDimensions(definition.minSize);
    const constraints = GRID_CONSTRAINTS[breakpoint];

    return {
        cols: Math.max(minSize.cols, constraints.minWidgetWidth),
        rows: Math.max(minSize.rows, constraints.minWidgetHeight),
    };
}

/**
 * Check if a move operation is valid
 */
export function validateMove(
    layouts: WidgetLayoutEntry[],
    widgetId: string,
    newPosition: GridPosition,
    breakpoint: BreakpointId
): ValidationResult {
    const errors: ValidationError[] = [];
    const movingLayout = layouts.find(l => l.widgetId === widgetId);

    if (!movingLayout) {
        return {
            isValid: false,
            errors: [{
                type: 'constraint_violation',
                widgetId,
                message: `Widget ${widgetId} not found in layouts`,
            }],
        };
    }

    // Check bounds
    if (!isWithinBounds(newPosition, movingLayout.dimensions, breakpoint)) {
        errors.push({
            type: 'out_of_bounds',
            widgetId,
            message: `New position is out of grid bounds`,
        });
    }

    // Check collisions with other widgets
    const updatedLayout = {
        ...movingLayout,
        position: newPosition,
    };

    for (const layout of layouts) {
        if (layout.widgetId !== widgetId) {
            if (checkCollision(updatedLayout, layout)) {
                errors.push({
                    type: 'collision',
                    widgetId,
                    message: `Movement would cause collision with widget ${layout.widgetId}`,
                });
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Check if a resize operation is valid
 */
export function validateResize(
    layouts: WidgetLayoutEntry[],
    widgetId: string,
    widgetType: WidgetType,
    newDimensions: GridDimensions,
    breakpoint: BreakpointId
): ValidationResult {
    const errors: ValidationError[] = [];
    const resizingLayout = layouts.find(l => l.widgetId === widgetId);

    if (!resizingLayout) {
        return {
            isValid: false,
            errors: [{
                type: 'constraint_violation',
                widgetId,
                message: `Widget ${widgetId} not found in layouts`,
            }],
        };
    }

    // Check size constraints
    if (!areDimensionsValid(newDimensions, breakpoint)) {
        errors.push({
            type: 'invalid_size',
            widgetId,
            message: `New dimensions violate breakpoint constraints`,
        });
    }

    // Check widget type constraints
    const minDims = getMinAllowedDimensions(widgetType, breakpoint);
    const maxDims = getMaxAllowedDimensions(widgetType, breakpoint);

    if (
        newDimensions.cols < minDims.cols ||
        newDimensions.cols > maxDims.cols ||
        newDimensions.rows < minDims.rows ||
        newDimensions.rows > maxDims.rows
    ) {
        errors.push({
            type: 'constraint_violation',
            widgetId,
            message: `New dimensions violate widget type constraints`,
        });
    }

    // Check bounds with new dimensions
    if (!isWithinBounds(resizingLayout.position, newDimensions, breakpoint)) {
        errors.push({
            type: 'out_of_bounds',
            widgetId,
            message: `New dimensions would extend beyond grid bounds`,
        });
    }

    // Check collisions
    const updatedLayout = {
        ...resizingLayout,
        dimensions: newDimensions,
    };

    for (const layout of layouts) {
        if (layout.widgetId !== widgetId) {
            if (checkCollision(updatedLayout, layout)) {
                errors.push({
                    type: 'collision',
                    widgetId,
                    message: `Resize would cause collision with widget ${layout.widgetId}`,
                });
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Calculate remaining capacity in the grid
 */
export function getRemainingCapacity(
    layouts: WidgetLayoutEntry[],
    breakpoint: BreakpointId
): number {
    const config = getBreakpointConfig(breakpoint);
    const totalCells = config.gridCols * config.gridRows;

    const usedCells = layouts.reduce(
        (sum, l) => sum + l.dimensions.cols * l.dimensions.rows,
        0
    );

    return totalCells - usedCells;
}

/**
 * Check if a widget of given dimensions can fit anywhere in the grid
 */
export function canFitWidget(
    layouts: WidgetLayoutEntry[],
    dimensions: GridDimensions,
    breakpoint: BreakpointId
): boolean {
    const config = getBreakpointConfig(breakpoint);

    // Quick check: enough total space?
    const requiredCells = dimensions.cols * dimensions.rows;
    if (getRemainingCapacity(layouts, breakpoint) < requiredCells) {
        return false;
    }

    // Check all possible positions
    for (let row = 0; row <= config.gridRows - dimensions.rows; row++) {
        for (let col = 0; col <= config.gridCols - dimensions.cols; col++) {
            const position = { col, row };
            const testLayout: WidgetLayoutEntry = {
                widgetId: '__test__',
                position,
                dimensions,
            };

            let hasCollision = false;
            for (const layout of layouts) {
                if (checkCollision(testLayout, layout)) {
                    hasCollision = true;
                    break;
                }
            }

            if (!hasCollision) {
                return true;
            }
        }
    }

    return false;
}
