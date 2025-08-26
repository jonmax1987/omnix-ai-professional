// CustomerCard Test
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import CustomerCard, { 
  CustomerSegments, 
  CustomerStatus, 
  CustomerCardVariants 
} from '../CustomerCard';
import { theme } from '../../../styles/theme';

// Mock useI18n hook
const mockT = jest.fn((key) => key);
jest.mock('../../../hooks/useI18n', () => ({
  useI18n: () => ({ t: mockT })
}));

const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

const defaultProps = {
  id: 'customer-1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  segment: CustomerSegments.LOYAL,
  status: CustomerStatus.ACTIVE,
  totalOrders: 25,
  totalSpent: 2500,
  averageOrderValue: 100,
  lastOrderDate: '2024-01-15',
  joinDate: '2023-06-01',
  loyaltyPoints: 1250,
  growth: 15.5,
  lifetimeValue: 3000
};

describe('CustomerCard', () => {
  beforeEach(() => {
    mockT.mockClear();
  });

  it('renders customer information correctly', () => {
    render(
      <TestWrapper>
        <CustomerCard {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument(); // total orders
    expect(screen.getByText('$2,500')).toBeInTheDocument(); // total spent
  });

  it('displays segment indicator with correct styling', () => {
    render(
      <TestWrapper>
        <CustomerCard {...defaultProps} segment={CustomerSegments.CHAMPIONS} />
      </TestWrapper>
    );

    const container = screen.getByText('John Doe').closest('.customer-card');
    expect(container).toHaveClass('customer-card-default');
  });

  it('shows growth indicator for positive growth', () => {
    render(
      <TestWrapper>
        <CustomerCard {...defaultProps} growth={25.3} />
      </TestWrapper>
    );

    expect(screen.getByText('25.3%')).toBeInTheDocument();
  });

  it('shows high risk badge for customers with high churn risk', () => {
    render(
      <TestWrapper>
        <CustomerCard {...defaultProps} churnRisk={0.8} />
      </TestWrapper>
    );

    expect(screen.getByText('customer.highRisk')).toBeInTheDocument();
  });

  it('handles click events correctly', async () => {
    const onSelect = jest.fn();
    const onClick = jest.fn();

    render(
      <TestWrapper>
        <CustomerCard
          {...defaultProps}
          onSelect={onSelect}
          onClick={onClick}
        />
      </TestWrapper>
    );

    const card = screen.getByText('John Doe').closest('.customer-card');
    fireEvent.click(card);

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith('customer-1', true, expect.any(Object));
      expect(onClick).toHaveBeenCalledWith('customer-1', expect.any(Object));
    });
  });

  it('handles action button clicks', async () => {
    const onContact = jest.fn();
    const onViewProfile = jest.fn();

    render(
      <TestWrapper>
        <CustomerCard
          {...defaultProps}
          onContact={onContact}
          onViewProfile={onViewProfile}
        />
      </TestWrapper>
    );

    const contactButton = screen.getByText('customer.contact').closest('button');
    const viewProfileButton = screen.getByText('customer.viewProfile').closest('button');

    fireEvent.click(contactButton);
    fireEvent.click(viewProfileButton);

    await waitFor(() => {
      expect(onContact).toHaveBeenCalledWith('customer-1', {
        email: 'john.doe@example.com',
        phone: '+1234567890'
      });
      expect(onViewProfile).toHaveBeenCalledWith('customer-1');
    });
  });

  it('renders compact variant correctly', () => {
    render(
      <TestWrapper>
        <CustomerCard
          {...defaultProps}
          variant={CustomerCardVariants.COMPACT}
        />
      </TestWrapper>
    );

    const card = screen.getByText('John Doe').closest('.customer-card');
    expect(card).toHaveClass('customer-card-compact');

    // In compact mode, some details should be hidden
    expect(screen.queryByText('john.doe@example.com')).not.toBeInTheDocument();
  });

  it('renders detailed variant with additional information', () => {
    render(
      <TestWrapper>
        <CustomerCard
          {...defaultProps}
          variant={CustomerCardVariants.DETAILED}
        />
      </TestWrapper>
    );

    const card = screen.getByText('John Doe').closest('.customer-card');
    expect(card).toHaveClass('customer-card-detailed');

    // Should show additional details
    expect(screen.getByText('customer.lastOrder')).toBeInTheDocument();
    expect(screen.getByText('customer.joinDate')).toBeInTheDocument();
    expect(screen.getByText('customer.lifetimeValue')).toBeInTheDocument();
  });

  it('displays new customer badge for new customers', () => {
    render(
      <TestWrapper>
        <CustomerCard
          {...defaultProps}
          status={CustomerStatus.NEW}
        />
      </TestWrapper>
    );

    expect(screen.getByText('customer.new')).toBeInTheDocument();
  });

  it('handles different customer segments', () => {
    const segments = [
      CustomerSegments.CHAMPIONS,
      CustomerSegments.AT_RISK,
      CustomerSegments.HIBERNATING
    ];

    segments.forEach((segment) => {
      render(
        <TestWrapper>
          <CustomerCard {...defaultProps} segment={segment} />
        </TestWrapper>
      );

      expect(mockT).toHaveBeenCalledWith(`customer.segments.${segment}`);
    });
  });

  it('handles custom actions', async () => {
    const customAction = {
      id: 'custom',
      label: 'Custom Action',
      icon: 'Settings',
      onClick: jest.fn(),
      variant: 'filled'
    };

    render(
      <TestWrapper>
        <CustomerCard {...defaultProps} actions={[customAction]} />
      </TestWrapper>
    );

    const customButton = screen.getByText('Custom Action');
    fireEvent.click(customButton);

    await waitFor(() => {
      expect(customAction.onClick).toHaveBeenCalled();
    });
  });

  it('formats currency correctly', () => {
    render(
      <TestWrapper>
        <CustomerCard
          {...defaultProps}
          totalSpent={12500.50}
          averageOrderValue={125.75}
          lifetimeValue={15000}
        />
      </TestWrapper>
    );

    expect(screen.getByText('$12,501')).toBeInTheDocument(); // total spent (rounded)
    expect(screen.getByText('$126')).toBeInTheDocument(); // avg order value (rounded)
  });

  it('does not render actions when showActions is false', () => {
    render(
      <TestWrapper>
        <CustomerCard {...defaultProps} showActions={false} />
      </TestWrapper>
    );

    expect(screen.queryByText('customer.contact')).not.toBeInTheDocument();
    expect(screen.queryByText('customer.viewProfile')).not.toBeInTheDocument();
  });

  it('does not render metrics when showMetrics is false', () => {
    render(
      <TestWrapper>
        <CustomerCard {...defaultProps} showMetrics={false} />
      </TestWrapper>
    );

    expect(screen.queryByText('customer.totalOrders')).not.toBeInTheDocument();
    expect(screen.queryByText('customer.totalSpent')).not.toBeInTheDocument();
  });

  it('handles missing optional props gracefully', () => {
    const minimalProps = {
      id: 'customer-2',
      name: 'Jane Doe'
    };

    render(
      <TestWrapper>
        <CustomerCard {...minimalProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // default total orders
  });
});