class PushNotificationService {
  constructor() {
    this.registration = null;
    this.subscription = null;
    this.vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'your-vapid-public-key';
  }

  async initialize() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
      return true;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return false;
    }
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('Notifications are not supported');
      return 'unsupported';
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
    } else if (permission === 'denied') {
      console.warn('Notification permission denied');
    } else {
      console.warn('Notification permission dismissed');
    }

    return permission;
  }

  async subscribe() {
    if (!this.registration) {
      const initialized = await this.initialize();
      if (!initialized) return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlB64ToUint8Array(this.vapidPublicKey)
      });

      this.subscription = subscription;
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  async unsubscribe() {
    if (!this.subscription) {
      const existingSubscription = await this.getExistingSubscription();
      if (existingSubscription) {
        this.subscription = existingSubscription;
      }
    }

    if (this.subscription) {
      try {
        const success = await this.subscription.unsubscribe();
        if (success) {
          await this.removeSubscriptionFromServer(this.subscription);
          this.subscription = null;
        }
        return success;
      } catch (error) {
        console.error('Push unsubscription failed:', error);
        return false;
      }
    }

    return true;
  }

  async getExistingSubscription() {
    if (!this.registration) {
      const initialized = await this.initialize();
      if (!initialized) return null;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        this.subscription = subscription;
      }
      return subscription;
    } catch (error) {
      console.error('Failed to get existing subscription:', error);
      return null;
    }
  }

  async sendSubscriptionToServer(subscription) {
    try {
      // In a real app, send to your push notification server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }

      console.log('Subscription sent to server successfully');
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      // For demo purposes, store in localStorage
      localStorage.setItem('pushSubscription', JSON.stringify(subscription.toJSON()));
    }
  }

  async removeSubscriptionFromServer(subscription) {
    try {
      // In a real app, send to your push notification server
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }

      console.log('Subscription removed from server successfully');
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
      // For demo purposes, remove from localStorage
      localStorage.removeItem('pushSubscription');
    }
  }

  async sendTestNotification(title = 'Test Notification', body = 'This is a test notification from OMNIX AI') {
    if (!this.subscription) {
      console.warn('No push subscription available');
      return false;
    }

    try {
      // In a real app, this would be sent from your server
      // For demo purposes, show a local notification
      if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'test-notification',
          requireInteraction: false,
          actions: [
            {
              action: 'view',
              title: 'View'
            },
            {
              action: 'dismiss',
              title: 'Dismiss'
            }
          ]
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Auto close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to send test notification:', error);
      return false;
    }
  }

  getPermissionStatus() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  isSubscribed() {
    return this.subscription !== null;
  }

  urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Listen for push messages from service worker
  setupMessageListener() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLOSED') {
          console.log('Notification closed:', event.data);
          // Handle notification close analytics
        }
      });
    }
  }
}

// Create singleton instance
const pushNotificationService = new PushNotificationService();

export default pushNotificationService;