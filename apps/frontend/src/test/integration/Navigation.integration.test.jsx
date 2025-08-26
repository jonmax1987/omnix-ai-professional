import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { renderWithTheme } from '../setup';
import App from '../../App';

// Mock components to focus on navigation flow
vi.mock('../../pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>
}));

vi.mock('../../pages/Products', () => ({
  default: () => <div data-testid="products-page">Products Page</div>
}));

vi.mock('../../pages/Settings', () => ({
  default: () => <div data-testid="settings-page">Settings Page</div>
}));

const renderApp = () => {
  return renderWithTheme(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

describe('Navigation Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window location
    delete window.location;
    window.location = { pathname: '/', search: '', hash: '' };
  });

  it('should navigate between main pages using sidebar', async () => {
    renderApp();

    // Should start on dashboard
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    // Navigate to Products
    const productsLink = screen.getByText('Products');
    fireEvent.click(productsLink);

    await waitFor(() => {
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
    });

    // Navigate to Settings
    const settingsLink = screen.getByText('Settings');
    fireEvent.click(settingsLink);

    await waitFor(() => {
      expect(screen.getByTestId('settings-page')).toBeInTheDocument();
    });

    // Navigate back to Dashboard
    const dashboardLink = screen.getByText('Dashboard');
    fireEvent.click(dashboardLink);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });
  });

  it('should highlight active navigation item', async () => {
    renderApp();

    // Dashboard should be active initially
    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink.closest('[data-active="true"]')).toBeInTheDocument();

    // Navigate to Products
    const productsLink = screen.getByText('Products');
    fireEvent.click(productsLink);

    await waitFor(() => {
      expect(productsLink.closest('[data-active="true"]')).toBeInTheDocument();
      expect(dashboardLink.closest('[data-active="true"]')).not.toBeInTheDocument();
    });
  });

  it('should handle mobile navigation', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    window.dispatchEvent(new Event('resize'));

    renderApp();

    // Should show mobile menu button
    const mobileMenuButton = screen.getByLabelText('Toggle navigation');
    expect(mobileMenuButton).toBeInTheDocument();

    // Sidebar should be hidden initially on mobile
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('collapsed');

    // Click mobile menu to open sidebar
    fireEvent.click(mobileMenuButton);

    await waitFor(() => {
      expect(sidebar).not.toHaveClass('collapsed');
    });

    // Navigate to Products on mobile
    const productsLink = screen.getByText('Products');
    fireEvent.click(productsLink);

    // Sidebar should close after navigation on mobile
    await waitFor(() => {
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
      expect(sidebar).toHaveClass('collapsed');
    });
  });

  it('should handle sidebar collapse/expand', async () => {
    renderApp();

    const sidebar = screen.getByTestId('sidebar');
    const collapseButton = screen.getByLabelText('Collapse sidebar');

    // Sidebar should be expanded initially
    expect(sidebar).not.toHaveClass('collapsed');

    // Collapse sidebar
    fireEvent.click(collapseButton);

    await waitFor(() => {
      expect(sidebar).toHaveClass('collapsed');
    });

    // Expand sidebar
    fireEvent.click(collapseButton);

    await waitFor(() => {
      expect(sidebar).not.toHaveClass('collapsed');
    });
  });

  it('should handle user menu interactions', async () => {
    renderApp();

    // Find user avatar/menu
    const userMenu = screen.getByTestId('user-menu');
    fireEvent.click(userMenu);

    // Should show user menu options
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    // Test settings navigation from user menu
    const settingsFromMenu = screen.getByText('Settings');
    fireEvent.click(settingsFromMenu);

    await waitFor(() => {
      expect(screen.getByTestId('settings-page')).toBeInTheDocument();
    });
  });

  it('should handle notifications panel', async () => {
    renderApp();

    // Find notifications button
    const notificationsBell = screen.getByLabelText('Notifications');
    fireEvent.click(notificationsBell);

    // Should show notifications panel
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByTestId('notifications-panel')).toBeInTheDocument();
    });

    // Close notifications panel
    fireEvent.click(notificationsBell);

    await waitFor(() => {
      expect(screen.queryByTestId('notifications-panel')).not.toBeInTheDocument();
    });
  });

  it('should handle language switching', async () => {
    renderApp();

    // Find language switcher
    const languageSwitcher = screen.getByTestId('language-switcher');
    
    // Should show current language (English initially)
    expect(screen.getByText('EN')).toBeInTheDocument();

    // Switch to Hebrew
    fireEvent.click(languageSwitcher);
    const hebrewOption = screen.getByText('עברית');
    fireEvent.click(hebrewOption);

    await waitFor(() => {
      expect(screen.getByText('HE')).toBeInTheDocument();
      // Page should have RTL direction
      expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    });

    // Switch back to English
    fireEvent.click(languageSwitcher);
    const englishOption = screen.getByText('English');
    fireEvent.click(englishOption);

    await waitFor(() => {
      expect(screen.getByText('EN')).toBeInTheDocument();
      expect(document.documentElement).toHaveAttribute('dir', 'ltr');
    });
  });

  it('should handle breadcrumb navigation', async () => {
    renderApp();

    // Navigate to a nested page (if exists)
    const productsLink = screen.getByText('Products');
    fireEvent.click(productsLink);

    await waitFor(() => {
      // Should show breadcrumbs
      const breadcrumb = screen.getByTestId('breadcrumb');
      expect(breadcrumb).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
    });

    // Click on home breadcrumb
    const homeLink = screen.getByText('Home');
    fireEvent.click(homeLink);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });
  });

  it('should handle back button navigation', async () => {
    renderApp();

    // Navigate to Products
    const productsLink = screen.getByText('Products');
    fireEvent.click(productsLink);

    await waitFor(() => {
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
    });

    // Navigate to Settings
    const settingsLink = screen.getByText('Settings');
    fireEvent.click(settingsLink);

    await waitFor(() => {
      expect(screen.getByTestId('settings-page')).toBeInTheDocument();
    });

    // Use browser back button
    window.history.back();

    await waitFor(() => {
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
    });
  });

  it('should persist navigation state across page refreshes', async () => {
    renderApp();

    // Navigate to Products
    const productsLink = screen.getByText('Products');
    fireEvent.click(productsLink);

    await waitFor(() => {
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
    });

    // Simulate page refresh by re-rendering with current location
    window.location.pathname = '/products';
    renderApp();

    // Should still be on Products page
    await waitFor(() => {
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
      expect(screen.getByText('Products').closest('[data-active="true"]')).toBeInTheDocument();
    });
  });
});