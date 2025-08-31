/**
 * withMemoization HOC - PERF-004: Memoization of expensive components
 * Higher-order components for automatic memoization and performance optimization
 */

import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';
import { isEqual, pick, throttle, debounce } from 'lodash-es';
import { 
  useDeepMemo, 
  useTrackedMemo, 
  createMemoizedComponent 
} from '../../utils/memoization.jsx';

/**
 * Default comparison strategies
 */
const ComparisonStrategies = {
  // Shallow comparison (React.memo default)
  shallow: (prevProps, nextProps) => {
    const keys = Object.keys(prevProps);
    return keys.length === Object.keys(nextProps).length &&
      keys.every(key => prevProps[key] === nextProps[key]);
  },

  // Deep comparison
  deep: (prevProps, nextProps) => isEqual(prevProps, nextProps),

  // Compare only specific props
  selective: (propsToCompare) => (prevProps, nextProps) => {
    const prevSelected = pick(prevProps, propsToCompare);
    const nextSelected = pick(nextProps, propsToCompare);
    return isEqual(prevSelected, nextSelected);
  },

  // Ignore functions in comparison
  ignoreFunctions: (prevProps, nextProps) => {
    const filterFunctions = (obj) => 
      Object.entries(obj).reduce((acc, [key, value]) => {
        if (typeof value !== 'function') {
          acc[key] = value;
        }
        return acc;
      }, {});
    
    return isEqual(filterFunctions(prevProps), filterFunctions(nextProps));
  },

  // Custom comparison with threshold
  threshold: (threshold = 0.95) => (prevProps, nextProps) => {
    const keys = Object.keys(prevProps);
    const matchingKeys = keys.filter(key => prevProps[key] === nextProps[key]);
    return matchingKeys.length / keys.length >= threshold;
  }
};

/**
 * Basic memoization HOC
 */
export function withMemoization(Component, options = {}) {
  const {
    strategy = 'shallow',
    propsToCompare = null,
    displayName = Component.displayName || Component.name,
    debug = false
  } = options;

  let compareFunction;
  if (typeof strategy === 'function') {
    compareFunction = strategy;
  } else if (strategy === 'selective' && propsToCompare) {
    compareFunction = ComparisonStrategies.selective(propsToCompare);
  } else {
    compareFunction = ComparisonStrategies[strategy] || ComparisonStrategies.shallow;
  }

  const MemoizedComponent = memo(Component, (prevProps, nextProps) => {
    const areEqual = compareFunction(prevProps, nextProps);
    
    if (debug && process.env.NODE_ENV === 'development') {
      console.debug(
        `[Memoization] ${displayName} ${areEqual ? 'skipped' : 'rendered'}`,
        { prevProps, nextProps, areEqual }
      );
    }
    
    return areEqual;
  });

  MemoizedComponent.displayName = `withMemoization(${displayName})`;
  
  return MemoizedComponent;
}

/**
 * HOC for components with expensive computations
 */
