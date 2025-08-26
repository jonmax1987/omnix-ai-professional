import { memo, useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { isEqual } from 'lodash-es';

// Deep comparison memo HOC
const withDeepMemo = (Component) => {
  return memo(Component, (prevProps, nextProps) => {
    return isEqual(prevProps, nextProps);
  });
};

// Shallow comparison memo HOC with custom comparison
const withShallowMemo = (Component, customCompare) => {
  return memo(Component, (prevProps, nextProps) => {
    if (customCompare) {
      return customCompare(prevProps, nextProps);
    }
    
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);
    
    if (prevKeys.length !== nextKeys.length) {
      return false;
    }
    
    return prevKeys.every(key => prevProps[key] === nextProps[key]);
  });
};

// Selective memo - only compare specific props
const withSelectiveMemo = (Component, propsToCompare = []) => {
  return memo(Component, (prevProps, nextProps) => {
    if (propsToCompare.length === 0) {
      return Object.keys(prevProps).every(key => prevProps[key] === nextProps[key]);
    }
    
    return propsToCompare.every(prop => 
      isEqual(prevProps[prop], nextProps[prop])
    );
  });
};

// Performance tracking memo
const withPerformanceMemo = (Component, componentName) => {
  return memo((props) => {
    const renderStartTime = useRef(performance.now());
    const [renderMetrics, setRenderMetrics] = useState({
      renderCount: 0,
      avgRenderTime: 0,
      lastRenderTime: 0
    });

    useEffect(() => {
      const renderTime = performance.now() - renderStartTime.current;
      
      setRenderMetrics(prev => {
        const newRenderCount = prev.renderCount + 1;
        const newAvgRenderTime = ((prev.avgRenderTime * prev.renderCount) + renderTime) / newRenderCount;
        
        // Log performance in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`${componentName} render #${newRenderCount}: ${renderTime.toFixed(2)}ms (avg: ${newAvgRenderTime.toFixed(2)}ms)`);
        }
        
        return {
          renderCount: newRenderCount,
          avgRenderTime: newAvgRenderTime,
          lastRenderTime: renderTime
        };
      });
      
      renderStartTime.current = performance.now();
    });

    return <Component {...props} __renderMetrics={renderMetrics} />;
  });
};

// Memoized callback with dependencies tracking
const useStableMemo = (factory, deps) => {
  const depsRef = useRef(deps);
  const resultRef = useRef();
  const isFirstRun = useRef(true);

  // Check if dependencies have changed
  const depsChanged = useMemo(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return true;
    }
    
    if (!deps || !depsRef.current) return true;
    if (deps.length !== depsRef.current.length) return true;
    
    return deps.some((dep, index) => !Object.is(dep, depsRef.current[index]));
  }, deps);

  if (depsChanged) {
    resultRef.current = factory();
    depsRef.current = deps;
  }

  return resultRef.current;
};

// Debounced callback hook
const useDebouncedCallback = (callback, delay, deps = []) => {
  const timeoutRef = useRef();
  
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay, ...deps]);
};

// Throttled callback hook
const useThrottledCallback = (callback, delay, deps = []) => {
  const lastCallRef = useRef(0);
  const timeoutRef = useRef();
  
  return useCallback((...args) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallRef.current;
    
    if (timeSinceLastCall >= delay) {
      lastCallRef.current = now;
      callback(...args);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        callback(...args);
      }, delay - timeSinceLastCall);
    }
  }, [callback, delay, ...deps]);
};

// Memoized state selector
const useStateSelector = (state, selector, deps = []) => {
  return useMemo(() => {
    if (typeof selector === 'function') {
      return selector(state);
    }
    return state[selector];
  }, [state, selector, ...deps]);
};

// Complex computation memoization
const useComputedValue = (computation, deps = [], options = {}) => {
  const { 
    cacheSize = 1,
    compareFn = Object.is,
    onCacheHit,
    onCacheMiss 
  } = options;
  
  const cacheRef = useRef([]);
  
  return useMemo(() => {
    // Check cache for existing computation
    const cacheEntry = cacheRef.current.find(entry => 
      entry.deps.length === deps.length &&
      entry.deps.every((dep, index) => compareFn(dep, deps[index]))
    );
    
    if (cacheEntry) {
      if (onCacheHit) onCacheHit(cacheEntry.result);
      return cacheEntry.result;
    }
    
    // Compute new value
    const result = computation();
    if (onCacheMiss) onCacheMiss(result);
    
    // Update cache
    const newEntry = { deps: [...deps], result };
    cacheRef.current.unshift(newEntry);
    
    // Limit cache size
    if (cacheRef.current.length > cacheSize) {
      cacheRef.current = cacheRef.current.slice(0, cacheSize);
    }
    
    return result;
  }, deps);
};

