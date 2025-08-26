import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import analytics from '../services/analytics.js';

// Main analytics hook
export function useAnalytics() {
  return {
    identify: analytics.identify.bind(analytics),
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackFormSubmission: analytics.trackFormSubmission.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackConversion: analytics.trackConversion.bind(analytics),
    setUserProperties: analytics.setUserProperties.bind(analytics),
    debug: analytics.debug.bind(analytics)
  };
}

// Auto-track page views on route changes
export function usePageTracking() {
  const location = useLocation();
  const prevLocationRef = useRef();

  useEffect(() => {
    // Don't track on initial load (already tracked in analytics initialization)
    if (prevLocationRef.current) {
      analytics.trackPageView(location.pathname, document.title);
    }
    prevLocationRef.current = location;
  }, [location]);
}

// Track form interactions
export function useFormTracking(formName) {
  const trackField = (fieldName, value) => {
    analytics.trackFormField(fieldName, value, formName);
  };

  const trackSubmission = (success = true, errorMessage = null) => {
    analytics.trackFormSubmission(formName, success, errorMessage);
  };

  const trackFieldFocus = (fieldName) => {
    analytics.trackEvent('form_field_focus', {
      field_name: fieldName,
      form_name: formName,
      category: 'Form'
    });
  };

  const trackFieldBlur = (fieldName, value) => {
    analytics.trackEvent('form_field_blur', {
      field_name: fieldName,
      form_name: formName,
      has_value: !!value,
      category: 'Form'
    });
  };

  return {
    trackField,
    trackSubmission,
    trackFieldFocus,
    trackFieldBlur
  };
}

// Track feature usage with automatic timing
export function useFeatureTracking(featureName) {
  const startTimeRef = useRef();

  const trackUsage = (action = 'used', properties = {}) => {
    analytics.trackFeatureUsage(featureName, action);
    
    if (action === 'started') {
      startTimeRef.current = Date.now();
    } else if (action === 'completed' && startTimeRef.current) {
      const duration = Date.now() - startTimeRef.current;
      analytics.trackEvent('feature_duration', {
        feature_name: featureName,
        duration,
        category: 'Features',
        ...properties
      });
      startTimeRef.current = null;
    }
  };

  const trackStart = (properties) => trackUsage('started', properties);
  const trackComplete = (properties) => trackUsage('completed', properties);
  const trackCancel = (properties) => trackUsage('cancelled', properties);

  return {
    trackUsage,
    trackStart,
    trackComplete,
    trackCancel
  };
}

// Track search interactions
export function useSearchTracking() {
  const trackSearch = (query, resultsCount, category = null, filters = {}) => {
    analytics.trackSearch(query, resultsCount, category);
    
    // Track additional search metadata
    analytics.trackEvent('search_details', {
      search_term: query,
      results_count: resultsCount,
      category,
      filters: JSON.stringify(filters),
      has_filters: Object.keys(filters).length > 0
    });
  };

  const trackSearchResultClick = (query, resultIndex, resultId) => {
    analytics.trackEvent('search_result_click', {
      search_term: query,
      result_index: resultIndex,
      result_id: resultId,
      category: 'Search'
    });
  };

  const trackSearchFilter = (filterType, filterValue, query) => {
    analytics.trackEvent('search_filter_applied', {
      filter_type: filterType,
      filter_value: filterValue,
      search_term: query,
      category: 'Search'
    });
  };

  return {
    trackSearch,
    trackSearchResultClick,
    trackSearchFilter
  };
}

// Track element visibility (intersection observer)
export function useVisibilityTracking(elementRef, eventName, threshold = 0.5) {
  const hasBeenVisible = useRef(false);

  useEffect(() => {
    if (!elementRef.current || hasBeenVisible.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            analytics.trackEvent(eventName, {
              element: entry.target.tagName,
              visibility_threshold: threshold,
              category: 'Visibility'
            });
            hasBeenVisible.current = true;
            observer.disconnect();
          }
        });
      },
      { threshold }
    );

    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [elementRef, eventName, threshold]);
}

// Track scroll depth
export function useScrollTracking(milestones = [25, 50, 75, 100]) {
  const trackedMilestones = useRef(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / documentHeight) * 100;

      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !trackedMilestones.current.has(milestone)) {
          analytics.trackEvent('scroll_depth', {
            milestone: `${milestone}%`,
            scroll_percent: Math.round(scrollPercent),
            page: window.location.pathname,
            category: 'Engagement'
          });
          trackedMilestones.current.add(milestone);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [milestones]);
}

// Track time on page with engagement detection
export function useTimeTracking() {
  const startTime = useRef(Date.now());
  const lastActivity = useRef(Date.now());
  const engagedTime = useRef(0);
  const isEngaged = useRef(true);

  useEffect(() => {
    const updateActivity = () => {
      if (!isEngaged.current) {
        isEngaged.current = true;
        startTime.current = Date.now();
      }
      lastActivity.current = Date.now();
    };

    const checkEngagement = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity.current;
      
      if (timeSinceActivity > 30000 && isEngaged.current) { // 30 seconds of inactivity
        engagedTime.current += now - startTime.current;
        isEngaged.current = false;
        
        analytics.trackEvent('user_idle', {
          engaged_time: engagedTime.current,
          idle_time: timeSinceActivity,
          category: 'Engagement'
        });
      }
    };

    // Track engagement
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    const engagementInterval = setInterval(checkEngagement, 5000);

    // Track final time on page unload
    const handleUnload = () => {
      const now = Date.now();
      if (isEngaged.current) {
        engagedTime.current += now - startTime.current;
      }
      
      analytics.trackEvent('page_exit', {
        total_time: now - startTime.current,
        engaged_time: engagedTime.current,
        engagement_rate: (engagedTime.current / (now - startTime.current)) * 100,
        page: window.location.pathname,
        category: 'Engagement'
      });
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(engagementInterval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);
}

// Track performance metrics
export function usePerformanceTracking() {
  useEffect(() => {
    // Track Web Vitals if not already being tracked
    if ('performance' in window && 'PerformanceObserver' in window) {
      // Track long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            analytics.trackPerformance('long_task', entry.duration);
          }
        }
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task API not supported
      }

      // Track layout shifts
      const layoutShiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.value > 0.1) { // Significant layout shifts
            analytics.trackPerformance('layout_shift', entry.value);
          }
        }
      });

      try {
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Layout shift API not supported
      }

      return () => {
        longTaskObserver.disconnect();
        layoutShiftObserver.disconnect();
      };
    }
  }, []);
}

// HOC for automatic component tracking
export function withAnalyticsTracking(Component, componentName) {
  return function AnalyticsWrapper(props) {
    const { trackEvent } = useAnalytics();

    useEffect(() => {
      trackEvent('component_mount', {
        component_name: componentName,
        category: 'Components'
      });

      return () => {
        trackEvent('component_unmount', {
          component_name: componentName,
          category: 'Components'
        });
      };
    }, [trackEvent]);

    return <Component {...props} />;
  };
}

export default useAnalytics;