export function withExpensiveComputation(Component, options = {}) {
  const {
    computations = {},
    cacheSize = 10,
    displayName = Component.displayName || Component.name
  } = options;

  const EnhancedComponent = (props) => {
    const computationCache = useRef(new Map());
    const renderCount = useRef(0);

    // Memoize each computation
    const memoizedComputations = useMemo(() => {
      const result = {};
      
      Object.entries(computations).forEach(([key, computation]) => {
        const cacheKey = JSON.stringify(props);
        const cached = computationCache.current.get(cacheKey);
        
        if (cached && cached[key]) {
          result[key] = cached[key];
        } else {
          const startTime = performance.now();
          result[key] = computation(props);
          const endTime = performance.now();
          
          if (process.env.NODE_ENV === 'development') {
            console.debug(
              `[Computation] ${displayName}.${key} took ${(endTime - startTime).toFixed(2)}ms`
            );
          }
          
          // Update cache
          if (computationCache.current.size >= cacheSize) {
            const firstKey = computationCache.current.keys().next().value;
            computationCache.current.delete(firstKey);
          }
          computationCache.current.set(cacheKey, {
            ...cached,
            [key]: result[key]
          });
        }
      });
      
      return result;
    }, [props]);

    useEffect(() => {
      renderCount.current += 1;
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[Render] ${displayName} rendered ${renderCount.current} times`);
      }
    });

    return <Component {...props} {...memoizedComputations} />;
  };

  EnhancedComponent.displayName = `withExpensiveComputation(${displayName})`;
  
  return memo(EnhancedComponent);
}

/**
 * HOC for throttled/debounced prop updates
 */
export function withThrottledProps(Component, options = {}) {
  const {
    throttleProps = [],
    debounceProps = [],
    throttleDelay = 300,
    debounceDelay = 500,
    displayName = Component.displayName || Component.name
  } = options;

  const EnhancedComponent = (props) => {
    const [throttledProps, setThrottledProps] = React.useState({});
    const [debouncedProps, setDebouncedProps] = React.useState({});

    // Create throttled setters
    const throttledSetters = useMemo(() => {
      const setters = {};
      throttleProps.forEach(prop => {
        setters[prop] = throttle((value) => {
          setThrottledProps(prev => ({ ...prev, [prop]: value }));
        }, throttleDelay);
      });
      return setters;
    }, []);

    // Create debounced setters
    const debouncedSetters = useMemo(() => {
      const setters = {};
      debounceProps.forEach(prop => {
        setters[prop] = debounce((value) => {
          setDebouncedProps(prev => ({ ...prev, [prop]: value }));
        }, debounceDelay);
      });
      return setters;
    }, []);

    // Update throttled props
    useEffect(() => {
      throttleProps.forEach(prop => {
        if (props[prop] !== undefined) {
          throttledSetters[prop](props[prop]);
        }
      });
    }, throttleProps.map(prop => props[prop]));

    // Update debounced props
    useEffect(() => {
      debounceProps.forEach(prop => {
        if (props[prop] !== undefined) {
          debouncedSetters[prop](props[prop]);
        }
      });
    }, debounceProps.map(prop => props[prop]));

    // Merge props
    const mergedProps = {
      ...props,
      ...throttledProps,
      ...debouncedProps
    };

    return <Component {...mergedProps} />;
  };

  EnhancedComponent.displayName = `withThrottledProps(${displayName})`;
  
  return memo(EnhancedComponent);
}

/**
 * HOC for lazy evaluation of props
 */
export function withLazyProps(Component, options = {}) {
  const {
    lazyProps = {},
    threshold = 100, // ms to wait before computing
    displayName = Component.displayName || Component.name
  } = options;

  const EnhancedComponent = (props) => {
    const [computedProps, setComputedProps] = React.useState({});
    const [isComputing, setIsComputing] = React.useState(false);

    useEffect(() => {
      const computeLazyProps = async () => {
        setIsComputing(true);
        const newProps = {};
        
        for (const [key, factory] of Object.entries(lazyProps)) {
          // Add delay for truly lazy evaluation
          await new Promise(resolve => setTimeout(resolve, threshold));
          
          if (typeof factory === 'function') {
            newProps[key] = await factory(props);
          }
        }
        
        setComputedProps(newProps);
        setIsComputing(false);
      };

      computeLazyProps();
    }, [props]);

    const finalProps = {
      ...props,
      ...computedProps,
      isComputingLazyProps: isComputing
    };

    return <Component {...finalProps} />;
  };

  EnhancedComponent.displayName = `withLazyProps(${displayName})`;
  
  return memo(EnhancedComponent);
}

/**
 * HOC for batch updates
 */
export function withBatchedUpdates(Component, options = {}) {
  const {
    batchDelay = 100,
    maxBatchSize = 10,
    displayName = Component.displayName || Component.name
  } = options;

  const EnhancedComponent = (props) => {
    const [batchedProps, setBatchedProps] = React.useState(props);
    const updateQueueRef = useRef([]);
    const timeoutRef = useRef();

    const processBatch = useCallback(() => {
      if (updateQueueRef.current.length === 0) return;
      
      const mergedProps = updateQueueRef.current.reduce(
        (acc, update) => ({ ...acc, ...update }),
        {}
      );
      
      setBatchedProps(prev => ({ ...prev, ...mergedProps }));
      updateQueueRef.current = [];
    }, []);

    const addToBatch = useCallback((update) => {
      updateQueueRef.current.push(update);
      
      if (updateQueueRef.current.length >= maxBatchSize) {
        processBatch();
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(processBatch, batchDelay);
      }
    }, [processBatch, batchDelay, maxBatchSize]);

    // Update batched props when props change
    useEffect(() => {
      const changedProps = {};
      Object.keys(props).forEach(key => {
        if (props[key] !== batchedProps[key]) {
          changedProps[key] = props[key];
        }
      });
      
      if (Object.keys(changedProps).length > 0) {
        addToBatch(changedProps);
      }
    }, [props]);

    return <Component {...batchedProps} />;
  };

  EnhancedComponent.displayName = `withBatchedUpdates(${displayName})`;
  
  return memo(EnhancedComponent);
}

/**
 * HOC for component profiling
 */
export function withProfiling(Component, options = {}) {
  const {
    name = Component.displayName || Component.name,
    logToConsole = true,
    onProfile = null
  } = options;

  const ProfiledComponent = (props) => {
    const renderCountRef = useRef(0);
    const mountTimeRef = useRef(Date.now());
    const renderTimesRef = useRef([]);

    useEffect(() => {
      renderCountRef.current += 1;
      const renderTime = Date.now() - mountTimeRef.current;
      renderTimesRef.current.push(renderTime);
      
      if (renderTimesRef.current.length > 100) {
        renderTimesRef.current.shift();
      }
      
      const avgRenderTime = renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length;
      
      const profileData = {
        component: name,
        renderCount: renderCountRef.current,
        lastRenderTime: renderTime,
        avgRenderTime,
        mountTime: mountTimeRef.current
      };
      
      if (logToConsole && process.env.NODE_ENV === 'development') {
        console.debug('[Profile]', profileData);
      }
      
      onProfile?.(profileData);
    });

    return (
      <React.Profiler
        id={name}
        onRender={(id, phase, actualDuration, baseDuration, startTime, commitTime) => {
          if (process.env.NODE_ENV === 'development') {
            console.debug(`[Profiler] ${id} (${phase}) took ${actualDuration.toFixed(2)}ms`);
          }
        }}
      >
        <Component {...props} />
      </React.Profiler>
    );
  };

  ProfiledComponent.displayName = `withProfiling(${name})`;
  
  return memo(ProfiledComponent);
}

/**
 * Combine multiple optimization HOCs
 */
export function withOptimizations(Component, optimizations = []) {
  return optimizations.reduce((EnhancedComponent, optimization) => {
    const { type, options } = optimization;
    
    switch (type) {
      case 'memoization':
        return withMemoization(EnhancedComponent, options);
      case 'expensive':
        return withExpensiveComputation(EnhancedComponent, options);
      case 'throttled':
        return withThrottledProps(EnhancedComponent, options);
      case 'lazy':
        return withLazyProps(EnhancedComponent, options);
      case 'batched':
        return withBatchedUpdates(EnhancedComponent, options);
      case 'profiling':
        return withProfiling(EnhancedComponent, options);
      default:
        return EnhancedComponent;
    }
  }, Component);
}

export default withMemoization;