import { useEffect, useRef, useCallback } from 'react';
import {
  GESTURE_THRESHOLD,
  SWIPE_DIRECTIONS,
  isTouchDevice,
  mobileTouchStyles
} from '../utils/mobileGestures';

// Custom hook for handling mobile gestures
export const useMobileGestures = (callbacks = {}) => {
  const elementRef = useRef(null);
  const startTouchRef = useRef(null);
  const startTimeRef = useRef(null);
  const longPressTimerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    startTouchRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      identifier: touch.identifier
    };
    startTimeRef.current = Date.now();

    // Handle long press
    if (callbacks.onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        callbacks.onLongPress(e);
      }, GESTURE_THRESHOLD.LONG_PRESS_TIME);
    }

    if (callbacks.onTouchStart) {
      callbacks.onTouchStart(e);
    }
  }, [callbacks]);

  const handleTouchMove = useCallback((e) => {
    if (!startTouchRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startTouchRef.current.x;
    const deltaY = touch.clientY - startTouchRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Cancel long press if moved too much
    if (distance > GESTURE_THRESHOLD.TAP_MAX_DISTANCE && longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (callbacks.onTouchMove) {
      callbacks.onTouchMove(e, { deltaX, deltaY, distance });
    }
  }, [callbacks]);

  const handleTouchEnd = useCallback((e) => {
    if (!startTouchRef.current) return;

    const endTouch = e.changedTouches[0];
    const deltaX = endTouch.clientX - startTouchRef.current.x;
    const deltaY = endTouch.clientY - startTouchRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const elapsedTime = Date.now() - startTimeRef.current;

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Handle tap
    if (
      distance <= GESTURE_THRESHOLD.TAP_MAX_DISTANCE &&
      elapsedTime <= GESTURE_THRESHOLD.TAP_MAX_TIME &&
      callbacks.onTap
    ) {
      callbacks.onTap(e);
    }

    // Handle swipe
    if (
      distance >= GESTURE_THRESHOLD.SWIPE_MIN_DISTANCE &&
      elapsedTime <= GESTURE_THRESHOLD.SWIPE_MAX_TIME &&
      callbacks.onSwipe
    ) {
      const direction = Math.abs(deltaX) > Math.abs(deltaY)
        ? (deltaX > 0 ? SWIPE_DIRECTIONS.RIGHT : SWIPE_DIRECTIONS.LEFT)
        : (deltaY > 0 ? SWIPE_DIRECTIONS.DOWN : SWIPE_DIRECTIONS.UP);

      callbacks.onSwipe(direction, { deltaX, deltaY, distance, elapsedTime });
    }

    if (callbacks.onTouchEnd) {
      callbacks.onTouchEnd(e, { deltaX, deltaY, distance, elapsedTime });
    }

    // Reset
    startTouchRef.current = null;
    startTimeRef.current = null;
  }, [callbacks]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !isTouchDevice()) return;

    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      // Cleanup
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return elementRef;
};

// Hook for swipe gestures
export const useSwipe = (callbacks = {}) => {
  return useMobileGestures({
    onSwipe: callbacks.onSwipe,
    onTouchStart: callbacks.onTouchStart,
    onTouchEnd: callbacks.onTouchEnd
  });
};

// Hook for tap gestures
export const useTap = (callbacks = {}) => {
  return useMobileGestures({
    onTap: callbacks.onTap,
    onLongPress: callbacks.onLongPress
  });
};

// Hook for pull-to-refresh
export const usePullToRefresh = (onRefresh, threshold = 80) => {
  const elementRef = useRef(null);
  const startYRef = useRef(null);
  const isPullingRef = useRef(false);

  const handleTouchStart = useCallback((e) => {
    if (elementRef.current?.scrollTop === 0) {
      startYRef.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (startYRef.current === null) return;

    const currentY = e.touches[0].clientY;
    const pullDistance = currentY - startYRef.current;

    if (pullDistance > 0) {
      isPullingRef.current = true;
      
      // Prevent default scrolling when pulling
      if (pullDistance > 20) {
        e.preventDefault();
      }

      // Visual feedback can be handled by parent component
      if (onRefresh && pullDistance > threshold) {
        // Indicate refresh threshold reached
      }
    }
  }, [threshold, onRefresh]);

  const handleTouchEnd = useCallback(() => {
    if (isPullingRef.current && startYRef.current !== null) {
      const pullDistance = Math.max(0, startYRef.current);
      
      if (pullDistance > threshold && onRefresh) {
        onRefresh();
      }
    }

    // Reset
    startYRef.current = null;
    isPullingRef.current = false;
  }, [threshold, onRefresh]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !isTouchDevice()) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return elementRef;
};

// Hook for pinch-to-zoom
export const usePinchZoom = (callbacks = {}) => {
  const elementRef = useRef(null);
  const initialDistanceRef = useRef(null);
  const initialScaleRef = useRef(1);

  const getDistance = (touch1, touch2) => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      initialDistanceRef.current = getDistance(e.touches[0], e.touches[1]);
      initialScaleRef.current = 1;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2 && initialDistanceRef.current) {
      e.preventDefault();
      
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialDistanceRef.current;

      if (callbacks.onPinch) {
        callbacks.onPinch(scale, initialScaleRef.current);
      }
    }
  }, [callbacks]);

  const handleTouchEnd = useCallback(() => {
    initialDistanceRef.current = null;
    initialScaleRef.current = 1;
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !isTouchDevice()) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return elementRef;
};

// Helper hook to apply mobile-friendly styles
export const useMobileStyles = () => {
  return mobileTouchStyles;
};