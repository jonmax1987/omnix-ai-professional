import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';

const VirtualContainer = styled.div`
  height: ${props => props.height}px;
  width: 100%;
  overflow: auto;
  position: relative;
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
`;

const ScrollArea = styled.div`
  position: relative;
  width: 100%;
`;

const ViewportContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  transform: translateY(${props => props.offsetY}px);
`;

const ItemContainer = styled(motion.div)`
  position: relative;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  &:hover {
    background: ${props => props.theme.colors.background.hover};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[4]};
  gap: ${props => props.theme.spacing[2]};
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[8]};
  gap: ${props => props.theme.spacing[2]};
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
`;

const ScrollIndicator = styled.div`
  position: absolute;
  right: 4px;
  top: 4px;
  bottom: 4px;
  width: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  pointer-events: none;
`;

const ScrollThumb = styled(motion.div)`
  width: 100%;
  background: ${props => props.theme.colors.primary[400]};
  border-radius: 4px;
  opacity: ${props => props.visible ? 0.7 : 0};
  transition: opacity 0.2s ease;
`;

const GridContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['columns', 'gap'].includes(prop),
})`
  display: grid;
  grid-template-columns: repeat(${props => props.columns}, 1fr);
  gap: ${props => props.gap}px;
  padding: ${props => props.theme.spacing[2]};
