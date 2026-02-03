/**
 * Grid Packing Utilities v2
 * Algorithms for automatic widget placement and grid optimization
 */

import type { GridPosition, GridDimensions } from '../types/widget.types';
import type { WidgetLayoutEntry, GridMatrix, CellState, BreakpointId } from '../types/layout.types';
import { getBreakpointConfig } from '../constants/breakpoints';

/**
 * Create an empty grid matrix
 */
export function createEmptyGrid(cols: number, rows: number): GridMatrix {
    return Array(rows).fill(null).map(() =>
        Array(cols).fill('empty') as CellState[]
    );
}

/**
 * Create a grid matrix from existing layouts
 */
export function createGridFromLayouts(
    layouts: WidgetLayoutEntry[],
    breakpoint: BreakpointId
): GridMatrix {
    const config = getBreakpointConfig(breakpoint);
    const grid = createEmptyGrid(config.gridCols, config.gridRows);

    for (const layout of layouts) {
        markOccupied(grid, layout.position, layout.dimensions);
    }

    return grid;
}

/**
 * Mark cells as occupied
 */
export function markOccupied(
    grid: GridMatrix,
    position: GridPosition,
    dimensions: GridDimensions
): void {
    for (let row = position.row; row < position.row + dimensions.rows; row++) {
        for (let col = position.col; col < position.col + dimensions.cols; col++) {
            if (grid[row] && grid[row][col] !== undefined) {
                grid[row][col] = 'occupied';
            }
        }
    }
}

/**
 * Check if a position is available for a widget of given dimensions
 */
export function canPlace(
    grid: GridMatrix,
    position: GridPosition,
    dimensions: GridDimensions
): boolean {
    const rows = grid.length;
    const cols = grid[0]?.length ?? 0;

    // Check bounds
    if (
        position.col < 0 ||
        position.row < 0 ||
        position.col + dimensions.cols > cols ||
        position.row + dimensions.rows > rows
    ) {
        return false;
    }

    // Check all cells are empty
    for (let row = position.row; row < position.row + dimensions.rows; row++) {
        for (let col = position.col; col < position.col + dimensions.cols; col++) {
            if (grid[row][col] !== 'empty') {
                return false;
            }
        }
    }

    return true;
}

/**
 * Find the first available position for a widget (first-fit algorithm)
 */
export function findFirstFit(
    grid: GridMatrix,
    dimensions: GridDimensions
): GridPosition | null {
    const rows = grid.length;
    const cols = grid[0]?.length ?? 0;

    for (let row = 0; row <= rows - dimensions.rows; row++) {
        for (let col = 0; col <= cols - dimensions.cols; col++) {
            const position = { col, row };
            if (canPlace(grid, position, dimensions)) {
                return position;
            }
        }
    }

    return null;
}

/**
 * Find the best position using best-fit algorithm
 * Tries to minimize fragmentation by placing widgets in positions
 * that leave the most usable space
 */
export function findBestFit(
    grid: GridMatrix,
    dimensions: GridDimensions
): GridPosition | null {
    const rows = grid.length;
    const cols = grid[0]?.length ?? 0;

    let bestPosition: GridPosition | null = null;
    let bestScore = -1;

    for (let row = 0; row <= rows - dimensions.rows; row++) {
        for (let col = 0; col <= cols - dimensions.cols; col++) {
            const position = { col, row };
            if (canPlace(grid, position, dimensions)) {
                // Score based on adjacency to existing widgets (prefer packed layouts)
                const score = calculateAdjacencyScore(grid, position, dimensions);
                if (score > bestScore) {
                    bestScore = score;
                    bestPosition = position;
                }
            }
        }
    }

    return bestPosition;
}

/**
 * Calculate adjacency score (higher = more adjacent to existing widgets)
 */
