// AIInsightsPanel Test Suite
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import AIInsightsPanel, { InsightTypes, InsightPriority, InsightConfidence } from '../AIInsightsPanel';
import { lightTheme } from '../../../styles/theme';

// Mock the hooks
jest.mock('../../../hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key, params) => {
      if (params) {
        return `${key}: ${Object.values(params).join(', ')}`;
      }
      return key;
    }
  })
}));

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={lightTheme}>
      {component}
    </ThemeProvider>
  );
};

const mockInsights = [
  {
    id: 'insight-1',
    title: 'Critical Stock Alert',
    description: 'iPhone 14 Pro inventory will be depleted in 2 days.',
    type: InsightTypes.INVENTORY,
    priority: InsightPriority.CRITICAL,
    confidence: InsightConfidence.HIGH,
    timestamp: new Date('2024-01-15'),
    metrics: [
      { label: 'Days Left', value: '2', color: '#EF4444' },
      { label: 'Current Stock', value: '8', color: '#F97316' }
    ],
    recommendation: 'Order 50 units immediately',
    actions: [
      {
        id: 'reorder',
        label: 'Quick Reorder',
        icon: 'shopping-cart',
        variant: 'filled',
        onClick: jest.fn()
      }
    ]
  },
  {
    id: 'insight-2',
    title: 'Revenue Opportunity',
    description: 'Cross-selling campaign could increase revenue by 12%.',
    type: InsightTypes.SALES,
    priority: InsightPriority.HIGH,
    confidence: InsightConfidence.MEDIUM,
    timestamp: new Date('2024-01-14'),
    metrics: [
      { label: 'Revenue Lift', value: '12%', color: '#10B981' }
    ],
    recommendation: 'Create targeted bundle offer',
    actions: [
      {
        id: 'create-campaign',
        label: 'Create Campaign',
        icon: 'Target',
        onClick: jest.fn()
      }
    ]
  },
  {
    id: 'insight-3',
    title: 'Customer Behavior Pattern',
    description: 'Premium customers shifted purchasing patterns.',
    type: InsightTypes.CUSTOMER,
    priority: InsightPriority.MEDIUM,
    confidence: InsightConfidence.LOW,
    timestamp: new Date('2024-01-13'),
    actions: []
  }
];

