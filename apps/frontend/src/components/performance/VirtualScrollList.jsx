/**
 * VirtualScrollList Component - PERF-003: Virtual scrolling for large datasets
 * High-performance virtual scrolling component for rendering large lists efficiently
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const VirtualScrollContainer = styled.div`
  position: relative;
  width: 100%;
  height: ${props => props.height || '400px'};
  overflow: auto;
  scroll-behavior: smooth;
  
  /* Custom scrollbar for better UX */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background.secondary};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border.default};
    border-radius: 4px;
    
    &:hover {
      background: ${props => props.theme.colors.border.strong};
    }
  }
`;

const VirtualScrollContent = styled.div`
  position: relative;
  width: 100%;
  height: ${props => props.totalHeight}px;
`;

const VirtualScrollViewport = styled.div`
  position: absolute;
  top: ${props => props.offsetY}px;
  left: 0;
  right: 0;
  width: 100%;
`;

const VirtualListItem = styled(motion.div)`
  width: 100%;
  position: relative;
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[4]};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const ScrollTopButton = styled(motion.button)`
  position: absolute;
  bottom: ${props => props.theme.spacing[4]};
  right: ${props => props.theme.spacing[4]};
  z-index: 10;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary[500]};
  color: white;
  border: none;
  box-shadow: ${props => props.theme.shadows.lg};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${props => props.theme.colors.primary[600]};
  }
`;

/**
 * Hook for calculating virtual scroll parameters
 */
