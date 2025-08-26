import { lazy, Suspense, useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';
import Spinner from '../atoms/Spinner';

const LoadingContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[8]};
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.spacing[2]};
  min-height: ${props => props.minHeight || '200px'};
`;

const LoadingIcon = styled(motion.div)`
  margin-bottom: ${props => props.theme.spacing[3]};
  color: ${props => props.theme.colors.primary[500]};
`;

const ProgressBar = styled.div`
  width: 200px;
  height: 4px;
  background: ${props => props.theme.colors.gray[200]};
  border-radius: 2px;
  overflow: hidden;
  margin: ${props => props.theme.spacing[3]} 0;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${props => props.theme.colors.primary[500]};
  border-radius: 2px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[8]};
  background: ${props => props.theme.colors.error[50]};
  border: 1px solid ${props => props.theme.colors.error[200]};
  border-radius: ${props => props.theme.spacing[2]};
  min-height: ${props => props.minHeight || '200px'};
`;

const RetryButton = styled.button`
  margin-top: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.primary[500]};
  color: white;
  border: none;
  border-radius: ${props => props.theme.spacing[1]};
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary[600]};
  }
`;

// Enhanced loading component with progress simulation
const LoadingFallback = ({ 
  message = "Loading...", 
  showProgress = false,
  minHeight,
  icon = "refresh" 
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!showProgress) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev; // Stop at 90% until actual load
        return prev + Math.random() * 20;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [showProgress]);

  return (
    <LoadingContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      minHeight={minHeight}
    >
      <LoadingIcon
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Icon name={icon} size={32} />
      </LoadingIcon>
      
      <Typography variant="body2" color="secondary" style={{ marginBottom: '8px' }}>
        {message}
      </Typography>
      
      {showProgress && (
        <ProgressBar>
          <ProgressFill
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </ProgressBar>
      )}
    </LoadingContainer>
  );
};

// Error boundary fallback
const ErrorFallback = ({ 
  error, 
  resetError, 
  message = "Failed to load component",
  minHeight 
}) => (
  <ErrorContainer minHeight={minHeight}>
    <Icon name="alert-triangle" size={32} color="#EF4444" />
    <Typography variant="body2" color="error" style={{ marginTop: '12px', textAlign: 'center' }}>
      {message}
    </Typography>
    {error && (
      <Typography variant="caption" color="secondary" style={{ marginTop: '8px', textAlign: 'center' }}>
        {error.message}
      </Typography>
    )}
    <RetryButton onClick={resetError}>
      Try Again
    </RetryButton>
  </ErrorContainer>
);

// HOC for lazy loading with enhanced features
const withLazyLoading = (
  importFunc,
  {
    fallback,
    errorFallback,
    loadingMessage = "Loading component...",
    showProgress = false,
    minHeight = "200px",
    preload = false,
    retryAttempts = 3,
    retryDelay = 1000
  } = {}
) => {
  let retryCount = 0;
  
  const LazyComponent = lazy(() => {
    return new Promise((resolve, reject) => {
      const attemptLoad = () => {
        importFunc()
          .then(resolve)
          .catch((error) => {
            retryCount++;
            if (retryCount < retryAttempts) {
              setTimeout(attemptLoad, retryDelay);
            } else {
              reject(error);
            }
          });
      };
      attemptLoad();
    });
  });

  const WrappedComponent = (props) => {
    const [error, setError] = useState(null);

    const resetError = () => {
      setError(null);
      retryCount = 0;
    };

    if (error) {
      return errorFallback ? 
        errorFallback(error, resetError) : 
        <ErrorFallback error={error} resetError={resetError} minHeight={minHeight} />;
    }

    return (
      <Suspense 
        fallback={
          fallback || 
          <LoadingFallback 
            message={loadingMessage} 
            showProgress={showProgress}
            minHeight={minHeight}
          />
        }
      >
        <LazyComponent {...props} />
      </Suspense>
    );
  };

  // Preload functionality
  if (preload) {
    // Preload after a short delay
    setTimeout(() => {
      importFunc().catch(() => {
        // Ignore preload errors
      });
    }, 100);
  }

  return WrappedComponent;
};

// Route-level lazy loading wrapper
const LazyRoute = ({ 
  component: Component, 
  loading = true,
  loadingMessage = "Loading page...",
  showProgress = true,
  ...props 
}) => {
  return (
    <Suspense 
      fallback={
        loading ? (
          <LoadingFallback 
            message={loadingMessage}
            showProgress={showProgress}
            minHeight="400px"
            icon="compass"
          />
        ) : null
      }
    >
      <Component {...props} />
    </Suspense>
  );
};

// Preloader utility for critical components
const preloadComponent = (importFunc) => {
  importFunc().catch(() => {
    // Ignore preload errors
  });
};

// Intersection Observer based lazy loading
const LazyOnVisible = ({ 
  children, 
  threshold = 0.1, 
  rootMargin = "50px",
  fallback = null,
  once = true 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin, once]);

  return (
    <div ref={setRef}>
      {isVisible ? children : fallback}
    </div>
  );
};

// Bundle analysis helper
const getBundleInfo = () => {
  if (typeof window !== 'undefined' && window.__CHUNK_INFO__) {
    return window.__CHUNK_INFO__;
  }
  return null;
};

// Performance metrics
const trackLoadingTime = (componentName, startTime = Date.now()) => {
  return () => {
    const loadTime = Date.now() - startTime;
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} loaded in ${loadTime}ms`);
    }
    
    // Send to analytics in production
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'component_load_time', {
        component_name: componentName,
        load_time: loadTime
      });
    }
  };
};

// Lazy loading with resource hints
const LazyWithResourceHints = ({ 
  importFunc, 
  moduleName,
  children,
  ...options 
}) => {
  useEffect(() => {
    // Add prefetch link for the module
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = `/chunks/${moduleName}.js`; // Adjust path as needed
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [moduleName]);

  const LazyComponent = withLazyLoading(importFunc, options);
  
  return <LazyComponent>{children}</LazyComponent>;
};

// Chunked lazy loading for large lists
const ChunkedLazyLoader = ({ 
  items = [], 
  chunkSize = 10,
  renderItem,
  loadingMessage = "Loading more items...",
  className 
}) => {
  const [loadedChunks, setLoadedChunks] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const visibleItems = items.slice(0, loadedChunks * chunkSize);
  const hasMore = visibleItems.length < items.length;

  const loadMore = async () => {
    setIsLoading(true);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setLoadedChunks(prev => prev + 1);
    setIsLoading(false);
  };

  useEffect(() => {
    // Auto-load when scrolled near bottom
    const handleScroll = () => {
      if (
        hasMore &&
        !isLoading &&
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading]);

  return (
    <div className={className}>
      {visibleItems.map((item, index) => renderItem(item, index))}
      
      {isLoading && (
        <LoadingFallback 
          message={loadingMessage}
          showProgress={false}
          minHeight="100px"
          icon="more-horizontal"
        />
      )}
      
      {hasMore && !isLoading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <button 
            onClick={loadMore}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Load More ({items.length - visibleItems.length} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export {
  LoadingFallback,
  ErrorFallback,
  withLazyLoading,
  LazyRoute,
  LazyOnVisible,
  LazyWithResourceHints,
  ChunkedLazyLoader,
  preloadComponent,
  getBundleInfo,
  trackLoadingTime
};

export default withLazyLoading;