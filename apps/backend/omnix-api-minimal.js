// OMNIX AI API - Minimal Lambda Function
// Handles basic endpoints without external dependencies

// CORS headers for all responses
const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://dtdnwq4annvk2.cloudfront.net',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-API-Key,X-Client-Type,X-Client-Version,X-Request-Id',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
};

// Success response helper
const createResponse = (statusCode, body) => ({
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body)
});

// Mock data for testing
const MOCK_DATA = {
    users: [
        { id: '1', email: 'admin@omnix.ai', name: 'Admin User', role: 'admin' },
        { id: '2', email: 'manager@omnix.ai', name: 'Store Manager', role: 'manager' },
        { id: '3', email: 'customer@omnix.ai', name: 'Customer User', role: 'customer' }
    ],
    products: [
        { 
            id: 'prod-001', 
            name: 'Organic Bananas', 
            price: 2.99, 
            category: 'Fruits',
            quantity: 150,
            minThreshold: 20,
            supplier: 'Fresh Farm Co',
            description: 'Fresh organic bananas, perfect for smoothies',
            image: '/images/bananas.jpg'
        },
        {
            id: 'prod-002',
            name: 'Whole Milk',
            price: 3.49,
            category: 'Dairy',
            quantity: 85,
            minThreshold: 15,
            supplier: 'Local Dairy',
            description: 'Fresh whole milk from local farms',
            image: '/images/milk.jpg'
        },
        {
            id: 'prod-003',
            name: 'Sourdough Bread',
            price: 4.99,
            category: 'Bakery',
            quantity: 25,
            minThreshold: 10,
            supplier: 'Artisan Bakery',
            description: 'Handcrafted sourdough bread',
            image: '/images/bread.jpg'
        }
    ],
    orders: [
        {
            id: 'order-001',
            userId: '3',
            customerName: 'Customer User',
            items: [
                { productId: 'prod-001', productName: 'Organic Bananas', quantity: 3, price: 2.99 },
                { productId: 'prod-002', productName: 'Whole Milk', quantity: 1, price: 3.49 }
            ],
            total: 12.46,
            status: 'completed',
            createdAt: '2025-09-01T10:30:00Z'
        },
        {
            id: 'order-002',
            userId: '3',
            customerName: 'Customer User',
            items: [
                { productId: 'prod-003', productName: 'Sourdough Bread', quantity: 1, price: 4.99 }
            ],
            total: 4.99,
            status: 'pending',
            createdAt: '2025-09-02T09:15:00Z'
        }
    ],
    dashboard: {
        summary: {
            totalRevenue: 15487.32,
            dailyRevenue: 1247.89,
            totalCustomers: 1853,
            activeCustomers: 127,
            totalOrders: 542,
            dailyOrders: 23,
            averageOrderValue: 28.57,
            inventoryValue: 45892.12,
            lowStockItems: 8,
            topSellingProducts: [
                { name: 'Organic Bananas', sales: 234 },
                { name: 'Whole Milk', sales: 198 },
                { name: 'Sourdough Bread', sales: 156 }
            ]
        }
    }
};

exports.handler = async (event) => {
    console.log('OMNIX API Lambda invoked:', JSON.stringify(event, null, 2));
    
    try {
        // Handle CORS preflight
        if (event.httpMethod === 'OPTIONS') {
            return createResponse(200, {});
        }

        const method = event.httpMethod;
        const path = event.path || event.pathParameters?.proxy || '';
        
        console.log(`Processing ${method} ${path}`);

        // Route handling
        if (path === '/health' || path === '/v1/health') {
            return createResponse(200, {
                status: 'healthy',
                message: 'OMNIX AI API is running',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                environment: process.env.NODE_ENV || 'development'
            });
        }

        if ((path === '/v1/auth/login' || path === '/auth/login') && method === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const { email, password } = body;
            
            const user = MOCK_DATA.users.find(u => u.email === email);
            if (user) {
                return createResponse(200, {
                    message: 'Login successful',
                    data: {
                        accessToken: `token-${user.id}-${Date.now()}`,
                        user: user
                    }
                });
            } else {
                return createResponse(401, { error: 'Invalid credentials' });
            }
        }

        if ((path === '/v1/dashboard/summary' || path === '/dashboard/summary') && method === 'GET') {
            return createResponse(200, {
                message: 'Dashboard summary retrieved',
                data: MOCK_DATA.dashboard.summary
            });
        }

        if ((path === '/v1/products' || path === '/products') && method === 'GET') {
            return createResponse(200, {
                message: 'Products retrieved',
                data: MOCK_DATA.products,
                total: MOCK_DATA.products.length
            });
        }

        if ((path === '/v1/orders' || path === '/orders') && method === 'GET') {
            return createResponse(200, {
                message: 'Orders retrieved',
                data: MOCK_DATA.orders,
                total: MOCK_DATA.orders.length
            });
        }

        if (path === '/analytics/performance' && method === 'POST') {
            const body = JSON.parse(event.body || '{}');
            console.log('Analytics performance metrics received:', body);
            
            // Generate a unique metrics ID
            const metricsId = `metrics_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
            
            return createResponse(201, {
                success: true,
                message: 'Performance metrics recorded successfully',
                timestamp: new Date().toISOString(),
                metricsId: metricsId
            });
        }

        // Default 404 for unmatched routes
        return createResponse(404, {
            error: 'Not Found',
            message: `Route ${method} ${path} not found`,
            availableRoutes: [
                'GET /health',
                'GET /v1/health',
                'POST /auth/login',
                'POST /v1/auth/login',
                'GET /dashboard/summary',
                'GET /v1/dashboard/summary',
                'GET /products',
                'GET /v1/products',
                'GET /orders',
                'GET /v1/orders',
                'POST /analytics/performance'
            ]
        });

    } catch (error) {
        console.error('Lambda error:', error);
        return createResponse(500, {
            error: 'Internal Server Error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};