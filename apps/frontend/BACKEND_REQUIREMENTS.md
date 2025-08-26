# OMNIX AI Backend Requirements

## Overview
This document outlines the backend API endpoints required for the OMNIX AI React frontend application to function end-to-end. The frontend is already built and expects these specific endpoints with the documented request/response formats.

## Base Configuration
- **Base URL**: `https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev/v1`
- **Technology Stack**: AWS Lambda + DynamoDB (Serverless)
- **API Specification**: See `omnix-api.yaml` for complete OpenAPI specification
- **Authentication**: Bearer JWT tokens + API Key header

## Priority Levels

### 🔴 **CRITICAL (P0) - Required for basic functionality**
These endpoints are actively called by the frontend and must be implemented first:

#### Authentication & User Management
```
POST   /v1/auth/login
POST   /v1/auth/logout  
POST   /v1/auth/refresh
GET    /v1/user/profile
PATCH  /v1/user/profile
```

#### Dashboard Data (Core Business Logic)
```
GET    /v1/dashboard/summary
GET    /v1/dashboard/inventory-graph
```

#### Products Management (Core CRUD)
```
GET    /v1/products
GET    /v1/products/{id}
POST   /v1/products
PATCH  /v1/products/{id}
DELETE /v1/products/{id}
```

#### Alerts System
```
GET    /v1/alerts
POST   /v1/alerts/{id}/dismiss
```

#### AI Features (Key Differentiators)
```
GET    /v1/recommendations/orders
GET    /v1/forecasts/demand
GET    /v1/forecasts/trends
```

### 🟡 **HIGH (P1) - Enhanced functionality**
```
GET    /v1/inventory
GET    /v1/inventory/{productId}
POST   /v1/inventory/{productId}/adjust
GET    /v1/inventory/{productId}/history
```

### 🟢 **MEDIUM (P2) - Full feature set**
```
GET    /v1/orders
POST   /v1/orders
GET    /v1/orders/{id}
PATCH  /v1/orders/{id}
GET    /v1/system/health
GET    /v1/system/status
```

## Detailed Endpoint Specifications

### 1. Dashboard Summary (CRITICAL)
**Frontend Usage**: Called on dashboard load and every 30 seconds for real-time updates

```http
GET /v1/dashboard/summary?timeRange=month
```

**Expected Response**:
```json
{
  "data": {
    "totalInventoryValue": 2450000.50,
    "totalItems": 15420,
    "lowStockItems": 45,
    "outOfStockItems": 12,
    "categoryBreakdown": [
      {
        "category": "Electronics",
        "itemCount": 1420,
        "value": 850000.25
      }
    ]
  }
}
```

### 2. Products List (CRITICAL)
**Frontend Usage**: Products page with search, filtering, and pagination

```http
GET /v1/products?page=1&limit=20&search=coffee&category=Beverages&sortBy=name&sortOrder=asc
```

**Expected Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Premium Coffee Beans",
      "sku": "PCB-001",
      "category": "Beverages",
      "quantity": 150,
      "minThreshold": 20,
      "price": 24.99,
      "supplier": "Global Coffee Co.",
      "lastUpdated": "2024-01-20T14:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1500,
    "pages": 75,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "totalValue": 245000.50,
    "totalItems": 1500
  }
}
```

### 3. Alerts (CRITICAL)
**Frontend Usage**: Dashboard alerts widget and dedicated alerts page

```http
GET /v1/alerts?type=low-stock&severity=high&limit=50
```

**Expected Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "low-stock",
      "severity": "high",
      "message": "Low stock alert for Premium Coffee Beans",
      "productId": "uuid",
      "productName": "Premium Coffee Beans",
      "actionRequired": true,
      "createdAt": "2024-01-20T10:30:00Z",
      "acknowledged": false
    }
  ],
  "count": 23
}
```

### 4. Order Recommendations (CRITICAL)
**Frontend Usage**: AI recommendations page and dashboard widget

```http
GET /v1/recommendations/orders?category=Beverages&urgency=high&limit=20
```

