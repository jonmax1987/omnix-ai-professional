/**
 * OMNIX AI - Enhanced Service Worker with Advanced Caching Strategies
 * Handles background push notifications, advanced caching, and offline functionality
 * PERF-005: Service worker for caching strategies
 */

const CACHE_VERSION = '2.0.0';
const CACHE_CONFIG = {
  STATIC: 'omnix-static-v2',
  DYNAMIC: 'omnix-dynamic-v2',
  IMAGES: 'omnix-images-v2',
  API: 'omnix-api-v2',
  FONTS: 'omnix-fonts-v2'
};

const CACHE_TTL = {
  STATIC: 7 * 24 * 60 * 60 * 1000,    // 7 days
  DYNAMIC: 24 * 60 * 60 * 1000,       // 24 hours
  IMAGES: 30 * 24 * 60 * 60 * 1000,   // 30 days
  API: 5 * 60 * 1000,                 // 5 minutes
  FONTS: 30 * 24 * 60 * 60 * 1000     // 30 days
};

const API_BASE_URL = self.location.origin;

// Performance metrics
let metrics = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  errors: 0
};

// Utility functions for advanced caching
function addTimestamp(response) {
  const responseClone = response.clone();
  const headers = new Headers(responseClone.headers);
  headers.set('sw-cached-at', Date.now().toString());
  
  return new Response(responseClone.body, {
    status: responseClone.status,
    statusText: responseClone.statusText,
    headers: headers
  });
}

function isExpired(response, ttl) {
  const cachedTimestamp = response.headers.get('sw-cached-at');
  if (!cachedTimestamp) return true;
  
  const cachedTime = parseInt(cachedTimestamp, 10);
  const now = Date.now();
  return (now - cachedTime) > ttl;
}

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_CONFIG.STATIC)
      .then((cache) => {
        console.log('Service Worker: Caching essential files');
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.webmanifest',
          '/registerSW.js'
        ]);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Keep current version caches
            const isCurrentCache = Object.values(CACHE_CONFIG).includes(cacheName);
            if (!isCurrentCache) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Add fetch event listener for advanced caching strategies
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Handle different types of requests with appropriate caching strategies
  if (url.origin === self.location.origin) {
    // Static assets - Cache First strategy
    if (url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/)) {
      event.respondWith(cacheFirst(event.request, CACHE_CONFIG.STATIC, CACHE_TTL.STATIC));
    }
    // Images - Cache First with longer TTL
    else if (url.pathname.match(/\.(png|jpe?g|gif|svg|webp|avif|ico)$/)) {
      event.respondWith(cacheFirst(event.request, CACHE_CONFIG.IMAGES, CACHE_TTL.IMAGES));
    }
    // Fonts - Cache First with long TTL
    else if (url.pathname.includes('/fonts/')) {
      event.respondWith(cacheFirst(event.request, CACHE_CONFIG.FONTS, CACHE_TTL.FONTS));
    }
    // API calls - Network First strategy
    else if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/v1/')) {
      event.respondWith(networkFirst(event.request, CACHE_CONFIG.API, CACHE_TTL.API));
    }
    // HTML pages - Stale While Revalidate
    else if (url.pathname.endsWith('.html') || url.pathname === '/' || !url.pathname.includes('.')) {
      event.respondWith(staleWhileRevalidate(event.request, CACHE_CONFIG.DYNAMIC, CACHE_TTL.DYNAMIC));
    }
  }
  // External API calls - Network First with shorter timeout
  else if (url.hostname.includes('api.') || url.pathname.startsWith('/api')) {
    event.respondWith(networkFirst(event.request, CACHE_CONFIG.API, CACHE_TTL.API, 2000));
  }
});

// Advanced caching strategies implementation

// Cache First - Try cache first, fallback to network
async function cacheFirst(request, cacheName, ttl) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse && !isExpired(cachedResponse, ttl)) {
      metrics.cacheHits++;
      return cachedResponse;
    }
    
    metrics.cacheMisses++;
    const networkResponse = await fetch(request);
    metrics.networkRequests++;
    
    if (networkResponse.ok) {
      const responseWithTimestamp = addTimestamp(networkResponse);
      cache.put(request, responseWithTimestamp.clone());
      return responseWithTimestamp;
    }
    
    // Return stale cache if network fails
    return cachedResponse || networkResponse;
  } catch (error) {
    metrics.errors++;
    console.error('Cache first error:', error);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    return cachedResponse || new Response('Network error', { status: 503 });
  }
}

// Network First - Try network first, fallback to cache
async function networkFirst(request, cacheName, ttl, timeout = 3000) {
  try {
    const cache = await caches.open(cacheName);
    
    const networkPromise = fetch(request);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    );
    
    try {
      const networkResponse = await Promise.race([networkPromise, timeoutPromise]);
      metrics.networkRequests++;
      
      if (networkResponse.ok) {
        const responseWithTimestamp = addTimestamp(networkResponse);
        cache.put(request, responseWithTimestamp.clone());
        return responseWithTimestamp;
      }
    } catch (error) {
      console.warn('Network failed, trying cache:', error.message);
    }
    
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      metrics.cacheHits++;
      return cachedResponse;
    }
    
    metrics.cacheMisses++;
    return new Response('No cache available', { status: 503 });
  } catch (error) {
    metrics.errors++;
    console.error('Network first error:', error);
    return new Response('Network error', { status: 503 });
  }
}

// Stale While Revalidate - Return cache immediately, update cache in background
async function staleWhileRevalidate(request, cacheName, ttl) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // Start network request in background
    const networkPromise = fetch(request).then(async (response) => {
      if (response.ok) {
        const responseWithTimestamp = addTimestamp(response);
        cache.put(request, responseWithTimestamp.clone());
      }
      return response;
    });
    
    // Return cache immediately if available and not expired
    if (cachedResponse && !isExpired(cachedResponse, ttl)) {
      metrics.cacheHits++;
      // Don't wait for network request
      networkPromise.catch(error => console.warn('Background update failed:', error));
      return cachedResponse;
    }
    
    // Wait for network if no cache or expired
    metrics.cacheMisses++;
    metrics.networkRequests++;
    return await networkPromise;
  } catch (error) {
    metrics.errors++;
    console.error('Stale while revalidate error:', error);
    return new Response('Network error', { status: 503 });
  }
}

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

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  switch (event.data.type) {
    case 'GET_METRICS':
      event.source.postMessage({
        type: 'METRICS_RESPONSE',
        data: {
          ...metrics,
          cacheEfficiency: metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) * 100 || 0
        }
      });
      break;
    case 'CLEAR_CACHE':
      clearSpecificCache(event.data.cacheName);
      break;
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
  }
});

// Clear specific cache
async function clearSpecificCache(cacheName) {
  if (cacheName) {
    await caches.delete(cacheName);
    console.log('Cache cleared:', cacheName);
  } else {
    // Clear all OMNIX caches
    const cacheNames = await caches.keys();
    for (const name of cacheNames) {
      if (name.startsWith('omnix-')) {
        await caches.delete(name);
        console.log('Cache cleared:', name);
      }
    }
  }
}

// Report metrics periodically
setInterval(() => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SW_METRICS',
        data: {
          ...metrics,
          cacheEfficiency: metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) * 100 || 0,
          timestamp: Date.now()
        }
      });
    });
  });
}, 60000); // Report every minute

console.log('OMNIX AI Enhanced Service Worker loaded v' + CACHE_VERSION);