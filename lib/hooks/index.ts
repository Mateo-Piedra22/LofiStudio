/**
 * Hooks Index v2
 * Central export for all custom hooks
 */

// Grid & Widget Hooks
export { useWidgetGrid } from './useWidgetGrid';

// Audio Hooks
export {
    useAmbientAudio,
    useIsAudioPlaying,
    useSoundState
} from './useAmbientAudio';

// Responsive Hooks
export {
    useBreakpoint,
    useCurrentBreakpoint,
    useIsMobile,
    useIsTouch,
    useOrientation,
    useGridConfig,
    useMediaQuery,
    usePrefersReducedMotion,
    usePrefersDarkMode,
    usePrefersHighContrast,
} from './useBreakpoint';

// Touch Gestures
export {
    useTouchGestures,
    useSwipeGesture,
    useLongPress,
} from './useTouchGestures';

// Storage Hooks
export { useLocalStorage } from './useLocalStorage';

// Legacy (to be refactored)
// export { useWidgets } from './useWidgets';
// export { useGridLayout } from './useGridLayout';
