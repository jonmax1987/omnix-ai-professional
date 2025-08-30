import React from 'react';
import styled from 'styled-components';
import Button from './Button';
import Typography from './Typography';

// Safe Sentry import - handle cases where monitoring service doesn't exist
let Sentry = null;
try {
  Sentry = require('../../services/monitoring').Sentry;
} catch (error) {
  console.warn('Sentry monitoring service not available:', error.message);
  // Create a mock Sentry object to prevent errors
  Sentry = {
    withScope: (callback) => callback({ 
      setTag: () => {}, 
      setContext: () => {}, 
      setUser: () => {} 
    }),
    captureException: (error) => {
      console.error('Sentry not available, logging error:', error);
      return 'mock-error-id';
    },
    addBreadcrumb: () => {},
    withErrorBoundary: (component, options) => component
  };
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme?.spacing?.[6] || theme?.spacing?.xl || '1.5rem'};
  min-height: 400px;
  text-align: center;
  background: ${({ theme }) => theme?.colors?.background?.secondary || '#f1f5f9'};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme?.colors?.border?.default || '#e2e8f0'};
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${({ theme }) => theme?.spacing?.[4] || theme?.spacing?.lg || '1rem'};
  color: ${({ theme }) => theme?.colors?.error?.[500] || theme?.colors?.red?.[500] || '#ef4444'};
`;

const ErrorActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme?.spacing?.[3] || theme?.spacing?.md || '0.75rem'};
  margin-top: ${({ theme }) => theme?.spacing?.[4] || theme?.spacing?.lg || '1rem'};
  
  @media (max-width: ${({ theme }) => theme?.breakpoints?.sm || '640px'}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ErrorDetails = styled.details`
  margin-top: ${({ theme }) => theme?.spacing?.[4] || theme?.spacing?.lg || '1rem'};
  text-align: left;
  max-width: 600px;
  
  summary {
    cursor: pointer;
    font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || theme?.typography?.weights?.medium || 500};
    margin-bottom: ${({ theme }) => theme?.spacing?.[2] || theme?.spacing?.sm || '0.5rem'};
    color: ${({ theme }) => theme?.colors?.text?.secondary || '#64748b'};
  }
  
  pre {
    background: ${({ theme }) => theme?.colors?.background?.primary || '#f8fafc'};
    padding: ${({ theme }) => theme?.spacing?.[3] || theme?.spacing?.md || '0.75rem'};
    border-radius: 4px;
    font-size: 12px;
    overflow: auto;
    max-height: 200px;
    border: 1px solid ${({ theme }) => theme?.colors?.border?.subtle || '#e2e8f0'};
  }
