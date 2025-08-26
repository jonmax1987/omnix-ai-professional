// Analytics service for tracking user interactions and application performance
class Analytics {
  constructor() {
    this.config = {
      googleAnalytics: {
        id: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
        enabled: !!import.meta.env.VITE_GOOGLE_ANALYTICS_ID && import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
      },
      googleTagManager: {
        id: import.meta.env.VITE_GOOGLE_TAG_MANAGER_ID,
        enabled: !!import.meta.env.VITE_GOOGLE_TAG_MANAGER_ID && import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
      },
      mixpanel: {
        token: import.meta.env.VITE_MIXPANEL_TOKEN,
        enabled: !!import.meta.env.VITE_MIXPANEL_TOKEN && import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
      }
    };

    this.userId = null;
    this.userProperties = {};
    this.sessionId = this.generateSessionId();
    this.pageStartTime = Date.now();
    this.isInitialized = false;

    // Disable analytics in development by default
    if (import.meta.env.DEV && !import.meta.env.VITE_ENABLE_DEV_ANALYTICS) {
      console.log('Analytics disabled in development');
      return;
    }

    this.initialize();
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  initialize() {
    this.loadGoogleAnalytics();
    this.loadGoogleTagManager();
    this.loadMixpanel();
    
    // Track initial page view
    this.trackPageView();
    
    // Set up automatic tracking
    this.setupAutomaticTracking();
    
    this.isInitialized = true;
    console.log('Analytics initialized');
  }

  loadGoogleAnalytics() {
    if (!this.config.googleAnalytics.enabled) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalytics.id}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      dataLayer.push(arguments);
    };
    
    gtag('js', new Date());
    gtag('config', this.config.googleAnalytics.id, {
      page_title: document.title,
      page_location: window.location.href,
      custom_map: {
        custom_definition_1: 'session_id'
      }
    });

    // Set session ID
    gtag('config', this.config.googleAnalytics.id, {
      custom_definition_1: this.sessionId
    });