`;

const GridItem = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary[300]};
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

// Hook for virtual scrolling calculations
const useVirtualScroll = ({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
  getItemHeight
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  
  const scrollTimeoutRef = useRef();

  // Calculate which items are visible
  const visibleRange = useMemo(() => {
    if (!items.length) return { start: 0, end: 0, offsetY: 0 };

    let start = 0;
    let end = 0;
    let offsetY = 0;
    let accumulatedHeight = 0;

    if (getItemHeight) {
      // Variable height items
      for (let i = 0; i < items.length; i++) {
        const currentItemHeight = getItemHeight(i);
        
        if (accumulatedHeight + currentItemHeight > scrollTop && start === 0) {
          start = Math.max(0, i - overscan);
          offsetY = accumulatedHeight - (i - start) * (getItemHeight(start) || itemHeight);
        }
        
        if (accumulatedHeight > scrollTop + containerHeight && end === 0) {
          end = Math.min(items.length, i + overscan);
          break;
        }
        
        accumulatedHeight += currentItemHeight;
      }
      
      if (end === 0) end = items.length;
    } else {
      // Fixed height items
      start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      end = Math.min(
        items.length,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
      );
      offsetY = start * itemHeight;
    }

    return { start, end, offsetY };
  }, [items.length, itemHeight, containerHeight, scrollTop, overscan, getItemHeight]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    if (getItemHeight) {
      return items.reduce((acc, _, index) => acc + getItemHeight(index), 0);
    }
    return items.length * itemHeight;
  }, [items.length, itemHeight, getItemHeight]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set new timeout
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    visibleRange,
    totalHeight,
    isScrolling,
    handleScroll
  };
};

// Main Virtual Scroll Component
const VirtualScroll = ({
  items = [],
  itemHeight = 50,
  height = 400,
  width = '100%',
  renderItem,
  getItemHeight,
  overscan = 5,
  loading = false,
  loadingComponent,
  emptyComponent,
  className,
  onScroll,
  showScrollIndicator = true,
  estimatedItemSize = 50,
  ...props
}) => {
  const containerRef = useRef(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  const {
    visibleRange,
    totalHeight,
    isScrolling,
    handleScroll
  } = useVirtualScroll({
    items,
    itemHeight: getItemHeight ? estimatedItemSize : itemHeight,
    containerHeight: height,
    overscan,
    getItemHeight
  });

  // Measure container dimensions
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setContainerDimensions({ width, height });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const handleScrollEvent = useCallback((e) => {
    handleScroll(e);
    if (onScroll) onScroll(e);
  }, [handleScroll, onScroll]);

  // Calculate scroll indicator position
  const scrollIndicatorStyle = useMemo(() => {
    if (!totalHeight || !height) return { height: 0, top: 0 };
    
    const scrollPercentage = containerRef.current ? 
      containerRef.current.scrollTop / (totalHeight - height) : 0;
    const indicatorHeight = Math.max((height / totalHeight) * height, 20);
    const indicatorTop = scrollPercentage * (height - indicatorHeight);
    
    return {
      height: indicatorHeight,
      top: indicatorTop
    };
  }, [totalHeight, height, visibleRange]);

  // Render loading state
  if (loading) {
    return (
      <VirtualContainer height={height} style={{ width }} className={className}>
        {loadingComponent || (
          <LoadingContainer>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Icon name="refresh" size={20} />
            </motion.div>
            <Typography variant="body2">Loading items...</Typography>
          </LoadingContainer>
        )}
      </VirtualContainer>
    );
  }

  // Render empty state
  if (items.length === 0) {
    return (
      <VirtualContainer height={height} style={{ width }} className={className}>
        {emptyComponent || (
          <EmptyContainer>
            <Icon name="inbox" size={32} />
            <Typography variant="body2">No items to display</Typography>
            <Typography variant="caption" color="secondary">
              The list is currently empty
            </Typography>
          </EmptyContainer>
        )}
      </VirtualContainer>
    );
  }

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);

  return (
    <VirtualContainer
      ref={containerRef}
      height={height}
      style={{ width }}
      className={className}
      onScroll={handleScrollEvent}
      {...props}
    >
      <ScrollArea style={{ height: totalHeight }}>
        <ViewportContainer offsetY={visibleRange.offsetY}>
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.start + index;
            const currentItemHeight = getItemHeight ? getItemHeight(actualIndex) : itemHeight;
            
            return (
              <ItemContainer
                key={item.id || actualIndex}
                style={{ height: currentItemHeight }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                {renderItem(item, actualIndex, isScrolling)}
              </ItemContainer>
            );
          })}
        </ViewportContainer>
      </ScrollArea>

      {/* Scroll Indicator */}
      {showScrollIndicator && totalHeight > height && (
        <ScrollIndicator>
          <ScrollThumb
            visible={isScrolling}
            style={scrollIndicatorStyle}
            animate={{ opacity: isScrolling ? 0.7 : 0 }}
            transition={{ duration: 0.2 }}
          />
        </ScrollIndicator>
      )}
    </VirtualContainer>
  );
};

// Virtual Grid Component
const VirtualGrid = ({
  items = [],
  itemHeight = 200,
  itemWidth = 200,
  columns = 3,
  gap = 16,
  height = 400,
  width = '100%',
  renderItem,
  overscan = 5,
  loading = false,
  className,
  ...props
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate grid layout
  const gridLayout = useMemo(() => {
    const rowHeight = itemHeight + gap;
    const itemsPerRow = columns;
    const totalRows = Math.ceil(items.length / itemsPerRow);
    const totalHeight = totalRows * rowHeight - gap;

    const visibleStartRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const visibleEndRow = Math.min(
      totalRows,
      Math.ceil((scrollTop + height) / rowHeight) + overscan
    );

    const visibleItems = [];
    for (let row = visibleStartRow; row < visibleEndRow; row++) {
      for (let col = 0; col < itemsPerRow; col++) {
        const index = row * itemsPerRow + col;
        if (index < items.length) {
          visibleItems.push({
            item: items[index],
            index,
            x: col * (itemWidth + gap),
            y: row * rowHeight,
            row,
            col
          });
        }
      }
    }

    return {
      totalHeight,
      visibleItems,
      offsetY: visibleStartRow * rowHeight
    };
  }, [items, itemHeight, itemWidth, columns, gap, height, scrollTop, overscan]);

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  if (loading) {
    return (
      <VirtualContainer height={height} style={{ width }} className={className}>
        <LoadingContainer>
          <Icon name="refresh" size={20} />
          <Typography variant="body2">Loading grid...</Typography>
        </LoadingContainer>
      </VirtualContainer>
    );
  }

  if (items.length === 0) {
    return (
      <VirtualContainer height={height} style={{ width }} className={className}>
        <EmptyContainer>
          <Icon name="grid" size={32} />
          <Typography variant="body2">No items in grid</Typography>
        </EmptyContainer>
      </VirtualContainer>
    );
  }

  return (
    <VirtualContainer
      ref={containerRef}
      height={height}
      style={{ width }}
      className={className}
      onScroll={handleScroll}
      {...props}
    >
      <ScrollArea style={{ height: gridLayout.totalHeight }}>
        <div style={{ position: 'relative', transform: `translateY(${gridLayout.offsetY}px)` }}>
          {gridLayout.visibleItems.map(({ item, index, x, y }) => (
            <GridItem
              key={item.id || index}
              style={{
                position: 'absolute',
                left: x,
                top: y - gridLayout.offsetY,
                width: itemWidth,
                height: itemHeight
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {renderItem(item, index)}
            </GridItem>
          ))}
        </div>
      </ScrollArea>
    </VirtualContainer>
  );
};

// Infinite Scroll Component
const InfiniteScroll = ({
  items = [],
  itemHeight = 50,
  height = 400,
  hasMore = false,
  loading = false,
  onLoadMore,
  loadingThreshold = 100,
  renderItem,
  className,
  ...props
}) => {
  const containerRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(false);

  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    if (distanceFromBottom < loadingThreshold && hasMore && !loading) {
      if (!isNearBottom) {
        setIsNearBottom(true);
        onLoadMore?.();
      }
    } else {
      setIsNearBottom(false);
    }
  }, [hasMore, loading, loadingThreshold, onLoadMore, isNearBottom]);

  return (
    <VirtualScroll
      ref={containerRef}
      items={items}
      itemHeight={itemHeight}
      height={height}
      renderItem={renderItem}
      onScroll={handleScroll}
      className={className}
      {...props}
    >
      {/* Loading indicator at bottom */}
      {(loading || hasMore) && (
        <LoadingContainer>
          {loading && (
            <>
              <Icon name="refresh" size={16} />
              <Typography variant="caption">Loading more...</Typography>
            </>
          )}
          {!loading && hasMore && (
            <Typography variant="caption" color="secondary">
              Scroll down to load more
            </Typography>
          )}
        </LoadingContainer>
      )}
    </VirtualScroll>
  );
};

// Performance monitoring hook
const useVirtualScrollPerformance = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    visibleItems: 0,
    scrollFPS: 0
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  const measureRenderTime = useCallback((callback) => {
    const start = performance.now();
    callback();
    const end = performance.now();
    
    setMetrics(prev => ({
      ...prev,
      renderTime: end - start
    }));
  }, []);

  const trackScrollFPS = useCallback(() => {
    frameCountRef.current++;
    const now = performance.now();
    
    if (now - lastTimeRef.current >= 1000) {
      setMetrics(prev => ({
        ...prev,
        scrollFPS: frameCountRef.current
      }));
      
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }
    
    requestAnimationFrame(trackScrollFPS);
  }, []);

  useEffect(() => {
    trackScrollFPS();
  }, [trackScrollFPS]);

  return { metrics, measureRenderTime };
};

export {
  VirtualGrid,
  InfiniteScroll,
  useVirtualScroll,
  useVirtualScrollPerformance
};

export default VirtualScroll;