// AuthProvider Component
// Central authentication provider with enhanced features
import React, { createContext, useContext, useEffect, useState } from 'react';
import useUserStore from '../../store/userStore';
import SessionManager from './SessionManager';

const AuthContext = createContext({});

/**
 * AuthProvider Component
 * Provides authentication context and session management
 */
const AuthProvider = ({ 
  children,
  enableSessionManagement = true,
  showSessionIndicator = false,
  autoRefreshToken = true,
  onAuthStateChange = null,
  onSessionExpired = null,
  ...props 
}) => {
  const {
    isAuthenticated,
    user,
    token,
    loading,
    errors,
    refreshSession,
    logout,
    getUserRole,
    hasPermission,
    canAccess
  } = useUserStore();

  const [authState, setAuthState] = useState({
    isLoading: loading.auth,
    isAuthenticated,
    user,
    token
  });

  // Monitor auth state changes
  useEffect(() => {
    const newAuthState = {
      isLoading: loading.auth,
      isAuthenticated,
      user,
      token
    };

    setAuthState(newAuthState);

    if (onAuthStateChange) {
      onAuthStateChange(newAuthState);
    }
  }, [isAuthenticated, user, token, loading.auth]); // Remove onAuthStateChange from deps

  // Auto token refresh
  useEffect(() => {
    if (!autoRefreshToken || !isAuthenticated || !token) return;

    const checkTokenRefresh = async () => {
      try {
        // Check if token needs refresh (5 minutes before expiry)
        const tokenExpiry = useUserStore.getState().tokenExpiry;
        if (tokenExpiry && Date.now() > tokenExpiry - 300000) {
          const refreshed = await refreshSession();
          // Only logout if refresh explicitly failed and we have a token
          if (!refreshed && token) {
            console.log('Token refresh failed, session expired');
            // Optional: You can trigger logout here if needed
            // logout();
          }
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkTokenRefresh, 300000);
    
    // Don't check immediately on mount to prevent logout loops
    // The first check will happen after 5 minutes
    
    return () => clearInterval(interval);
  }, [isAuthenticated, token, autoRefreshToken, refreshSession]);

  // Handle session expiration
  const handleSessionExpired = () => {
    if (onSessionExpired) {
      onSessionExpired();
    } else {
      // Default behavior: redirect to login
      window.location.href = '/login';
    }
  };

  const contextValue = {
    // Auth state
    isAuthenticated,
    isLoading: authState.isLoading,
    user,
    token,
    
    // User info
    userRole: getUserRole(),
    fullName: useUserStore.getState().getFullName(),
    initials: useUserStore.getState().getInitials(),
    
    // Permissions
    hasPermission,
    canAccess,
    
    // Actions
    logout,
    refreshSession,
    
    // Errors
    error: errors.auth,
    
    // Utilities
    isAdmin: () => getUserRole() === 'admin',
    isManager: () => ['admin', 'manager'].includes(getUserRole()),
    isUser: () => getUserRole() === 'user'
  };

  return (
    <AuthContext.Provider value={contextValue} {...props}>
      {children}
      
      {/* Session Management */}
      {enableSessionManagement && isAuthenticated && (
        <SessionManager
          showIndicator={showSessionIndicator}
          onSessionExpired={handleSessionExpired}
        />
      )}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Higher-order component for authentication
 */
export const withAuth = (WrappedComponent, options = {}) => {
  const {
    requiredRoles = [],
    requiredPermissions = [],
    redirectTo = '/login',
    loadingComponent = null
  } = options;

  return function AuthenticatedComponent(props) {
    const auth = useAuth();

    if (auth.isLoading) {
      return loadingComponent || <div>Loading...</div>;
    }

    if (!auth.isAuthenticated) {
      window.location.href = redirectTo;
      return null;
    }

    // Check role requirements
    if (requiredRoles.length > 0 && !requiredRoles.includes(auth.userRole)) {
      return <div>Access Denied: Insufficient role</div>;
    }

    // Check permission requirements
    const hasRequiredPermissions = requiredPermissions.every(({ resource, action }) =>
      auth.hasPermission(resource, action)
    );

    if (!hasRequiredPermissions) {
      return <div>Access Denied: Insufficient permissions</div>;
    }

    return <WrappedComponent {...props} auth={auth} />;
  };
};

/**
 * Component for conditional rendering based on auth state
 */
export const AuthGuard = ({ 
  children, 
  fallback = null, 
  requireAuth = true,
  requiredRoles = [],
  requiredPermissions = [],
  operator = 'AND'
}) => {
  const auth = useAuth();

  if (auth.isLoading) {
    return fallback;
  }

  if (requireAuth && !auth.isAuthenticated) {
    return fallback;
  }

  // Check role requirements
  if (requiredRoles.length > 0 && !requiredRoles.includes(auth.userRole)) {
    return fallback;
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const hasPermissions = operator === 'OR'
      ? requiredPermissions.some(({ resource, action }) => auth.hasPermission(resource, action))
      : requiredPermissions.every(({ resource, action }) => auth.hasPermission(resource, action));
    
    if (!hasPermissions) {
      return fallback;
    }
  }

  return children;
};

export default AuthProvider;