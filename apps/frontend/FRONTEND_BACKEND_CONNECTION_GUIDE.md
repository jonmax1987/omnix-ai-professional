# OMNIX AI - Frontend Backend Connection Guide

## Backend API Endpoints

### Production/Staging
- **API Gateway URL**: `https://18sz01wxsi.execute-api.eu-central-1.amazonaws.com/dev`
- **Region**: `eu-central-1`
- **Stage**: `dev` (for development), `staging`, `prod`

### Local Development
- **Backend**: `http://localhost:3001` (NestJS)
- **AI Lambda**: `http://localhost:3002` (Serverless Offline)

## Authentication Setup

### 1. API Keys
The backend requires API keys for security. Include one of these in your requests:
```javascript
// Development
headers: {
  'X-API-Key': 'omnix-api-key-development-2024'
}

// Staging
headers: {
  'X-API-Key': 'omnix-api-key-staging-2024'
}

// Production
headers: {
  'X-API-Key': 'omnix-api-key-production-2024'
}
```

### 2. JWT Authentication Flow

#### Login Endpoint
```javascript
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "userPassword"
}

// Response
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "USER"
    }
  },
  "message": "Login successful"
}
```

#### Using Access Token
```javascript
// Include in all authenticated requests
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'X-API-Key': 'your-api-key'
}
```

#### Refresh Token
```javascript
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}

// Response
{
  "data": {
    "accessToken": "new-access-token",
    "refreshToken": "new-refresh-token"
  },
  "message": "Token refreshed successfully"
}
```

## Main API Endpoints

### Customer Analytics
```javascript
// Get customer profile with AI insights
GET /customers/:customerId/profile
Authorization: Bearer {token}
X-API-Key: {api-key}

// Get AI-powered recommendations
POST /ai/recommendations
Authorization: Bearer {token}
X-API-Key: {api-key}
Content-Type: application/json

{
  "customerId": "customer-id",
  "context": "shopping_cart"
}

// Get consumption predictions
GET /ai/predictions/:customerId
Authorization: Bearer {token}
X-API-Key: {api-key}
```

### Products
```javascript
// Get all products
GET /products
Authorization: Bearer {token}
X-API-Key: {api-key}

// Get product by ID
GET /products/:id
Authorization: Bearer {token}
X-API-Key: {api-key}

// Search products
GET /products/search?q=milk&category=dairy
Authorization: Bearer {token}
X-API-Key: {api-key}
```

### Orders
```javascript
// Create order
POST /orders
Authorization: Bearer {token}
X-API-Key: {api-key}
Content-Type: application/json

{
  "customerId": "customer-id",
  "items": [
    {
      "productId": "product-id",
      "quantity": 2,
      "price": 9.99
    }
  ]
}

// Get order status
GET /orders/:orderId
Authorization: Bearer {token}
X-API-Key: {api-key}
```

## Frontend Integration Example (Next.js)

### 1. Create API Client
```typescript
// utils/api-client.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://18sz01wxsi.execute-api.eu-central-1.amazonaws.com/dev';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'omnix-api-key-development-2024';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          
          // Retry original request
          error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return apiClient.request(error.config);
        } catch (refreshError) {
          // Redirect to login
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2. Auth Service
```typescript
// services/auth.service.ts
import apiClient from '@/utils/api-client';

export const authService = {
  async login(email: string, password: string) {
    const { data } = await apiClient.post('/auth/login', {
      email,
      password,
    });
    
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    
    return data.data;
  },

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await apiClient.post('/auth/logout', { refreshToken });
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  },
};
```

### 3. Customer Service
```typescript
// services/customer.service.ts
import apiClient from '@/utils/api-client';

export const customerService = {
  async getProfile(customerId: string) {
    const { data } = await apiClient.get(`/customers/${customerId}/profile`);
    return data;
  },

  async getRecommendations(customerId: string, context: string = 'general') {
    const { data } = await apiClient.post('/ai/recommendations', {
      customerId,
      context,
    });
    return data;
  },

  async getPredictions(customerId: string) {
    const { data } = await apiClient.get(`/ai/predictions/${customerId}`);
    return data;
  },
};
```

## Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://18sz01wxsi.execute-api.eu-central-1.amazonaws.com/dev
NEXT_PUBLIC_API_KEY=omnix-api-key-development-2024
```

### Backend (.env)
```bash
JWT_SECRET=omnix-jwt-secret-change-in-production
JWT_REFRESH_SECRET=omnix-refresh-secret-change-in-production
API_KEY_1=omnix-api-key-production-2024
API_KEY_2=omnix-api-key-staging-2024
API_KEY_3=omnix-api-key-development-2024
AWS_REGION=eu-central-1
DYNAMODB_TABLE_PREFIX=omnix-ai-dev-
```

## CORS Configuration
The backend is configured to accept requests from all origins (`*`) for development. In production, update the CORS settings to only allow your frontend domain:

```typescript
// In production, update serverless.yml
cors:
  origin: 'https://your-frontend-domain.com'
  headers:
    - Content-Type
    - Authorization
    - X-API-Key
  allowCredentials: true
```

## Error Handling
The API returns errors in this format:
```json
{
  "statusCode": 400,
  "message": "Error message here",
  "error": "Bad Request"
}
```

Handle errors appropriately in your frontend:
```typescript
try {
  const data = await customerService.getProfile(customerId);
  // Handle success
} catch (error) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || 'An error occurred';
    // Show error to user
  }
}
```

## WebSocket Connection (Real-time Updates)
For real-time features:
```javascript
// WebSocket endpoint
wss://your-websocket-api-id.execute-api.eu-central-1.amazonaws.com/dev

// Connection with auth
const ws = new WebSocket(`wss://...?token=${accessToken}`);
```

## Testing the Connection

### 1. Test Authentication
```bash
# Login
curl -X POST https://18sz01wxsi.execute-api.eu-central-1.amazonaws.com/dev/auth/login \
  -H "Content-Type: application/json" \
  -H "X-API-Key: omnix-api-key-development-2024" \
  -d '{"email":"test@example.com","password":"testPassword"}'
```

### 2. Test Authenticated Request
```bash
# Get products (replace TOKEN with actual token)
curl -X GET https://18sz01wxsi.execute-api.eu-central-1.amazonaws.com/dev/products \
  -H "Authorization: Bearer TOKEN" \
  -H "X-API-Key: omnix-api-key-development-2024"
```

## Support & Troubleshooting

Common issues:
1. **401 Unauthorized**: Check if token is expired or API key is missing
2. **403 Forbidden**: Verify API key is correct for the environment
3. **CORS errors**: Ensure frontend domain is whitelisted in backend
4. **Connection refused**: Check if backend services are running

For local development:
```bash
# Start backend
cd backend
npm run start:dev

# Start AI Lambda
cd ai-lambda
serverless offline
```

---

Built by Jonathan Max — OMNIX AI Platform