// AuthProvider Test Suite
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter } from 'react-router-dom';
import AuthProvider, { useAuth, withAuth, AuthGuard } from '../AuthProvider';
import useUserStore from '../../../store/userStore';
import { lightTheme } from '../../../styles/theme';

// Mock the user store
jest.mock('../../../store/userStore');

// Mock SessionManager
jest.mock('../SessionManager', () => {
  return function MockSessionManager({ onSessionExpired }) {
    return <div data-testid="session-manager">Session Manager</div>;
  };
});

const renderWithProviders = (component) => {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        {component}
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('AuthProvider', () => {
  const mockUserStore = {
    isAuthenticated: true,
    user: { id: 1, name: 'Test User', role: 'user' },
    token: 'mock-token',
    tokenExpiry: Date.now() + 3600000, // 1 hour from now
    loading: { auth: false },
    errors: { auth: null },
    refreshSession: jest.fn(),
    logout: jest.fn(),
    getUserRole: jest.fn(() => 'user'),
    hasPermission: jest.fn(),
    canAccess: jest.fn(),
    getFullName: jest.fn(() => 'Test User'),
    getInitials: jest.fn(() => 'TU')
  };

  beforeEach(() => {
    useUserStore.mockReturnValue(mockUserStore);
    useUserStore.getState = jest.fn(() => mockUserStore);
    jest.clearAllMocks();
  });

  it('renders children and provides auth context', () => {
    const TestComponent = () => {
      const auth = useAuth();
      return (
        <div>
          <span data-testid="authenticated">{auth.isAuthenticated.toString()}</span>
          <span data-testid="user-role">{auth.userRole}</span>
          <span data-testid="full-name">{auth.fullName}</span>
        </div>
      );
    };

    renderWithProviders(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user-role')).toHaveTextContent('user');
    expect(screen.getByTestId('full-name')).toHaveTextContent('Test User');
  });

  it('renders SessionManager when enabled and authenticated', () => {
    renderWithProviders(
      <AuthProvider enableSessionManagement={true}>
        <div>App Content</div>
      </AuthProvider>
    );

    expect(screen.getByTestId('session-manager')).toBeInTheDocument();
  });

  it('does not render SessionManager when disabled', () => {
    renderWithProviders(
      <AuthProvider enableSessionManagement={false}>
        <div>App Content</div>
      </AuthProvider>
    );

    expect(screen.queryByTestId('session-manager')).not.toBeInTheDocument();
  });

  it('does not render SessionManager when not authenticated', () => {
    mockUserStore.isAuthenticated = false;

    renderWithProviders(
      <AuthProvider enableSessionManagement={true}>
        <div>App Content</div>
      </AuthProvider>
    );

    expect(screen.queryByTestId('session-manager')).not.toBeInTheDocument();
  });

  it('calls onAuthStateChange when auth state changes', async () => {
    const onAuthStateChange = jest.fn();

    renderWithProviders(
      <AuthProvider onAuthStateChange={onAuthStateChange}>
        <div>App Content</div>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(onAuthStateChange).toHaveBeenCalledWith({
        isLoading: false,
        isAuthenticated: true,
        user: mockUserStore.user,
        token: mockUserStore.token
      });
    });
  });

  it('handles token refresh automatically', async () => {
    // Set token to expire soon (4 minutes from now)
    mockUserStore.tokenExpiry = Date.now() + 240000;

    renderWithProviders(
      <AuthProvider autoRefreshToken={true}>
        <div>App Content</div>
      </AuthProvider>
    );

    // Wait for the token refresh check
    await waitFor(() => {
      expect(mockUserStore.refreshSession).toHaveBeenCalled();
    }, { timeout: 1000 });
  });
});

describe('useAuth hook', () => {
  it('throws error when used outside AuthProvider', () => {
    const TestComponent = () => {
      useAuth();
      return null;
    };

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });

  it('provides correct auth context values', () => {
    mockUserStore.hasPermission.mockReturnValue(true);
    mockUserStore.canAccess.mockReturnValue(true);

    const TestComponent = () => {
      const auth = useAuth();
      return (
        <div>
          <span data-testid="is-admin">{auth.isAdmin().toString()}</span>
          <span data-testid="is-manager">{auth.isManager().toString()}</span>
          <span data-testid="is-user">{auth.isUser().toString()}</span>
          <span data-testid="has-permission">{auth.hasPermission('products', 'view').toString()}</span>
          <span data-testid="can-access">{auth.canAccess('products').toString()}</span>
        </div>
      );
    };

    renderWithProviders(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
    expect(screen.getByTestId('is-manager')).toHaveTextContent('false');
    expect(screen.getByTestId('is-user')).toHaveTextContent('true');
    expect(screen.getByTestId('has-permission')).toHaveTextContent('true');
    expect(screen.getByTestId('can-access')).toHaveTextContent('true');
  });
});

describe('withAuth HOC', () => {
  const TestComponent = ({ auth }) => (
    <div data-testid="protected-content">
      User: {auth.fullName}
    </div>
  );

  it('renders component when authenticated', () => {
    const ProtectedComponent = withAuth(TestComponent);

    renderWithProviders(
      <AuthProvider>
        <ProtectedComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('User: Test User')).toBeInTheDocument();
  });

  it('shows loading when auth is loading', () => {
    mockUserStore.loading.auth = true;
    const ProtectedComponent = withAuth(TestComponent);

    renderWithProviders(
      <AuthProvider>
        <ProtectedComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('redirects when not authenticated', () => {
    mockUserStore.isAuthenticated = false;
    
    // Mock window.location
    delete window.location;
    window.location = { href: '' };

    const ProtectedComponent = withAuth(TestComponent);

    renderWithProviders(
      <AuthProvider>
        <ProtectedComponent />
      </AuthProvider>
    );

    expect(window.location.href).toBe('/login');
  });

  it('shows access denied for insufficient role', () => {
    const ProtectedComponent = withAuth(TestComponent, {
      requiredRoles: ['admin']
    });

    renderWithProviders(
      <AuthProvider>
        <ProtectedComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Access Denied: Insufficient role')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('shows access denied for insufficient permissions', () => {
    mockUserStore.hasPermission.mockReturnValue(false);
    
    const ProtectedComponent = withAuth(TestComponent, {
      requiredPermissions: [{ resource: 'admin', action: 'manage' }]
    });

    renderWithProviders(
      <AuthProvider>
        <ProtectedComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Access Denied: Insufficient permissions')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});

describe('AuthGuard component', () => {
  it('renders children when authenticated', () => {
    renderWithProviders(
      <AuthProvider>
        <AuthGuard>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('renders fallback when not authenticated', () => {
    mockUserStore.isAuthenticated = false;

    renderWithProviders(
      <AuthProvider>
        <AuthGuard fallback={<div data-testid="fallback">Access Denied</div>}>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('renders children for correct role', () => {
    mockUserStore.getUserRole.mockReturnValue('admin');

    renderWithProviders(
      <AuthProvider>
        <AuthGuard requiredRoles={['admin']}>
          <div data-testid="protected-content">Admin Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('renders fallback for incorrect role', () => {
    renderWithProviders(
      <AuthProvider>
        <AuthGuard 
          requiredRoles={['admin']} 
          fallback={<div data-testid="fallback">Need Admin Role</div>}
        >
          <div data-testid="protected-content">Admin Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('handles permission checking with AND operator', () => {
    mockUserStore.hasPermission.mockImplementation((resource, action) => {
      return resource === 'products' && action === 'view';
    });

    renderWithProviders(
      <AuthProvider>
        <AuthGuard 
          requiredPermissions={[
            { resource: 'products', action: 'view' },
            { resource: 'products', action: 'edit' }
          ]}
          operator="AND"
          fallback={<div data-testid="fallback">Missing Permissions</div>}
        >
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('handles permission checking with OR operator', () => {
    mockUserStore.hasPermission.mockImplementation((resource, action) => {
      return resource === 'products' && action === 'view';
    });

    renderWithProviders(
      <AuthProvider>
        <AuthGuard 
          requiredPermissions={[
            { resource: 'products', action: 'view' },
            { resource: 'products', action: 'edit' }
          ]}
          operator="OR"
        >
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});