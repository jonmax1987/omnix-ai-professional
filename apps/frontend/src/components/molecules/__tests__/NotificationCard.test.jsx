// NotificationCard Test Suite
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import NotificationCard, { NotificationTypes, NotificationPriorities } from '../NotificationCard';
import { lightTheme } from '../../../styles/theme';

// Mock the hooks
jest.mock('../../../hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key) => key
  })
}));

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={lightTheme}>
      {component}
    </ThemeProvider>
  );
};

const mockNotification = {
  id: 'test-notification',
  title: 'Test Notification',
  message: 'This is a test notification message',
  timestamp: Date.now() - 300000, // 5 minutes ago
  type: NotificationTypes.INFO,
  priority: NotificationPriorities.MEDIUM
};

describe('NotificationCard', () => {
  it('renders notification with basic props', () => {
    renderWithTheme(
      <NotificationCard {...mockNotification} />
    );

    expect(screen.getByText('Test Notification')).toBeInTheDocument();
    expect(screen.getByText('This is a test notification message')).toBeInTheDocument();
    expect(screen.getByText(/ago/)).toBeInTheDocument();
  });

  it('handles different notification types', () => {
    const { rerender } = renderWithTheme(
      <NotificationCard {...mockNotification} type={NotificationTypes.SUCCESS} />
    );

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // Icon

    rerender(
      <ThemeProvider theme={lightTheme}>
        <NotificationCard {...mockNotification} type={NotificationTypes.ERROR} />
      </ThemeProvider>
    );

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // Different icon
  });

  it('shows unread indicator for unread notifications', () => {
    const { container } = renderWithTheme(
      <NotificationCard {...mockNotification} read={false} />
    );

    expect(container.querySelector('[class*="UnreadIndicator"]')).toBeInTheDocument();
  });

  it('hides unread indicator for read notifications', () => {
    const { container } = renderWithTheme(
      <NotificationCard {...mockNotification} read={true} />
    );

    expect(container.querySelector('[class*="UnreadIndicator"]')).not.toBeInTheDocument();
  });

  it('renders action buttons', () => {
    const actions = [
      {
        id: 'view',
        label: 'View',
        variant: 'outline',
        onClick: jest.fn()
      },
      {
        id: 'dismiss',
        label: 'Dismiss',
        variant: 'ghost',
        onClick: jest.fn()
      }
    ];

    renderWithTheme(
      <NotificationCard {...mockNotification} actions={actions} />
    );

    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
  });

  it('calls action callback when action button is clicked', () => {
    const mockActionClick = jest.fn();
    const mockOnActionClick = jest.fn();
    
    const actions = [
      {
        id: 'view',
        label: 'View',
        onClick: mockActionClick
      }
    ];

    renderWithTheme(
      <NotificationCard
        {...mockNotification}
        actions={actions}
        onActionClick={mockOnActionClick}
      />
    );

    fireEvent.click(screen.getByText('View'));

    expect(mockActionClick).toHaveBeenCalledWith(mockNotification.id, expect.any(Object));
    expect(mockOnActionClick).toHaveBeenCalledWith(
      actions[0],
      mockNotification.id,
      expect.any(Object)
    );
  });

  it('handles dismiss functionality', () => {
    const mockOnDismiss = jest.fn();

    renderWithTheme(
      <NotificationCard
        {...mockNotification}
        dismissible={true}
        onDismiss={mockOnDismiss}
      />
    );

    const dismissButton = screen.getByLabelText('notifications.dismiss');
    fireEvent.click(dismissButton);

    expect(mockOnDismiss).toHaveBeenCalledWith(mockNotification.id);
  });

  it('handles read state toggle', () => {
    const mockOnRead = jest.fn();

    renderWithTheme(
      <NotificationCard
        {...mockNotification}
        read={false}
        onRead={mockOnRead}
      />
    );

    const readButton = screen.getByText('notifications.markRead');
    fireEvent.click(readButton);

    expect(mockOnRead).toHaveBeenCalledWith(mockNotification.id);
  });

  it('displays priority badges for high and critical priorities', () => {
    const { rerender } = renderWithTheme(
      <NotificationCard {...mockNotification} priority={NotificationPriorities.CRITICAL} />
    );

    expect(screen.getByText('notifications.critical')).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={lightTheme}>
        <NotificationCard {...mockNotification} priority={NotificationPriorities.HIGH} />
      </ThemeProvider>
    );

    expect(screen.getByText('notifications.high')).toBeInTheDocument();
  });

  it('renders avatar when provided', () => {
    const avatar = {
      src: 'test-avatar.jpg',
      alt: 'Test User',
      fallback: 'TU'
    };

    renderWithTheme(
      <NotificationCard {...mockNotification} avatar={avatar} />
    );

    expect(screen.getByAltText('Test User')).toBeInTheDocument();
  });

  it('renders badge when provided', () => {
    const badge = {
      text: 'New',
      variant: 'filled',
      color: 'primary'
    };

    renderWithTheme(
      <NotificationCard {...mockNotification} badge={badge} />
    );

    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('displays metadata', () => {
    const metadata = {
      'Customer': 'John Doe',
      'Amount': '$150.00'
    };

    renderWithTheme(
      <NotificationCard {...mockNotification} metadata={metadata} />
    );

    expect(screen.getByText('Customer:')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Amount:')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
  });

  it('handles interactive mode', () => {
    const mockOnClick = jest.fn();
    const mockOnRead = jest.fn();

    renderWithTheme(
      <NotificationCard
        {...mockNotification}
        interactive={true}
        read={false}
        onClick={mockOnClick}
        onRead={mockOnRead}
      />
    );

    fireEvent.click(screen.getByText('Test Notification'));

    expect(mockOnRead).toHaveBeenCalledWith(mockNotification.id);
    expect(mockOnClick).toHaveBeenCalledWith(mockNotification.id, expect.any(Object));
  });

  it('renders in compact mode', () => {
    const { container } = renderWithTheme(
      <NotificationCard {...mockNotification} compact={true} />
    );

    expect(container.firstChild).toHaveStyleRule('padding', expect.stringContaining('12px')); // theme.spacing[3]
  });

  it('formats timestamp correctly', () => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const { rerender } = renderWithTheme(
      <NotificationCard {...mockNotification} timestamp={fiveMinutesAgo} />
    );
    expect(screen.getByText('5m ago')).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={lightTheme}>
        <NotificationCard {...mockNotification} timestamp={oneHourAgo} />
      </ThemeProvider>
    );
    expect(screen.getByText('1h ago')).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={lightTheme}>
        <NotificationCard {...mockNotification} timestamp={oneDayAgo} />
      </ThemeProvider>
    );
    expect(screen.getByText('1d ago')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = renderWithTheme(
      <NotificationCard
        {...mockNotification}
        type={NotificationTypes.SUCCESS}
        className="custom-class"
      />
    );

    const notificationElement = container.firstChild;
    expect(notificationElement).toHaveClass('notification-card');
    expect(notificationElement).toHaveClass('notification-success');
    expect(notificationElement).toHaveClass('custom-class');
  });
});