    console.log('Google Analytics loaded');
  }

  loadGoogleTagManager() {
    if (!this.config.googleTagManager.enabled) return;

    // GTM script
    const script = document.createElement('script');
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${this.config.googleTagManager.id}');
    `;
    document.head.appendChild(script);

    // GTM noscript
    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${this.config.googleTagManager.id}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    document.body.prepend(noscript);

    window.dataLayer = window.dataLayer || [];

    console.log('Google Tag Manager loaded');
  }

  loadMixpanel() {
    if (!this.config.mixpanel.enabled) return;

    const script = document.createElement('script');
    script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
    script.onload = () => {
      mixpanel.init(this.config.mixpanel.token, {
        debug: import.meta.env.DEV,
        track_pageview: false,
        persistence: 'localStorage'
      });
      console.log('Mixpanel loaded');
    };
    document.head.appendChild(script);
  }

  setupAutomaticTracking() {
    // Track time on page
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - this.pageStartTime;
      this.trackEvent('page_time', {
        duration: timeOnPage,
        page: window.location.pathname
      });
    });

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden');
      } else {
        this.trackEvent('page_visible');
        this.pageStartTime = Date.now(); // Reset timer
      }
    });

    // Track errors
    window.addEventListener('error', (event) => {
      this.trackEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent('unhandled_promise_rejection', {
        reason: event.reason?.toString() || 'Unknown'
      });
    });
  }

  // User identification
  identify(userId, properties = {}) {
    this.userId = userId;
    this.userProperties = { ...this.userProperties, ...properties };

    if (this.config.googleAnalytics.enabled && typeof gtag !== 'undefined') {
      gtag('config', this.config.googleAnalytics.id, {
        user_id: userId,
        custom_definition_2: properties.userType || 'anonymous'
      });
    }

    if (this.config.mixpanel.enabled && typeof mixpanel !== 'undefined') {
      mixpanel.identify(userId);
      mixpanel.people.set(properties);
    }

    if (this.config.googleTagManager.enabled && typeof dataLayer !== 'undefined') {
      dataLayer.push({
        event: 'user_identify',
        user_id: userId,
        user_properties: properties
      });
    }

    console.log('User identified:', userId, properties);
  }

  // Set user properties
  setUserProperties(properties) {
    this.userProperties = { ...this.userProperties, ...properties };

    if (this.config.mixpanel.enabled && typeof mixpanel !== 'undefined') {
      mixpanel.people.set(properties);
    }

    if (this.config.googleTagManager.enabled && typeof dataLayer !== 'undefined') {
      dataLayer.push({
        event: 'user_properties_updated',
        user_properties: properties
      });
    }
  }

  // Page view tracking
  trackPageView(page = window.location.pathname, title = document.title) {
    const pageData = {
      page_title: title,
      page_location: window.location.href,
      page_path: page,
      session_id: this.sessionId,
      user_id: this.userId,
      timestamp: Date.now()
    };

    if (this.config.googleAnalytics.enabled && typeof gtag !== 'undefined') {
      gtag('config', this.config.googleAnalytics.id, {
        page_title: title,
        page_location: window.location.href
      });
    }

    if (this.config.mixpanel.enabled && typeof mixpanel !== 'undefined') {
      mixpanel.track('Page View', pageData);
    }

    if (this.config.googleTagManager.enabled && typeof dataLayer !== 'undefined') {
      dataLayer.push({
        event: 'page_view',
        ...pageData
      });
    }

    // Reset page start time
    this.pageStartTime = Date.now();

    console.log('Page view tracked:', pageData);
  }

  // Event tracking
  trackEvent(eventName, properties = {}) {
    const eventData = {
      ...properties,
      session_id: this.sessionId,
      user_id: this.userId,
      timestamp: Date.now(),
      page: window.location.pathname,
      user_agent: navigator.userAgent
    };

    if (this.config.googleAnalytics.enabled && typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        event_category: properties.category || 'User Interaction',
        event_label: properties.label,
        value: properties.value,
        custom_definition_1: this.sessionId,
        ...properties
      });
    }

    if (this.config.mixpanel.enabled && typeof mixpanel !== 'undefined') {
      mixpanel.track(eventName, eventData);
    }

    if (this.config.googleTagManager.enabled && typeof dataLayer !== 'undefined') {
      dataLayer.push({
        event: eventName,
        ...eventData
      });
    }

    console.log(`Event tracked: ${eventName}`, eventData);
  }

  // E-commerce tracking
  trackPurchase(transactionData) {
    const {
      transaction_id,
      value,
      currency = 'USD',
      items = []
    } = transactionData;

    if (this.config.googleAnalytics.enabled && typeof gtag !== 'undefined') {
      gtag('event', 'purchase', {
        transaction_id,
        value,
        currency,
        items
      });
    }

    if (this.config.mixpanel.enabled && typeof mixpanel !== 'undefined') {
      mixpanel.track('Purchase', {
        ...transactionData,
        session_id: this.sessionId
      });
    }

    if (this.config.googleTagManager.enabled) {
      dataLayer.push({
        event: 'purchase',
        ecommerce: {
          transaction_id,
          value,
          currency,
          items
        }
      });
    }
  }

  // Form tracking
  trackFormSubmission(formName, success = true, errorMessage = null) {
    this.trackEvent('form_submission', {
      form_name: formName,
      success,
      error_message: errorMessage,
      category: 'Form'
    });
  }

  trackFormField(fieldName, value, formName) {
    this.trackEvent('form_field_interaction', {
      field_name: fieldName,
      form_name: formName,
      has_value: !!value,
      category: 'Form'
    });
  }

  // Search tracking
  trackSearch(query, results_count, category = null) {
    this.trackEvent('search', {
      search_term: query,
      results_count,
      category,
      label: query
    });
  }

  // Performance tracking
  trackPerformance(metric, value, category = 'Performance') {
    this.trackEvent('performance_metric', {
      metric_name: metric,
      metric_value: value,
      category
    });
  }

  // Feature usage tracking
  trackFeatureUsage(feature, action = 'used') {
    this.trackEvent('feature_usage', {
      feature_name: feature,
      action,
      category: 'Features'
    });
  }

  // Error tracking
  trackError(error, context = {}) {
    this.trackEvent('application_error', {
      error_message: error.message || error.toString(),
      error_stack: error.stack,
      context,
      category: 'Errors'
    });
  }

  // A/B Test tracking
  trackExperiment(experimentName, variant) {
    this.trackEvent('experiment_viewed', {
      experiment_name: experimentName,
      variant_name: variant,
      category: 'Experiments'
    });

    // Set user property for segmentation
    this.setUserProperties({
      [`experiment_${experimentName}`]: variant
    });
  }

  // Custom conversion goals
  trackConversion(goalName, value = null) {
    this.trackEvent('conversion', {
      goal_name: goalName,
      conversion_value: value,
      category: 'Conversions'
    });
  }

  // Debug helper
  debug() {
    console.log('Analytics Debug Info:', {
      config: this.config,
      userId: this.userId,
      sessionId: this.sessionId,
      userProperties: this.userProperties,
      isInitialized: this.isInitialized
    });
  }
}

// Create singleton instance
const analytics = new Analytics();

// React hook for analytics
export const useAnalytics = () => {
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
};

export default analytics;