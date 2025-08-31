/**
 * useInfiniteScroll Hook - PERF-003: Virtual scrolling for large datasets
 * Advanced infinite scrolling hook with virtual scrolling optimization
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLazyLoading } from './useLazyLoading';

/**
 * Hook for infinite scrolling with pagination
 */
export function useInfiniteScroll({
  fetchMore,
  hasMore = true,
  threshold = 0.8,
  initialPage = 1,
  pageSize = 20,
  enabled = true,
  resetTrigger = null
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [allItems, setAllItems] = useState([]);
  const [hasMoreItems, setHasMoreItems] = useState(hasMore);
  
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);
  const lastResetTrigger = useRef(resetTrigger);

  // Reset when trigger changes
  useEffect(() => {
    if (resetTrigger !== lastResetTrigger.current) {
      setPage(initialPage);
      setAllItems([]);
      setHasMoreItems(hasMore);
      setError(null);
      lastResetTrigger.current = resetTrigger;
    }
  }, [resetTrigger, initialPage, hasMore]);

  // Load more data
  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreItems || !enabled) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchMore(page, pageSize);
      
      if (result.data && Array.isArray(result.data)) {
        setAllItems(prev => [...prev, ...result.data]);
        setPage(prev => prev + 1);
        setHasMoreItems(result.hasMore !== false && result.data.length === pageSize);
      } else {
        setHasMoreItems(false);
      }
    } catch (err) {
      setError(err);
      console.error('Infinite scroll fetch error:', err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetchMore, page, pageSize, hasMoreItems, enabled]);

  // Intersection observer for automatic loading
  const { ref: observerRef } = useLazyLoading({
    threshold: 0.1,
    rootMargin: '100px',
    onVisible: () => {
      if (!loading && hasMoreItems && enabled) {
        loadMore();
      }
    }
  });

  // Manual trigger for load more
  const triggerLoadMore = useCallback(() => {
    if (!loading && hasMoreItems && enabled) {
      loadMore();
    }
  }, [loadMore, loading, hasMoreItems, enabled]);

  // Reset function
  const reset = useCallback(() => {
    setPage(initialPage);
    setAllItems([]);
    setHasMoreItems(hasMore);
    setError(null);
    setLoading(false);
    loadingRef.current = false;
  }, [initialPage, hasMore]);

  return {
    items: allItems,
    loading,
    error,
    hasMore: hasMoreItems,
    loadMore: triggerLoadMore,
    reset,
    sentinelRef: observerRef,
    page: page - 1 // Return current page (0-indexed)
  };
}

/**
 * Hook for infinite scrolling with search/filter capabilities
 */
export function useInfiniteScrollWithSearch({
  fetchMore,
  searchQuery = '',
  filters = {},
  hasMore = true,
  threshold = 0.8,
  pageSize = 20,
  debounceMs = 300,
  enabled = true
}) {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const debounceRef = useRef(null);

  // Debounce search query and filters
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setDebouncedFilters(filters);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, filters, debounceMs]);

  // Create reset trigger when search/filters change
  const resetTrigger = useMemo(() => 
    JSON.stringify({ query: debouncedQuery, filters: debouncedFilters }),
    [debouncedQuery, debouncedFilters]
  );

  // Enhanced fetch function with search/filters
  const enhancedFetchMore = useCallback(async (page, size) => {
    return fetchMore(page, size, debouncedQuery, debouncedFilters);
  }, [fetchMore, debouncedQuery, debouncedFilters]);

  const infiniteScroll = useInfiniteScroll({
    fetchMore: enhancedFetchMore,
    hasMore,
    threshold,
    pageSize,
    enabled,
    resetTrigger
  });

  return {
    ...infiniteScroll,
    searchQuery: debouncedQuery,
    filters: debouncedFilters,
    isSearching: searchQuery !== debouncedQuery || JSON.stringify(filters) !== JSON.stringify(debouncedFilters)
  };
}

/**
 * Hook for virtual infinite scrolling (combines virtual scrolling with infinite loading)
 */
export function useVirtualInfiniteScroll({
  fetchMore,
  itemHeight = 50,
  containerHeight = 400,
  hasMore = true,
  pageSize = 50,
  overscan = 5,
  threshold = 0.9, // Load more when 90% through current items
  enabled = true,
  resetTrigger = null
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  // Use infinite scroll hook
  const {
    items,
    loading,
    error,
    hasMore: hasMoreItems,
    loadMore,
    reset,
    page
  } = useInfiniteScroll({
    fetchMore,
    hasMore,
    pageSize,
    enabled,
    resetTrigger
  });

  // Calculate virtual scroll parameters
  const { startIndex, endIndex, offsetY, totalHeight, visibleItems } = useMemo(() => {
    if (!items.length) {
      return { startIndex: 0, endIndex: 0, offsetY: 0, totalHeight: 0, visibleItems: [] };
    }

    const visibleItemCount = Math.ceil(containerHeight / itemHeight);
    const startIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIdx = Math.min(items.length - 1, startIdx + visibleItemCount + overscan * 2);

    return {
      startIndex: startIdx,
      endIndex: endIdx,
      offsetY: startIdx * itemHeight,
      totalHeight: items.length * itemHeight,
      visibleItems: items.slice(startIdx, endIdx + 1)
    };
  }, [scrollTop, items, itemHeight, containerHeight, overscan]);

  // Handle scroll with infinite loading trigger
  const handleScroll = useCallback((event) => {
    const newScrollTop = event.target.scrollTop;
    setScrollTop(newScrollTop);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set scrolling to false after delay
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);

    // Check if we need to load more items
    if (hasMoreItems && !loading && enabled) {
      const scrollPercentage = newScrollTop / (totalHeight - containerHeight);
      if (scrollPercentage >= threshold) {
        loadMore();
      }
    }
  }, [totalHeight, containerHeight, threshold, hasMoreItems, loading, enabled, loadMore]);

  // Scroll to item
  const scrollToItem = useCallback((index) => {
    const top = index * itemHeight;
    return { top, behavior: 'smooth' };
  }, [itemHeight]);

  // Get loading state for specific range
  const isLoadingRange = useCallback((index) => {
    // Consider items near the end as potentially loading
    const loadingThreshold = Math.max(items.length - pageSize, 0);
    return loading && index >= loadingThreshold;
  }, [loading, items.length, pageSize]);

  return {
    // Virtual scroll data
    items,
    visibleItems,
    startIndex,
    endIndex,
    offsetY,
    totalHeight,
    
    // Scroll state
    scrollTop,
    isScrolling,
    handleScroll,
    scrollToItem,
    
    // Infinite scroll state
    loading,
    error,
    hasMore: hasMoreItems,
    loadMore,
    reset,
    page,
    
    // Utilities
    isLoadingRange
  };
}

