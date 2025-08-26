import { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { usePullToRefresh } from '../../hooks/useMobileGestures';
import { isTouchDevice } from '../../utils/mobileGestures';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';
import Spinner from '../atoms/Spinner';

const PullContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
`;

const PullIndicator = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]};
  box-shadow: ${props => props.theme.shadows.md};
  z-index: 10;
  min-width: 120px;
  backdrop-filter: blur(10px);
  pointer-events: none;
`;

const PullContent = styled(motion.div)`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
`;

const RefreshSpinner = styled(motion.div)`
  position: absolute;
  top: ${props => props.theme.spacing[4]};
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background: ${props => props.theme.colors.background.elevated};
  border-radius: 50%;
  padding: ${props => props.theme.spacing[2]};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const PullArrow = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['pullDistance', 'threshold'].includes(prop)
})`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => {
    if (props.pullDistance > props.threshold) {
      return props.theme.colors.success[500];
    } else if (props.pullDistance > props.threshold * 0.5) {
      return props.theme.colors.primary[500];
    }
    return props.theme.colors.text.secondary;
  }};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const PullText = styled(Typography).withConfig({
  shouldForwardProp: (prop) => !['pullDistance', 'threshold'].includes(prop)
}).attrs({
  variant: 'caption',
  weight: 'medium'
})`
  color: ${props => {
    if (props.pullDistance > props.threshold) {
      return props.theme.colors.success[500];
    } else if (props.pullDistance > props.threshold * 0.5) {
      return props.theme.colors.primary[500];
    }
    return props.theme.colors.text.secondary;
  }};
  text-align: center;
`;

const ProgressBar = styled(motion.div)`
  width: 60px;
  height: 3px;
  background: ${props => props.theme.colors.border.default};
  border-radius: 2px;
  overflow: hidden;
  margin-top: ${props => props.theme.spacing[1]};
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${props => {
    if (props.progress >= 1) {
      return props.theme.colors.success[500];
    } else if (props.progress > 0.5) {
      return props.theme.colors.primary[500];
    }
    return props.theme.colors.text.secondary;
  }};
  border-radius: 2px;
  transform-origin: left;
`;

const PULL_THRESHOLD = 80;
const MAX_PULL_DISTANCE = 150;

const PullToRefresh = ({
  children,
  onRefresh,
  refreshing = false,
  threshold = PULL_THRESHOLD,
  maxPullDistance = MAX_PULL_DISTANCE,
  disabled = false,
  showProgressBar = true,
  pullingText = 'Pull to refresh',
  releaseText = 'Release to refresh',
  refreshingText = 'Refreshing...',
  className,
  ...props
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [canRefresh, setCanRefresh] = useState(false);
  
  const contentRef = useRef(null);
  const startYRef = useRef(null);
  const isPullingRef = useRef(false);

  const handleTouchStart = (e) => {
    if (disabled || refreshing) return;
    
    const scrollTop = contentRef.current?.scrollTop || 0;
    if (scrollTop === 0) {
      startYRef.current = e.touches[0].clientY;
      setIsPulling(false);
    }
  };

  const handleTouchMove = (e) => {
    if (disabled || refreshing || startYRef.current === null) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startYRef.current);
    
    if (distance > 10) {
      // Prevent default scrolling when pulling
      e.preventDefault();
      
      if (!isPullingRef.current) {
        setIsPulling(true);
        isPullingRef.current = true;
      }
      
      // Apply resistance to pull distance
      const resistance = 0.6;
      const adjustedDistance = Math.min(
        distance * resistance,
        maxPullDistance
      );
      
      setPullDistance(adjustedDistance);
      setCanRefresh(adjustedDistance >= threshold);
      
      // Update content transform for visual feedback
      if (contentRef.current) {
        contentRef.current.style.transform = `translateY(${Math.min(adjustedDistance, threshold)}px)`;
        contentRef.current.style.transition = 'none';
      }
    }
  };

  const handleTouchEnd = () => {
    if (disabled || refreshing) return;
    
    if (isPullingRef.current) {
      if (canRefresh && onRefresh) {
        onRefresh();
      }
      
      // Reset pull state
      resetPull();
    }
    
    startYRef.current = null;
    isPullingRef.current = false;
  };

  const resetPull = () => {
    setIsPulling(false);
    setPullDistance(0);
    setCanRefresh(false);
    
    if (contentRef.current) {
      contentRef.current.style.transform = 'translateY(0)';
      contentRef.current.style.transition = 'transform 0.3s ease-out';
    }
  };

  // Reset when refreshing is complete
  useState(() => {
    if (!refreshing && isPullingRef.current) {
      resetPull();
    }
  }, [refreshing]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const arrowRotation = pullProgress * 180;

  const getPullText = () => {
    if (refreshing) return refreshingText;
    if (canRefresh) return releaseText;
    return pullingText;
  };

  const getPullIcon = () => {
    if (refreshing) return null;
    if (canRefresh) return 'refresh';
    return 'arrow-down';
  };

  // Only show on touch devices
  if (!isTouchDevice()) {
    return <div className={className} {...props}>{children}</div>;
  }

  return (
    <PullContainer
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {(isPulling || refreshing) && (
          <PullIndicator
            initial={{ opacity: 0, y: -60, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: Math.max(-40, pullDistance - 60),
              scale: Math.min(1, pullProgress + 0.8)
            }}
            exit={{ opacity: 0, y: -60, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {refreshing ? (
              <Spinner size={24} />
            ) : (
              <PullArrow
                pullDistance={pullDistance}
                threshold={threshold}
                animate={{ rotate: arrowRotation }}
                transition={{ duration: 0.2 }}
              >
                <Icon name={getPullIcon()} size={24} />
              </PullArrow>
            )}
            
            <PullText pullDistance={pullDistance} threshold={threshold}>
              {getPullText()}
            </PullText>
            
            {showProgressBar && !refreshing && (
              <ProgressBar>
                <ProgressFill
                  progress={pullProgress}
                  animate={{ scaleX: pullProgress }}
                  transition={{ duration: 0.1 }}
                />
              </ProgressBar>
            )}
          </PullIndicator>
        )}
      </AnimatePresence>

      {/* Refreshing spinner */}
      <AnimatePresence>
        {refreshing && (
          <RefreshSpinner
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Spinner size={20} />
          </RefreshSpinner>
        )}
      </AnimatePresence>

      {/* Content */}
      <PullContent
        ref={contentRef}
        style={{ pointerEvents: refreshing ? 'none' : 'auto' }}
      >
        {children}
      </PullContent>
    </PullContainer>
  );
};

export default PullToRefresh;