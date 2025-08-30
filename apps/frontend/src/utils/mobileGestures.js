// Mobile gesture utilities for touch interactions

// Non-hook gesture handlers (called from inside hooks)
export const createSwipeHandler = (element, options) => {
  return addSwipeGesture(element, options);
};

export const createTapHandler = (element, options) => {
  return addTapGesture(element, options);
};

export const createLongPressHandler = (element, options) => {
  return addLongPressGesture(element, options);
};

export const createPinchHandler = (element, options) => {
  return addPinchGesture(element, options);
};

export const createPullToRefreshHandler = (element, options) => {
  return addPullToRefreshGesture(element, options);
};

export const GESTURE_THRESHOLD = {
  SWIPE_MIN_DISTANCE: 50,
  SWIPE_MAX_TIME: 300,
  TAP_MAX_TIME: 200,
  TAP_MAX_DISTANCE: 10,
  LONG_PRESS_TIME: 500,
  PINCH_MIN_SCALE_CHANGE: 0.1,
  PAN_MIN_DISTANCE: 5
};

export const SWIPE_DIRECTIONS = {
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down'
};

class TouchTracker {
  constructor() {
    this.startTouches = [];
    this.currentTouches = [];
    this.startTime = 0;
    this.isTracking = false;
  }

  start(touches) {
    this.startTouches = Array.from(touches).map(touch => ({
      x: touch.clientX,
      y: touch.clientY,
      identifier: touch.identifier
    }));
    this.currentTouches = [...this.startTouches];
    this.startTime = Date.now();
    this.isTracking = true;
  }

  update(touches) {
    if (!this.isTracking) return;
    
    this.currentTouches = Array.from(touches).map(touch => ({
      x: touch.clientX,
      y: touch.clientY,
      identifier: touch.identifier
    }));
  }

  end() {
    this.isTracking = false;
  }