describe('AIInsightsPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders panel with basic structure', () => {
    renderWithTheme(
      <AIInsightsPanel insights={mockInsights} />
    );

    expect(screen.getByText('insights.title')).toBeInTheDocument();
    expect(screen.getByText('Critical Stock Alert')).toBeInTheDocument();
    expect(screen.getByText('Revenue Opportunity')).toBeInTheDocument();
    expect(screen.getByText('Customer Behavior Pattern')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    renderWithTheme(
      <AIInsightsPanel insights={[]} loading={true} />
    );

    expect(screen.getByText('insights.loading')).toBeInTheDocument();
  });

  it('displays empty state when no insights', () => {
    renderWithTheme(
      <AIInsightsPanel insights={[]} />
    );

    expect(screen.getByText('insights.empty.title')).toBeInTheDocument();
    expect(screen.getByText('insights.empty.description')).toBeInTheDocument();
  });

  it('renders insights with correct priority styling', () => {
    const { container } = renderWithTheme(
      <AIInsightsPanel insights={mockInsights} />
    );

    // Critical insight should have critical priority styling
    const criticalCard = container.querySelector('[data-priority="critical"]');
    expect(criticalCard).toBeInTheDocument();
  });

  it('displays insight metrics correctly', () => {
    renderWithTheme(
      <AIInsightsPanel insights={mockInsights} showMetrics={true} />
    );

    expect(screen.getByText('2')).toBeInTheDocument(); // Days Left value
    expect(screen.getByText('Days Left')).toBeInTheDocument(); // Days Left label
    expect(screen.getByText('8')).toBeInTheDocument(); // Current Stock value
  });

  it('shows confidence badges', () => {
    renderWithTheme(
      <AIInsightsPanel insights={mockInsights} />
    );

    expect(screen.getByText('insights.confidence.high')).toBeInTheDocument();
    expect(screen.getByText('insights.confidence.medium')).toBeInTheDocument();
    expect(screen.getByText('insights.confidence.low')).toBeInTheDocument();
  });

  it('renders insight recommendations', () => {
    renderWithTheme(
      <AIInsightsPanel insights={mockInsights} />
    );

    expect(screen.getByText(/Order 50 units immediately/)).toBeInTheDocument();
    expect(screen.getByText(/Create targeted bundle offer/)).toBeInTheDocument();
  });

  it('displays action buttons and handles clicks', () => {
    const mockOnActionClick = jest.fn();
    
    renderWithTheme(
      <AIInsightsPanel 
        insights={mockInsights} 
        onActionClick={mockOnActionClick}
      />
    );

    const quickReorderButton = screen.getByText('Quick Reorder');
    expect(quickReorderButton).toBeInTheDocument();

    fireEvent.click(quickReorderButton);
    expect(mockOnActionClick).toHaveBeenCalledWith(
      mockInsights[0].actions[0],
      mockInsights[0],
      expect.any(Object)
    );
  });

  it('handles insight card clicks', () => {
    const mockOnInsightClick = jest.fn();
    
    renderWithTheme(
      <AIInsightsPanel 
        insights={mockInsights} 
        onInsightClick={mockOnInsightClick}
        interactive={true}
      />
    );

    const insightCard = screen.getByText('Critical Stock Alert').closest('div');
    fireEvent.click(insightCard);
    
    expect(mockOnInsightClick).toHaveBeenCalledWith(
      mockInsights[0],
      expect.any(Object)
    );
  });

  it('handles refresh functionality', () => {
    const mockOnRefresh = jest.fn();
    
    renderWithTheme(
      <AIInsightsPanel 
        insights={mockInsights} 
        onRefresh={mockOnRefresh}
        showControls={true}
      />
    );

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);
    
    expect(mockOnRefresh).toHaveBeenCalled();
  });

  it('filters insights by type', () => {
    renderWithTheme(
      <AIInsightsPanel 
        insights={mockInsights} 
        filterByType={InsightTypes.INVENTORY}
      />
    );

    // Should only show inventory insight
    expect(screen.getByText('Critical Stock Alert')).toBeInTheDocument();
    expect(screen.queryByText('Revenue Opportunity')).not.toBeInTheDocument();
    expect(screen.queryByText('Customer Behavior Pattern')).not.toBeInTheDocument();
  });

  it('filters insights by priority', () => {
    renderWithTheme(
      <AIInsightsPanel 
        insights={mockInsights} 
        filterByPriority={InsightPriority.CRITICAL}
      />
    );

    // Should only show critical insight
    expect(screen.getByText('Critical Stock Alert')).toBeInTheDocument();
    expect(screen.queryByText('Revenue Opportunity')).not.toBeInTheDocument();
    expect(screen.queryByText('Customer Behavior Pattern')).not.toBeInTheDocument();
  });

  it('displays summary metrics in header', () => {
    renderWithTheme(
      <AIInsightsPanel 
        insights={mockInsights} 
        showMetrics={true}
      />
    );

    // Should show summary with total insights and critical count
    expect(screen.getByText(/insights.summary/)).toBeInTheDocument();
  });

  it('handles different column layouts', () => {
    const { container, rerender } = renderWithTheme(
      <AIInsightsPanel insights={mockInsights} columns={1} />
    );

    let grid = container.querySelector('[style*="grid-template-columns: 1fr"]');
    expect(grid).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={lightTheme}>
        <AIInsightsPanel insights={mockInsights} columns={2} />
      </ThemeProvider>
    );

    grid = container.querySelector('[style*="grid-template-columns: repeat(2, 1fr)"]');
    expect(grid).toBeInTheDocument();
  });

  it('handles compact variant correctly', () => {
    renderWithTheme(
      <AIInsightsPanel 
        insights={mockInsights} 
        variant="compact"
      />
    );

    // Compact variant should have expand/collapse functionality
    const toggleButton = screen.getByRole('button', { name: /chevron/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('prevents action click propagation', () => {
    const mockOnInsightClick = jest.fn();
    const mockOnActionClick = jest.fn();
    
    renderWithTheme(
      <AIInsightsPanel 
        insights={mockInsights} 
        onInsightClick={mockOnInsightClick}
        onActionClick={mockOnActionClick}
        interactive={true}
      />
    );

    const actionButton = screen.getByText('Quick Reorder');
    fireEvent.click(actionButton);
    
    // Action click should not trigger insight click
    expect(mockOnActionClick).toHaveBeenCalled();
    expect(mockOnInsightClick).not.toHaveBeenCalled();
  });

  it('shows insight timestamps correctly', () => {
    renderWithTheme(
      <AIInsightsPanel insights={mockInsights} />
    );

    // Should display formatted timestamps
    expect(screen.getByText('1/15/2024')).toBeInTheDocument();
    expect(screen.getByText('1/14/2024')).toBeInTheDocument();
    expect(screen.getByText('1/13/2024')).toBeInTheDocument();
  });

  it('handles insights without actions', () => {
    renderWithTheme(
      <AIInsightsPanel insights={mockInsights} />
    );

    // Third insight has no actions - should still render properly
    expect(screen.getByText('Customer Behavior Pattern')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = renderWithTheme(
      <AIInsightsPanel 
        insights={mockInsights}
        className="custom-panel"
        variant="full"
      />
    );

    const panelElement = container.firstChild;
    expect(panelElement).toHaveClass('ai-insights-panel');
    expect(panelElement).toHaveClass('custom-panel');
  });

  it('hides metrics when showMetrics is false', () => {
    renderWithTheme(
      <AIInsightsPanel 
        insights={mockInsights} 
        showMetrics={false}
      />
    );

    expect(screen.queryByText('Days Left')).not.toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('hides controls when showControls is false', () => {
    renderWithTheme(
      <AIInsightsPanel 
        insights={mockInsights} 
        showControls={false}
        onRefresh={() => {}}
      />
    );

    expect(screen.queryByRole('button', { name: /filter/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /refresh/i })).not.toBeInTheDocument();
  });

  it('sorts insights by priority correctly', () => {
    const unsortedInsights = [mockInsights[2], mockInsights[0], mockInsights[1]]; // medium, critical, high
    
    renderWithTheme(
      <AIInsightsPanel 
        insights={unsortedInsights} 
        sortBy="priority"
      />
    );

    const insightTitles = screen.getAllByText(/Alert|Opportunity|Pattern/);
    expect(insightTitles[0]).toHaveTextContent('Critical Stock Alert'); // Critical first
    expect(insightTitles[1]).toHaveTextContent('Revenue Opportunity'); // High second
    expect(insightTitles[2]).toHaveTextContent('Customer Behavior Pattern'); // Medium last
  });
});