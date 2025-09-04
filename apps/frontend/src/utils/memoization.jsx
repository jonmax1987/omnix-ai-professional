/**
 * Memoization Utilities - PERF-004: Memoization of expensive components
 * Advanced memoization utilities for optimizing React components and computations
 */

import React, { useMemo, useCallback, useRef, useEffect, useState, memo, forwardRef as reactForwardRef } from 'react';
import { isEqual } from 'lodash-es';

/**
 * Deep comparison memoization for complex objects
 */
export function useDeepMemo(factory, deps) {
  const ref = useRef();
  const signalRef = useRef(0);

  if (!ref.current || !isEqual(deps, ref.current.deps)) {
    ref.current = {
      deps,
      value: factory()
    };
    signalRef.current += 1;
  }

  return ref.current.value;
}

/**
 * Deep comparison callback memoization
 */
export function useDeepCallback(callback, deps) {
  return useDeepMemo(() => callback, deps);
}

/**
 * Memoization with custom comparison function
 */
export function useCustomMemo(factory, deps, areEqual) {
  const ref = useRef();

  if (!ref.current || !areEqual(deps, ref.current.deps)) {
    ref.current = {
      deps,
      value: factory()
    };
  }

  return ref.current.value;
}

/**
 * Time-based memoization (TTL cache)
 */
export function useTimedMemo(factory, deps, ttl = 60000) {
  const ref = useRef();
  const now = Date.now();

  if (
    !ref.current ||
    !isEqual(deps, ref.current.deps) ||
    now - ref.current.timestamp > ttl
  ) {
    ref.current = {
      deps,
      value: factory(),
      timestamp: now
    };
  }

  return ref.current.value;
}

/**
 * Selective memoization based on prop paths
 */
export function useSelectiveMemo(factory, deps, paths) {
  const getSelectedValues = (obj) => {
    return paths.map(path => {
      const keys = path.split('.');
      let value = obj;
      for (const key of keys) {
        value = value?.[key];
      }
      return value;
    });
  };

  const selectedDeps = deps.map(dep => 
    typeof dep === 'object' && dep !== null ? getSelectedValues(dep) : dep
  );

  return useMemo(factory, selectedDeps.flat());
}

/**
 * Debounced memoization for rapidly changing values
 */
export function useDebouncedMemo(factory, deps, delay = 300) {
  const [debouncedDeps, setDebouncedDeps] = useState(deps);
  const timeoutRef = useRef();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedDeps(deps);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, deps);

  return useMemo(factory, debouncedDeps);
}

/**
 * Throttled memoization for high-frequency updates
 */
