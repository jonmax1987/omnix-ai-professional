/**
 * System Health Monitor Tests - Phase 5 QA
 * Comprehensive test suite for system health monitoring components
 * Tests health monitoring, performance tracking, and alert systems
 */

import { describe, test, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import SystemHealthMonitor from '../SystemHealthMonitor.jsx';
import { lightTheme } from '../../../styles/theme.js';

/**
 * Mock dependencies
 */
vi.mock('../../../store/websocketStore.js', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    connectionState: { status: 'connected', connectedAt: Date.now() },
    isConnected: true,
    lastMessageTime: Date.now(),
    reconnectAttempts: 0
  }))
}));

vi.mock('../../../utils/cdnOptimization.js', () => ({
  cdnPerformanceMonitor: {
    getPerformanceReport: vi.fn(() => ({
      summary: {
        cacheHitRate: '85.50%',
        averageLoadTime: '750.00ms',
        totalRequests: 150,
        totalTransferSize: '2.3 MB',
        efficiency: 'excellent'
      },
      details: {
        imageLoads: 75,
        slowestImage: { loadTime: 1200, url: 'slow-image.jpg' },
        recommendations: ['Consider optimizing large images']
      }
    }))
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock performance API
global.performance = {
  ...global.performance,
  now: vi.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 50000000,
    totalJSHeapSize: 100000000,
    jsHeapSizeLimit: 200000000
  },
  getEntriesByType: vi.fn(() => [{
    loadEventEnd: 2000,
    loadEventStart: 1900,
    domContentLoadedEventEnd: 1800,
    domContentLoadedEventStart: 1700
  }])
};

/**
 * Test wrapper component
 */
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={lightTheme}>
    {children}
  </ThemeProvider>
);

beforeAll(() => {
  // Mock console methods to avoid test output noise
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

/**
 * SystemHealthMonitor Component Tests
 */
describe('SystemHealthMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('[]'); // Empty API errors
  });

  test('should render health monitoring cards', async () => {
    render(
      <TestWrapper>
        <SystemHealthMonitor refreshInterval={1000} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('WebSocket Connection')).toBeInTheDocument();
      expect(screen.getByText('API Services')).toBeInTheDocument();
      expect(screen.getByText('Performance')).toBeInTheDocument();
    });
  });

  test('should display healthy WebSocket status', async () => {
    render(
      <TestWrapper>
        <SystemHealthMonitor />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Healthy')).toBeInTheDocument();
      expect(screen.getByText('connected')).toBeInTheDocument();
    });
  });

  test('should display WebSocket connection metrics', async () => {
    render(
      <TestWrapper>
        <SystemHealthMonitor />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Connection State:')).toBeInTheDocument();
      expect(screen.getByText('Uptime:')).toBeInTheDocument();
      expect(screen.getByText('Last Message:')).toBeInTheDocument();
    });
  });

  test('should show warnings for old messages', async () => {
    // Mock old last message time
    const oldTime = Date.now() - 35000; // 35 seconds ago
    
    vi.doMock('../../../store/websocketStore.js', () => ({
      __esModule: true,
      default: vi.fn(() => ({
        connectionState: { status: 'connected', connectedAt: Date.now() },
        isConnected: true,
        lastMessageTime: oldTime,
        reconnectAttempts: 0
      }))
    }));

    render(
      <TestWrapper>
        <SystemHealthMonitor />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No messages received in 30+ seconds')).toBeInTheDocument();
    });
  });

  test('should display API error information', async () => {
    // Mock API errors
    const apiErrors = [
      { timestamp: Date.now() - 60000, message: 'Network error' },
      { timestamp: Date.now() - 30000, message: 'Timeout error' }
    ];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(apiErrors));

    render(
      <TestWrapper>
        <SystemHealthMonitor />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Recent Errors:')).toBeInTheDocument();
      expect(screen.getByText('2 (5 min)')).toBeInTheDocument();
    });
  });

  test('should show performance metrics', async () => {
    render(
      <TestWrapper>
        <SystemHealthMonitor />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Memory Usage:')).toBeInTheDocument();
      expect(screen.getByText('50.0%')).toBeInTheDocument();
      expect(screen.getByText('CDN Cache Hit Rate:')).toBeInTheDocument();
      expect(screen.getByText('85.50%')).toBeInTheDocument();
    });
  });

  test('should handle missing performance API gracefully', async () => {
    const originalPerformance = global.performance;
    global.performance = { ...global.performance, memory: undefined };

    render(
      <TestWrapper>
        <SystemHealthMonitor />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Performance')).toBeInTheDocument();
    });

    global.performance = originalPerformance;
  });

  test('should refresh metrics on interval', async () => {
    const mockUseWebSocketStore = vi.fn(() => ({
      connectionState: { status: 'connected', connectedAt: Date.now() },
      isConnected: true,
      lastMessageTime: Date.now(),
      reconnectAttempts: 0
    }));

    vi.doMock('../../../store/websocketStore.js', () => ({
      __esModule: true,
      default: mockUseWebSocketStore
    }));

    render(
      <TestWrapper>
        <SystemHealthMonitor refreshInterval={100} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('WebSocket Connection')).toBeInTheDocument();
    });

    // Wait for at least one refresh cycle
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    // The component should have refreshed metrics
    expect(mockUseWebSocketStore).toHaveBeenCalled();
  });

  test('should handle alerts display toggle', async () => {
    // Mock system with alerts
    const apiErrors = [
      { timestamp: Date.now() - 30000, message: 'Test error' }
    ];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(apiErrors));

    const { rerender } = render(
      <TestWrapper>
        <SystemHealthMonitor showAlerts={true} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('API errors detected: 1 in 5 minutes')).toBeInTheDocument();
    });

    // Rerender with alerts disabled
    rerender(
      <TestWrapper>
        <SystemHealthMonitor showAlerts={false} />
      </TestWrapper>
    );

    expect(screen.queryByText('API errors detected: 1 in 5 minutes')).not.toBeInTheDocument();
  });

  test('should handle compact view mode', async () => {
    render(
      <TestWrapper>
        <SystemHealthMonitor compactView={true} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('WebSocket Connection')).toBeInTheDocument();
      expect(screen.getByText('API Services')).toBeInTheDocument();
      expect(screen.getByText('Performance')).toBeInTheDocument();
    });

    // In compact view, overall system status should not be shown
    expect(screen.queryByText('System Overview')).not.toBeInTheDocument();
  });

  test('should show different status indicators', async () => {
    // Mock disconnected WebSocket
    vi.doMock('../../../store/websocketStore.js', () => ({
      __esModule: true,
      default: vi.fn(() => ({
        connectionState: { status: 'disconnected' },
        isConnected: false,
        lastMessageTime: null,
        reconnectAttempts: 5
      }))
    }));

    render(
      <TestWrapper>
        <SystemHealthMonitor />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('WebSocket connection is down')).toBeInTheDocument();
      expect(screen.getByText('High reconnection attempts: 5')).toBeInTheDocument();
    });
  });
});

