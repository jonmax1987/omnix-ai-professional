const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock users database (same as your NestJS users.service.ts)
const users = [
  {
    id: '1',
    email: 'admin@omnix.ai',
    passwordHash: '$2b$10$9djHvmN6iQW6ch1CFYPT1Ogt7XVctTee.SBAsRyD7PnnC91hAQQra', // admin123
    name: 'Admin User',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'manager@omnix.ai',
    passwordHash: '$2b$10$F/27b68iP4U2Gjd6zCfIqONMg46dRy/Ip/ChdrF1riY7QBhrUHxwi', // manager123
    name: 'Store Manager',
    role: 'manager',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'customer-001',
    email: 'customer@omnix.ai',
    passwordHash: '$2b$12$DVN8hsgG4Xm3p2t3ZsEo9upSsiFyzoRj.hVv71TeAbTw2fFTJGouG', // customer123
    name: 'Sarah Johnson',
    role: 'customer',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// JWT Secret (in production, use environment variable)
const JWT_SECRET = 'omnix-ai-jwt-secret-key-2024';

// Helper functions
const findUserByEmail = (email) => {
  return users.find(user => user.email === email && user.isActive);
};

const validateUser = async (email, password) => {
  const user = findUserByEmail(email);
  if (user && await bcrypt.compare(password, user.passwordHash)) {
    return user;
  }
  return null;
};

const generateJWT = (user) => {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
  };
  return jwt.sign(payload, JWT_SECRET);
};

const generateRefreshToken = (userId) => {
  return `${userId}.${Date.now()}.${Math.random().toString(36).substring(7)}`;
};

const toUserProfile = (user) => {
  const { passwordHash, ...userProfile } = user;
  return userProfile;
};

// Mock data generators (matching your existing backend)
const generateDashboardSummary = () => ({
  revenue: {
    today: 15420.50,
    yesterday: 14230.75,
    thisWeek: 89567.25,
    lastWeek: 82341.60,
    thisMonth: 342156.80,
    lastMonth: 318745.92,
    growth: 12.5
  },
  orders: {
    total: 1247,
    pending: 23,
    processing: 45,
    completed: 1179,
    cancelled: 0,
    growth: 8.3
  },
  inventory: {
    totalProducts: 2856,
    lowStock: 47,
    outOfStock: 12,
    totalValue: 1250000,
    categories: 24
  },
  customers: {
    total: 15670,
    active: 8934,
    new: 234,
    returning: 8700,
    growth: 15.7
  }
});

const generateProducts = () => [
  {
    id: 'prod-001',
    name: 'Organic Bananas',
    category: 'Fruits',
    price: 2.99,
    quantity: 150,
    minThreshold: 20,
    supplier: 'Fresh Farms Co.',
    status: 'in_stock'
  },
  {
    id: 'prod-002', 
    name: 'Whole Milk',
    category: 'Dairy',
    price: 3.49,
    quantity: 8,
    minThreshold: 15,
    supplier: 'Daily Dairy Ltd.',
    status: 'low_stock'
  },
  {
    id: 'prod-003',
    name: 'Sourdough Bread',
    category: 'Bakery',
    price: 4.99,
    quantity: 0,
    minThreshold: 10,
    supplier: 'Artisan Bakery',
    status: 'out_of_stock'
  }
];

// Main Lambda handler
exports.handler = async (event) => {
  console.log('🚀 OMNIX AI Lambda - Auth System:', JSON.stringify(event, null, 2));
  
  const method = event.httpMethod || event.requestContext?.http?.method;
  const path = event.path || event.rawPath || '';
  
  // CORS headers
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://d1vu6p9f5uc16.cloudfront.net',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-API-Key,X-Client-Type,X-Client-Version,X-Request-Id',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };

  // Handle OPTIONS preflight
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // Parse request body
    let body = {};
    if (event.body) {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    }

    // Route handling
    if (method === 'POST' && path.includes('/auth/login')) {
      console.log('🔐 Processing login request:', body);
      
      const { email, password } = body;
      
      if (!email || !password) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            message: 'Email and password are required',
            error: 'Bad Request'
          })
        };
      }

      // Validate user credentials
      const user = await validateUser(email, password);
      
      if (!user) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({
            message: 'Invalid credentials',
            error: 'Unauthorized'
          })
        };
      }

      // Generate tokens
      const accessToken = generateJWT(user);
      const refreshToken = generateRefreshToken(user.id);

      // Update last login
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex].lastLoginAt = new Date().toISOString();
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Login successful',
          data: {
            accessToken,
            refreshToken,
            user: toUserProfile(user)
          }
        })
      };
    }

    // Dashboard summary
    if (method === 'GET' && path.includes('/dashboard/summary')) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Dashboard summary retrieved successfully',
          data: generateDashboardSummary()
        })
      };
    }

    // Products
    if (method === 'GET' && path.includes('/products')) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Products retrieved successfully',
          data: generateProducts(),
          pagination: {
            page: 1,
            limit: 10,
            total: 3,
            totalPages: 1
          }
        })
      };
    }

    // Default fallback
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({
        message: `Route not found: ${method} ${path}`,
        error: 'Not Found'
      })
    };

  } catch (error) {
    console.error('❌ Lambda error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Internal server error',
        error: error.message
      })
    };
  }
};