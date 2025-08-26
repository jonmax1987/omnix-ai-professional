// Unauthorized Page
// Dedicated page for access denied scenarios
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import useUserStore from '../store/userStore';
import Button from '../components/atoms/Button';
import Typography from '../components/atoms/Typography';
import Icon from '../components/atoms/Icon';
import SEOHead from '../components/atoms/SEOHead';

const UnauthorizedContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.background};
  padding: ${props => props.theme.spacing[4]};
`;

const ContentCard = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[8]};
  text-align: center;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  ${props => props.theme.breakpoints.mobile} {
    padding: ${props => props.theme.spacing[6]};
    margin: ${props => props.theme.spacing[4]};
  }
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  background: ${props => props.theme.colors.warning}20;
  border-radius: 50%;
  margin: 0 auto ${props => props.theme.spacing[6]};
  color: ${props => props.theme.colors.warning};
`;

const InfoSection = styled.div`
  margin: ${props => props.theme.spacing[6]} 0;
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.spacing[2]};
  text-align: left;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: ${props => props.theme.spacing[2]} 0;
  padding: ${props => props.theme.spacing[2]} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[3]};
  justify-content: center;
  margin-top: ${props => props.theme.spacing[6]};
  
  ${props => props.theme.breakpoints.mobile} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, getUserRole, logout } = useUserStore();

  // Get additional info from route state
  const {
    reason = 'insufficient_permissions',
    requiredRole = null,
    requiredPermissions = [],
    resource = null
  } = location.state || {};

  const userRole = getUserRole();

  const getReasonMessage = () => {
    switch (reason) {
      case 'insufficient_role':
        return `Your current role (${userRole}) doesn't have access to this resource.`;
      case 'insufficient_permissions':
        return 'You don\'t have the required permissions to access this resource.';
      case 'session_expired':
        return 'Your session has expired. Please log in again.';
      case 'account_locked':
        return 'Your account has been temporarily locked for security reasons.';
      case 'feature_disabled':
        return 'This feature is currently disabled or under maintenance.';
      default:
        return 'You don\'t have permission to access this resource.';
    }
  };

  const getActionSuggestion = () => {
    switch (reason) {
      case 'insufficient_role':
        return 'Contact your administrator to request role elevation if needed.';
      case 'insufficient_permissions':
        return 'Contact your administrator to request additional permissions.';
      case 'session_expired':
        return 'Please log in again to continue using the application.';
      case 'account_locked':
        return 'Contact support or try again later.';
      case 'feature_disabled':
        return 'Check back later or contact support for more information.';
      default:
        return 'Contact your administrator for assistance.';
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleContact = () => {
    // You could implement a contact form modal or mailto link here
    window.open('mailto:support@omnix.ai?subject=Access Request&body=I need access to a restricted resource.', '_blank');
  };

  return (
    <>
      <SEOHead 
        title="Access Denied - OMNIX AI"
        description="You don't have permission to access this resource"
        noIndex={true}
      />
      
      <UnauthorizedContainer>
        <ContentCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <IconContainer>
            <Icon name="ShieldX" size={48} />
          </IconContainer>
          
          <Typography variant="h3" weight="bold" color="warning">
            Access Denied
          </Typography>
          
          <Typography variant="h6" color="secondary" style={{ marginTop: '12px' }}>
            {getReasonMessage()}
          </Typography>
          
          <Typography variant="body1" color="tertiary" style={{ marginTop: '16px' }}>
            {getActionSuggestion()}
          </Typography>

          {/* User and Access Information */}
          <InfoSection>
            <Typography variant="subtitle2" weight="medium" color="primary" style={{ marginBottom: '12px' }}>
              Access Information
            </Typography>
            
            <InfoItem>
              <Typography variant="body2" color="secondary">Current User:</Typography>
              <Typography variant="body2" weight="medium">
                {user?.name || user?.email || 'Unknown'}
              </Typography>
            </InfoItem>
            
            <InfoItem>
              <Typography variant="body2" color="secondary">Current Role:</Typography>
              <Typography variant="body2" weight="medium" color="primary">
                {userRole}
              </Typography>
            </InfoItem>
            
            {requiredRole && (
              <InfoItem>
                <Typography variant="body2" color="secondary">Required Role:</Typography>
                <Typography variant="body2" weight="medium" color="warning">
                  {requiredRole}
                </Typography>
              </InfoItem>
            )}
            
            {resource && (
              <InfoItem>
                <Typography variant="body2" color="secondary">Requested Resource:</Typography>
                <Typography variant="body2" weight="medium">
                  {resource}
                </Typography>
              </InfoItem>
            )}
            
            {requiredPermissions.length > 0 && (
              <InfoItem>
                <Typography variant="body2" color="secondary">Missing Permissions:</Typography>
                <div>
                  {requiredPermissions.map((perm, index) => (
                    <Typography key={index} variant="caption" color="warning" style={{ display: 'block' }}>
                      {perm.resource}.{perm.action}
                    </Typography>
                  ))}
                </div>
              </InfoItem>
            )}
          </InfoSection>

          {/* Action Buttons */}
          <ActionsContainer>
            <Button
              variant="outline"
              onClick={handleGoBack}
              color="secondary"
            >
              <Icon name="ArrowLeft" size={16} />
              Go Back
            </Button>
            
            <Button
              variant="filled"
              onClick={handleGoHome}
              color="primary"
            >
              <Icon name="Home" size={16} />
              Dashboard
            </Button>
            
            <Button
              variant="outline"
              onClick={handleContact}
              color="primary"
            >
              <Icon name="Mail" size={16} />
              Request Access
            </Button>
          </ActionsContainer>

          {reason === 'session_expired' && (
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: `1px solid ${props => props.theme?.colors?.border || '#e2e8f0'}` }}>
              <Button
                variant="filled"
                onClick={handleLogout}
                color="warning"
                style={{ width: '100%' }}
              >
                <Icon name="LogOut" size={16} />
                Log In Again
              </Button>
            </div>
          )}
        </ContentCard>
      </UnauthorizedContainer>
    </>
  );
};

export default Unauthorized;