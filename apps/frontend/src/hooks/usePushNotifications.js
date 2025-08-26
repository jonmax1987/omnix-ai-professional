import { useState, useEffect, useCallback } from 'react';
import pushNotificationService from '../services/pushNotifications';
import useUserStore from '../store/userStore';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { preferences } = useUserStore();

  // Initialize push notification support detection
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 
                       'PushManager' in window && 
                       'Notification' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
        pushNotificationService.setupMessageListener();
      }
    };

    checkSupport();
  }, []);

  // Check for existing subscription on mount
  useEffect(() => {
    const checkExistingSubscription = async () => {
      if (isSupported && preferences.notifications.push) {
        try {
          setIsLoading(true);
          const initialized = await pushNotificationService.initialize();
          if (initialized) {
            const existingSubscription = await pushNotificationService.getExistingSubscription();
            setSubscription(existingSubscription);
          }
        } catch (error) {
          console.error('Error checking existing subscription:', error);
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkExistingSubscription();
  }, [isSupported, preferences.notifications.push]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const permissionResult = await pushNotificationService.requestPermission();
      setPermission(permissionResult);
      
      return permissionResult === 'granted';
    } catch (error) {
      console.error('Error requesting permission:', error);
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser');
      return false;
    }

    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        setError('Permission not granted for notifications');
        return false;
      }
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const newSubscription = await pushNotificationService.subscribe();
      setSubscription(newSubscription);
      
      return newSubscription !== null;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission, requestPermission]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!isSupported) {
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const success = await pushNotificationService.unsubscribe();
      if (success) {
        setSubscription(null);
      }
      
      return success;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Send a test notification
  const sendTestNotification = useCallback(async (title, body) => {
    if (!isSupported || !subscription) {
      setError('Not subscribed to push notifications');
      return false;
    }

    try {
      setError(null);
      const success = await pushNotificationService.sendTestNotification(title, body);
      
      if (!success) {
        setError('Failed to send test notification');
      }
      
      return success;
    } catch (error) {
      console.error('Error sending test notification:', error);
      setError(error.message);
      return false;
    }
  }, [isSupported, subscription]);

  // Check if user is subscribed
  const isSubscribed = useCallback(() => {
    return subscription !== null && pushNotificationService.isSubscribed();
  }, [subscription]);

  // Get current status
  const getStatus = useCallback(() => {
    if (!isSupported) return 'unsupported';
    if (permission === 'denied') return 'denied';
    if (permission === 'default') return 'default';
    if (isSubscribed()) return 'subscribed';
    return 'granted';
  }, [isSupported, permission, isSubscribed]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    permission,
    subscription,
    isSupported,
    isLoading,
    error,
    
    // Computed
    isSubscribed: isSubscribed(),
    status: getStatus(),
    
    // Actions
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    clearError
  };
};

export default usePushNotifications;