`;

const FeedbackForm = styled.form`
  margin-top: ${({ theme }) => theme?.spacing?.[4] || theme?.spacing?.lg || '1rem'};
  max-width: 400px;
  
  textarea {
    width: 100%;
    min-height: 80px;
    padding: ${({ theme }) => theme?.spacing?.[2] || theme?.spacing?.sm || '0.5rem'};
    border: 1px solid ${({ theme }) => theme?.colors?.border?.default || '#e2e8f0'};
    border-radius: 4px;
    resize: vertical;
    font-family: inherit;
    
    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme?.colors?.primary?.[500] || theme?.colors?.primary?.main || '#0ea5e9'};
      box-shadow: 0 0 0 2px ${({ theme }) => theme?.colors?.primary?.[100] || theme?.colors?.primary?.light || 'rgba(14, 165, 233, 0.2)'};
    }
  }
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      showFeedback: false,
      feedback: ''
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Report to Sentry
    Sentry.withScope((scope) => {
      scope.setTag('errorBoundary', true);
      scope.setContext('errorInfo', errorInfo);
      scope.setContext('props', this.props);
      
      if (this.props.userId) {
        scope.setUser({ id: this.props.userId });
      }
      
      const eventId = Sentry.captureException(error);
      this.setState({ eventId });
    });

    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleShowFeedback = () => {
    this.setState({ showFeedback: true });
  };

  handleFeedbackSubmit = (e) => {
    e.preventDefault();
    
    if (this.state.feedback.trim() && this.state.eventId) {
      // captureUserFeedback is deprecated in newer Sentry versions
      // Use addBreadcrumb instead for user feedback
      Sentry.addBreadcrumb({
        category: 'user-feedback',
        message: this.state.feedback,
        level: 'info',
        data: {
          name: this.props.userEmail || 'Anonymous',
          email: this.props.userEmail || '',
          comments: this.state.feedback,
          event_id: this.state.eventId
        }
      });
      
      this.setState({ 
        showFeedback: false,
        feedback: ''
      });
      
      alert('Thank you for your feedback!');
    }
  };

  handleFeedbackChange = (e) => {
    this.setState({ feedback: e.target.value });
  };

  render() {
    if (this.state.hasError) {
      const { fallback, level = 'page' } = this.props;
      
      // Custom fallback
      if (fallback) {
        return fallback(this.state.error, this.state.errorInfo);
      }

      return (
        <ErrorContainer role="alert">
          <ErrorIcon>⚠️</ErrorIcon>
          
          <Typography variant="h2" color="error">
            {level === 'component' ? 'Component Error' : 'Something went wrong'}
          </Typography>
          
          <Typography variant="body1" color="secondary" style={{ marginTop: '1rem', maxWidth: '500px' }}>
            {level === 'component' 
              ? 'A component failed to render properly. This might be a temporary issue.'
              : 'We encountered an unexpected error. Our team has been notified and is working on a fix.'
            }
          </Typography>

          <ErrorActions>
            {level === 'page' && (
              <>
                <Button 
                  variant="primary" 
                  onClick={this.handleReload}
                >
                  Reload Page
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                >
                  Go to Dashboard
                </Button>
              </>
            )}
            
            {this.state.eventId && (
              <Button 
                variant="ghost" 
                onClick={this.handleShowFeedback}
              >
                Report Issue
              </Button>
            )}
          </ErrorActions>

          {this.state.showFeedback && (
            <FeedbackForm onSubmit={this.handleFeedbackSubmit}>
              <Typography variant="body2" style={{ marginBottom: '0.5rem' }}>
                Help us fix this issue by describing what you were doing:
              </Typography>
              <textarea
                value={this.state.feedback}
                onChange={this.handleFeedbackChange}
                placeholder="What were you trying to do when this error occurred?"
                required
              />
              <div style={{ marginTop: '0.5rem' }}>
                <Button type="submit" size="sm">
                  Send Feedback
                </Button>
              </div>
            </FeedbackForm>
          )}

          {import.meta.env.DEV && this.state.error && (
            <ErrorDetails>
              <summary>Error Details (Development)</summary>
              <pre>
                {this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </ErrorDetails>
          )}

          {this.state.eventId && import.meta.env.DEV && (
            <Typography variant="caption" color="secondary" style={{ marginTop: '1rem' }}>
              Error ID: {this.state.eventId}
            </Typography>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

// Component-level error boundary wrapper
export function withErrorBoundary(Component, errorBoundaryProps = {}) {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps} level="component">
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Sentry error boundary (alternative implementation)
export const SentryErrorBoundary = Sentry.withErrorBoundary(
  ({ children }) => children,
  {
    fallback: ({ error, resetError }) => (
      <ErrorContainer>
        <ErrorIcon>⚠️</ErrorIcon>
        <Typography variant="h2" color="error">
          Application Error
        </Typography>
        <Typography variant="body1" color="secondary" style={{ marginTop: '1rem' }}>
          Something went wrong. The error has been reported.
        </Typography>
        <ErrorActions>
          <Button variant="primary" onClick={resetError}>
            Try Again
          </Button>
        </ErrorActions>
      </ErrorContainer>
    ),
    beforeCapture: (scope) => {
      scope.setTag('errorBoundary', 'sentry');
    }
  }
);

export default ErrorBoundary;