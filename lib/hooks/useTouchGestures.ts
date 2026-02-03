/**
 * useTouchGestures v2
 * Touch gesture detection for mobile interactions
 */

'use client';

import { useRef, useCallback, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

export interface SwipeEvent {
    direction: SwipeDirection;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    deltaX: number;
    deltaY: number;
    velocity: number;
    duration: number;
}

export interface LongPressEvent {
    x: number;
    y: number;
    duration: number;
}

export interface PinchEvent {
    scale: number;
    centerX: number;
    centerY: number;
}

export interface TouchGestureOptions {
    /** Minimum distance (px) to trigger swipe */
    swipeThreshold?: number;
    /** Maximum time (ms) for swipe */
    swipeTimeout?: number;
    /** Minimum time (ms) for long press */
    longPressThreshold?: number;
    /** Enable swipe detection */
    enableSwipe?: boolean;
    /** Enable long press detection */
    enableLongPress?: boolean;
    /** Enable pinch detection */
    enablePinch?: boolean;
    /** Prevent default touch behavior */
    preventDefault?: boolean;
}

export interface TouchGestureCallbacks {
    onSwipe?: (event: SwipeEvent) => void;
    onSwipeLeft?: (event: SwipeEvent) => void;
    onSwipeRight?: (event: SwipeEvent) => void;
    onSwipeUp?: (event: SwipeEvent) => void;
    onSwipeDown?: (event: SwipeEvent) => void;
    onLongPress?: (event: LongPressEvent) => void;
    onPinch?: (event: PinchEvent) => void;
    onTap?: (x: number, y: number) => void;
    onDoubleTap?: (x: number, y: number) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_OPTIONS: Required<TouchGestureOptions> = {
    swipeThreshold: 50,
    swipeTimeout: 300,
    longPressThreshold: 500,
    enableSwipe: true,
    enableLongPress: true,
    enablePinch: true,
    preventDefault: false,
};

const DOUBLE_TAP_DELAY = 300;
const TAP_MOVE_THRESHOLD = 10;

// ═══════════════════════════════════════════════════════════════════════════════
// Main Hook
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook for detecting touch gestures
 */
export function useTouchGestures<T extends HTMLElement = HTMLElement>(
    callbacks: TouchGestureCallbacks,
    options: TouchGestureOptions = {}
) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const elementRef = useRef<T>(null);

    // Touch state refs
    const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastTapRef = useRef<{ x: number; y: number; time: number } | null>(null);
    const initialPinchDistanceRef = useRef<number | null>(null);

    // Clear long press timer
    const clearLongPressTimer = useCallback(() => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    }, []);

    // Get distance between two touch points
    const getPinchDistance = useCallback((touches: TouchList): number => {
        if (touches.length < 2) return 0;
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.hypot(dx, dy);
    }, []);

    // Get center point of pinch
    const getPinchCenter = useCallback((touches: TouchList): { x: number; y: number } => {
        if (touches.length < 2) return { x: 0, y: 0 };
        return {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2,
        };
    }, []);

    // Touch start handler
    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (opts.preventDefault) {
            e.preventDefault();
        }

        const touch = e.touches[0];
        const now = Date.now();

        touchStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            time: now,
        };

        // Start long press timer
        if (opts.enableLongPress && callbacks.onLongPress) {
            clearLongPressTimer();
            longPressTimerRef.current = setTimeout(() => {
                if (touchStartRef.current) {
                    callbacks.onLongPress?.({
                        x: touch.clientX,
                        y: touch.clientY,
                        duration: opts.longPressThreshold,
                    });
                }
            }, opts.longPressThreshold);
        }

        // Pinch start
        if (opts.enablePinch && e.touches.length === 2) {
            initialPinchDistanceRef.current = getPinchDistance(e.touches);
        }
    }, [opts, callbacks, clearLongPressTimer, getPinchDistance]);

    // Touch move handler
    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!touchStartRef.current) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = touch.clientY - touchStartRef.current.y;

        // Cancel long press if moved too much
        if (Math.abs(deltaX) > TAP_MOVE_THRESHOLD || Math.abs(deltaY) > TAP_MOVE_THRESHOLD) {
            clearLongPressTimer();
        }

        // Handle pinch
        if (opts.enablePinch && e.touches.length === 2 && initialPinchDistanceRef.current) {
            const currentDistance = getPinchDistance(e.touches);
            const scale = currentDistance / initialPinchDistanceRef.current;
            const center = getPinchCenter(e.touches);

            callbacks.onPinch?.({
                scale,
                centerX: center.x,
                centerY: center.y,
            });
        }
    }, [opts, callbacks, clearLongPressTimer, getPinchDistance, getPinchCenter]);

    // Touch end handler
    const handleTouchEnd = useCallback((e: TouchEvent) => {
        clearLongPressTimer();

        if (!touchStartRef.current) return;

        const touch = e.changedTouches[0];
        const now = Date.now();
        const duration = now - touchStartRef.current.time;

        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = touch.clientY - touchStartRef.current.y;
        const distance = Math.hypot(deltaX, deltaY);

        // Check for swipe
        if (
            opts.enableSwipe &&
            duration < opts.swipeTimeout &&
            distance > opts.swipeThreshold
        ) {
            const velocity = distance / duration;
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);

            let direction: SwipeDirection;
            if (absX > absY) {
                direction = deltaX > 0 ? 'right' : 'left';
            } else {
                direction = deltaY > 0 ? 'down' : 'up';
            }

            const event: SwipeEvent = {
                direction,
                startX: touchStartRef.current.x,
                startY: touchStartRef.current.y,
                endX: touch.clientX,
                endY: touch.clientY,
                deltaX,
                deltaY,
                velocity,
                duration,
            };

            callbacks.onSwipe?.(event);

            switch (direction) {
                case 'left': callbacks.onSwipeLeft?.(event); break;
                case 'right': callbacks.onSwipeRight?.(event); break;
                case 'up': callbacks.onSwipeUp?.(event); break;
                case 'down': callbacks.onSwipeDown?.(event); break;
            }
        }
        // Check for tap/double tap
        else if (distance < TAP_MOVE_THRESHOLD && duration < opts.swipeTimeout) {
            const tapX = touch.clientX;
            const tapY = touch.clientY;

            // Check for double tap
            if (
                lastTapRef.current &&
                now - lastTapRef.current.time < DOUBLE_TAP_DELAY &&
                Math.abs(tapX - lastTapRef.current.x) < 30 &&
                Math.abs(tapY - lastTapRef.current.y) < 30
            ) {
                callbacks.onDoubleTap?.(tapX, tapY);
                lastTapRef.current = null;
            } else {
                callbacks.onTap?.(tapX, tapY);
                lastTapRef.current = { x: tapX, y: tapY, time: now };
            }
        }

        touchStartRef.current = null;
        initialPinchDistanceRef.current = null;
    }, [opts, callbacks, clearLongPressTimer]);

    // Touch cancel handler
    const handleTouchCancel = useCallback(() => {
        clearLongPressTimer();
        touchStartRef.current = null;
        initialPinchDistanceRef.current = null;
    }, [clearLongPressTimer]);

    // Setup event listeners
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        element.addEventListener('touchstart', handleTouchStart, { passive: !opts.preventDefault });
        element.addEventListener('touchmove', handleTouchMove, { passive: true });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });
        element.addEventListener('touchcancel', handleTouchCancel, { passive: true });

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
            element.removeEventListener('touchcancel', handleTouchCancel);
            clearLongPressTimer();
        };
    }, [
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        handleTouchCancel,
        clearLongPressTimer,
        opts.preventDefault,
    ]);

    return elementRef;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Simplified Hooks
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook for swipe detection only
 */
export function useSwipeGesture<T extends HTMLElement = HTMLElement>(
    onSwipe: (direction: SwipeDirection, event: SwipeEvent) => void,
    options?: Omit<TouchGestureOptions, 'enableLongPress' | 'enablePinch'>
) {
    return useTouchGestures<T>(
        { onSwipe: (e) => onSwipe(e.direction, e) },
        { ...options, enableLongPress: false, enablePinch: false }
    );
}

/**
 * Hook for long press detection only
 */
export function useLongPress<T extends HTMLElement = HTMLElement>(
    onLongPress: (event: LongPressEvent) => void,
    threshold?: number
) {
    return useTouchGestures<T>(
        { onLongPress },
        { enableSwipe: false, enablePinch: false, longPressThreshold: threshold }
    );
}

export default useTouchGestures;