  getDistance(touch1, touch2) {
    const dx = touch2.x - touch1.x;
    const dy = touch2.y - touch1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getAngle(touch1, touch2) {
    const dx = touch2.x - touch1.x;
    const dy = touch2.y - touch1.y;
    return Math.atan2(dy, dx);
  }

  getDelta() {
    if (this.startTouches.length === 0 || this.currentTouches.length === 0) {
      return { x: 0, y: 0 };
    }
    
    const start = this.startTouches[0];
    const current = this.currentTouches[0];
    
    return {
      x: current.x - start.x,
      y: current.y - start.y
    };
  }

  getSwipeDirection() {
    const delta = this.getDelta();
    const absX = Math.abs(delta.x);
    const absY = Math.abs(delta.y);
    
    if (absX > absY) {
      return delta.x > 0 ? SWIPE_DIRECTIONS.RIGHT : SWIPE_DIRECTIONS.LEFT;
    } else {
      return delta.y > 0 ? SWIPE_DIRECTIONS.DOWN : SWIPE_DIRECTIONS.UP;
    }
  }

  getScale() {
    if (this.startTouches.length < 2 || this.currentTouches.length < 2) {
      return 1;
    }
    
    const startDistance = this.getDistance(this.startTouches[0], this.startTouches[1]);
    const currentDistance = this.getDistance(this.currentTouches[0], this.currentTouches[1]);
    
    return currentDistance / startDistance;
  }

  getElapsedTime() {
    return Date.now() - this.startTime;
  }
}

// Swipe gesture handler
export function useSwipe(element, callbacks = {}) {
  const tracker = new TouchTracker();

  const handleTouchStart = (e) => {
    tracker.start(e.touches);
  };

  const handleTouchMove = (e) => {
    e.preventDefault(); // Prevent scrolling during swipe
    tracker.update(e.touches);
    
    if (callbacks.onPan) {
      const delta = tracker.getDelta();
      callbacks.onPan(delta);
    }
  };

  const handleTouchEnd = (e) => {
    const delta = tracker.getDelta();
    const distance = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
    const elapsedTime = tracker.getElapsedTime();
    
    if (
      distance >= GESTURE_THRESHOLD.SWIPE_MIN_DISTANCE &&
      elapsedTime <= GESTURE_THRESHOLD.SWIPE_MAX_TIME
    ) {
      const direction = tracker.getSwipeDirection();
      if (callbacks.onSwipe) {
        callbacks.onSwipe(direction, { distance, elapsedTime, delta });
      }
    }
    
    tracker.end();
  };

  // Add event listeners
  if (element) {
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
  }

  // Cleanup function
  return () => {
    if (element) {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    }
  };
}

// Tap gesture handler
export function useTap(element, callbacks = {}) {
  const tracker = new TouchTracker();

  const handleTouchStart = (e) => {
    tracker.start(e.touches);
  };

  const handleTouchEnd = (e) => {
    const delta = tracker.getDelta();
    const distance = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
    const elapsedTime = tracker.getElapsedTime();
    
    if (
      distance <= GESTURE_THRESHOLD.TAP_MAX_DISTANCE &&
      elapsedTime <= GESTURE_THRESHOLD.TAP_MAX_TIME
    ) {
      if (callbacks.onTap) {
        callbacks.onTap(e);
      }
    }
    
    tracker.end();
  };

  if (element) {
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
  }

  return () => {
    if (element) {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    }
  };
}

// Long press gesture handler
export function useLongPress(element, callbacks = {}) {
  const tracker = new TouchTracker();
  let longPressTimer = null;

  const handleTouchStart = (e) => {
    tracker.start(e.touches);
    
    longPressTimer = setTimeout(() => {
      const delta = tracker.getDelta();
      const distance = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
      
      if (distance <= GESTURE_THRESHOLD.TAP_MAX_DISTANCE) {
        if (callbacks.onLongPress) {
          callbacks.onLongPress(e);
        }
      }
    }, GESTURE_THRESHOLD.LONG_PRESS_TIME);
  };

  const handleTouchMove = (e) => {
    tracker.update(e.touches);
    const delta = tracker.getDelta();
    const distance = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
    
    if (distance > GESTURE_THRESHOLD.TAP_MAX_DISTANCE) {
      clearTimeout(longPressTimer);
    }
  };

  const handleTouchEnd = (e) => {
    clearTimeout(longPressTimer);
    tracker.end();
  };

  if (element) {
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
  }

  return () => {
    if (element) {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    }
    clearTimeout(longPressTimer);
  };
}

// Pinch gesture handler (for zoom)
export function usePinch(element, callbacks = {}) {
  const tracker = new TouchTracker();
  let initialScale = 1;

  const handleTouchStart = (e) => {
    if (e.touches.length >= 2) {
      tracker.start(e.touches);
      initialScale = 1;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length >= 2) {
      e.preventDefault();
      tracker.update(e.touches);
      
      const scale = tracker.getScale();
      const scaleChange = Math.abs(scale - initialScale);
      
      if (scaleChange >= GESTURE_THRESHOLD.PINCH_MIN_SCALE_CHANGE) {
        if (callbacks.onPinch) {
          callbacks.onPinch(scale, { initialScale, scaleChange });
        }
      }
    }
  };

  const handleTouchEnd = (e) => {
    tracker.end();
  };

  if (element) {
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
  }

  return () => {
    if (element) {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    }
  };
}

// Pull to refresh gesture
export function usePullToRefresh(element, callbacks = {}) {
  const tracker = new TouchTracker();
  let isRefreshing = false;

  const handleTouchStart = (e) => {
    if (element.scrollTop === 0 && !isRefreshing) {
      tracker.start(e.touches);
    }
  };

  const handleTouchMove = (e) => {
    if (tracker.isTracking && !isRefreshing) {
      const delta = tracker.getDelta();
      
      if (delta.y > 0) { // Pulling down
        if (callbacks.onPull) {
          const pullDistance = Math.min(delta.y, 150); // Max pull distance
          callbacks.onPull(pullDistance);
        }
        
        if (delta.y > 80) { // Threshold for refresh
          e.preventDefault(); // Prevent overscroll
        }
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (tracker.isTracking && !isRefreshing) {
      const delta = tracker.getDelta();
      
      if (delta.y > 80) { // Refresh threshold
        isRefreshing = true;
        if (callbacks.onRefresh) {
          callbacks.onRefresh(() => {
            isRefreshing = false;
          });
        }
      } else if (callbacks.onRelease) {
        callbacks.onRelease();
      }
    }
    
    tracker.end();
  };

  if (element) {
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
  }

  return () => {
    if (element) {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    }
  };
}

// React hook for mobile gestures
export function useMobileGestures(ref, gestures = {}) {
  const cleanupFunctions = [];

  const initialize = () => {
    if (!ref.current) return;

    const element = ref.current;

    if (gestures.swipe) {
      const cleanup = createSwipeHandler(element, gestures.swipe);
      cleanupFunctions.push(cleanup);
    }

    if (gestures.tap) {
      const cleanup = createTapHandler(element, gestures.tap);
      cleanupFunctions.push(cleanup);
    }

    if (gestures.longPress) {
      const cleanup = createLongPressHandler(element, gestures.longPress);
      cleanupFunctions.push(cleanup);
    }

    if (gestures.pinch) {
      const cleanup = createPinchHandler(element, gestures.pinch);
      cleanupFunctions.push(cleanup);
    }

    if (gestures.pullToRefresh) {
      const cleanup = createPullToRefreshHandler(element, gestures.pullToRefresh);
      cleanupFunctions.push(cleanup);
    }
  };

  const cleanup = () => {
    cleanupFunctions.forEach(fn => fn && fn());
    cleanupFunctions.length = 0;
  };

  return { initialize, cleanup };
}

// Utility to check if device supports touch
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Utility to prevent default touch behaviors
export const preventDefaultTouchBehavior = (element) => {
  if (!element) return;

  const preventDefaults = (e) => {
    e.preventDefault();
  };

  element.addEventListener('touchstart', preventDefaults, { passive: false });
  element.addEventListener('touchmove', preventDefaults, { passive: false });

  return () => {
    element.removeEventListener('touchstart', preventDefaults);
    element.removeEventListener('touchmove', preventDefaults);
  };
};

// Mobile-specific CSS styles
export const mobileTouchStyles = {
  // Remove tap highlight on touch
  WebkitTapHighlightColor: 'transparent',
  
  // Improve touch scrolling
  WebkitOverflowScrolling: 'touch',
  
  // Prevent text selection during gestures
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  userSelect: 'none',
  
  // Improve touch responsiveness
  touchAction: 'manipulation'
};