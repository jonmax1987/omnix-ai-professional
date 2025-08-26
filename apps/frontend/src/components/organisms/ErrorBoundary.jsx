import { Component } from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
  background: ${props => props.theme.colors.background.elevated};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const ErrorTitle = styled.h2`
  color: ${props => props.theme.colors.status.error};
  margin-bottom: 1rem;
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const ErrorMessage = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 2rem;
  max-width: 500px;
`;

const ErrorButton = styled.button`
  background: ${props => props.theme.colors.primary[600]};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.theme.colors.primary[700]};
  }
`;

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    console.error('Component stack:', errorInfo.componentStack);
    console.error('Error stack:', error.stack);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      return (
        <ErrorContainer>
          <ErrorTitle>Something went wrong</ErrorTitle>
          <ErrorMessage>
            {this.props.showError && this.state.error?.message 
              ? this.state.error.message 
              : 'An unexpected error occurred. Please try again.'}
          </ErrorMessage>
          <ErrorButton onClick={this.handleReset}>
            Try Again
          </ErrorButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;