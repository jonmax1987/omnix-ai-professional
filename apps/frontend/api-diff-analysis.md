# OMNIX AI API Specification Comparison

## Overview
This document compares the **Backend OpenAPI Specification** (`omnix-api.yaml`) with the **Client-side API Expectations** (`client-api.yaml`) to identify integration gaps.

## Key Differences Summary

### 🔴 **Critical Mismatches**

| Aspect | Backend Spec | Client Expectations | Impact |
|--------|--------------|-------------------|--------|
| **Base URL Structure** | `/v1/products` | `/products` | All endpoints fail |
| **Authentication** | API Key + Bearer | Bearer only | Auth may fail |
| **Response Structure** | `{data: [...], pagination: {...}}` | `{products: [...], pagination: {...}}` | Data parsing errors |

### 🟡 **Missing Endpoints in Backend**

| Client Endpoint | Purpose | Status |
|-----------------|---------|--------|
| `/auth/*` | User authentication | Not defined in backend |
| `/user/*` | User profile management | Not defined in backend |
| `/inventory/*` | Inventory operations | Not defined in backend |
| `/orders/*` | Order management | Not defined in backend |
| `/analytics/*` | Advanced analytics | Partially different |
| `/settings/*` | Application settings | Not defined in backend |
| `/system/*` | System health/status | Not defined in backend |

### 🟢 **Compatible Endpoints**

| Endpoint | Backend | Client | Compatibility |
|----------|---------|--------|---------------|
| Products CRUD | ✅ `/v1/products` | ✅ `/products` | Structure compatible, path differs |
| Alerts | ✅ `/v1/alerts` | ✅ `/alerts` | Structure compatible, path differs |
| Dashboard | ✅ `/v1/dashboard/summary` | ✅ `/analytics/dashboard` | Different paths, similar purpose |

---

## Detailed Endpoint Analysis

### 1. **Products API**

#### ✅ **Compatible Operations**
- **GET /products** - List products with filtering
- **POST /products** - Create product
- **GET /products/{id}** - Get product by ID
- **PUT /products/{id}** - Update product
- **DELETE /products/{id}** - Delete product

#### 🔄 **Path Differences**
```diff
- Backend:  /v1/products
+ Client:   /products
```

#### 🔄 **Response Structure Differences**
```yaml
# Backend Response
{
  "data": [...],
  "pagination": {...},
  "meta": {...}
}

# Client Expectation
{
  "products": [...],
  "pagination": {...}
}
```

#### 🔄 **Schema Differences**
| Field | Backend | Client | Notes |
|-------|---------|--------|-------|
| `lastUpdated` | ✅ | ❌ | Backend has this field |
| `expirationDate` | ✅ | ❌ | Backend has this field |
| `unit` | ✅ | ❌ | Backend has this field |
| `tags` | ❌ | ✅ | Client expects this field |
| `status` | ❌ | ✅ | Client expects this field |

### 2. **Authentication API**

#### ❌ **Missing in Backend**
The backend specification doesn't include authentication endpoints, but the client expects:
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `POST /auth/reset-password`
- `POST /auth/change-password`

### 3. **Dashboard/Analytics API**

#### 🔄 **Different Approach**
```yaml
# Backend Approach
GET /v1/dashboard/summary
GET /v1/dashboard/inventory-graph

# Client Approach  
GET /analytics/dashboard
GET /analytics/forecast
GET /analytics/trends
```

#### 🔄 **Data Structure Differences**
```yaml
# Backend DashboardSummary
{
  "totalInventoryValue": number,
  "totalItems": number,
  "lowStockItems": number,
  "categoryBreakdown": [...]
}

# Client Dashboard Metrics
{
  "revenue": {...},
  "orders": {...},
  "inventory": {...},
  "alerts": {...}
}
```

### 4. **Alerts API**

#### ✅ **Good Compatibility**
Both have similar alert concepts, but with differences:

#### 🔄 **Endpoint Differences**
```diff
- Backend:  /v1/alerts/{alertId}/dismiss
+ Client:   /alerts/{id}/acknowledge
```