// Heavy operation hook with web worker
const useWebWorkerMemo = (workerScript, data, deps = []) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const workerRef = useRef(null);

  useEffect(() => {
    if (!workerScript || !data) return;

    setLoading(true);
    setError(null);

    // Create worker if it doesn't exist
    if (!workerRef.current) {
      try {
        workerRef.current = new Worker(workerScript);
      } catch (err) {
        setError(err);
        setLoading(false);
        return;
      }
    }

    const worker = workerRef.current;

    const handleMessage = (e) => {
      setResult(e.data.result);
      setLoading(false);
    };

    const handleError = (err) => {
      setError(err);
      setLoading(false);
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);

    // Send data to worker
    worker.postMessage({ data });

    return () => {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
    };
  }, deps);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  return { result, loading, error };
};

// Async computation with memoization
const useAsyncMemo = (asyncComputation, deps = [], initialValue = null) => {
  const [result, setResult] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cancelRef = useRef();

  useEffect(() => {
    let cancelled = false;
    
    // Cancel previous computation
    if (cancelRef.current) {
      cancelRef.current();
    }
    
    cancelRef.current = () => {
      cancelled = true;
    };

    setLoading(true);
    setError(null);

    const runComputation = async () => {
      try {
        const computationResult = await asyncComputation();
        
        if (!cancelled) {
          setResult(computationResult);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      }
    };

    runComputation();

    return () => {
      cancelled = true;
    };
  }, deps);

  return { result, loading, error };
};

// Optimized list rendering helper
const useVirtualizedList = (items, itemHeight, containerHeight, renderItem) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight)
    );
    
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }));
  }, [items, itemHeight, containerHeight, scrollTop]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    renderVirtualizedList: () => (
      <div style={{ height: containerHeight, overflow: 'auto' }} onScroll={handleScroll}>
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleItems.map(({ item, index, top }) => (
            <div
              key={item.id || index}
              style={{
                position: 'absolute',
                top,
                left: 0,
                right: 0,
                height: itemHeight
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    )
  };
};

// Render optimization detector
const useRenderOptimization = (componentName, props) => {
  const renderCountRef = useRef(0);
  const propsHistoryRef = useRef([]);
  const lastRenderTimeRef = useRef(performance.now());

  useEffect(() => {
    renderCountRef.current++;
    const renderTime = performance.now() - lastRenderTimeRef.current;
    
    // Store props history for analysis
    propsHistoryRef.current.push({
      props: { ...props },
      renderCount: renderCountRef.current,
      renderTime,
      timestamp: Date.now()
    });

    // Keep only last 10 renders
    if (propsHistoryRef.current.length > 10) {
      propsHistoryRef.current.shift();
    }

    // Analyze unnecessary re-renders in development
    if (process.env.NODE_ENV === 'development' && renderCountRef.current > 1) {
      const currentProps = propsHistoryRef.current[propsHistoryRef.current.length - 1].props;
      const previousProps = propsHistoryRef.current[propsHistoryRef.current.length - 2]?.props;

      if (previousProps) {
        const changedProps = Object.keys(currentProps).filter(
          key => !Object.is(currentProps[key], previousProps[key])
        );

        if (changedProps.length === 0) {
          console.warn(
            `${componentName} re-rendered without prop changes. Render #${renderCountRef.current}`
          );
        } else {
          console.log(
            `${componentName} re-rendered due to props: ${changedProps.join(', ')}`
          );
        }
      }
    }

    lastRenderTimeRef.current = performance.now();
  });

  return {
    renderCount: renderCountRef.current,
    propsHistory: propsHistoryRef.current
  };
};

// Batch state updates
const useBatchedUpdates = () => {
  const [updates, setUpdates] = useState([]);
  const timeoutRef = useRef();

  const batchUpdate = useCallback((updateFn) => {
    setUpdates(prev => [...prev, updateFn]);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setUpdates(currentUpdates => {
        // Apply all batched updates
        currentUpdates.forEach(update => update());
        return [];
      });
    }, 0);
  }, []);

  return batchUpdate;
};

// Expensive computation cache
const computationCache = new Map();

const useMemoWithCache = (computation, deps, cacheKey) => {
  return useMemo(() => {
    const key = cacheKey || JSON.stringify(deps);
    
    if (computationCache.has(key)) {
      return computationCache.get(key);
    }
    
    const result = computation();
    computationCache.set(key, result);
    
    // Limit cache size
    if (computationCache.size > 100) {
      const firstKey = computationCache.keys().next().value;
      computationCache.delete(firstKey);
    }
    
    return result;
  }, deps);
};

export {
  withDeepMemo,
  withShallowMemo,
  withSelectiveMemo,
  withPerformanceMemo,
  useStableMemo,
  useDebouncedCallback,
  useThrottledCallback,
  useStateSelector,
  useComputedValue,
  useWebWorkerMemo,
  useAsyncMemo,
  useVirtualizedList,
  useRenderOptimization,
  useBatchedUpdates,
  useMemoWithCache
};