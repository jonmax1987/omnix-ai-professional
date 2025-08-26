/**
 * OMNIX AI - Notification Service
 * Comprehensive push notification system with AI-powered targeting
 * Supports web push, service workers, and real-time delivery
 */

import { apiService } from './api';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

class NotificationService {
  constructor() {
    this.registration = null;
    this.subscription = null;
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    
    // Notification types with AI confidence scoring
    this.notificationTypes = {
      REPLENISHMENT: {
        id: 'replenishment',
        priority: 'high',
        icon: '🛒',
        sound: 'default',
        requiresAction: true,
        aiConfidence: true
      },
      DEAL_ALERT: {
        id: 'deal',
        priority: 'medium',
        icon: '💰',
        sound: 'soft',
        requiresAction: false,
        aiConfidence: true
      },
      PRICE_DROP: {
        id: 'price_drop',
        priority: 'medium',
        icon: '📉',
        sound: 'soft',
        requiresAction: false,
        aiConfidence: false
      },
      NEW_PRODUCT: {
        id: 'new_product',
        priority: 'low',
        icon: '✨',
        sound: 'quiet',
        requiresAction: false,
        aiConfidence: true
      },
      LOYALTY_UPDATE: {
        id: 'loyalty',
        priority: 'low',
        icon: '🎉',
        sound: 'celebration',
        requiresAction: false,
        aiConfidence: false
      },
      SYSTEM_ALERT: {
        id: 'system',
        priority: 'high',
        icon: '⚠️',
        sound: 'urgent',
        requiresAction: true,
        aiConfidence: false
      }
    };
    
    this.initialize();
  }