export function useThrottledMemo(factory, deps, interval = 1000) {
  const lastRunRef = useRef(0);
  const resultRef = useRef();
  const timeoutRef = useRef();

  const now = Date.now();
  const shouldRun = now - lastRunRef.current >= interval;

  if (shouldRun || !resultRef.current) {
    resultRef.current = factory();
    lastRunRef.current = now;
  }

  // Schedule an update after the throttle period
  useEffect(() => {
    if (!shouldRun) {
      const remaining = interval - (now - lastRunRef.current);
      timeoutRef.current = setTimeout(() => {
        resultRef.current = factory();
        lastRunRef.current = Date.now();
      }, remaining);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, deps);

  return resultRef.current;
}

/**
 * LRU (Least Recently Used) cache memoization
 */
class LRUCache {
  constructor(maxSize = 10) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) {
      return undefined;
    }
    // Move to end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    // Remove if exists (to update position)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // Add to end
    this.cache.set(key, value);
    // Remove oldest if over capacity
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  clear() {
    this.cache.clear();
  }
}

export function useLRUMemo(factory, deps, options = {}) {
  const { maxSize = 10, keyGenerator = JSON.stringify } = options;
  const cacheRef = useRef(new LRUCache(maxSize));
  
  const key = keyGenerator(deps);
  const cached = cacheRef.current.get(key);
  
  if (cached !== undefined) {
    return cached;
  }
  
  const value = factory();
  cacheRef.current.set(key, value);
  return value;
}

/**
 * Async memoization for promises
 */
export function useAsyncMemo(asyncFactory, deps, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    asyncFactory()
      .then(result => {
        if (!cancelled && isMountedRef.current) {
          setValue(result);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled && isMountedRef.current) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { value, loading, error };
}

/**
 * Weak memoization for object references
 */
const weakMemoCache = new WeakMap();

export function useWeakMemo(factory, objectDep) {
  if (!objectDep || typeof objectDep !== 'object') {
    return factory();
  }

  if (weakMemoCache.has(objectDep)) {
    return weakMemoCache.get(objectDep);
  }

  const value = factory();
  weakMemoCache.set(objectDep, value);
  return value;
}

/**
 * Computation tracking memoization
 */
export function useTrackedMemo(factory, deps, name = 'computation') {
  const countRef = useRef(0);
  const timeRef = useRef(0);

  const value = useMemo(() => {
    const startTime = performance.now();
    const result = factory();
    const endTime = performance.now();
    
    countRef.current += 1;
    timeRef.current = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Memoization] ${name} computed (${countRef.current}x, ${timeRef.current.toFixed(2)}ms)`);
    }
    
    return result;
  }, deps);

  return {
    value,
    computeCount: countRef.current,
    lastComputeTime: timeRef.current
  };
}

/**
 * Lazy initialization memoization
 */
export function useLazyMemo(factory) {
  const ref = useRef();
  
  if (!ref.current) {
    ref.current = { value: factory() };
  }
  
  return ref.current.value;
}

/**
 * Progressive memoization for incremental computation
 */
export function useProgressiveMemo(factory, deps, options = {}) {
  const { chunkSize = 100, delay = 0 } = options;
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    setProgress(0);
    setIsComplete(false);

    const compute = async () => {
      const generator = factory();
      let current = 0;
      let chunk = [];
      
      for (const item of generator) {
        if (abortRef.current) break;
        
        chunk.push(item);
        current++;
        
        if (chunk.length >= chunkSize) {
          setResult(prev => [...(prev || []), ...chunk]);
          setProgress(current);
          chunk = [];
          
          if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      if (chunk.length > 0 && !abortRef.current) {
        setResult(prev => [...(prev || []), ...chunk]);
        setProgress(current);
      }
      
      setIsComplete(true);
    };

    compute();

    return () => {
      abortRef.current = true;
    };
  }, deps);

  return { result, progress, isComplete };
}

/**
 * Memoization with invalidation
 */
export function useInvalidatableMemo(factory, deps) {
  const [invalidationToken, setInvalidationToken] = useState(0);
  
  const value = useMemo(
    () => factory(),
    [...deps, invalidationToken]
  );
  
  const invalidate = useCallback(() => {
    setInvalidationToken(prev => prev + 1);
  }, []);
  
  return [value, invalidate];
}

/**
 * Conditional memoization
 */
export function useConditionalMemo(factory, deps, shouldMemoize = true) {
  const ref = useRef();
  
  if (!shouldMemoize) {
    return factory();
  }
  
  if (!ref.current || !isEqual(deps, ref.current.deps)) {
    ref.current = {
      deps,
      value: factory()
    };
  }
  
  return ref.current.value;
}

/**
 * Multi-level memoization
 */
export function useMultiLevelMemo(factories, deps) {
  return useMemo(() => {
    const results = [];
    for (let i = 0; i < factories.length; i++) {
      const factory = factories[i];
      const prevResults = results.slice(0, i);
      results.push(factory(...prevResults));
    }
    return results[results.length - 1];
  }, deps);
}

/**
 * Create a memoized component with automatic prop comparison
 */
export function createMemoizedComponent(Component, options = {}) {
  const {
    compareProps = isEqual,
    displayName = Component.displayName || Component.name,
    forwardRef = false
  } = options;

  const MemoizedComponent = memo(
    forwardRef ? reactForwardRef(Component) : Component,
    compareProps
  );
  
  MemoizedComponent.displayName = `Memoized(${displayName})`;
  
  return MemoizedComponent;
}

/**
 * Performance monitoring wrapper for memoization
 */
export function withMemoizationMetrics(Component, name = Component.name) {
  return memo((props) => {
    const renderCountRef = useRef(0);
    const renderTimeRef = useRef(0);
    
    useEffect(() => {
      renderCountRef.current += 1;
      
      if (process.env.NODE_ENV === 'development') {
        console.debug(
          `[Memoization Metrics] ${name} rendered ${renderCountRef.current} times`
        );
      }
    });
    
    const startTime = performance.now();
    const result = <Component {...props} />;
    renderTimeRef.current = performance.now() - startTime;
    
    return result;
  });
}