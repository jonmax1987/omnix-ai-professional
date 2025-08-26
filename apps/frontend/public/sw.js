/**
 * OMNIX AI - Service Worker for Push Notifications
 * Handles background push notifications, caching, and offline functionality
 */

const CACHE_NAME = 'omnix-ai-v1';
const API_BASE_URL = self.location.origin;

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching essential files');
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json'
        ]);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received');
  
  if (!event.data) {
    console.log('Push event has no data');
    return;
  }

  try {
    const data = event.data.json();
    const { type, title, body, icon, actions, data: notificationData } = data;

    const notificationOptions = {
      body: body || 'New notification from OMNIX AI',
      icon: icon || '/icon-192x192.png',
      tag: `${type}-${notificationData?.id || Date.now()}`,
      renotify: true,
      requireInteraction: false,
      actions: actions || [],
      data: {
        ...notificationData,
        type,
        timestamp: Date.now()
      }
    };

    event.waitUntil(
      self.registration.showNotification(
        title || 'OMNIX AI',
        notificationOptions
      )
    );
  } catch (error) {
    console.error('Error handling push event:', error);
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  const { data, action } = event;
  event.notification.close();

  // Handle different actions and notification types
  const targetUrl = getTargetUrl(data?.type, action, data);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            return client.navigate(targetUrl);
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

/**
 * Get target URL for navigation
 */
function getTargetUrl(type, action, data) {
  const baseUrl = self.location.origin;
  const { productId, dealId, url } = data || {};
  
  if (url) return url;
  
  switch (type) {
    case 'REPLENISHMENT':
      if (action === 'buy-now') return `${baseUrl}/product/${productId}?action=buy`;
      return `${baseUrl}/product/${productId}`;
    case 'DEAL_ALERT':
      return `${baseUrl}/deals/${dealId || ''}`;
    case 'PRICE_DROP':
      return `${baseUrl}/product/${productId}`;
    case 'NEW_PRODUCT':
      return `${baseUrl}/product/${productId}`;
    case 'LOYALTY_UPDATE':
      return `${baseUrl}/rewards`;
    default:
      return `${baseUrl}/customer/dashboard`;
  }
}

console.log('OMNIX AI Service Worker loaded');