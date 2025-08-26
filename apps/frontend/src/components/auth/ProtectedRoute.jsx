import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useUserStore from '../../store/userStore';

function ProtectedRoute({ children, requiredPermission = null, requiredResource = null }) {
  const { isAuthenticated, hasPermission, canAccess, token, loading } = useUserStore();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading?.auth) {
    return <div>Loading...</div>;
  }

  // Check authentication only after loading is complete
  if (!isAuthenticated) {
    // Redirect to login page with return path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check specific permission if required
  if (requiredPermission && requiredResource) {
    if (!hasPermission(requiredResource, requiredPermission)) {
      // Redirect to unauthorized page with context
      return (
        <Navigate 
          to="/unauthorized" 
          state={{
            reason: 'insufficient_permissions',
            requiredPermissions: [{ resource: requiredResource, action: requiredPermission }],
            resource: requiredResource,
            from: location
          }}
          replace 
        />
      );
    }
  }

  // Check resource access if required
  if (requiredResource && !requiredPermission) {
    if (!canAccess(requiredResource)) {
      return (
        <Navigate 
          to="/unauthorized" 
          state={{
            reason: 'insufficient_permissions',
            resource: requiredResource,
            from: location
          }}
          replace 
        />
      );
    }
  }

  return children;
}

export default ProtectedRoute;