/**
 * Integration tests with real store data
 */
describe('SystemHealthMonitor Integration', () => {
  test('should integrate with WebSocket store changes', async () => {
    let storeCallback;
    const mockStore = {
      connectionState: { status: 'connecting' },
      isConnected: false,
      lastMessageTime: null,
      reconnectAttempts: 1,
      subscribe: vi.fn((callback) => {
        storeCallback = callback;
        return () => {}; // Unsubscribe function
      })
    };

    vi.doMock('../../../store/websocketStore.js', () => ({
      __esModule: true,
      default: vi.fn(() => mockStore)
    }));

    render(
      <TestWrapper>
        <SystemHealthMonitor refreshInterval={100} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('connecting')).toBeInTheDocument();
    });

    // Simulate WebSocket connection
    await act(async () => {
      mockStore.connectionState = { status: 'connected', connectedAt: Date.now() };
      mockStore.isConnected = true;
      mockStore.lastMessageTime = Date.now();
      
      // Wait for next refresh cycle
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    await waitFor(() => {
      expect(screen.getByText('connected')).toBeInTheDocument();
    });
  });

  test('should handle CDN performance monitor errors', async () => {
    vi.doMock('../../../utils/cdnOptimization.js', () => ({
      cdnPerformanceMonitor: {
        getPerformanceReport: vi.fn(() => {
          throw new Error('CDN monitor error');
        })
      }
    }));

    render(
      <TestWrapper>
        <SystemHealthMonitor />
      </TestWrapper>
    );

    // Should render without crashing even if CDN monitor fails
    await waitFor(() => {
      expect(screen.getByText('Performance')).toBeInTheDocument();
    });
  });

  test('should calculate overall health status correctly', async () => {
    // Mock multiple error conditions
    const apiErrors = Array.from({ length: 10 }, (_, i) => ({
      timestamp: Date.now() - (i * 10000),
      message: `Error ${i}`
    }));
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(apiErrors));

    vi.doMock('../../../store/websocketStore.js', () => ({
      __esModule: true,
      default: vi.fn(() => ({
        connectionState: { status: 'disconnected' },
        isConnected: false,
        lastMessageTime: null,
        reconnectAttempts: 0
      }))
    }));

    global.performance.memory = {
      usedJSHeapSize: 95000000,
      totalJSHeapSize: 100000000
    };

    render(
      <TestWrapper>
        <SystemHealthMonitor />
      </TestWrapper>
    );

    // Should show error status due to multiple issues
    await waitFor(() => {
      expect(screen.getByText('System Error')).toBeInTheDocument();
    });
  });
});

/**
 * Performance and reliability tests
 */
