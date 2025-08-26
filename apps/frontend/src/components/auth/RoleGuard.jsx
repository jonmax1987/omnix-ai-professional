// RoleGuard Component
// Enhanced role-based access control with fallback UI
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import useUserStore from '../../store/userStore';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

const AccessDeniedContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[8]};
  text-align: center;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.spacing[3]};
  margin: ${props => props.theme.spacing[4]};
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: ${props => props.theme.colors.warning}20;
  border-radius: 50%;
  margin-bottom: ${props => props.theme.spacing[4]};
  color: ${props => props.theme.colors.warning};
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[3]};
  margin-top: ${props => props.theme.spacing[4]};
  
  ${props => props.theme.breakpoints.mobile} {
    flex-direction: column;
    width: 100%;
    
    > * {
      width: 100%;
    }
  }
`;

/**
 * RoleGuard Component
 * Controls access to components based on user roles and permissions
 */
const RoleGuard = ({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  fallbackComponent = null,
  showFallback = true,
  redirectTo = null,
  onAccessDenied = null,
  operator = 'AND', // 'AND' or 'OR' for permission checking
  ...props
}) => {
  const { 
    user, 
    permissions, 
    hasPermission, 
    getUserRole,
    isAuthenticated 
  } = useUserStore();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return null; // Let ProtectedRoute handle this
  }

  const userRole = getUserRole();
  const hasRequiredRole = allowedRoles.length === 0 || allowedRoles.includes(userRole);
  
  // Check permissions
  let hasRequiredPermissions = true;
  if (requiredPermissions.length > 0) {
    if (operator === 'OR') {
      // User needs at least one of the required permissions
      hasRequiredPermissions = requiredPermissions.some(({ resource, action }) =>
        hasPermission(resource, action)
      );
    } else {
      // User needs all required permissions (AND)
      hasRequiredPermissions = requiredPermissions.every(({ resource, action }) =>
        hasPermission(resource, action)
      );
    }
  }

  const hasAccess = hasRequiredRole && hasRequiredPermissions;

  // Handle access granted
  if (hasAccess) {
    return children;
  }

  // Handle access denied
  React.useEffect(() => {
    if (onAccessDenied) {
      onAccessDenied({
        userRole,
        allowedRoles,
        requiredPermissions,
        user
      });
    }
  }, []);

  // Custom fallback component
  if (fallbackComponent) {
    return fallbackComponent;
  }

  // Don't show anything
  if (!showFallback) {
    return null;
  }

  // Default access denied UI
  return (
    <AccessDeniedContainer
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      <IconContainer>
        <Icon name="Shield" size={32} />
      </IconContainer>
      
      <Typography variant="h5" weight="semibold" color="primary">
        Access Restricted
      </Typography>
      
      <Typography variant="body1" color="secondary" style={{ marginTop: '8px', maxWidth: '400px' }}>
        You don't have the required permissions to access this content.
        {allowedRoles.length > 0 && (
          <span> Required role{allowedRoles.length > 1 ? 's' : ''}: <strong>{allowedRoles.join(', ')}</strong></span>
        )}
      </Typography>

      {requiredPermissions.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <Typography variant="subtitle2" weight="medium" color="secondary">
            Missing Permissions:
          </Typography>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: '8px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            {requiredPermissions
              .filter(({ resource, action }) => !hasPermission(resource, action))
              .map(({ resource, action }, index) => (
                <li key={index}>
                  <Typography variant="caption" color="warning">
                    • {resource}.{action}
                  </Typography>
                </li>
              ))
            }
          </ul>
        </div>
      )}

      <ActionsContainer>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
        >
          <Icon name="ArrowLeft" size={16} />
          Go Back
        </Button>
        
        <Button
          variant="filled"
          color="primary"
          onClick={() => window.location.href = '/dashboard'}
        >
          <Icon name="Home" size={16} />
          Go to Dashboard
        </Button>
      </ActionsContainer>
    </AccessDeniedContainer>
  );
};

/**
 * Hook for checking access within components
 */
export const useRoleGuard = () => {
  const { user, hasPermission, getUserRole, isAuthenticated } = useUserStore();

  const checkAccess = ({
    allowedRoles = [],
    requiredPermissions = [],
    operator = 'AND'
  }) => {
    if (!isAuthenticated) return false;

    const userRole = getUserRole();
    const hasRequiredRole = allowedRoles.length === 0 || allowedRoles.includes(userRole);
    
    let hasRequiredPermissions = true;
    if (requiredPermissions.length > 0) {
      if (operator === 'OR') {
        hasRequiredPermissions = requiredPermissions.some(({ resource, action }) =>
          hasPermission(resource, action)
        );
      } else {
        hasRequiredPermissions = requiredPermissions.every(({ resource, action }) =>
          hasPermission(resource, action)
        );
      }
    }

    return hasRequiredRole && hasRequiredPermissions;
  };

  const canAccess = (config) => checkAccess(config);
  
  const isAdmin = () => getUserRole() === 'admin';
  const isManager = () => ['admin', 'manager'].includes(getUserRole());
  const isUser = () => getUserRole() === 'user';

  return {
    canAccess,
    checkAccess,
    isAdmin,
    isManager,
    isUser,
    userRole: getUserRole(),
    user
  };
};

export default RoleGuard;