#### 🔄 **Schema Differences**
| Field | Backend | Client | Notes |
|-------|---------|--------|-------|
| `productName` | ✅ | ✅ | Compatible |
| `actionRequired` | ✅ | ✅ | Compatible |
| `dismissedAt` | ✅ | ❌ | Backend only |
| `acknowledged` | ❌ | ✅ | Client only |
| `title` | ❌ | ✅ | Client only |

### 5. **Recommendations API**

#### 🔄 **Different Focus**
```yaml
# Backend: Order-focused
GET /v1/recommendations/orders
- Returns OrderRecommendation objects
- Focus on purchasing recommendations

# Client: General recommendations
GET /recommendations
- Returns generic recommendation objects
- Broader recommendation types
```

### 6. **Forecasting API**

#### ✅ **Backend Has More**
```yaml
# Backend (comprehensive)
GET /v1/forecasts/demand
GET /v1/forecasts/trends

# Client (simplified)
GET /analytics/forecast
GET /analytics/trends
```

---

## Data Model Comparison

### Product Schema

| Field | Backend Type | Client Type | Compatible |
|-------|-------------|------------|------------|
| `id` | string (uuid) | string | ✅ |
| `name` | string | string | ✅ |
| `sku` | string | string | ✅ |
| `category` | string | string | ✅ |
| `quantity` | integer | integer | ✅ |
| `price` | number (decimal) | number | ✅ |
| `supplier` | string | string | ✅ |
| `barcode` | string | ❌ | Backend only |
| `cost` | number | number | ✅ |
| `unit` | string | ❌ | Backend only |
| `expirationDate` | date | ❌ | Backend only |
| `location` | string | string | ✅ |
| `description` | string | ❌ | Backend only |
| `minThreshold` | integer | integer | ✅ |
| `lastUpdated` | date-time | ❌ | Backend only |
| `tags` | ❌ | array[string] | Client only |
| `status` | ❌ | enum | Client only |

### Alert Schema

| Field | Backend Type | Client Type | Compatible |
|-------|-------------|------------|------------|
| `id` | string (uuid) | string | ✅ |
| `type` | enum | enum | ✅ (similar) |
| `severity` | enum | enum | ✅ |
| `message` | string | string | ✅ |
| `productId` | string (uuid) | string | ✅ |
| `productName` | string | string | ✅ |
| `actionRequired` | boolean | boolean | ✅ |
| `createdAt` | date-time | date-time | ✅ |
| `title` | ❌ | string | Client only |
| `acknowledged` | ❌ | boolean | Client only |
| `dismissedAt` | date-time | ❌ | Backend only |

---

## Authentication & Security

### Backend Security
```yaml
security:
  - ApiKeyAuth: []    # X-API-Key header
  - BearerAuth: []    # JWT Bearer token
```

### Client Security
```yaml
security:
  - BearerAuth: []    # JWT Bearer token only
```

**Impact**: Client doesn't handle API Key authentication method.

---

## Integration Recommendations

### 🎯 **Immediate Actions Required**

1. **Fix Base URL Structure**
   ```diff
   - const API_CONFIG = { baseURL: 'http://localhost:3001/api' }
   + const API_CONFIG = { baseURL: 'http://localhost:3001/v1' }
   ```

2. **Update Response Parsing**
   ```javascript
   // Current client expectation
   const products = response.products;
   
   // Should be (backend format)
   const products = response.data;
   ```

3. **Add Missing Authentication Endpoints**
   - Either implement auth endpoints in backend
   - Or remove auth UI from frontend

4. **Align Data Models**
   - Add missing fields to client models
   - Update frontend to handle backend fields

### 🔧 **Medium-term Alignment**

1. **Standardize Endpoint Patterns**
2. **Align Dashboard/Analytics Structure**
3. **Reconcile Recommendation Systems**
4. **Unify Alert Management**

### 📋 **Optional Enhancements**

1. **Add Missing Client Features to Backend**
   - User management
   - System monitoring
   - Settings management
   - Order management

---

## Conclusion

The backend and client APIs have **~60% compatibility** in core functionality but significant structural differences that prevent direct integration. The main issues are:

1. **URL Structure** - Easy fix
2. **Response Format** - Requires client updates
3. **Missing Endpoints** - Need backend implementation or client removal
4. **Data Model Gaps** - Need alignment on both sides

**Recommended Approach**: Start with fixing URL structure and response parsing, then gradually align the data models and add missing endpoints.