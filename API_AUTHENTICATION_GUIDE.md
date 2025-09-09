# OMNIX AI - API Authentication & Integration Guide

## 🔐 Verified Authentication Credentials

### Production Environment
**Base URL**: `https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod`

#### Admin Account
- **Email**: `admin@omnix.ai`
- **Password**: `admin123`
- **Role**: `admin`
- **User ID**: `1`
- **Name**: `Admin User`

#### Manager Account
- **Email**: `manager@omnix.ai`
- **Password**: `Manager123`
- **Role**: `manager`
- **User ID**: `2`
- **Name**: `Store Manager`

#### Customer Account  
- **Email**: `customer@omnix.ai`
- **Password**: `customer123`
- **Role**: `customer`
- **User ID**: `customer-001`
- **Name**: `Sarah Johnson`

### Staging Environment
**Base URL**: `https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/staging`

#### Staging Manager Account
- **Email**: `staging@omnix.ai`
- **Password**: `staging123`
- **Role**: `admin`
- **User ID**: `staging-user-001`
- **Name**: `Staging Manager`

#### Staging Customer Account  
- **Email**: `customer@staging.omnix.ai`
- **Password**: `customer123`
- **Role**: `customer`
- **User ID**: `staging-customer-001`
- **Name**: `John Doe`

## 🚀 Available API Endpoints

### ✅ Core Endpoints (Working & Verified)

#### Authentication
- `POST /v1/auth/login` - User authentication
  - **Input**: `{"email": "admin@omnix.ai", "password": "admin123"}`
  - **Output**: `{"accessToken": "token-1-...", "user": {...}}`

#### Health & Status
- `GET /health` - Basic health check
- `GET /v1/health` - Detailed health check

#### Dashboard & Analytics
- `GET /v1/dashboard/summary` - Business metrics dashboard
  - **Authentication**: Required (Bearer token)
  - **Data**: Revenue ($31,630.91), Orders (655), Customers (8), Inventory Value ($26,733.17)

#### Products Management
- `GET /v1/products` - Product catalog
  - **Authentication**: Required (Bearer token)  
  - **Data**: 48 products with full metadata (price, cost, inventory, supplier, location)

#### Orders Management
- `GET /v1/orders` - Order history and management
  - **Authentication**: Required (Bearer token)
  - **Data**: Rich order data with customer analytics metadata

#### Analytics
- `GET /v1/analytics/sessions` - Customer session analytics
  - **Authentication**: Required (Bearer token)
  - **Data**: Detailed user behavior, page journeys, conversion data

### ❌ Missing/Not Implemented Endpoints
- Customer analytics (`/v1/analytics/customers`)
- Forecasting (`/v1/analytics/forecasting`) 
- User profiles (`/v1/user/profile`)
- Advanced AI endpoints

## 🔧 Frontend Configuration

### Environment Files Status

#### `.env.production` ✅ Correct
```
VITE_API_BASE_URL=https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod
VITE_API_KEY=omnix-api-key-production-2024
```

#### `.env.staging` ⚠️ Needs Update
```
# Current (incorrect path)
VITE_API_BASE_URL=https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/v1

# Should be  
VITE_API_BASE_URL=https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod
```

#### `.env.local` ✅ Development
```
VITE_API_BASE_URL=http://localhost:3001
```

## 📊 API Response Examples

### Login Response
```json
{
  "message": "Login successful",
  "data": {
    "accessToken": "token-1-1757363853590",
    "user": {
      "id": "1",
      "email": "admin@omnix.ai", 
      "name": "Admin User",
      "role": "admin",
      "isActive": true
    }
  }
}
```

### Dashboard Summary Response
```json
{
  "message": "Dashboard summary retrieved",
  "data": {
    "totalRevenue": 31630.91,
    "dailyRevenue": 0,
    "totalCustomers": 8,
    "activeCustomers": 0, 
    "totalOrders": 655,
    "dailyOrders": 0,
    "averageOrderValue": 48.29,
    "inventoryValue": 26733.17,
    "lowStockItems": 0,
    "topSellingProducts": [
      {"name": "Apples Red 1kg", "sales": 402},
      {"name": "Bananas", "sales": 370},
      {"name": "White Bread Loaf", "sales": 363}
    ]
  }
}
```