/**
 * Hook for bidirectional infinite scrolling (load up and down)
 */
export function useBidirectionalInfiniteScroll({
  fetchMore, // (direction: 'up' | 'down', page, pageSize) => Promise
  initialPage = 0,
  pageSize = 20,
  hasMoreUp = true,
  hasMoreDown = true,
  enabled = true
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [upPage, setUpPage] = useState(initialPage);
  const [downPage, setDownPage] = useState(initialPage);
  const [hasMoreUpItems, setHasMoreUpItems] = useState(hasMoreUp);
  const [hasMoreDownItems, setHasMoreDownItems] = useState(hasMoreDown);
  
  const loadingRef = useRef({ up: false, down: false });

  // Load more in specific direction
  const loadMore = useCallback(async (direction) => {
    if (loadingRef.current[direction] || !enabled) return;

    const currentPage = direction === 'up' ? upPage : downPage;
    const hasMore = direction === 'up' ? hasMoreUpItems : hasMoreDownItems;
    
    if (!hasMore) return;

    loadingRef.current[direction] = true;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchMore(direction, currentPage, pageSize);
      
      if (result.data && Array.isArray(result.data)) {
        setItems(prev => {
          return direction === 'up' 
            ? [...result.data, ...prev]
            : [...prev, ...result.data];
        });

        if (direction === 'up') {
          setUpPage(prev => prev - 1);
          setHasMoreUpItems(result.hasMore !== false && result.data.length === pageSize);
        } else {
          setDownPage(prev => prev + 1);
          setHasMoreDownItems(result.hasMore !== false && result.data.length === pageSize);
        }
      } else {
        if (direction === 'up') {
          setHasMoreUpItems(false);
        } else {
          setHasMoreDownItems(false);
        }
      }
    } catch (err) {
      setError(err);
      console.error(`Bidirectional infinite scroll fetch error (${direction}):`, err);
    } finally {
      loadingRef.current[direction] = false;
      setLoading(Object.values(loadingRef.current).some(Boolean));
    }
  }, [fetchMore, upPage, downPage, hasMoreUpItems, hasMoreDownItems, pageSize, enabled]);

  // Load more up
  const loadMoreUp = useCallback(() => loadMore('up'), [loadMore]);
  
  // Load more down
  const loadMoreDown = useCallback(() => loadMore('down'), [loadMore]);

  // Reset
  const reset = useCallback(() => {
    setItems([]);
    setUpPage(initialPage);
    setDownPage(initialPage);
    setHasMoreUpItems(hasMoreUp);
    setHasMoreDownItems(hasMoreDown);
    setError(null);
    setLoading(false);
    loadingRef.current = { up: false, down: false };
  }, [initialPage, hasMoreUp, hasMoreDown]);

  return {
    items,
    loading,
    error,
    hasMoreUp: hasMoreUpItems,
    hasMoreDown: hasMoreDownItems,
    loadMoreUp,
    loadMoreDown,
    reset,
    upPage,
    downPage
  };
}

/**
 * Hook for performance monitoring of infinite scroll
 */
export function useInfiniteScrollPerformance() {
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageLoadTime: 0,
    totalLoadTime: 0,
    itemsLoaded: 0
  });

  const addMetric = useCallback((loadTime, itemCount, success = true) => {
    setMetrics(prev => {
      const newTotalRequests = prev.totalRequests + 1;
      const newSuccessful = success ? prev.successfulRequests + 1 : prev.successfulRequests;
      const newFailed = success ? prev.failedRequests : prev.failedRequests + 1;
      const newTotalLoadTime = prev.totalLoadTime + (loadTime || 0);
      const newAverageLoadTime = newSuccessful > 0 ? newTotalLoadTime / newSuccessful : 0;
      const newItemsLoaded = prev.itemsLoaded + (itemCount || 0);

      return {
        totalRequests: newTotalRequests,
        successfulRequests: newSuccessful,
        failedRequests: newFailed,
        averageLoadTime: newAverageLoadTime,
        totalLoadTime: newTotalLoadTime,
        itemsLoaded: newItemsLoaded
      };
    });
  }, []);

  const reset = useCallback(() => {
    setMetrics({
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLoadTime: 0,
      totalLoadTime: 0,
      itemsLoaded: 0
    });
  }, []);

  return {
    metrics,
    addMetric,
    reset
  };
}

export default useInfiniteScroll;