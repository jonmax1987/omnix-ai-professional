// Test utilities for OMNIX AI testing
import { vi } from 'vitest';
import { renderWithTheme } from '../setup';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock API responses
export const mockApiResponses = {
  success: (data) => Promise.resolve({ data, status: 200 }),
  error: (message = 'API Error', status = 500) => 
    Promise.reject({ response: { data: { message }, status } }),
  loading: () => new Promise(() => {}) // Never resolves, simulates loading
};

// Create mock store for testing
export const createMockStore = (initialState = {}) => ({
  getState: vi.fn(() => initialState),
  setState: vi.fn(),
  subscribe: vi.fn(),
  destroy: vi.fn(),
  ...initialState
});

// Mock WebSocket for real-time features
export class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    this.onopen = null;
    this.onclose = null;
    this.onerror = null;
    this.onmessage = null;
    
    // Simulate connection after a tick
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) this.onopen();
    }, 0);
  }
  
  send(data) {
    // Mock send implementation
    return true;
  }
  
  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) this.onclose();
  }
  
  simulateMessage(data) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) });
    }
  }
  
  simulateError(error) {
    if (this.onerror) {
      this.onerror(error);
    }
  }
}

// Wait for async updates with better error handling
export const waitForAsync = async (callback, options = {}) => {
  const { timeout = 5000, interval = 50 } = options;
  
  return waitFor(callback, { timeout, interval });
};

// Test data generators
export const generateTestData = {
  product: (overrides = {}) => ({
    id: Math.random().toString(36).substr(2, 9),
    name: 'Test Product',
    sku: 'SKU-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
    price: 29.99,
    stock: 100,
    category: 'Test Category',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }),
  
  customer: (overrides = {}) => ({
    id: Math.random().toString(36).substr(2, 9),
    name: 'Test Customer',
    email: 'test@example.com',
    segment: 'regular',
    totalSpent: 1000,
    orderCount: 10,
    lastOrderDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    ...overrides
  }),
  
  order: (overrides = {}) => ({
    id: Math.random().toString(36).substr(2, 9),
    orderNumber: 'ORD-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    customerId: Math.random().toString(36).substr(2, 9),
    status: 'pending',
    total: 299.99,
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }),
  
  inventory: (overrides = {}) => ({
    id: Math.random().toString(36).substr(2, 9),
    productId: Math.random().toString(36).substr(2, 9),
    quantity: 100,
    location: 'Warehouse A',
    status: 'available',
    lastRestocked: new Date().toISOString(),
    depletionRate: 5,
    reorderPoint: 20,
    ...overrides
  })
};

// Custom queries for complex components
export const customQueries = {
  getMetricCard: (name) => {
    const cards = screen.getAllByTestId('metric-card');
    return cards.find(card => within(card).queryByText(name));
  },
  
  getChartByTitle: (title) => {
    const charts = screen.getAllByTestId('chart-container');
    return charts.find(chart => within(chart).queryByText(title));
  },
  
  getTableRow: (identifier) => {
    const rows = screen.getAllByRole('row');
    return rows.find(row => within(row).queryByText(identifier));
  }
};

// Accessibility testing helpers
export const a11yHelpers = {
  expectNoA11yViolations: async (container) => {
    const { axe } = await import('jest-axe');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  },
  
  checkKeyboardNavigation: async (element) => {
    const user = userEvent.setup();
    await user.tab();
    expect(element).toHaveFocus();
    
    await user.keyboard('{Enter}');
    await user.keyboard('{Space}');
    await user.keyboard('{Escape}');
    
    return true;
  },
  
  checkAriaAttributes: (element) => {
    const requiredAttrs = ['role', 'aria-label', 'aria-describedby'];
    const hasAttrs = requiredAttrs.some(attr => element.hasAttribute(attr));
    expect(hasAttrs).toBe(true);
  }
};

// Performance testing helpers
export const performanceHelpers = {
  measureRenderTime: async (component) => {
    const start = performance.now();
    const { container } = renderWithTheme(component);
    await waitFor(() => {
      expect(container.firstChild).toBeInTheDocument();
    });
    const end = performance.now();
    
    return end - start;
  },
  
  expectFastRender: async (component, maxTime = 100) => {
    const renderTime = await performanceHelpers.measureRenderTime(component);
    expect(renderTime).toBeLessThan(maxTime);
  },
  
  measureReRenders: (Component) => {
    let renderCount = 0;
    const CountingWrapper = () => {
      renderCount++;
      return Component;
    };
    
    // Return a function that can be called with JSX
    return () => {
      renderWithTheme(CountingWrapper());
      return renderCount;
    };
  }
};

// Mock service helpers
export const mockServices = {
  api: {
    get: vi.fn(() => mockApiResponses.success({})),
    post: vi.fn(() => mockApiResponses.success({})),
    put: vi.fn(() => mockApiResponses.success({})),
    patch: vi.fn(() => mockApiResponses.success({})),
    delete: vi.fn(() => mockApiResponses.success({}))
  },
  
  websocket: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  },
  
  analytics: {
    track: vi.fn(),
    identify: vi.fn(),
    page: vi.fn(),
    group: vi.fn()
  },
  
  auth: {
    login: vi.fn(() => Promise.resolve({ token: 'mock-token' })),
    logout: vi.fn(() => Promise.resolve()),
    refreshToken: vi.fn(() => Promise.resolve({ token: 'new-mock-token' })),
    getCurrentUser: vi.fn(() => ({ id: '1', email: 'test@example.com', role: 'manager' }))
  }
};

// Test environment setup helpers
export const setupTestEnvironment = () => {
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  };
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  
  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  };
  Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });
  
  // Mock navigator
  Object.defineProperty(window, 'navigator', {
    value: {
      onLine: true,
      userAgent: 'Mozilla/5.0 (Testing) AppleWebKit/537.36'
    },
    writable: true
  });
  
  return {
    localStorage: localStorageMock,
    sessionStorage: sessionStorageMock
  };
};

// Cleanup helpers
export const cleanupAfterTest = () => {
  // Clear all mocks
  vi.clearAllMocks();
  
  // Clear all timers
  vi.clearAllTimers();
  
  // Clear localStorage and sessionStorage
  if (window.localStorage) {
    window.localStorage.clear();
  }
  if (window.sessionStorage) {
    window.sessionStorage.clear();
  }
  
  // Remove all event listeners
  document.removeEventListener('click', () => {});
  document.removeEventListener('keydown', () => {});
};

export default {
  mockApiResponses,
  createMockStore,
  MockWebSocket,
  waitForAsync,
  generateTestData,
  customQueries,
  a11yHelpers,
  performanceHelpers,
  mockServices,
  setupTestEnvironment,
  cleanupAfterTest
};