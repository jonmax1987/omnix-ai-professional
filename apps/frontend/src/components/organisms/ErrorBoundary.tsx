import React, { Component, ErrorInfo, ReactNode, createContext, useContext, useState, FC, ComponentType } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// Error types
export interface ErrorDetails {
  error: Error;
  errorInfo: ErrorInfo;
  errorBoundary?: string;
  errorBoundaryProps?: Record<string, any>;
  timestamp: string;
  url: string;
  userAgent: string;
  componentStack: string;
  errorId: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  isRecovering: boolean;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: ErrorDetails, retry: () => void) => ReactNode;
  onError?: (error: ErrorDetails) => void;
  level?: 'page' | 'section' | 'component';
  name?: string;
  isolate?: boolean;
  enableRetry?: boolean;
  maxRetries?: number;
  showDetails?: boolean;
  reportToService?: boolean;
}

// Error context for nested error boundaries
const ErrorContext = createContext<{
  errors: ErrorDetails[];
  clearErrors: () => void;
}>({
  errors: [],
  clearErrors: () => {}
});

// Styled components
const ErrorContainer = styled(motion.div)<{ level: string }>`
  padding: ${props => props.level === 'page' ? '40px' : '20px'};
  background: ${props => props.theme?.colors?.background?.paper || '#fff'};
  border-radius: ${props => props.theme?.borders?.radius?.lg || '12px'};
  box-shadow: ${props => props.theme?.shadows?.lg || '0 4px 6px rgba(0,0,0,0.1)'};
  margin: ${props => props.level === 'page' ? '40px auto' : '20px 0'};
  max-width: ${props => props.level === 'page' ? '800px' : '100%'};
`;

const ErrorHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const ErrorIcon = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ef4444;
  border-radius: 50%;
  color: white;
  font-size: 24px;
`;

const ErrorTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.theme?.colors?.text?.primary || '#1f2937'};
  margin: 0;
`;

const ErrorMessage = styled.p`
  font-size: 16px;
  color: ${props => props.theme?.colors?.text?.secondary || '#6b7280'};
  line-height: 1.6;
  margin: 16px 0;
`;

const ErrorDetails = styled.details`
  margin-top: 24px;
  padding: 16px;
  background: ${props => props.theme?.colors?.background?.default || '#f9fafb'};
  border-radius: 8px;
  border: 1px solid ${props => props.theme?.colors?.divider || '#e5e7eb'};
`;

const ErrorSummary = styled.summary`
  cursor: pointer;
  font-weight: 500;
  color: ${props => props.theme?.colors?.text?.primary || '#1f2937'};
  user-select: none;
  
  &:hover {
    color: ${props => props.theme?.colors?.primary?.main || '#3b82f6'};
  }
`;

const ErrorStack = styled.pre`
  margin-top: 16px;
  padding: 16px;
  background: #1f2937;
  color: #f3f4f6;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
  font-family: 'Monaco', 'Courier New', monospace;
`;

const ErrorActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled(motion.button)<{ variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.variant === 'primary' ? `
    background: ${props.theme?.colors?.primary?.main || '#3b82f6'};
    color: white;
    border: none;
    
    &:hover {
      background: ${props.theme?.colors?.primary?.dark || '#2563eb'};
    }
  ` : `
    background: transparent;
    color: ${props.theme?.colors?.text?.primary || '#1f2937'};
    border: 1px solid ${props.theme?.colors?.divider || '#e5e7eb'};
    
    &:hover {
      background: ${props.theme?.colors?.background?.default || '#f9fafb'};
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Modern Error Boundary Component
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static defaultProps = {
    level: 'component',
    isolate: true,
    enableRetry: true,
    maxRetries: 3,
    showDetails: process.env.NODE_ENV === 'development',
    reportToService: true
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, name, reportToService } = this.props;
    
    const errorDetails: ErrorDetails = {
      error,
      errorInfo,
      errorBoundary: name || 'Unknown',
      errorBoundaryProps: this.props,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId || 'unknown'
    };
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Boundary: ${name || 'Unknown'}`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
    
    // Call error handler
    if (onError) {
      onError(errorDetails);
    }
    
    // Report to error service
    if (reportToService) {
      this.reportError(errorDetails);
    }
    
    // Store error in session storage for debugging
    this.storeErrorForDebugging(errorDetails);
  }

  private reportError(errorDetails: ErrorDetails): void {
    // Report to Sentry
    if (typeof (window as any).Sentry !== 'undefined') {
      (window as any).Sentry.captureException(errorDetails.error, {
        contexts: {
          errorBoundary: {
            name: this.props.name,
            level: this.props.level,
            errorId: errorDetails.errorId
          }
        },
        tags: {
          errorBoundary: this.props.name || 'unknown',
          level: this.props.level || 'component'
        },
        extra: {
          componentStack: errorDetails.componentStack,
          props: this.props
        }
      });
    }
    
    // Report to custom analytics
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'exception', {
        description: errorDetails.error.message,
        fatal: this.props.level === 'page',
        error_boundary: this.props.name
      });
    }
    
    // Report to backend
    this.sendErrorToBackend(errorDetails);
  }

  private async sendErrorToBackend(errorDetails: ErrorDetails): Promise<void> {
    try {
      await fetch('/api/v1/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...errorDetails,
          error: {
            message: errorDetails.error.message,
            stack: errorDetails.error.stack,
            name: errorDetails.error.name
          }
        })
      });
    } catch (error) {
      // Silently fail
      console.error('Failed to report error to backend:', error);
    }
  }

  private storeErrorForDebugging(errorDetails: ErrorDetails): void {
    try {
      const errors = JSON.parse(
        sessionStorage.getItem('errorBoundaryErrors') || '[]'
      );
      
      errors.push({
        ...errorDetails,
        error: {
          message: errorDetails.error.message,
          stack: errorDetails.error.stack,
          name: errorDetails.error.name
        }
      });
      
      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.shift();
      }
      
      sessionStorage.setItem('errorBoundaryErrors', JSON.stringify(errors));
    } catch (error) {
      // Storage might be full or disabled
    }
  }

  private handleRetry = (): void => {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.retryCount < maxRetries) {
      this.setState({
        isRecovering: true,
        retryCount: this.state.retryCount + 1
      });
      
      // Attempt recovery
      setTimeout(() => {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          errorId: null,
          isRecovering: false
        });
      }, 100);
    }
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, errorId, retryCount, isRecovering } = this.state;
    const { 
      children, 
      fallback, 
      level = 'component', 
      enableRetry = true,
      maxRetries = 3,
      showDetails = false,
      name
    } = this.props;

    if (hasError && error && errorInfo) {
      // Use custom fallback if provided
      if (fallback) {
        const errorDetails: ErrorDetails = {
          error,
          errorInfo,
          errorBoundary: name || 'Unknown',
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          componentStack: errorInfo.componentStack,
          errorId: errorId || 'unknown'
        };
        
        return fallback(errorDetails, this.handleRetry);
      }

      // Default error UI
      return (
        <AnimatePresence mode="wait">
          <ErrorContainer
            level={level}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ErrorHeader>
              <ErrorIcon>⚠️</ErrorIcon>
              <div>
                <ErrorTitle>
                  {level === 'page' 
                    ? 'Something went wrong' 
                    : 'Component Error'}
                </ErrorTitle>
                {errorId && showDetails && (
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                    Error ID: {errorId}
                  </div>
                )}
              </div>
            </ErrorHeader>

            <ErrorMessage>
              {level === 'page'
                ? "We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists."
                : `An error occurred in ${name || 'this component'}. The application may still work normally.`}
            </ErrorMessage>

            {error.message && showDetails && (
              <div style={{
                padding: '12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                marginTop: '16px'
              }}>
                <code style={{ color: '#dc2626', fontSize: '14px' }}>
                  {error.message}
                </code>
              </div>
            )}

            {showDetails && (
              <ErrorDetails>
                <ErrorSummary>View Error Details</ErrorSummary>
                <ErrorStack>
                  {error.stack}
                  {'\n\n'}
                  Component Stack:
                  {errorInfo.componentStack}
                </ErrorStack>
              </ErrorDetails>
            )}

            <ErrorActions>
              {enableRetry && retryCount < maxRetries && (
                <Button
                  variant="primary"
                  onClick={this.handleRetry}
                  disabled={isRecovering}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isRecovering ? 'Recovering...' : `Try Again (${retryCount}/${maxRetries})`}
                </Button>
              )}
              
              {level === 'page' && (
                <>
                  <Button
                    variant="secondary"
                    onClick={this.handleReload}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Reload Page
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={this.handleGoHome}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Go to Home
                  </Button>
                </>
              )}
            </ErrorActions>

            {retryCount >= maxRetries && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#92400e'
              }}>
                Maximum retry attempts reached. Please reload the page or contact support.
              </div>
            )}
          </ErrorContainer>
        </AnimatePresence>
      );
    }

    return children;
  }
}

// Hook to use error context
export const useErrorContext = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorContext must be used within ErrorProvider');
  }
  return context;
};

// Error provider for app-level error management
export const ErrorProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorDetails[]>([]);
  
  const clearErrors = () => setErrors([]);
  
  return (
    <ErrorContext.Provider value={{ errors, clearErrors }}>
      <ErrorBoundary level="page" name="AppRoot">
        {children}
      </ErrorBoundary>
    </ErrorContext.Provider>
  );
};

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}