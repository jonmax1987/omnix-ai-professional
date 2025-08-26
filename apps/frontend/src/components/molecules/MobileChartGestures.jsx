import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipe, usePinchZoom, useTap } from '../../hooks/useMobileGestures';
import { SWIPE_DIRECTIONS, isTouchDevice } from '../../utils/mobileGestures';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';

const GestureWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  touch-action: manipulation;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
`;

const ChartArea = styled(motion.div)`
  width: 100%;
  height: 100%;
  transform-origin: center center;
  transition: transform 0.3s ease-out;
`;

const GestureIndicator = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]};
  box-shadow: ${props => props.theme.shadows.lg};
  z-index: 100;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  backdrop-filter: blur(10px);
  min-width: 120px;
`;

const SwipeIndicator = styled(motion.div)`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.theme.colors.primary[500]};
  color: white;
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.spacing[4]};
  font-size: ${props => props.theme.typography.caption.fontSize};
  z-index: 50;
  pointer-events: none;
`;

const ZoomIndicator = styled(motion.div)`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]};
  box-shadow: ${props => props.theme.shadows.md};
  z-index: 50;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
`;

const TouchPoint = styled(motion.div)`
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary[500]}50;
  border: 2px solid ${props => props.theme.colors.primary[500]};
  pointer-events: none;
  z-index: 40;
`;

const MobileChartGestures = ({
  children,
  onSwipe,
  onZoom,
  onTap,
  onLongPress,
  enableSwipe = true,
  enableZoom = true,
  enableTap = true,
  showIndicators = false,
  className,
  ...props
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [touchPoints, setTouchPoints] = useState([]);
  const [showGestureHint, setShowGestureHint] = useState(false);

  const containerRef = useRef(null);
  const initialScaleRef = useRef(1);
  const initialPositionRef = useRef({ x: 0, y: 0 });

  // Swipe gesture handling
  const swipeRef = useSwipe({
    onSwipe: (direction, details) => {
      if (!enableSwipe) return;

      setSwipeDirection(direction);
      setTimeout(() => setSwipeDirection(null), 1000);

      if (onSwipe) {
        onSwipe(direction, details);
      }
    },
    onTouchStart: (e) => {
      // Show touch points for visual feedback
      const points = Array.from(e.touches).map((touch, index) => ({
        id: index,
        x: touch.clientX - containerRef.current?.getBoundingClientRect().left || 0,
        y: touch.clientY - containerRef.current?.getBoundingClientRect().top || 0
      }));
      setTouchPoints(points);
    },
    onTouchEnd: () => {
      setTouchPoints([]);
    }
  });

  // Pinch zoom handling
  const zoomRef = usePinchZoom({
    onPinch: (newScale, initialScale) => {
      if (!enableZoom) return;

      const clampedScale = Math.max(0.5, Math.min(3, newScale));
      setScale(clampedScale);
      setIsZooming(true);

      if (onZoom) {
        onZoom(clampedScale, initialScale);
      }

      // Clear zooming state after animation
      setTimeout(() => setIsZooming(false), 300);
    }
  });

  // Tap gesture handling
  const tapRef = useTap({
    onTap: (e) => {
      if (!enableTap) return;

      const rect = containerRef.current?.getBoundingClientRect();
      const tapPosition = {
        x: e.changedTouches[0].clientX - rect.left,
        y: e.changedTouches[0].clientY - rect.top
      };

      if (onTap) {
        onTap(e, tapPosition);
      }
    },
    onLongPress: (e) => {
      if (onLongPress) {
        const rect = containerRef.current?.getBoundingClientRect();
        const pressPosition = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        };
        onLongPress(e, pressPosition);
      }
    }
  });

  // Combine refs
  useEffect(() => {
    if (containerRef.current) {
      if (enableSwipe) swipeRef.current = containerRef.current;
      if (enableZoom) zoomRef.current = containerRef.current;
      if (enableTap) tapRef.current = containerRef.current;
    }
  }, [enableSwipe, enableZoom, enableTap]);

  // Reset zoom with double tap
  const handleDoubleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Show gesture hints on mobile
  useEffect(() => {
    if (isTouchDevice() && showIndicators) {
      setShowGestureHint(true);
      const timer = setTimeout(() => setShowGestureHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showIndicators]);

  const getSwipeDirectionIcon = (direction) => {
    switch (direction) {
      case SWIPE_DIRECTIONS.LEFT: return 'chevron-left';
      case SWIPE_DIRECTIONS.RIGHT: return 'chevron-right';
      case SWIPE_DIRECTIONS.UP: return 'chevron-up';
      case SWIPE_DIRECTIONS.DOWN: return 'chevron-down';
      default: return 'hand';
    }
  };

  const getSwipeDirectionText = (direction) => {
    switch (direction) {
      case SWIPE_DIRECTIONS.LEFT: return 'Previous';
      case SWIPE_DIRECTIONS.RIGHT: return 'Next';
      case SWIPE_DIRECTIONS.UP: return 'Up';
      case SWIPE_DIRECTIONS.DOWN: return 'Down';
      default: return 'Swipe';
    }
  };

  return (
    <GestureWrapper
      ref={containerRef}
      className={className}
      {...props}
    >
      <ChartArea
        animate={{
          scale,
          x: position.x,
          y: position.y
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </ChartArea>

      {/* Touch points visualization */}
      <AnimatePresence>
        {touchPoints.map(point => (
          <TouchPoint
            key={point.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 0.7,
              x: point.x - 10,
              y: point.y - 10
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </AnimatePresence>

      {/* Swipe direction indicator */}
      <AnimatePresence>
        {swipeDirection && (
          <SwipeIndicator
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Icon name={getSwipeDirectionIcon(swipeDirection)} size={16} />
            {getSwipeDirectionText(swipeDirection)}
          </SwipeIndicator>
        )}
      </AnimatePresence>

      {/* Zoom indicator */}
      <AnimatePresence>
        {(isZooming || scale !== 1) && enableZoom && (
          <ZoomIndicator
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Icon name="zoom-in" size={16} />
            <Typography variant="caption">
              {(scale * 100).toFixed(0)}%
            </Typography>
            {scale !== 1 && (
              <button
                onClick={handleDoubleReset}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                <Icon name="refresh" size={14} />
              </button>
            )}
          </ZoomIndicator>
        )}
      </AnimatePresence>

      {/* Gesture hints */}
      <AnimatePresence>
        {showGestureHint && isTouchDevice() && (
          <GestureIndicator
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <Icon name="hand" size={24} />
            <Typography variant="caption" align="center">
              Swipe to navigate
            </Typography>
            {enableZoom && (
              <Typography variant="caption" align="center">
                Pinch to zoom
              </Typography>
            )}
            <Typography variant="caption" align="center" color="secondary">
              Tap for details
            </Typography>
          </GestureIndicator>
        )}
      </AnimatePresence>
    </GestureWrapper>
  );
};

export default MobileChartGestures;