### Products Response
```json
{
  "message": "Products retrieved",
  "data": [
    {
      "id": "61348c1e-8026-44ac-a4ef-e9074fe7a71a",
      "name": "Dog Treats 500g",
      "sku": "DOGTREATS-001",
      "price": 9.99,
      "cost": 6.2,
      "quantity": 70,
      "minThreshold": 20,
      "category": "Pet Care",
      "supplier": "Pet Nutrition Co.",
      "location": "Pet Section, Shelf K3",
      "barcode": "4040404040404",
      "unit": "bag",
      "description": "Training treats for dogs, chicken flavor"
    }
  ]
}
```

### Session Analytics Response (Detailed)
```json
{
  "message": "Sessions analytics retrieved",
  "data": [
    {
      "id": "b59e4729-0f07-4689-8027-a2a58efcfb12",
      "customerId": "customer-002",
      "sessionStart": "2024-08-02T09:41:00.000Z",
      "sessionEnd": "2024-08-02T10:15:00.000Z",
      "sessionDuration": 34,
      "device": "tablet",
      "browser": "Safari",
      "pageViews": 21,
      "uniquePageViews": 17,
      "timeOnSite": 2040,
      "avgTimePerPage": 97,
      "bounceRate": 0,
      "sessionType": "converter",
      "sessionOutcome": "purchase",
      "conversionData": {
        "completedPurchase": true,
        "cartValue": 45,
        "conversionRate": 1
      },
      "interactions": {
        "clicks": 45,
        "searches": 0,
        "cartActions": 2,
        "productViews": 14,
        "categoryViews": 7
      },
      "pageJourney": [
        {
          "step": 1,
          "page": "Snacks",
          "type": "category",
          "timeOnPage": 80,
          "interactions": {
            "clicks": 0,
            "scrollDepth": 80,
            "focused": true
          }
        }
        // ... 20 more journey steps
      ],
      "metadata": {
        "isBusinessHours": true,
        "dayOfWeek": "Friday",
        "month": "August",
        "customerBehaviorType": "exploratory"
      }
    }
  ]
}
```

## 🔄 Authentication Flow

### 1. Login Process
```javascript
// Frontend Implementation
const response = await fetch('/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@omnix.ai',
    password: 'admin123'
  })
});
```

### 2. Token Usage
```javascript
// Use token for protected endpoints
const dashboard = await fetch('/v1/dashboard/summary', {
  headers: {
    'Authorization': 'Bearer token-1-1757363853590',
    'Content-Type': 'application/json'
  }
});
```

### 3. Frontend Store Integration
The authentication is handled automatically by:
- `httpClient.js` - Token management and refresh
- `userStore.js` - User state and authentication flow
- Request interceptors add tokens automatically

## 🌐 WebSocket Configuration

**Production WebSocket URL**: `wss://5oo31khrrj.execute-api.eu-central-1.amazonaws.com/prod`

WebSocket is configured for real-time features:
- Live dashboard updates
- Real-time inventory notifications
- Customer activity streaming

## 📈 Data Quality Assessment

### Business Metrics (Live Data)
- **Total Revenue**: $31,630.91
- **Total Orders**: 655 orders
- **Total Customers**: 8 customers  
- **Product Catalog**: 48 products
- **Inventory Value**: $26,733.17
- **Top Products**: Apples (402 sales), Bananas (370 sales), Bread (363 sales)

### Analytics Depth
- **Session Analytics**: Detailed page journeys, interaction tracking, conversion data
- **Customer Behavior**: Device types, browser info, geographic data
- **Product Performance**: Sales tracking, inventory levels, supplier information
- **Order Analytics**: Rich metadata including seasonal patterns, basket composition

## ⚠️ Important Notes

1. **Staging Environment**: The staging `.env` file has an incorrect API base URL path
2. **Local Development**: Uses localhost:3001 (ensure backend is running)
3. **Authentication Tokens**: Tokens appear to be session-based and may expire
4. **CORS Configuration**: Production API properly configured for frontend domain
5. **Rate Limiting**: No rate limiting observed during testing

## 🔧 Required Updates

### Fix Staging Environment
```bash
# Update apps/frontend/.env.staging
VITE_API_BASE_URL=https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod
```

### Test Credentials in Development
Ensure the development backend accepts the same credentials or provide local test accounts.

---

**Last Updated**: September 8, 2025  
**Verified By**: API Integration Analysis  
**Status**: ✅ Production API fully functional with verified credentials