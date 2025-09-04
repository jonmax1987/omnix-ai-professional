import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  max-width: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transform: ${props => props.show ? 'translateX(0)' : 'translateX(420px)'};
  transition: transform 0.3s ease-in-out;
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px 8px 20px;
  font-weight: 600;
  font-size: 16px;
  gap: 8px;
`;

const NotificationBody = styled.div`
  padding: 0 20px 16px 20px;
  font-size: 14px;
  line-height: 1.4;
  opacity: 0.9;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 20px 16px 20px;
`;

const Button = styled.button`
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &.primary {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }
  }
  
  &.secondary {
    background: transparent;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
`;

const Icon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`;

const NOTIFICATION_KEY = 'omnix-cache-notification-shown';
const CACHE_VERSION = '2024-09-03-v2';

const CacheUpdateNotification = () => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if we should show the notification
    const shouldShow = checkShouldShowNotification();
    
    if (shouldShow && !dismissed) {
      // Delay showing to avoid jarring experience
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [dismissed]);

  const checkShouldShowNotification = () => {
    try {
      // Check if user has old cached version
      const cachedVersion = localStorage.getItem('omnix-cache-version');
      const notificationShown = localStorage.getItem(NOTIFICATION_KEY);
      
      // Show if cache version doesn't match and notification hasn't been shown for this version
      if (cachedVersion !== CACHE_VERSION && notificationShown !== CACHE_VERSION) {
        return true;
      }
      
      // Also check for JavaScript errors that might indicate cache issues
      const hasJSErrors = window.__OMNIX_JS_ERRORS__ || false;
      if (hasJSErrors && notificationShown !== CACHE_VERSION) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn('Error checking cache notification status:', error);
      return false;
    }
  };

  const handleRefresh = () => {
    // Clear all caches and reload
    try {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('omnix-cache-version', CACHE_VERSION);
      localStorage.setItem(NOTIFICATION_KEY, CACHE_VERSION);
      
      // Clear service worker caches if available
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => registration.unregister());
        });
      }
      
      // Clear cache API
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => caches.delete(cacheName));
        });
      }
      
      // Force reload with cache bust
      window.location.reload(true);
    } catch (error) {
      console.error('Error clearing caches:', error);
      // Fallback to simple reload
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    
    // Mark notification as shown for this version
    try {
      localStorage.setItem(NOTIFICATION_KEY, CACHE_VERSION);
    } catch (error) {
      console.warn('Could not save notification state:', error);
    }
  };

  const handleLater = () => {
    setShow(false);
    // Don't mark as permanently dismissed, allow it to show again later
  };

  if (!show) return null;

  return (
    <NotificationContainer show={show}>
      <CloseButton onClick={handleDismiss}>&times;</CloseButton>
      
      <NotificationHeader>
        <Icon>🔄</Icon>
        App Update Available
      </NotificationHeader>
      
      <NotificationBody>
        We've updated OMNIX AI with important fixes and improvements. 
        To ensure you get the latest version and avoid any issues, 
        please refresh the page to clear your browser cache.
      </NotificationBody>
      
      <ButtonContainer>
        <Button className="primary" onClick={handleRefresh}>
          Refresh Now
        </Button>
        <Button className="secondary" onClick={handleLater}>
          Later
        </Button>
      </ButtonContainer>
    </NotificationContainer>
  );
};

export default CacheUpdateNotification;