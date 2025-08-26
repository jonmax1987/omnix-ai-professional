// Sample test file to demonstrate Jest + React Testing Library configuration
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithTheme } from './setup';
import { 
  mockApiResponses, 
  generateTestData, 
  setupTestEnvironment,
  cleanupAfterTest 
} from './utils/testUtils';

// Sample component for testing
const SampleComponent = ({ onClick, loading = false }) => {
  return (
    <div data-testid="sample-component">
      <h1>Sample Component</h1>
      <p>This is a test component for Jest configuration</p>
      <button 
        onClick={onClick} 
        disabled={loading}
        data-testid="action-button"
      >
        {loading ? 'Loading...' : 'Click Me'}
      </button>
    </div>
  );
};

describe('Jest + React Testing Library Configuration', () => {
  let testEnv;
  
  beforeEach(() => {
    testEnv = setupTestEnvironment();
  });
  
  afterEach(() => {
    cleanupAfterTest();
  });
  
  describe('Basic Rendering', () => {
    it('should render the component correctly', () => {
      renderWithTheme(<SampleComponent />);
      
      expect(screen.getByTestId('sample-component')).toBeInTheDocument();
      expect(screen.getByText('Sample Component')).toBeInTheDocument();
      expect(screen.getByText('This is a test component for Jest configuration')).toBeInTheDocument();
    });
    
    it('should render button with correct text', () => {
      renderWithTheme(<SampleComponent />);
      
      const button = screen.getByTestId('action-button');
      expect(button).toHaveTextContent('Click Me');
      expect(button).not.toBeDisabled();
    });
    
    it('should show loading state', () => {
      renderWithTheme(<SampleComponent loading />);
      
      const button = screen.getByTestId('action-button');
      expect(button).toHaveTextContent('Loading...');
      expect(button).toBeDisabled();
    });
  });
  
  describe('User Interactions', () => {
    it('should handle click events', () => {
      const handleClick = vi.fn();
      renderWithTheme(<SampleComponent onClick={handleClick} />);
      
      const button = screen.getByTestId('action-button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
    
    it('should not trigger click when loading', () => {
      const handleClick = vi.fn();
      renderWithTheme(<SampleComponent onClick={handleClick} loading />);
      
      const button = screen.getByTestId('action-button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });
  
  describe('Mock Data Generation', () => {
    it('should generate test product data', () => {
      const product = generateTestData.product({ name: 'Custom Product' });
      
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name', 'Custom Product');
      expect(product).toHaveProperty('sku');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('stock');
    });
    
    it('should generate test customer data', () => {
      const customer = generateTestData.customer({ email: 'custom@test.com' });
      
      expect(customer).toHaveProperty('id');
      expect(customer).toHaveProperty('name');
      expect(customer).toHaveProperty('email', 'custom@test.com');
      expect(customer).toHaveProperty('segment');
    });
  });
  
  describe('Async Operations', () => {
    it('should handle async operations with waitFor', async () => {
      const AsyncComponent = () => {
        const [data, setData] = React.useState(null);
        
        React.useEffect(() => {
          setTimeout(() => {
            setData('Loaded Data');
          }, 100);
        }, []);
        
        return <div>{data || 'Loading...'}</div>;
      };
      
      renderWithTheme(<AsyncComponent />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Loaded Data')).toBeInTheDocument();
      });
    });
    
    it('should mock API responses', async () => {
      const mockFetch = vi.fn(() => mockApiResponses.success({ message: 'Success' }));
      
      const result = await mockFetch();
      
      expect(result.data).toEqual({ message: 'Success' });
      expect(result.status).toBe(200);
    });
  });
  
  describe('Environment Mocks', () => {
    it('should mock localStorage', () => {
      testEnv.localStorage.setItem('testKey', 'testValue');
      testEnv.localStorage.getItem.mockReturnValue('testValue');
      
      expect(testEnv.localStorage.setItem).toHaveBeenCalledWith('testKey', 'testValue');
      expect(testEnv.localStorage.getItem()).toBe('testValue');
    });
    
    it('should mock sessionStorage', () => {
      testEnv.sessionStorage.setItem('sessionKey', 'sessionValue');
      testEnv.sessionStorage.getItem.mockReturnValue('sessionValue');
      
      expect(testEnv.sessionStorage.setItem).toHaveBeenCalledWith('sessionKey', 'sessionValue');
      expect(testEnv.sessionStorage.getItem()).toBe('sessionValue');
    });
  });
  
  describe('Snapshot Testing', () => {
    it('should match snapshot', () => {
      const { container } = renderWithTheme(<SampleComponent />);
      
      expect(container.firstChild).toMatchSnapshot();
    });
  });
  
  describe('Coverage Testing', () => {
    it('should have complete test coverage', () => {
      // This test demonstrates that our setup tracks coverage
      const testFunction = (value) => {
        if (value > 0) {
          return 'positive';
        } else if (value < 0) {
          return 'negative';
        } else {
          return 'zero';
        }
      };
      
      expect(testFunction(1)).toBe('positive');
      expect(testFunction(-1)).toBe('negative');
      expect(testFunction(0)).toBe('zero');
    });
  });
});

// React import for the async component test
import React from 'react';