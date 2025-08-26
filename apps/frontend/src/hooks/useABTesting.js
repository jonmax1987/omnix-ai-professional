// A/B Testing Hook for OMNIX AI
// Custom hook for managing A/B testing functionality
import { useState, useEffect, useCallback, useRef } from 'react';
import { abTestingService } from '../services/api';
import { wsService } from '../services/api';

/**
 * Custom hook for A/B testing management
 * @param {Object} options - Hook configuration options
 * @returns {Object} A/B testing state and methods
 */
export const useABTesting = (options = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 60000, // 1 minute
    realTimeUpdates = true
  } = options;

  // State management
  const [tests, setTests] = useState([]);
  const [activeTests, setActiveTests] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testResults, setTestResults] = useState(new Map());
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs for cleanup
  const refreshTimer = useRef(null);
  const mounted = useRef(true);

  /**
   * Fetch all A/B tests
   */
  const fetchTests = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await abTestingService.listAllTests(params);
      
      if (mounted.current) {
        setTests(response.data || []);
        setActiveTests(response.data?.filter(test => test.status === 'running') || []);
      }
      
      return response;
    } catch (err) {
      if (mounted.current) {
        setError(err.message || 'Failed to fetch A/B tests');
        console.error('Failed to fetch A/B tests:', err);
      }
      throw err;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Fetch available models for testing
   */
  const fetchAvailableModels = useCallback(async () => {
    try {
      const response = await abTestingService.getAvailableModels();
      
      if (mounted.current) {
        setAvailableModels(response.data || []);
      }
      
      return response;
    } catch (err) {
      console.error('Failed to fetch available models:', err);
      return { data: [] };
    }
  }, []);

  /**
   * Create a new A/B test
   */
  const createTest = useCallback(async (testConfig) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate configuration
      const validation = abTestingService.validateTestConfig(testConfig);
      if (!validation.isValid) {
        throw new Error(`Invalid test configuration: ${validation.errors.join(', ')}`);
      }
      
      const response = await abTestingService.createTest(testConfig);
      
      // Refresh tests list
      await fetchTests();
      
      return response;
    } catch (err) {
      if (mounted.current) {
        setError(err.message || 'Failed to create A/B test');
      }
      throw err;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [fetchTests]);

  /**
   * Create a quick test with predefined templates
   */
  const createQuickTest = useCallback(async (quickTestConfig) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await abTestingService.createQuickTest(quickTestConfig);
      
      // Refresh tests list
      await fetchTests();
      
      return response;
    } catch (err) {
      if (mounted.current) {
        setError(err.message || 'Failed to create quick A/B test');
      }
      throw err;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [fetchTests]);

  /**
   * Get test results with caching
   */
  const getTestResults = useCallback(async (testId, options = {}) => {
    try {
      // Check if we already have cached results
      if (testResults.has(testId) && !options.forceRefresh) {
        const cached = testResults.get(testId);
        const cacheAge = Date.now() - cached.timestamp;
        if (cacheAge < 30000) { // 30 second cache
          return cached.data;
        }
      }

      const response = await abTestingService.getTestResults(testId, options);
      
      // Cache the results
      if (mounted.current) {
        const newResults = new Map(testResults);
        newResults.set(testId, {
          data: response,
          timestamp: Date.now()
        });
        setTestResults(newResults);
      }
      
      return response;
    } catch (err) {
      console.error(`Failed to fetch results for test ${testId}:`, err);
      throw err;
    }
  }, [testResults]);

  /**
   * Activate/start an A/B test
   */
  const activateTest = useCallback(async (testId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await abTestingService.activateTest(testId);
      
      // Refresh tests list
      await fetchTests();
      
      return response;
    } catch (err) {
      if (mounted.current) {
        setError(err.message || 'Failed to activate A/B test');
      }
      throw err;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [fetchTests]);

  /**
   * Deactivate/pause an A/B test
   */
  const deactivateTest = useCallback(async (testId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await abTestingService.deactivateTest(testId);
      
      // Refresh tests list
      await fetchTests();
      
      return response;
    } catch (err) {
      if (mounted.current) {
        setError(err.message || 'Failed to deactivate A/B test');
      }
      throw err;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [fetchTests]);

  /**
   * Delete an A/B test
   */
  const deleteTest = useCallback(async (testId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await abTestingService.deleteTest(testId);
      
      // Remove from cached results
      if (testResults.has(testId)) {
        const newResults = new Map(testResults);
        newResults.delete(testId);
        setTestResults(newResults);
      }
      
      // Refresh tests list
      await fetchTests();
      
      return response;
    } catch (err) {
      if (mounted.current) {
        setError(err.message || 'Failed to delete A/B test');
      }
      throw err;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [fetchTests, testResults]);

  /**
   * Get test analytics
   */
  const getTestAnalytics = useCallback(async (testId) => {
    try {
      return await abTestingService.getTestAnalytics(testId);
    } catch (err) {
      console.error(`Failed to fetch analytics for test ${testId}:`, err);
      throw err;
    }
  }, []);

  /**
   * Export test results
   */
  const exportTestResults = useCallback(async (testId, format = 'csv') => {
    try {
      return await abTestingService.exportTestResults(testId, format);
    } catch (err) {
      console.error(`Failed to export results for test ${testId}:`, err);
      throw err;
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchTests(),
      fetchAvailableModels()
    ]);
  }, [fetchTests, fetchAvailableModels]);

  // Initialize hook
  useEffect(() => {
    mounted.current = true;
    
    const initialize = async () => {
      try {
        await Promise.all([
          fetchTests(),
          fetchAvailableModels()
        ]);
        
        if (mounted.current) {
          setIsInitialized(true);
        }
      } catch (err) {
        console.error('Failed to initialize A/B testing hook:', err);
      }
    };

    initialize();
    
    return () => {
      mounted.current = false;
    };
  }, [fetchTests, fetchAvailableModels]);

  // Set up auto-refresh
  useEffect(() => {
    if (!autoRefresh || !isInitialized) return;

    refreshTimer.current = setInterval(async () => {
      try {
        await fetchTests();
      } catch (err) {
        console.error('Auto-refresh failed:', err);
      }
    }, refreshInterval);

    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
        refreshTimer.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, isInitialized, fetchTests]);

  // Set up real-time updates via WebSocket
  useEffect(() => {
    if (!realTimeUpdates || !isInitialized) return;

    const handleABTestUpdate = (message) => {
      const { type, payload } = message;
      
      switch (type) {
        case 'ab_test.created':
        case 'ab_test.updated':
        case 'ab_test.status_changed':
          // Refresh tests on any A/B test update
          fetchTests().catch(console.error);
          break;
          
        case 'ab_test.results_updated':
          // Clear cached results for this test
          if (payload.testId && testResults.has(payload.testId)) {
            const newResults = new Map(testResults);
            newResults.delete(payload.testId);
            setTestResults(newResults);
          }
          break;
          
        default:
          // Handle other A/B test related events
          if (type.startsWith('ab_test.')) {
            fetchTests().catch(console.error);
          }
      }
    };

    // Subscribe to A/B testing events
    wsService.subscribe('ab_tests', handleABTestUpdate);
    wsService.subscribe('ab_test.*', handleABTestUpdate);

    return () => {
      wsService.unsubscribe('ab_tests', handleABTestUpdate);
      wsService.unsubscribe('ab_test.*', handleABTestUpdate);
    };
  }, [realTimeUpdates, isInitialized, fetchTests, testResults]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, []);

  return {
    // State
    tests,
    activeTests,
    availableModels,
    loading,
    error,
    isInitialized,
    testResults: Object.fromEntries(testResults),
    
    // Actions
    fetchTests,
    createTest,
    createQuickTest,
    getTestResults,
    activateTest,
    deactivateTest,
    deleteTest,
    getTestAnalytics,
    exportTestResults,
    refresh,
    clearError,
    
    // Computed values
    totalTests: tests.length,
    runningTests: activeTests.length,
    completedTests: tests.filter(test => test.status === 'completed').length,
    pendingTests: tests.filter(test => test.status === 'pending').length
  };
};

/**
 * Hook for managing a single A/B test
 * @param {string} testId - Test identifier
 * @param {Object} options - Hook options
 * @returns {Object} Single test state and methods
 */
export const useABTest = (testId, options = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds for single test
    includeResults = true,
    includeAnalytics = false
  } = options;

  const [test, setTest] = useState(null);
  const [results, setResults] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshTimer = useRef(null);
  const mounted = useRef(true);

  // Fetch test data
  const fetchTest = useCallback(async () => {
    if (!testId) return;

    try {
      setLoading(true);
      setError(null);

      const [testData, resultsData, analyticsData] = await Promise.allSettled([
        abTestingService.getTest(testId),
        includeResults ? abTestingService.getTestResults(testId) : Promise.resolve(null),
        includeAnalytics ? abTestingService.getTestAnalytics(testId) : Promise.resolve(null)
      ]);

      if (mounted.current) {
        if (testData.status === 'fulfilled') {
          setTest(testData.value);
        }
        
        if (includeResults && resultsData.status === 'fulfilled') {
          setResults(resultsData.value);
        }
        
        if (includeAnalytics && analyticsData.status === 'fulfilled') {
          setAnalytics(analyticsData.value);
        }

        // Set error if test fetch failed
        if (testData.status === 'rejected') {
          setError(testData.reason?.message || 'Failed to fetch test');
        }
      }
    } catch (err) {
      if (mounted.current) {
        setError(err.message || 'Failed to fetch test data');
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [testId, includeResults, includeAnalytics]);

  // Initialize
  useEffect(() => {
    mounted.current = true;
    fetchTest();
    
    return () => {
      mounted.current = false;
    };
  }, [fetchTest]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !testId) return;

    refreshTimer.current = setInterval(fetchTest, refreshInterval);

    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [autoRefresh, refreshInterval, testId, fetchTest]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, []);

  return {
    test,
    results,
    analytics,
    loading,
    error,
    refresh: fetchTest,
    clearError: () => setError(null)
  };
};

export default useABTesting;