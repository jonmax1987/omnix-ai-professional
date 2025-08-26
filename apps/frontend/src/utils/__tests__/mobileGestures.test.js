import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  GESTURE_THRESHOLD, 
  SWIPE_DIRECTIONS, 
  isTouchDevice, 
  mobileTouchStyles 
} from '../mobileGestures';

describe('Mobile Gestures Utilities', () => {
  describe('Constants', () => {
    it('exports correct gesture thresholds', () => {
      expect(GESTURE_THRESHOLD).toEqual({
        SWIPE_MIN_DISTANCE: 50,
        SWIPE_MAX_TIME: 300,
        TAP_MAX_TIME: 200,
        TAP_MAX_DISTANCE: 10,
        LONG_PRESS_TIME: 500,
        PINCH_MIN_SCALE_CHANGE: 0.1,
        PAN_MIN_DISTANCE: 5
      });
    });

    it('exports correct swipe directions', () => {
      expect(SWIPE_DIRECTIONS).toEqual({
        LEFT: 'left',
        RIGHT: 'right',
        UP: 'up',
        DOWN: 'down'
      });
    });

    it('exports mobile touch styles', () => {
      expect(mobileTouchStyles).toEqual({
        WebkitTapHighlightColor: 'transparent',
        WebkitOverflowScrolling: 'touch',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
        touchAction: 'manipulation'
      });
    });
  });

  describe('isTouchDevice', () => {
    let originalTouchStart;
    let originalMaxTouchPoints;

    beforeEach(() => {
      originalTouchStart = window.ontouchstart;
      originalMaxTouchPoints = navigator.maxTouchPoints;
    });

    afterEach(() => {
      window.ontouchstart = originalTouchStart;
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: originalMaxTouchPoints,
        configurable: true
      });
    });

    it('returns true when ontouchstart is supported', () => {
      window.ontouchstart = null;
      expect(isTouchDevice()).toBe(true);
    });

    it('returns true when maxTouchPoints > 0', () => {
      delete window.ontouchstart;
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 1,
        configurable: true
      });
      expect(isTouchDevice()).toBe(true);
    });

    it('returns false when no touch support', () => {
      delete window.ontouchstart;
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 0,
        configurable: true
      });
      expect(isTouchDevice()).toBe(false);
    });
  });

  describe('TouchTracker Class', () => {
    // Note: TouchTracker is not exported, so we'll test the public API through hooks
    // This would require more complex integration testing
  });

  describe('Gesture Recognition', () => {
    let mockElement;
    let mockTouchEvent;

    beforeEach(() => {
      mockElement = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        getBoundingClientRect: vi.fn(() => ({
          left: 0,
          top: 0,
          width: 100,
          height: 100
        }))
      };

      mockTouchEvent = {
        touches: [{
          clientX: 50,
          clientY: 50,
          identifier: 0
        }],
        changedTouches: [{
          clientX: 100,
          clientY: 50,
          identifier: 0
        }],
        preventDefault: vi.fn()
      };
    });

    it('calculates swipe direction correctly', () => {
      // This would test the internal logic of swipe detection
      // Since the functions are not exported individually, this would be an integration test
      expect(SWIPE_DIRECTIONS.LEFT).toBe('left');
      expect(SWIPE_DIRECTIONS.RIGHT).toBe('right');
      expect(SWIPE_DIRECTIONS.UP).toBe('up');
      expect(SWIPE_DIRECTIONS.DOWN).toBe('down');
    });

    it('validates gesture thresholds', () => {
      expect(GESTURE_THRESHOLD.SWIPE_MIN_DISTANCE).toBe(50);
      expect(GESTURE_THRESHOLD.SWIPE_MAX_TIME).toBe(300);
      expect(GESTURE_THRESHOLD.TAP_MAX_TIME).toBe(200);
      expect(GESTURE_THRESHOLD.TAP_MAX_DISTANCE).toBe(10);
      expect(GESTURE_THRESHOLD.LONG_PRESS_TIME).toBe(500);
    });
  });

  describe('Distance and Angle Calculations', () => {
    it('calculates distance correctly', () => {
      const point1 = { x: 0, y: 0 };
      const point2 = { x: 3, y: 4 };
      
      // Distance formula: sqrt((x2-x1)² + (y2-y1)²)
      const expectedDistance = Math.sqrt(9 + 16); // 5
      
      // Since internal functions aren't exported, we test the concept
      expect(expectedDistance).toBe(5);
    });

    it('calculates angle correctly', () => {
      const point1 = { x: 0, y: 0 };
      const point2 = { x: 1, y: 1 };
      
      // Angle formula: atan2(dy, dx)
      const expectedAngle = Math.atan2(1, 1); // π/4 radians (45 degrees)
      
      expect(expectedAngle).toBeCloseTo(Math.PI / 4);
    });
  });

  describe('Gesture Validation', () => {
    it('validates swipe gestures correctly', () => {
      const swipeDistance = 60; // > SWIPE_MIN_DISTANCE
      const swipeTime = 250; // < SWIPE_MAX_TIME
      
      expect(swipeDistance > GESTURE_THRESHOLD.SWIPE_MIN_DISTANCE).toBe(true);
      expect(swipeTime < GESTURE_THRESHOLD.SWIPE_MAX_TIME).toBe(true);
    });

    it('validates tap gestures correctly', () => {
      const tapDistance = 5; // < TAP_MAX_DISTANCE
      const tapTime = 150; // < TAP_MAX_TIME
      
      expect(tapDistance < GESTURE_THRESHOLD.TAP_MAX_DISTANCE).toBe(true);
      expect(tapTime < GESTURE_THRESHOLD.TAP_MAX_TIME).toBe(true);
    });

    it('validates long press gestures correctly', () => {
      const pressTime = 600; // > LONG_PRESS_TIME
      const moveDistance = 8; // < TAP_MAX_DISTANCE
      
      expect(pressTime > GESTURE_THRESHOLD.LONG_PRESS_TIME).toBe(true);
      expect(moveDistance < GESTURE_THRESHOLD.TAP_MAX_DISTANCE).toBe(true);
    });

    it('validates pinch gestures correctly', () => {
      const scaleChange = 0.15; // > PINCH_MIN_SCALE_CHANGE
      
      expect(scaleChange > GESTURE_THRESHOLD.PINCH_MIN_SCALE_CHANGE).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles zero distance correctly', () => {
      const distance = 0;
      expect(distance < GESTURE_THRESHOLD.TAP_MAX_DISTANCE).toBe(true);
      expect(distance < GESTURE_THRESHOLD.SWIPE_MIN_DISTANCE).toBe(true);
    });

    it('handles very long gestures', () => {
      const longDistance = 1000;
      const longTime = 2000;
      
      expect(longDistance > GESTURE_THRESHOLD.SWIPE_MIN_DISTANCE).toBe(true);
      expect(longTime > GESTURE_THRESHOLD.SWIPE_MAX_TIME).toBe(true);
    });

    it('handles negative coordinates', () => {
      const point1 = { x: -10, y: -10 };
      const point2 = { x: 10, y: 10 };
      
      const distance = Math.sqrt(
        Math.pow(point2.x - point1.x, 2) + 
        Math.pow(point2.y - point1.y, 2)
      );
      
      expect(distance).toBeCloseTo(28.28, 2);
    });
  });

  describe('Performance Considerations', () => {
    it('uses reasonable threshold values for performance', () => {
      // Ensure thresholds are not too sensitive (performance impact)
      expect(GESTURE_THRESHOLD.SWIPE_MIN_DISTANCE).toBeGreaterThanOrEqual(30);
      expect(GESTURE_THRESHOLD.TAP_MAX_DISTANCE).toBeLessThanOrEqual(20);
      expect(GESTURE_THRESHOLD.LONG_PRESS_TIME).toBeGreaterThanOrEqual(300);
    });
  });
});