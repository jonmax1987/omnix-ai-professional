// RoleGuard Test Suite
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter } from 'react-router-dom';
import RoleGuard, { useRoleGuard } from '../RoleGuard';
import useUserStore from '../../../store/userStore';
import { lightTheme } from '../../../styles/theme';

// Mock the user store
jest.mock('../../../store/userStore');

const renderWithTheme = (component) => {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        {component}
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('RoleGuard', () => {
  const mockUserStore = {
    isAuthenticated: true,
    user: { id: 1, name: 'Test User', role: 'user' },
    permissions: {
      products: { view: true, create: false, edit: false, delete: false },
      orders: { view: true, create: true, edit: false, delete: false }
    },
    hasPermission: jest.fn(),
    getUserRole: jest.fn(),
  };

  beforeEach(() => {
    useUserStore.mockReturnValue(mockUserStore);
    mockUserStore.hasPermission.mockImplementation((resource, action) => {
      return mockUserStore.permissions[resource]?.[action] || false;
    });
    mockUserStore.getUserRole.mockReturnValue('user');
    jest.clearAllMocks();
  });

  it('renders children when user has required role', () => {
    renderWithTheme(
      <RoleGuard allowedRoles={['user', 'admin']}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows access denied when user lacks required role', () => {
    mockUserStore.getUserRole.mockReturnValue('guest');

    renderWithTheme(
      <RoleGuard allowedRoles={['admin']}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    expect(screen.getByText(/Required role: admin/)).toBeInTheDocument();
  });

  it('renders children when user has required permissions (AND operator)', () => {
    const requiredPermissions = [
      { resource: 'products', action: 'view' },
      { resource: 'orders', action: 'view' }
    ];

    renderWithTheme(
      <RoleGuard requiredPermissions={requiredPermissions} operator="AND">
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows access denied when user lacks required permissions (AND operator)', () => {
    const requiredPermissions = [
      { resource: 'products', action: 'view' },
      { resource: 'products', action: 'delete' } // User doesn't have delete permission
    ];

    renderWithTheme(
      <RoleGuard requiredPermissions={requiredPermissions} operator="AND">
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    expect(screen.getByText('Missing Permissions:')).toBeInTheDocument();
    expect(screen.getByText('• products.delete')).toBeInTheDocument();
  });

  it('renders children when user has at least one required permission (OR operator)', () => {
    const requiredPermissions = [
      { resource: 'products', action: 'view' }, // User has this
      { resource: 'products', action: 'delete' } // User doesn't have this
    ];

    renderWithTheme(
      <RoleGuard requiredPermissions={requiredPermissions} operator="OR">
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows access denied when user has no required permissions (OR operator)', () => {
    const requiredPermissions = [
      { resource: 'products', action: 'delete' },
      { resource: 'orders', action: 'delete' }
    ];

    renderWithTheme(
      <RoleGuard requiredPermissions={requiredPermissions} operator="OR">
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
  });

  it('renders custom fallback component', () => {
    const CustomFallback = () => <div>Custom Access Denied</div>;

    renderWithTheme(
      <RoleGuard allowedRoles={['admin']} fallbackComponent={<CustomFallback />}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Custom Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Access Restricted')).not.toBeInTheDocument();
  });

  it('returns null when user is not authenticated', () => {
    mockUserStore.isAuthenticated = false;

    const { container } = renderWithTheme(
      <RoleGuard allowedRoles={['user']}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(container.firstChild).toBeNull();
  });

  it('returns null when showFallback is false', () => {
    mockUserStore.getUserRole.mockReturnValue('guest');

    const { container } = renderWithTheme(
      <RoleGuard allowedRoles={['admin']} showFallback={false}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(container.firstChild).toBeNull();
  });

  it('calls onAccessDenied callback when access is denied', () => {
    const onAccessDenied = jest.fn();
    mockUserStore.getUserRole.mockReturnValue('guest');

    renderWithTheme(
      <RoleGuard allowedRoles={['admin']} onAccessDenied={onAccessDenied}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(onAccessDenied).toHaveBeenCalledWith({
      userRole: 'guest',
      allowedRoles: ['admin'],
      requiredPermissions: [],
      user: mockUserStore.user
    });
  });

  it('handles navigation buttons correctly', () => {
    mockUserStore.getUserRole.mockReturnValue('guest');
    
    // Mock window.history.back and window.location
    const mockBack = jest.fn();
    Object.defineProperty(window, 'history', {
      value: { back: mockBack },
      writable: true
    });
    
    delete window.location;
    window.location = { href: '' };

    renderWithTheme(
      <RoleGuard allowedRoles={['admin']}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    const backButton = screen.getByText('Go Back');
    const dashboardButton = screen.getByText('Go to Dashboard');

    fireEvent.click(backButton);
    expect(mockBack).toHaveBeenCalled();

    fireEvent.click(dashboardButton);
    expect(window.location.href).toBe('/dashboard');
  });
});

describe('useRoleGuard hook', () => {
  const TestComponent = () => {
    const { canAccess, isAdmin, isManager, isUser, userRole } = useRoleGuard();
    
    return (
      <div>
        <span data-testid="user-role">{userRole}</span>
        <span data-testid="is-admin">{isAdmin().toString()}</span>
        <span data-testid="is-manager">{isManager().toString()}</span>
        <span data-testid="is-user">{isUser().toString()}</span>
        <span data-testid="can-view-products">
          {canAccess({ 
            requiredPermissions: [{ resource: 'products', action: 'view' }] 
          }).toString()}
        </span>
      </div>
    );
  };

  const mockUserStore = {
    isAuthenticated: true,
    user: { id: 1, name: 'Test User', role: 'manager' },
    permissions: {
      products: { view: true, create: true, edit: false, delete: false }
    },
    hasPermission: jest.fn(),
    getUserRole: jest.fn(),
  };

  beforeEach(() => {
    useUserStore.mockReturnValue(mockUserStore);
    mockUserStore.hasPermission.mockImplementation((resource, action) => {
      return mockUserStore.permissions[resource]?.[action] || false;
    });
    mockUserStore.getUserRole.mockReturnValue('manager');
    jest.clearAllMocks();
  });

  it('provides correct role information', () => {
    render(<TestComponent />);

    expect(screen.getByTestId('user-role')).toHaveTextContent('manager');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
    expect(screen.getByTestId('is-manager')).toHaveTextContent('true');
    expect(screen.getByTestId('is-user')).toHaveTextContent('false');
  });

  it('correctly checks permissions', () => {
    render(<TestComponent />);

    expect(screen.getByTestId('can-view-products')).toHaveTextContent('true');
  });

  it('handles admin role correctly', () => {
    mockUserStore.getUserRole.mockReturnValue('admin');

    render(<TestComponent />);

    expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
    expect(screen.getByTestId('is-manager')).toHaveTextContent('true'); // admin is also manager
    expect(screen.getByTestId('is-user')).toHaveTextContent('false');
  });
});