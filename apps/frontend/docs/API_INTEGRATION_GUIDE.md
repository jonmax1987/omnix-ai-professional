# OMNIX AI - API Integration Guide

## 📋 Overview

This guide provides comprehensive information about the API integration between the OMNIX AI React frontend and the backend services, including current status, transformation layers, and integration roadmap.

---

## 🔌 Current Integration Status

### Integration Phases

#### ✅ Phase 1: Structural Alignment (COMPLETED)
- **URL Structure**: Frontend aligned with backend `/v1` prefix
- **Response Transformation**: Data format conversion layer implemented  
- **Authentication**: Dual auth support (API Key + Bearer tokens)
- **Base Configuration**: Environment and service setup complete

#### 🔄 Phase 2: Data Flow Integration (IN PROGRESS)
- **Store Integration**: Zustand stores connected to API services
- **Error Handling**: Comprehensive error management
- **Loading States**: Fine-grained loading indicators
- **Real-time Updates**: WebSocket preparation

#### ⏳ Phase 3: Full Feature Integration (PLANNED)
- **Missing Endpoints**: User management, advanced features
- **WebSocket Integration**: Real-time data streaming
- **Advanced Error Handling**: Retry logic, circuit breakers
- **Performance Optimization**: Caching, optimization

---

## 🏗️ Architecture Overview

### API Service Layer Structure

```javascript
src/services/
├── api.js              # Core API client and utilities
├── analytics.js        # Analytics and metrics endpoints  
├── monitoring.js       # Performance and health monitoring
└── pushNotifications.js # Push notification service
```

### Store Integration Pattern

```javascript
// Store with API integration
const useProductsStore = create((set, get) => ({
  // State
  products: [],
  loading: false,
  error: null,
  
  // Async Actions
  fetchProducts: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await productsAPI.getProducts(params);
      set({ products: data.products, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  }
}));
```

---

## 🔄 API Transformation Layer

### Response Format Transformation

The frontend expects different response formats than the backend provides. A transformation layer handles this conversion:

```javascript
const transformBackendResponse = (data, endpoint) => {
  if (data && data.data) {
    // Products endpoint transformation
    if (endpoint.includes('/products')) {
      return {
        products: data.data,           // data -> products
        pagination: data.pagination,   // Keep pagination
        meta: data.meta               // Keep metadata
      };
    }
    
    // Dashboard endpoint transformation
    if (endpoint.includes('/dashboard/summary')) {
      return {
        metrics: {
          inventory: {
            totalValue: data.data.totalInventoryValue,
            totalItems: data.data.totalItems,
            lowStockItems: data.data.lowStockItems,
            outOfStockItems: data.data.outOfStockItems
          },
          alerts: {
            total: data.data.activeAlerts
          }
        }
      };
    }
    
    // Alerts endpoint transformation  
    if (endpoint.includes('/alerts')) {
      return {
        alerts: data.data.map(alert => ({
          ...alert,
          acknowledged: alert.dismissedAt ? true : false
        }))
      };
    }
  }
  
  return data;
};
```

### Request Headers Enhancement

```javascript
const createApiHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  // Add API Key (backend requirement)
  const apiKey = process.env.REACT_APP_API_KEY;
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }
  
  // Add Bearer token (client expectation)
  const token = useUserStore.getState().token;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};
```

---

## 📊 Endpoint Mapping

### Core Endpoints (✅ Integrated)

| Frontend Expectation | Backend Endpoint | Status | Notes |
|--------------------|------------------|--------|-------|
| `GET /products` | `GET /v1/products` | ✅ Working | Response transformation applied |
| `POST /products` | `POST /v1/products` | ✅ Working | Request/response mapping |
| `GET /products/{id}` | `GET /v1/products/{id}` | ✅ Working | Direct mapping |
| `PUT /products/{id}` | `PUT /v1/products/{id}` | ✅ Working | Field validation aligned |
| `DELETE /products/{id}` | `DELETE /v1/products/{id}` | ✅ Working | Confirmation flow |

### Dashboard Endpoints (✅ Integrated)

| Frontend Expectation | Backend Endpoint | Status | Notes |
|--------------------|------------------|--------|-------|
| `GET /analytics/dashboard` | `GET /v1/dashboard/summary` | ✅ Mapped | Data structure transformation |
| `GET /analytics/inventory` | `GET /v1/dashboard/inventory-graph` | ✅ Mapped | Chart data formatting |

