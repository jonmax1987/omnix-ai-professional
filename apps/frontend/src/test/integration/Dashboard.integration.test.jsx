import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithTheme } from '../setup';
import Dashboard from '../../pages/Dashboard';

// Mock the store
const mockStore = {
  dashboard: {
    metrics: {
      totalProducts: 1234,
      lowStock: 42,
      outOfStock: 8,
      totalValue: 156789.50
    },
    alerts: [
      {
        id: '1',
        type: 'warning',
        message: 'Low stock alert for Product A',
        timestamp: new Date().toISOString()
      },
      {
        id: '2', 
        type: 'error',
        message: 'Out of stock: Product B',
        timestamp: new Date().toISOString()
      }
    ],
    chartData: {
      inventoryValue: [
        { date: '2024-01-01', value: 150000 },
        { date: '2024-01-02', value: 155000 },
        { date: '2024-01-03', value: 160000 }
      ],
      categoryBreakdown: [
        { category: 'Electronics', value: 45000, percentage: 30 },
        { category: 'Clothing', value: 30000, percentage: 20 },
        { category: 'Food', value: 75000, percentage: 50 }
      ]
    },
    isLoading: false,
    error: null
  }
};

vi.mock('../../stores/dashboardStore', () => ({
  useDashboardStore: () => mockStore.dashboard
}));

describe('Dashboard Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dashboard with all key metrics', async () => {
    renderWithTheme(<Dashboard />);

    // Check if main metrics are displayed
    await waitFor(() => {
      expect(screen.getByText('1,234')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument(); 
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('$156,789.50')).toBeInTheDocument();
    });
  });

  it('should display alerts and allow interaction', async () => {
    renderWithTheme(<Dashboard />);

    // Check if alerts are displayed
    await waitFor(() => {
      expect(screen.getByText('Low stock alert for Product A')).toBeInTheDocument();
      expect(screen.getByText('Out of stock: Product B')).toBeInTheDocument();
    });

    // Should be able to dismiss alerts (if dismiss functionality exists)
    const alertCards = screen.getAllByTestId('alert-card');
    expect(alertCards).toHaveLength(2);
  });

  it('should render charts and data visualizations', async () => {
    renderWithTheme(<Dashboard />);

    // Check if chart containers are present
    await waitFor(() => {
      expect(screen.getByTestId('inventory-chart')).toBeInTheDocument();
      expect(screen.getByTestId('category-chart')).toBeInTheDocument();
    });
  });

  it('should handle responsive layout changes', async () => {
    // Test mobile layout
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    window.dispatchEvent(new Event('resize'));
    
    renderWithTheme(<Dashboard />);

    // Dashboard should still render all key elements in mobile view
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('should handle loading states', async () => {
    const loadingMockStore = {
      ...mockStore,
      dashboard: {
        ...mockStore.dashboard,
        isLoading: true
      }
    };

    vi.mocked(require('../../stores/dashboardStore').useDashboardStore).mockReturnValueOnce(
      loadingMockStore.dashboard
    );

    renderWithTheme(<Dashboard />);

    // Should show loading indicators
    expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
  });

  it('should handle error states', async () => {
    const errorMockStore = {
      ...mockStore,
      dashboard: {
        ...mockStore.dashboard,
        error: 'Failed to load dashboard data',
        isLoading: false
      }
    };

    vi.mocked(require('../../stores/dashboardStore').useDashboardStore).mockReturnValueOnce(
      errorMockStore.dashboard
    );

    renderWithTheme(<Dashboard />);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
    });
  });
});