  /**
   * Initialize notification system
   */
  async initialize() {
    if (!this.isSupported) {
      console.warn('Push notifications not supported in this browser');
      return false;
    }

    try {
      // Register service worker
      await this.registerServiceWorker();
      
      // Request permission if not granted
      if (this.permission === 'default') {
        await this.requestPermission();
      }
      
      // Subscribe to push notifications if granted
      if (this.permission === 'granted') {
        await this.subscribe();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  /**
   * Register service worker for push notifications
   */
  async registerServiceWorker() {
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service worker registered:', this.registration);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      return this.registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Request notification permission with AI-powered timing
   */
  async requestPermission() {
    try {
      // AI-powered optimal timing - check user engagement patterns
      const { canRequest, suggestedTiming } = await this.getOptimalPermissionTiming();
      
      if (!canRequest) {
        console.log(`Permission request delayed - optimal timing: ${suggestedTiming}`);
        return 'delayed';
      }
      
      this.permission = await Notification.requestPermission();
      
      // Track permission decision for AI learning
      await this.trackPermissionDecision(this.permission);
      
      return this.permission;
    } catch (error) {
      console.error('Permission request failed:', error);
      return 'denied';
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe() {
    if (!this.registration || this.permission !== 'granted') {
      throw new Error('Cannot subscribe - service worker not registered or permission denied');
    }

    try {
      // Get VAPID public key from server
      const { vapidPublicKey } = await apiService.get('/notifications/vapid-key');
      
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });
      
      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription);
      
      console.log('Push subscription successful:', this.subscription);
      return this.subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe() {
    try {
      if (this.subscription) {
        await this.subscription.unsubscribe();
        await this.removeSubscriptionFromServer();
        this.subscription = null;
      }
      return true;
    } catch (error) {
      console.error('Unsubscribe failed:', error);
      return false;
    }
  }

  /**
   * Send local notification with AI personalization
   */
  async sendLocalNotification(type, data) {
    if (this.permission !== 'granted') {
      console.warn('Notifications not permitted');
      return false;
    }

    const notificationType = this.notificationTypes[type];
    if (!notificationType) {
      console.error('Invalid notification type:', type);
      return false;
    }

    try {
      // AI-powered notification personalization
      const personalizedContent = await this.personalizeNotification(type, data);
      
      const notification = new Notification(personalizedContent.title, {
        body: personalizedContent.body,
        icon: personalizedContent.icon || `/icons/${notificationType.icon}.png`,
        badge: '/icons/badge.png',
        tag: `${type}-${data.id}`,
        requireInteraction: notificationType.requiresAction,
        silent: notificationType.sound === 'quiet',
        actions: personalizedContent.actions || [],
        data: {
          ...data,
          type,
          timestamp: Date.now(),
          aiGenerated: personalizedContent.aiGenerated
        }
      });

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        this.handleNotificationClick(event.target.data);
        notification.close();
      };

      // Track notification delivery
      await this.trackNotificationDelivery(type, data.id, 'delivered');
      
      return notification;
    } catch (error) {
      console.error('Local notification failed:', error);
      return false;
    }
  }

  /**
   * AI-powered notification personalization
   */
  async personalizeNotification(type, data) {
    try {
      const userPreferences = useNotificationStore.getState().preferences;
      const userProfile = useAuthStore.getState().user;
      
      const response = await apiService.post('/ai/personalize-notification', {
        type,
        data,
        userPreferences,
        userProfile: {
          id: userProfile.id,
          shoppingPatterns: userProfile.shoppingPatterns,
          preferences: userProfile.preferences
        }
      });
      
      return {
        title: response.personalizedTitle,
        body: response.personalizedBody,
        icon: response.recommendedIcon,
        actions: response.suggestedActions,
        aiGenerated: true,
        confidence: response.confidence
      };
    } catch (error) {
      console.error('Notification personalization failed:', error);
      
      // Fallback to default content
      return this.getDefaultNotificationContent(type, data);
    }
  }

  /**
   * Get default notification content
   */
  getDefaultNotificationContent(type, data) {
    const templates = {
      REPLENISHMENT: {
        title: `Time to restock ${data.productName}!`,
        body: `Based on your usage, you'll run out in ${data.daysRemaining} days.`,
        actions: [
          { action: 'buy-now', title: 'Buy Now' },
          { action: 'remind-later', title: 'Remind Later' }
        ]
      },
      DEAL_ALERT: {
        title: `Great deal on ${data.productName}!`,
        body: `Save ${data.discount}% - limited time offer`,
        actions: [
          { action: 'view-deal', title: 'View Deal' },
          { action: 'dismiss', title: 'Not Interested' }
        ]
      },
      PRICE_DROP: {
        title: `Price drop alert!`,
        body: `${data.productName} is now ${data.newPrice} (was ${data.oldPrice})`,
        actions: [
          { action: 'buy-now', title: 'Buy Now' },
          { action: 'add-to-cart', title: 'Add to Cart' }
        ]
      },
      NEW_PRODUCT: {
        title: `New product you might like`,
        body: `${data.productName} - ${data.reason}`,
        actions: [
          { action: 'learn-more', title: 'Learn More' },
          { action: 'dismiss', title: 'Not Interested' }
        ]
      },
      LOYALTY_UPDATE: {
        title: `Loyalty reward earned!`,
        body: `You've earned ${data.points} points. Total: ${data.totalPoints}`,
        actions: [
          { action: 'view-rewards', title: 'View Rewards' }
        ]
      }
    };
    
    return templates[type] || { title: 'OMNIX Notification', body: data.message };
  }

  /**
   * Handle notification click events
   */
  async handleNotificationClick(data) {
    const { type, action } = data;
    
    // Track interaction
    await this.trackNotificationInteraction(type, data.id, action || 'click');
    
    // Route based on notification type and action
    switch (type) {
      case 'REPLENISHMENT':
        if (action === 'buy-now') {
          window.location.href = `/product/${data.productId}?action=buy`;
        } else if (action === 'remind-later') {
          await this.scheduleReminder(data.productId, data.reminderDelay || 86400000); // 1 day
        }
        break;
        
      case 'DEAL_ALERT':
        if (action === 'view-deal') {
          window.location.href = `/deals/${data.dealId}`;
        }
        break;
        
      case 'PRICE_DROP':
        window.location.href = `/product/${data.productId}`;
        break;
        
      case 'NEW_PRODUCT':
        if (action === 'learn-more') {
          window.location.href = `/product/${data.productId}`;
        }
        break;
        
      case 'LOYALTY_UPDATE':
        window.location.href = '/rewards';
        break;
        
      default:
        window.location.href = '/dashboard';
    }
  }

  /**
   * Get optimal permission request timing using AI
   */
  async getOptimalPermissionTiming() {
    try {
      const response = await apiService.post('/ai/optimal-permission-timing', {
        userEngagement: this.getUserEngagementMetrics(),
        currentTime: new Date().toISOString(),
        pageContext: window.location.pathname
      });
      
      return {
        canRequest: response.shouldRequest,
        suggestedTiming: response.optimalTime,
        confidence: response.confidence
      };
    } catch (error) {
      console.error('Failed to get optimal timing:', error);
      return { canRequest: true, suggestedTiming: 'now' };
    }
  }

  /**
   * Get user engagement metrics for AI optimization
   */
  getUserEngagementMetrics() {
    return {
      sessionDuration: Date.now() - (window.sessionStartTime || Date.now()),
      pageViews: parseInt(sessionStorage.getItem('pageViews') || '1'),
      interactions: parseInt(sessionStorage.getItem('userInteractions') || '0'),
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      deviceType: this.getDeviceType()
    };
  }

  /**
   * Get device type for context-aware notifications
   */
  getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      return 'mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      return 'tablet';
    }
    return 'desktop';
  }

  /**
   * Track notification delivery for analytics
   */
  async trackNotificationDelivery(type, notificationId, status) {
    try {
      await apiService.post('/analytics/notification-delivery', {
        type,
        notificationId,
        status,
        timestamp: Date.now(),
        deviceType: this.getDeviceType(),
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to track delivery:', error);
    }
  }

  /**
   * Track notification interactions for AI learning
   */
  async trackNotificationInteraction(type, notificationId, action) {
    try {
      await apiService.post('/analytics/notification-interaction', {
        type,
        notificationId,
        action,
        timestamp: Date.now(),
        deviceType: this.getDeviceType()
      });
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  }

  /**
   * Track permission decisions for optimization
   */
  async trackPermissionDecision(decision) {
    try {
      await apiService.post('/analytics/permission-decision', {
        decision,
        timestamp: Date.now(),
        userContext: this.getUserEngagementMetrics()
      });
    } catch (error) {
      console.error('Failed to track permission decision:', error);
    }
  }

  /**
   * Send subscription to server
   */
  async sendSubscriptionToServer(subscription) {
    try {
      await apiService.post('/notifications/subscribe', {
        subscription,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          deviceType: this.getDeviceType()
        }
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      throw error;
    }
  }

  /**
   * Remove subscription from server
   */
  async removeSubscriptionFromServer() {
    try {
      await apiService.post('/notifications/unsubscribe', {
        endpoint: this.subscription.endpoint
      });
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
    }
  }

  /**
   * Schedule reminder notification
   */
  async scheduleReminder(productId, delay) {
    try {
      await apiService.post('/notifications/schedule-reminder', {
        productId,
        delay,
        scheduledFor: new Date(Date.now() + delay).toISOString()
      });
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  urlBase64ToUint8Array(base64String) {
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

  /**
   * Get notification status and capabilities
   */
  getStatus() {
    return {
      isSupported: this.isSupported,
      permission: this.permission,
      isSubscribed: !!this.subscription,
      serviceWorkerRegistered: !!this.registration,
      deviceType: this.getDeviceType()
    };
  }

  /**
   * Test notification (for debugging)
   */
  async testNotification() {
    return this.sendLocalNotification('DEAL_ALERT', {
      id: 'test-' + Date.now(),
      productName: 'Test Product',
      discount: 25,
      productId: 'test-123'
    });
  }
}

// Create singleton instance
export const notificationService = new NotificationService();
export default notificationService;