### Alerts Endpoints (✅ Integrated)

| Frontend Expectation | Backend Endpoint | Status | Notes |
|--------------------|------------------|--------|-------|
| `GET /alerts` | `GET /v1/alerts` | ✅ Working | Filtering and severity mapping |
| `POST /alerts/{id}/acknowledge` | `POST /v1/alerts/{id}/dismiss` | ✅ Mapped | Action terminology aligned |

### Recommendations Endpoints (✅ Integrated)

| Frontend Expectation | Backend Endpoint | Status | Notes |
|--------------------|------------------|--------|-------|
| `GET /recommendations` | `GET /v1/recommendations/orders` | ✅ Mapped | Order-specific recommendations |

### Forecasting Endpoints (✅ Integrated)

| Frontend Expectation | Backend Endpoint | Status | Notes |
|--------------------|------------------|--------|-------|
| `GET /analytics/forecast` | `GET /v1/forecasts/demand` | ✅ Mapped | Demand prediction data |
| `GET /analytics/trends` | `GET /v1/forecasts/trends` | ✅ Mapped | Trend analysis data |

---

## ❌ Missing Endpoints

### Authentication System (Not Implemented)
```javascript
// Frontend expects but backend doesn't provide:
POST /auth/login
POST /auth/logout  
POST /auth/refresh
GET /user/profile
PATCH /user/preferences
```

**Impact**: Authentication flow not functional
**Workaround**: Mock authentication in development
**Solution**: Implement auth endpoints in backend

### User Management (Not Implemented)
```javascript
// Frontend expects:
GET /user/profile
PATCH /user/profile  
GET /user/preferences
PATCH /user/preferences
```

**Impact**: User profile and settings not functional
**Solution**: Add user management endpoints

### Advanced Features (Partial)
```javascript  
// Frontend expects but backend may not fully support:
GET /inventory/adjustments
POST /inventory/{productId}/adjust
GET /products/batch-delete
POST /products/batch-delete
GET /system/health
```

**Impact**: Advanced features limited
**Solution**: Incremental backend feature addition

---

## 🔧 Configuration

### Environment Variables

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:3000/v1    # Backend base URL
REACT_APP_API_KEY=your-api-key-here           # API authentication key

# Feature Flags
REACT_APP_ENABLE_WEBSOCKET=true               # Real-time features
REACT_APP_ENABLE_PUSH_NOTIFICATIONS=true     # Push notifications
REACT_APP_ENABLE_OFFLINE_MODE=true           # Offline functionality

# Development
REACT_APP_MOCK_API=false                      # Use mock data instead of API
REACT_APP_API_TIMEOUT=30000                   # Request timeout (ms)
REACT_APP_ENABLE_API_LOGGING=true            # Log API requests
```

### API Configuration Object

```javascript
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/v1',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableMocking: process.env.REACT_APP_MOCK_API === 'true',
  enableLogging: process.env.REACT_APP_ENABLE_API_LOGGING === 'true'
};
```

---

## 🚦 Error Handling

### Error Classification

```javascript
const API_ERRORS = {
  NETWORK_ERROR: 'network_error',      // No internet/server down
  TIMEOUT_ERROR: 'timeout_error',      // Request timeout
  AUTH_ERROR: 'auth_error',            // Authentication failure  
  VALIDATION_ERROR: 'validation_error', // Input validation
  NOT_FOUND: 'not_found',              // Resource not found
  SERVER_ERROR: 'server_error',        // 5xx errors
  RATE_LIMIT: 'rate_limit_error'       // Too many requests
};
```

### Error Handling Strategy

```javascript
const handleApiError = (error, endpoint) => {
  // Log error for monitoring
  console.error(`API Error on ${endpoint}:`, error);
  
  // Categorize error
  const errorType = classifyError(error);
  
  // User-friendly error messages
  const userMessage = getUserFriendlyMessage(errorType);
  
  // Store error in global state
  useStore.getState().setError('api', {
    type: errorType,
    message: userMessage,
    endpoint,
    timestamp: new Date().toISOString()
  });
  
  // Retry logic for specific errors
  if (shouldRetry(errorType)) {
    return retryRequest(endpoint, error.config);
  }
  
  throw error;
};
```

---

## 📡 Real-time Integration

### WebSocket Connection (Planned)

```javascript
class WebSocketManager {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }
  
  connect() {
    this.socket = new WebSocket(this.url);
    
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };
    
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
    
    this.socket.onclose = () => {
      this.handleReconnect();
    };
  }
  
  handleMessage(data) {
    switch (data.type) {
      case 'INVENTORY_UPDATE':
        useProductsStore.getState().updateProduct(data.payload);
        break;
      case 'NEW_ALERT':
        useAlertsStore.getState().addAlert(data.payload);
        break;
      case 'METRIC_UPDATE':
        useDashboardStore.getState().updateMetrics(data.payload);
        break;
    }
  }
}
```

### Push Notifications Integration

```javascript
const PushNotificationService = {
  async requestPermission() {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },
  
  async subscribe() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.REACT_APP_VAPID_KEY
    });
    
    // Send subscription to backend
    await api.post('/notifications/subscribe', {
      subscription: subscription.toJSON()
    });
    
    return subscription;
  }
};
```

---

## 🧪 Testing Integration

### API Mocking for Development

```javascript
// Mock API responses for development
const mockApiResponses = {
  '/v1/products': {
    data: [
      { id: '1', name: 'Coffee Beans', quantity: 150 },
      { id: '2', name: 'Sugar', quantity: 75 }
    ],
    pagination: { page: 1, limit: 20, total: 2 }
  },
  
  '/v1/dashboard/summary': {
    data: {
      totalInventoryValue: 125000,
      totalItems: 1250,
      lowStockItems: 23,
      activeAlerts: 5
    }
  }
};