function calculateAdjacencyScore(
    grid: GridMatrix,
    position: GridPosition,
    dimensions: GridDimensions
): number {
    const rows = grid.length;
    const cols = grid[0]?.length ?? 0;
    let score = 0;

    // Check all border cells
    for (let row = position.row; row < position.row + dimensions.rows; row++) {
        // Left neighbor
        if (position.col > 0 && grid[row][position.col - 1] === 'occupied') {
            score++;
        }
        // Right neighbor
        const rightCol = position.col + dimensions.cols;
        if (rightCol < cols && grid[row][rightCol] === 'occupied') {
            score++;
        }
    }

    for (let col = position.col; col < position.col + dimensions.cols; col++) {
        // Top neighbor
        if (position.row > 0 && grid[position.row - 1][col] === 'occupied') {
            score++;
        }
        // Bottom neighbor
        const bottomRow = position.row + dimensions.rows;
        if (bottomRow < rows && grid[bottomRow][col] === 'occupied') {
            score++;
        }
    }

    // Bonus for corner positions (more stable layouts)
    if (position.col === 0 || position.col + dimensions.cols === cols) {
        score += 2;
    }
    if (position.row === 0 || position.row + dimensions.rows === rows) {
        score += 2;
    }

    return score;
}

/**
 * Pack widgets to remove gaps (gravity towards top-left)
 */
export function packWidgets(
    layouts: WidgetLayoutEntry[],
    breakpoint: BreakpointId
): WidgetLayoutEntry[] {
    const config = getBreakpointConfig(breakpoint);
    const grid = createEmptyGrid(config.gridCols, config.gridRows);
    const packed: WidgetLayoutEntry[] = [];

    // Sort by original position (top to bottom, left to right)
    const sorted = [...layouts].sort((a, b) => {
        if (a.position.row !== b.position.row) {
            return a.position.row - b.position.row;
        }
        return a.position.col - b.position.col;
    });

    for (const layout of sorted) {
        const newPosition = findFirstFit(grid, layout.dimensions);
        if (newPosition) {
            packed.push({
                ...layout,
                position: newPosition,
            });
            markOccupied(grid, newPosition, layout.dimensions);
        } else {
            // If can't fit, keep original position (shouldn't happen in valid state)
            packed.push(layout);
        }
    }

    return packed;
}

/**
 * Calculate grid utilization percentage
 */
export function calculateUtilization(
    layouts: WidgetLayoutEntry[],
    breakpoint: BreakpointId
): number {
    const config = getBreakpointConfig(breakpoint);
    const totalCells = config.gridCols * config.gridRows;

    const usedCells = layouts.reduce(
        (sum, l) => sum + l.dimensions.cols * l.dimensions.rows,
        0
    );

    return (usedCells / totalCells) * 100;
}

/**
 * Get all empty cells in the grid
 */
export function getEmptyCells(grid: GridMatrix): GridPosition[] {
    const empty: GridPosition[] = [];

    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            if (grid[row][col] === 'empty') {
                empty.push({ col, row });
            }
        }
    }

    return empty;
}

/**
 * Find the largest contiguous empty area
 */
export function findLargestEmptyArea(grid: GridMatrix): {
    position: GridPosition;
    dimensions: GridDimensions;
} | null {
    const rows = grid.length;
    const cols = grid[0]?.length ?? 0;

    let best: { position: GridPosition; dimensions: GridDimensions } | null = null;
    let bestArea = 0;

    for (let startRow = 0; startRow < rows; startRow++) {
        for (let startCol = 0; startCol < cols; startCol++) {
            if (grid[startRow][startCol] !== 'empty') continue;

            // Find maximum rectangle starting from this cell
            for (let h = 1; h <= rows - startRow; h++) {
                for (let w = 1; w <= cols - startCol; w++) {
                    const dims = { cols: w, rows: h };
                    const pos = { col: startCol, row: startRow };

                    if (canPlace(grid, pos, dims)) {
                        const area = w * h;
                        if (area > bestArea) {
                            bestArea = area;
                            best = { position: pos, dimensions: dims };
                        }
                    }
                }
            }
        }
    }

    return best;
}
