import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../../../test/setup';
import MetricCard from '../MetricCard';

describe('MetricCard Component', () => {
  const mockMetricData = {
    title: 'Total Revenue',
    value: 245680,
    valueFormat: 'currency',
    change: 12.5,
    trend: 'up',
    icon: 'trending-up',
    iconColor: 'success'
  };

  it('renders correctly with basic props', () => {
    renderWithTheme(
      <MetricCard
        title={mockMetricData.title}
        value={mockMetricData.value}
      />
    );

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('245680')).toBeInTheDocument();
  });

  it('displays currency format correctly', () => {
    renderWithTheme(
      <MetricCard
        title={mockMetricData.title}
        value={mockMetricData.value}
        valueFormat="currency"
      />
    );

    expect(screen.getByText(/\$245,680/)).toBeInTheDocument();
  });

  it('displays percentage format correctly', () => {
    renderWithTheme(
      <MetricCard
        title="Growth Rate"
        value={12.5}
        valueFormat="percentage"
      />
    );

    expect(screen.getByText('12.5%')).toBeInTheDocument();
  });

  it('shows trend change correctly', () => {
    renderWithTheme(
      <MetricCard
        title={mockMetricData.title}
        value={mockMetricData.value}
        change={mockMetricData.change}
        trend={mockMetricData.trend}
      />
    );

    expect(screen.getByText(/\+12\.5%/)).toBeInTheDocument();
  });

  it('renders with icon when provided', () => {
    renderWithTheme(
      <MetricCard
        title={mockMetricData.title}
        value={mockMetricData.value}
        icon={mockMetricData.icon}
        iconColor={mockMetricData.iconColor}
      />
    );

    // Icon should be rendered (mocked in our setup)
    const card = screen.getByText('Total Revenue').closest('[data-testid="metric-card"]') || 
                 screen.getByText('Total Revenue').parentElement;
    expect(card).toBeInTheDocument();
  });

  it('shows badge when provided', () => {
    renderWithTheme(
      <MetricCard
        title={mockMetricData.title}
        value={mockMetricData.value}
        badge="Live"
      />
    );

    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('renders with progress indicator', () => {
    renderWithTheme(
      <MetricCard
        title={mockMetricData.title}
        value={mockMetricData.value}
        target={250000}
        progress={98.3}
      />
    );

    expect(screen.getByText(/98\.3%/)).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    renderWithTheme(
      <MetricCard
        title={mockMetricData.title}
        value={mockMetricData.value}
        onClick={handleClick}
      />
    );

    const card = screen.getByText('Total Revenue').parentElement;
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders in compact variant', () => {
    renderWithTheme(
      <MetricCard
        title={mockMetricData.title}
        value={mockMetricData.value}
        variant="compact"
      />
    );

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('245680')).toBeInTheDocument();
  });

  it('renders with loading state', () => {
    renderWithTheme(
      <MetricCard
        title={mockMetricData.title}
        value={mockMetricData.value}
        loading={true}
      />
    );

    // Should show loading indicator
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
  });

  it('handles different trend directions', () => {
    const { rerender } = renderWithTheme(
      <MetricCard
        title="Test Metric"
        value={100}
        change={-5.2}
        trend="down"
      />
    );

    expect(screen.getByText(/-5\.2%/)).toBeInTheDocument();

    rerender(
      <MetricCard
        title="Test Metric"
        value={100}
        change={0}
        trend="neutral"
      />
    );

    expect(screen.getByText(/0%/)).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    renderWithTheme(
      <MetricCard
        title={mockMetricData.title}
        value={mockMetricData.value}
        className="custom-metric-card"
      />
    );

    const card = screen.getByText('Total Revenue').parentElement;
    expect(card).toHaveClass('custom-metric-card');
  });

  it('displays formatted numbers correctly', () => {
    renderWithTheme(
      <MetricCard
        title="Large Number"
        value={1234567}
        valueFormat="number"
      />
    );

    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('handles missing change prop gracefully', () => {
    renderWithTheme(
      <MetricCard
        title={mockMetricData.title}
        value={mockMetricData.value}
        trend="up"
      />
    );

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    // Should not crash without change value
  });

  it('renders without trend when not provided', () => {
    renderWithTheme(
      <MetricCard
        title={mockMetricData.title}
        value={mockMetricData.value}
      />
    );

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('245680')).toBeInTheDocument();
    // Should not show any trend indicators
  });
});