// Mock fetch for testing
global.fetch = jest.fn((url) => {
  const endpoint = url.replace('http://localhost:3000', '');
  const mockData = mockApiResponses[endpoint];
  
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockData)
  });
});
```

### Integration Testing

```javascript
describe('Products API Integration', () => {
  test('should fetch products and transform response', async () => {
    const { result } = renderHook(() => useProductsStore());
    
    await act(async () => {
      await result.current.fetchProducts();
    });
    
    expect(result.current.products).toHaveLength(2);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });
  
  test('should handle API errors gracefully', async () => {
    // Mock API error
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    const { result } = renderHook(() => useProductsStore());
    
    await act(async () => {
      await result.current.fetchProducts();
    });
    
    expect(result.current.error).toBeTruthy();
    expect(result.current.loading).toBe(false);
  });
});
```

---

## 🔮 Future Integration Plans

### Phase 3: Advanced Integration
- **GraphQL Layer**: Consider GraphQL for complex queries
- **Caching Strategy**: Implement intelligent caching
- **Offline Sync**: Queue requests for offline mode
- **Background Sync**: Service worker data synchronization

### Phase 4: Performance Optimization
- **Request Deduplication**: Prevent duplicate requests
- **Response Compression**: Gzip/Brotli compression
- **CDN Integration**: Static asset optimization
- **Edge Caching**: Geographic data distribution

### Phase 5: Monitoring & Analytics
- **API Performance Monitoring**: Request timing and success rates
- **Error Tracking**: Comprehensive error logging
- **Usage Analytics**: API endpoint usage patterns
- **Health Checks**: Automated service monitoring

---

## 📋 Integration Checklist

### Pre-Integration Setup
- [ ] Backend API server running on correct port
- [ ] Environment variables configured
- [ ] API authentication keys set up
- [ ] CORS settings configured on backend
- [ ] Database connections established

### Integration Testing
- [ ] All core endpoints responding correctly
- [ ] Response transformation working
- [ ] Error handling functioning
- [ ] Authentication flow tested
- [ ] Real-time features working (if applicable)

### Production Readiness
- [ ] Rate limiting configured
- [ ] SSL certificates installed
- [ ] Monitoring systems active
- [ ] Backup and failover systems ready
- [ ] Performance benchmarks met

---

## 🎯 Quick Start Guide

### 1. Start Backend Service
```bash
# Ensure backend is running on port 3000
npm run start:backend
```

### 2. Configure Environment
```bash
# Set environment variables
export REACT_APP_API_URL=http://localhost:3000/v1
export REACT_APP_API_KEY=your-development-key
```

### 3. Start Frontend
```bash  
# Start React development server
npm run dev
```

### 4. Verify Integration
- Check browser network tab for API requests
- Verify response transformations in Redux DevTools
- Test error scenarios with network throttling
- Confirm authentication headers present

The API integration layer provides a robust foundation for the OMNIX AI system, with comprehensive error handling, transformation capabilities, and preparation for advanced features like real-time updates and offline functionality.