function useVirtualScroll({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
  threshold = 100
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  // Calculate visible range
  const { startIndex, endIndex, offsetY } = useMemo(() => {
    if (!items.length || !itemHeight) {
      return { startIndex: 0, endIndex: 0, offsetY: 0 };
    }

    const visibleItemCount = Math.ceil(containerHeight / itemHeight);
    const startIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIdx = Math.min(
      items.length - 1,
      startIdx + visibleItemCount + overscan * 2
    );

    return {
      startIndex: startIdx,
      endIndex: endIdx,
      offsetY: startIdx * itemHeight
    };
  }, [scrollTop, items.length, itemHeight, containerHeight, overscan]);

  // Handle scroll events
  const handleScroll = useCallback((event) => {
    const newScrollTop = event.target.scrollTop;
    setScrollTop(newScrollTop);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set scrolling to false after scroll stops
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  // Calculate total height
  const totalHeight = items.length * itemHeight;

  // Get visible items
  const visibleItems = items.slice(startIndex, endIndex + 1);

  return {
    startIndex,
    endIndex,
    offsetY,
    totalHeight,
    visibleItems,
    isScrolling,
    scrollTop,
    handleScroll
  };
}

/**
 * Hook for dynamic item heights (more complex scenarios)
 */
function useDynamicVirtualScroll({
  items,
  estimatedItemHeight = 50,
  containerHeight,
  overscan = 5
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [itemHeights, setItemHeights] = useState(new Map());
  const scrollTimeoutRef = useRef(null);
  const itemRefs = useRef(new Map());

  // Measure item heights
  const measureItem = useCallback((index, element) => {
    if (element) {
      const height = element.getBoundingClientRect().height;
      setItemHeights(prev => {
        const newMap = new Map(prev);
        newMap.set(index, height);
        return newMap;
      });
      itemRefs.current.set(index, element);
    }
  }, []);

  // Calculate positions and visible range
  const { startIndex, endIndex, offsetY, totalHeight, itemPositions } = useMemo(() => {
    let totalH = 0;
    const positions = [];

    // Calculate cumulative positions
    for (let i = 0; i < items.length; i++) {
      positions.push(totalH);
      const height = itemHeights.get(i) || estimatedItemHeight;
      totalH += height;
    }

    // Find visible range
    let startIdx = 0;
    let endIdx = items.length - 1;

    // Binary search for start index
    let left = 0;
    let right = positions.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (positions[mid] <= scrollTop) {
        startIdx = mid;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    // Find end index
    const viewportBottom = scrollTop + containerHeight;
    for (let i = startIdx; i < positions.length; i++) {
      if (positions[i] > viewportBottom) {
        endIdx = i - 1;
        break;
      }
    }

    // Apply overscan
    startIdx = Math.max(0, startIdx - overscan);
    endIdx = Math.min(items.length - 1, endIdx + overscan);

    return {
      startIndex: startIdx,
      endIndex: endIdx,
      offsetY: positions[startIdx] || 0,
      totalHeight: totalH,
      itemPositions: positions
    };
  }, [scrollTop, items.length, itemHeights, estimatedItemHeight, containerHeight, overscan]);

  // Handle scroll
  const handleScroll = useCallback((event) => {
    const newScrollTop = event.target.scrollTop;
    setScrollTop(newScrollTop);
    setIsScrolling(true);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  const visibleItems = items.slice(startIndex, endIndex + 1);

  return {
    startIndex,
    endIndex,
    offsetY,
    totalHeight,
    visibleItems,
    isScrolling,
    scrollTop,
    itemPositions,
    measureItem,
    handleScroll
  };
}

/**
 * Basic Virtual Scroll List Component
 */
const VirtualScrollList = ({
  items = [],
  itemHeight = 50,
  height = '400px',
  renderItem,
  overscan = 5,
  className,
  loading = false,
  onScroll,
  onScrollEnd,
  showScrollTop = true,
  itemKey = 'id',
  ...props
}) => {
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(400);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

  // Parse height to number
  const numericHeight = useMemo(() => {
    if (typeof height === 'number') return height;
    if (typeof height === 'string') {
      return parseInt(height.replace('px', ''), 10) || 400;
    }
    return 400;
  }, [height]);

  // Update container height
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          setContainerHeight(entry.contentRect.height);
        }
      });
      
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const {
    startIndex,
    endIndex,
    offsetY,
    totalHeight,
    visibleItems,
    isScrolling,
    scrollTop,
    handleScroll
  } = useVirtualScroll({
    items,
    itemHeight,
    containerHeight: numericHeight,
    overscan
  });

  // Enhanced scroll handler
  const enhancedHandleScroll = useCallback((event) => {
    handleScroll(event);
    onScroll?.(event, { scrollTop: event.target.scrollTop, isScrolling });
    
    // Show/hide scroll to top button
    setShowScrollTopButton(event.target.scrollTop > 200);
    
    // Check if scrolled to end
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      onScrollEnd?.();
    }
  }, [handleScroll, onScroll, onScrollEnd, isScrolling]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Scroll to item
  const scrollToItem = useCallback((index) => {
    if (containerRef.current) {
      const top = index * itemHeight;
      containerRef.current.scrollTo({ top, behavior: 'smooth' });
    }
  }, [itemHeight]);

  // Render loading state
  if (loading && items.length === 0) {
    return (
      <VirtualScrollContainer height={height} className={className} {...props}>
        <LoadingIndicator>Loading items...</LoadingIndicator>
      </VirtualScrollContainer>
    );
  }

  return (
    <VirtualScrollContainer
      ref={containerRef}
      height={height}
      className={className}
      onScroll={enhancedHandleScroll}
      {...props}
    >
      <VirtualScrollContent totalHeight={totalHeight}>
        <VirtualScrollViewport offsetY={offsetY}>
          <AnimatePresence mode="popLayout">
            {visibleItems.map((item, index) => {
              const actualIndex = startIndex + index;
              const key = typeof itemKey === 'function' ? itemKey(item, actualIndex) : item[itemKey] || actualIndex;
              
              return (
                <VirtualListItem
                  key={key}
                  style={{ height: itemHeight }}
                  initial={isScrolling ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderItem(item, actualIndex)}
                </VirtualListItem>
              );
            })}
          </AnimatePresence>
        </VirtualScrollViewport>
      </VirtualScrollContent>

      {/* Loading indicator for infinite scroll */}
      {loading && items.length > 0 && (
        <LoadingIndicator>Loading more items...</LoadingIndicator>
      )}

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && showScrollTopButton && (
          <ScrollTopButton
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ↑
          </ScrollTopButton>
        )}
      </AnimatePresence>
    </VirtualScrollContainer>
  );
};

/**
 * Advanced Virtual Scroll List with Dynamic Heights
 */
export const DynamicVirtualScrollList = ({
  items = [],
  estimatedItemHeight = 50,
  height = '400px',
  renderItem,
  overscan = 5,
  className,
  loading = false,
  onScroll,
  onScrollEnd,
  showScrollTop = true,
  itemKey = 'id',
  ...props
}) => {
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(400);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

  const numericHeight = useMemo(() => {
    if (typeof height === 'number') return height;
    if (typeof height === 'string') {
      return parseInt(height.replace('px', ''), 10) || 400;
    }
    return 400;
  }, [height]);

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          setContainerHeight(entry.contentRect.height);
        }
      });
      
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const {
    startIndex,
    endIndex,
    offsetY,
    totalHeight,
    visibleItems,
    isScrolling,
    scrollTop,
    measureItem,
    handleScroll
  } = useDynamicVirtualScroll({
    items,
    estimatedItemHeight,
    containerHeight: numericHeight,
    overscan
  });

  const enhancedHandleScroll = useCallback((event) => {
    handleScroll(event);
    onScroll?.(event, { scrollTop: event.target.scrollTop, isScrolling });
    setShowScrollTopButton(event.target.scrollTop > 200);
    
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      onScrollEnd?.();
    }
  }, [handleScroll, onScroll, onScrollEnd, isScrolling]);

  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  if (loading && items.length === 0) {
    return (
      <VirtualScrollContainer height={height} className={className} {...props}>
        <LoadingIndicator>Loading items...</LoadingIndicator>
      </VirtualScrollContainer>
    );
  }

  return (
    <VirtualScrollContainer
      ref={containerRef}
      height={height}
      className={className}
      onScroll={enhancedHandleScroll}
      {...props}
    >
      <VirtualScrollContent totalHeight={totalHeight}>
        <VirtualScrollViewport offsetY={offsetY}>
          <AnimatePresence mode="popLayout">
            {visibleItems.map((item, index) => {
              const actualIndex = startIndex + index;
              const key = typeof itemKey === 'function' ? itemKey(item, actualIndex) : item[itemKey] || actualIndex;
              
              return (
                <VirtualListItem
                  key={key}
                  ref={(el) => measureItem(actualIndex, el)}
                  initial={isScrolling ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderItem(item, actualIndex)}
                </VirtualListItem>
              );
            })}
          </AnimatePresence>
        </VirtualScrollViewport>
      </VirtualScrollContent>

      {loading && items.length > 0 && (
        <LoadingIndicator>Loading more items...</LoadingIndicator>
      )}

      <AnimatePresence>
        {showScrollTop && showScrollTopButton && (
          <ScrollTopButton
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ↑
          </ScrollTopButton>
        )}
      </AnimatePresence>
    </VirtualScrollContainer>
  );
};

export default VirtualScrollList;
export { useVirtualScroll, useDynamicVirtualScroll };