describe('SystemHealthMonitor Performance', () => {
  test('should handle rapid refresh intervals without performance issues', async () => {
    const startTime = performance.now();
    
    render(
      <TestWrapper>
        <SystemHealthMonitor refreshInterval={50} />
      </TestWrapper>
    );

    // Wait for multiple refresh cycles
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    const endTime = performance.now();
    
    // Should not cause significant performance impact
    expect(endTime - startTime).toBeLessThan(1000);
  });

  test('should cleanup intervals on unmount', async () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    
    const { unmount } = render(
      <TestWrapper>
        <SystemHealthMonitor refreshInterval={1000} />
      </TestWrapper>
    );

    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  test('should handle large numbers of alerts efficiently', async () => {
    // Mock many API errors
    const manyErrors = Array.from({ length: 1000 }, (_, i) => ({
      timestamp: Date.now() - (i * 1000),
      message: `Error ${i}`
    }));
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(manyErrors));

    const startTime = performance.now();
    
    render(
      <TestWrapper>
        <SystemHealthMonitor />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('API Services')).toBeInTheDocument();
    });

    const endTime = performance.now();
    
    // Should handle large error arrays efficiently
    expect(endTime - startTime).toBeLessThan(2000);
  });

  test('should handle missing theme gracefully', () => {
    render(
      <SystemHealthMonitor refreshInterval={1000} />
    );

    // Should render without theme provider
    expect(screen.getByText('WebSocket Connection')).toBeInTheDocument();
  });
});

/**
 * Accessibility tests
 */
describe('SystemHealthMonitor Accessibility', () => {
  test('should have proper ARIA attributes', async () => {
    render(
      <TestWrapper>
        <SystemHealthMonitor />
      </TestWrapper>
    );

    await waitFor(() => {
      const healthCards = screen.getAllByRole('generic');
      expect(healthCards.length).toBeGreaterThan(0);
    });
  });

  test('should have accessible status indicators', async () => {
    render(
      <TestWrapper>
        <SystemHealthMonitor />
      </TestWrapper>
    );

    await waitFor(() => {
      const statusElements = screen.getAllByText(/healthy|warning|error/i);
      expect(statusElements.length).toBeGreaterThan(0);
    });
  });

  test('should support keyboard navigation', async () => {
    render(
      <TestWrapper>
        <SystemHealthMonitor />
      </TestWrapper>
    );

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    expect(refreshButton).toBeInTheDocument();
    
    // Should be focusable
    refreshButton.focus();
    expect(document.activeElement).toBe(refreshButton);
  });
});

/**
 * Error boundary and edge cases
 */
describe('SystemHealthMonitor Error Handling', () => {
  test('should handle WebSocket store errors', async () => {
    vi.doMock('../../../store/websocketStore.js', () => ({
      __esModule: true,
      default: vi.fn(() => {
        throw new Error('Store error');
      })
    }));

    // Should not crash when store throws error
    expect(() => {
      render(
        <TestWrapper>
          <SystemHealthMonitor />
        </TestWrapper>
      );
    }).not.toThrow();
  });

  test('should handle malformed localStorage data', async () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-json');

    render(
      <TestWrapper>
        <SystemHealthMonitor />
      </TestWrapper>
    );

    // Should render without crashing
    await waitFor(() => {
      expect(screen.getByText('API Services')).toBeInTheDocument();
    });
  });

  test('should handle CDN monitor unavailability', async () => {
    vi.doMock('../../../utils/cdnOptimization.js', () => ({
      cdnPerformanceMonitor: null
    }));

    render(
      <TestWrapper>
        <SystemHealthMonitor />
      </TestWrapper>
    );

    // Should render performance card even without CDN monitor
    await waitFor(() => {
      expect(screen.getByText('Performance')).toBeInTheDocument();
    });
  });
});

/**
 * Real-time updates tests
 */
describe('SystemHealthMonitor Real-time Updates', () => {
  test('should update when WebSocket state changes', async () => {
    let wsState = {
      connectionState: { status: 'connected' },
      isConnected: true,
      lastMessageTime: Date.now(),
      reconnectAttempts: 0
    };

    const mockStore = vi.fn(() => wsState);
    
    vi.doMock('../../../store/websocketStore.js', () => ({
      __esModule: true,
      default: mockStore
    }));

    const { rerender } = render(
      <TestWrapper>
        <SystemHealthMonitor refreshInterval={100} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('connected')).toBeInTheDocument();
    });

    // Change WebSocket state
    wsState = {
      ...wsState,
      connectionState: { status: 'disconnected' },
      isConnected: false
    };

    rerender(
      <TestWrapper>
        <SystemHealthMonitor refreshInterval={100} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('disconnected')).toBeInTheDocument();
    });
  });

  test('should update performance metrics in real-time', async () => {
    let cacheHitRate = '75.00%';
    
    vi.doMock('../../../utils/cdnOptimization.js', () => ({
      cdnPerformanceMonitor: {
        getPerformanceReport: vi.fn(() => ({
          summary: {
            cacheHitRate,
            averageLoadTime: '500.00ms',
            totalRequests: 100,
            totalTransferSize: '1.5 MB',
            efficiency: 'good'
          },
          details: {
            imageLoads: 50,
            slowestImage: null,
            recommendations: []
          }
        }))
      }
    }));

    const { rerender } = render(
      <TestWrapper>
        <SystemHealthMonitor refreshInterval={100} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('75.00%')).toBeInTheDocument();
    });

    // Update cache hit rate
    cacheHitRate = '90.00%';
    
    rerender(
      <TestWrapper>
        <SystemHealthMonitor refreshInterval={100} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('90.00%')).toBeInTheDocument();
    });
  });
});