**Expected Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "productId": "uuid",
      "productName": "Premium Coffee Beans",
      "currentStock": 15,
      "recommendedQuantity": 100,
      "urgency": "high",
      "reason": "Stock below minimum threshold",
      "explanation": "Based on sales trends, recommend ordering 100 units",
      "estimatedCost": 1850.00,
      "supplier": "Global Coffee Co.",
      "confidence": 0.95,
      "createdAt": "2024-01-20T14:00:00Z"
    }
  ]
}
```

### 5. Demand Forecasts (CRITICAL)
**Frontend Usage**: Analytics page forecasting charts

```http
GET /v1/forecasts/demand?productId=uuid&timeHorizon=month&limit=20
```

**Expected Response**:
```json
{
  "data": [
    {
      "productId": "uuid",
      "productName": "Premium Coffee Beans",
      "category": "Beverages",
      "timeHorizon": "month",
      "predictions": [
        {
          "period": "2024-02-01",
          "predictedDemand": 85.5,
          "confidenceInterval": {
            "lower": 75.2,
            "upper": 95.8
          }
        }
      ],
      "accuracy": 0.87,
      "model": "ARIMA",
      "lastUpdated": "2024-01-20T12:00:00Z"
    }
  ]
}
```

## Request/Response Standards

### Authentication Headers
```http
Authorization: Bearer <jwt_token>
X-API-Key: <api_key>
Content-Type: application/json
```

### Standard Response Format
All endpoints must return responses in this format:
```json
{
  "data": { /* response payload */ },
  "pagination": { /* for paginated responses */ },
  "meta": { /* additional metadata */ },
  "message": "Success message" // optional
}
```

### Error Response Format
```json
{
  "error": "Bad Request",
  "message": "Invalid input parameters",
  "code": 400,
  "timestamp": "2024-01-20T15:30:00Z",
  "details": "Specific error details" // optional
}
```

### Pagination Parameters
Standard pagination for list endpoints:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sortBy`: Sort field
- `sortOrder`: asc/desc (default: asc)

## Data Models

### Product Schema
```typescript
{
  id: string (UUID),
  name: string (max 255),
  sku: string (max 100, unique),
  barcode?: string (max 50),
  category: string (max 100),
  quantity: number (≥ 0),
  minThreshold: number (≥ 0),
  price: number (≥ 0),
  cost?: number (≥ 0),
  supplier: string (max 255),
  description?: string (max 1000),
  unit?: string (max 20),
  expirationDate?: string (ISO date),
  location?: string (max 100),
  createdAt: string (ISO datetime),
  updatedAt: string (ISO datetime)
}
```

### Alert Schema
```typescript
{
  id: string (UUID),
  type: "low-stock" | "out-of-stock" | "expired" | "forecast-warning" | "system",
  severity: "high" | "medium" | "low",
  message: string,
  productId?: string (UUID),
  productName?: string,
  actionRequired: boolean,
  createdAt: string (ISO datetime),
  acknowledged: boolean,
  dismissedAt?: string (ISO datetime)
}
```

## Current Frontend Integration Points

### API Service Layer
- **File**: `src/services/api.js`
- **Configuration**: API base URL, timeout, retry logic
- **Response Transformation**: Handles backend response format conversion
- **Error Handling**: Custom ApiError class with status codes

### State Management
- **Dashboard**: `src/store/dashboardStore.js` - Calls dashboard and chart endpoints
- **Products**: `src/store/productsStore.js` - Full CRUD operations
- **Alerts**: `src/store/alertsStore.js` - Fetches and manages alerts
- **Recommendations**: `src/store/recommendationsStore.js` - AI recommendations
- **Forecasting**: `src/store/forecastingStore.js` - Demand forecasts and trends

### Environment Configuration
```bash
# Development
VITE_API_BASE_URL=http://localhost:3001
VITE_API_KEY=your_api_key

# Production  
VITE_API_BASE_URL=https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev
VITE_API_KEY=your_production_api_key
```

## Testing Endpoints

### Health Check
Implement this endpoint for monitoring:
```http
GET /v1/system/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T15:30:00Z",
  "checks": {
    "database": "healthy",
    "cache": "healthy",
    "external_apis": "healthy"
  }
}
```

## Security Requirements

1. **JWT Authentication**: 15-minute access tokens with refresh tokens
2. **API Key Validation**: Header-based API key for additional security
3. **Rate Limiting**: Implement per-user rate limits
4. **Input Validation**: Validate all request parameters
5. **CORS**: Configure for frontend domain
6. **Data Sanitization**: Prevent SQL injection and XSS

## Performance Requirements

- **Response Time**: < 500ms for most endpoints
- **Dashboard Summary**: < 200ms (called frequently)
- **Products List**: < 1s (with pagination)
- **AI Endpoints**: < 2s (acceptable for ML processing)
- **Concurrent Users**: Support 100+ simultaneous users

## Development Notes

1. **Mock Data**: Frontend has fallback mock data for development
2. **Error Handling**: Frontend retries failed requests (3 attempts)
3. **Real-time Updates**: Dashboard refreshes every 30 seconds
4. **Caching**: Consider implementing response caching for frequently accessed data
5. **WebSocket**: Optional real-time notifications (WebSocket service exists in frontend)

## Next Steps

1. **Phase 1**: Implement P0 (Critical) endpoints
2. **Phase 2**: Add P1 (High) inventory management
3. **Phase 3**: Complete P2 (Medium) order management
4. **Phase 4**: Add real-time WebSocket notifications
5. **Phase 5**: Implement advanced analytics endpoints

This document should provide your backend team with everything needed to implement the API endpoints for full frontend compatibility.