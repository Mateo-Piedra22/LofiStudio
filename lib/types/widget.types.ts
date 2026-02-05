/**
 * Widget System Types v2
 * Core type definitions for the LofiStudio widget system
 */

// ============================================
// Widget Type Definitions
// ============================================

/**
 * All available widget types in the system
 */
export type WidgetType =
  | 'clock'
  | 'worldtime'
  | 'weather'
  | 'gif'
  | 'tasks'
  | 'timer'
  | 'notes'
  | 'quote'
  | 'calendar'
  | 'breathing'
  | 'dictionary'
  | 'habit'
  | 'focus'
  | 'calculator'
  | 'quicklinks'
  | 'flashcard'
  | 'embed';

/**
 * Widget size in grid units (columns x rows)
 * Format: `${cols}x${rows}`
 */
export type WidgetSize = '1x1' | '1x2' | '1x3' | '2x1' | '2x2' | '2x3' | '3x1' | '3x2' | '3x3';

/**
 * Position in the grid (0-indexed)
 */
export interface GridPosition {
  col: number;  // Column index (0-based)
  row: number;  // Row index (0-based)
}

/**
 * Dimensions in grid units
 */
export interface GridDimensions {
  cols: number;  // Width in columns
  rows: number;  // Height in rows
}

/**
 * Complete layout information for a widget
 */
export interface WidgetLayout {
  position: GridPosition;
  dimensions: GridDimensions;
}

/**
 * Widget instance with all its data
 */
export interface WidgetInstance {
  id: string;
  type: WidgetType;
  layout: WidgetLayout;
  settings: Record<string, unknown>;
  style?: WidgetStyle;
  isVisible: boolean;
}

/**
 * Widget definition (static metadata)
 */
export interface WidgetDefinition {
  type: WidgetType;
  label: string;
  description: string;
  icon: string;  // Lucide icon name
  defaultSize: WidgetSize;
  minSize: WidgetSize;
  maxSize: WidgetSize;
  category: WidgetCategory;
  defaultSettings: Record<string, unknown>;
  allowAlignment?: boolean;
}

/**
 * Visual styling configuration for widgets
 */
export interface WidgetStyle {
  // Content alignment (for visual widgets)
  justifyContent?: 'start' | 'center' | 'end';
  alignItems?: 'start' | 'center' | 'end';

  // Optional scaling
  scale?: number;
}

/**
 * Widget categories for organization
 */
export type WidgetCategory =
  | 'productivity'
  | 'information'
  | 'entertainment'
  | 'wellness'
  | 'utility';

// ============================================
// Widget Header & Actions
// ============================================

/**
 * Action button in widget header
 */
export interface WidgetAction {
  id: string;
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
}

/**
 * Props for the standardized widget wrapper
 */
export interface WidgetWrapperProps {
  id: string;
  type: WidgetType;
  title: string;
  icon: string;
  actions?: WidgetAction[];
  showHeader?: boolean;
  onRemove?: () => void;
  onSettings?: () => void;
  children: React.ReactNode;
  className?: string;
}

// ============================================
// Widget State
// ============================================

/**
 * Loading state for widgets that fetch data
 */
export type WidgetLoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Common widget state interface
 */
export interface WidgetState<T = unknown> {
  data: T | null;
  loading: WidgetLoadingState;
  error: string | null;
  lastUpdated: number | null;
}

// ============================================
// Presets
// ============================================

/**
 * Preset configuration for quick setup
 */
export interface WidgetPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  widgets: Array<{
    type: WidgetType;
    layout: WidgetLayout;
    settings?: Record<string, unknown>;
  }>;
  background?: {
    type: 'gradient' | 'image' | 'video' | 'room';
    value?: string;
  };
  ambientSounds?: Array<{
    id: string;
    volume: number;
  }>;
}

// ============================================
// Helper Functions (Type Guards)
// ============================================

/**
 * Check if a string is a valid widget type
 */
export function isWidgetType(value: string): value is WidgetType {
  const validTypes: WidgetType[] = [
    'clock', 'worldtime', 'weather', 'gif', 'tasks', 'timer',
    'notes', 'quote', 'calendar', 'breathing', 'dictionary',
    'habit', 'focus', 'calculator', 'quicklinks', 'flashcard', 'embed'
  ];
  return validTypes.includes(value as WidgetType);
}

/**
 * Check if a string is a valid widget size
 */
export function isWidgetSize(value: string): value is WidgetSize {
  const validSizes: WidgetSize[] = ['1x1', '1x2', '1x3', '2x1', '2x2', '2x3', '3x1'];
  return validSizes.includes(value as WidgetSize);
}

/**
 * Parse widget size string into dimensions
 */
export function parseWidgetSize(size: WidgetSize): GridDimensions {
  const [cols, rows] = size.split('x').map(Number);
  return { cols, rows };
}

/**
 * Convert dimensions to size string
 */
export function toWidgetSize(dimensions: GridDimensions): WidgetSize {
  return `${dimensions.cols}x${dimensions.rows}` as WidgetSize;
}
