// SessionManager Component
// Manages user session timeout and warnings
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import useUserStore from '../../store/userStore';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';

const SessionWarningOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: ${props => props.theme.spacing[4]};
`;

const WarningModal = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[6]};
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const WarningIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: ${props => props.theme.colors.warning}20;
  border-radius: 50%;
  margin: 0 auto ${props => props.theme.spacing[4]};
  color: ${props => props.theme.colors.warning};
`;

const CountdownText = styled(Typography)`
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.theme.colors.danger};
  margin: ${props => props.theme.spacing[3]} 0;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[3]};
  margin-top: ${props => props.theme.spacing[6]};
  justify-content: center;
  
  ${props => props.theme.breakpoints.mobile} {
    flex-direction: column;
  }
`;

const SessionIndicator = styled(motion.div)`
  position: fixed;
  top: ${props => props.theme.spacing[4]};
  right: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 250px;
  
  ${props => props.theme.breakpoints.mobile} {
    top: ${props => props.theme.spacing[2]};
    right: ${props => props.theme.spacing[2]};
    left: ${props => props.theme.spacing[2]};
    max-width: none;
  }
`;

const formatTime = (milliseconds) => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * SessionManager Component
 * Handles session timeout warnings and auto-logout
 */
const SessionManager = ({ 
  showIndicator = false,
  warningDuration = 60000, // 1 minute warning
  onSessionExpired = null,
  onSessionExtended = null,
  ...props 
}) => {
  const {
    isAuthenticated,
    isSessionExpiring,
    isSessionExpired,
    getSessionTimeRemaining,
    showSessionWarning,
    extendSession,
    logout,
    updateLastActivity,
    session
  } = useUserStore();

  const [countdown, setCountdown] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [showIndicatorState, setShowIndicatorState] = useState(false);

  // Use ref to maintain stable reference to updateLastActivity
  const updateLastActivityRef = useRef(updateLastActivity);
  updateLastActivityRef.current = updateLastActivity;

  // Update last activity on user interactions
  const handleUserActivity = useCallback(() => {
    if (isAuthenticated) {
      updateLastActivityRef.current();
    }
  }, [isAuthenticated]);

  // Set up activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [isAuthenticated, handleUserActivity]);

  // Monitor session state
  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
      setShowIndicatorState(false);
      return;
    }

    const checkSession = () => {
      const timeRemaining = getSessionTimeRemaining();
      
      // Session expired
      if (isSessionExpired()) {
        setShowWarning(false);
        setShowIndicatorState(false);
        logout();
        if (onSessionExpired) {
          onSessionExpired();
        }
        return;
      }

      // Show warning
      if (isSessionExpiring() && timeRemaining <= warningDuration) {
        setCountdown(timeRemaining);
        setShowWarning(true);
        if (showIndicator) {
          setShowIndicatorState(true);
        }
      } else {
        setShowWarning(false);
        setShowIndicatorState(false);
      }
    };

    // Check immediately and then every second
    checkSession();
    const interval = setInterval(checkSession, 1000);

    return () => clearInterval(interval);
  }, [
    isAuthenticated,
    isSessionExpiring,
    isSessionExpired,
    getSessionTimeRemaining,
    warningDuration,
    showIndicator,
    logout,
    onSessionExpired
  ]);

  const handleExtendSession = async () => {
    const success = await extendSession();
    if (success) {
      setShowWarning(false);
      setShowIndicatorState(false);
      if (onSessionExtended) {
        onSessionExtended();
      }
    }
  };

  const handleLogout = () => {
    logout();
    setShowWarning(false);
    setShowIndicatorState(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Session Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <SessionWarningOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WarningModal
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ 
                type: "spring",
                damping: 20,
                stiffness: 300
              }}
            >
              <WarningIcon>
                <Icon name="Clock" size={28} />
              </WarningIcon>
              
              <Typography variant="h4" weight="semibold" color="warning">
                Session Expiring Soon
              </Typography>
              
              <Typography variant="body1" color="secondary" style={{ margin: '12px 0' }}>
                Your session will expire in:
              </Typography>
              
              <CountdownText variant="h2">
                {formatTime(countdown)}
              </CountdownText>
              
              <Typography variant="body2" color="secondary">
                You'll be automatically logged out for security reasons.
                Click "Stay Logged In" to extend your session.
              </Typography>
              
              <ActionsContainer>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  color="secondary"
                >
                  <Icon name="LogOut" size={16} />
                  Logout Now
                </Button>
                
                <Button
                  variant="filled"
                  onClick={handleExtendSession}
                  color="primary"
                >
                  <Icon name="RefreshCw" size={16} />
                  Stay Logged In
                </Button>
              </ActionsContainer>
            </WarningModal>
          </SessionWarningOverlay>
        )}
      </AnimatePresence>

      {/* Session Indicator */}
      <AnimatePresence>
        {showIndicatorState && (
          <SessionIndicator
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <Icon name="Clock" size={16} color="warning" />
            <div>
              <Typography variant="caption" weight="medium" color="warning">
                Session expires in
              </Typography>
              <Typography variant="subtitle2" weight="bold" color="danger">
                {formatTime(countdown)}
              </Typography>
            </div>
          </SessionIndicator>
        )}
      </AnimatePresence>
    </>
  );
};

export default SessionManager;