const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client with connection pooling
const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'eu-central-1',
    maxAttempts: 3,
    requestHandler: {
        connectionTimeout: 2000,
        requestTimeout: 5000
    }
});
const dynamodb = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
        convertEmptyValues: false,
        removeUndefinedValues: true,
    },
    unmarshallOptions: {
        wrapNumbers: false,
    }
});

// CORS headers for all responses
const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://d1vu6p9f5uc16.cloudfront.net',
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

// Cache for frequently accessed data (5-minute TTL)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Table names mapping
const TABLE_NAMES = {
    products: 'omnix-ai-products-dev',
    orders: 'omnix-ai-dev-orders', 
    users: 'omnix-ai-dev-users',
    inventory: 'omnix-ai-dev-inventory',
    sessions: 'omnix-ai-cdk-streaming-analytics-dev-20250820T1533'
};

// Helper function to get cached data or fetch from DynamoDB
async function getCachedData(cacheKey, fetchFunction) {
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        console.log(`📦 Using cached data for ${cacheKey}`);
        return cached.data;
    }
    
    console.log(`🔄 Fetching fresh data for ${cacheKey}`);
    const data = await fetchFunction();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
}

// Retry mechanism with exponential backoff
async function retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            console.error(`❌ Attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Exponential backoff with jitter
            const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
            console.log(`⏳ Retrying in ${Math.round(delay)}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Fetch products from DynamoDB
async function fetchProducts() {
    return await retryWithBackoff(async () => {
        const command = new ScanCommand({ 
            TableName: TABLE_NAMES.products,
            ConsistentRead: false, // Use eventually consistent reads for better performance
            Select: 'ALL_ATTRIBUTES'
        });
        const response = await dynamodb.send(command);
        console.log(`✅ Retrieved ${response.Items?.length || 0} products from DynamoDB`);
        return response.Items || [];
    });
}

// Fetch orders from DynamoDB
async function fetchOrders() {
    return await retryWithBackoff(async () => {
        const command = new ScanCommand({ 
            TableName: TABLE_NAMES.orders,
            ConsistentRead: false,
            Select: 'ALL_ATTRIBUTES'
        });
        const response = await dynamodb.send(command);
        console.log(`✅ Retrieved ${response.Items?.length || 0} orders from DynamoDB`);
        return response.Items || [];
    });
}

// Fetch users from DynamoDB
async function fetchUsers() {
    try {
        return await retryWithBackoff(async () => {
            const command = new ScanCommand({ 
                TableName: TABLE_NAMES.users,
                ConsistentRead: false,
                Select: 'ALL_ATTRIBUTES'
            });
            const response = await dynamodb.send(command);
            console.log(`✅ Retrieved ${response.Items?.length || 0} users from DynamoDB`);
            return response.Items || [];
        });
    } catch (error) {
        console.error('❌ Error fetching users after retries:', error);
        return [{
            id: '1', 
            email: 'admin@omnix.ai', 
            name: 'Admin User', 
            role: 'admin' 
        }]; // Fallback user
    }
}

// Fetch sessions analytics data
async function fetchSessions() {
    try {
        return await retryWithBackoff(async () => {
            const command = new ScanCommand({ 
                TableName: TABLE_NAMES.sessions,
                ConsistentRead: false,
                Limit: 100, // Limit to avoid timeout
                Select: 'ALL_ATTRIBUTES'
            });
            const response = await dynamodb.send(command);
            console.log(`✅ Retrieved ${response.Items?.length || 0} session records from DynamoDB`);
            return response.Items || [];
        });
    } catch (error) {
        console.error('❌ Error fetching sessions after retries:', error);
        return [];
    }
}

// Calculate dashboard summary from real data
async function calculateDashboardSummary() {
    const [products, orders] = await Promise.all([
        getCachedData('products', fetchProducts),
        getCachedData('orders', fetchOrders)
    ]);
    
    // Calculate metrics from real data
    const totalRevenue = orders.reduce((sum, order) => {
        const orderTotal = order.total || order.totalAmount || 0;
        return sum + (typeof orderTotal === 'number' ? orderTotal : 0);
    }, 0);
    
    const inventoryValue = products.reduce((sum, product) => {
        const price = product.price || 0;
        const quantity = product.quantity || 0;
        return sum + (price * quantity);
    }, 0);
    
    const lowStockItems = products.filter(p => 
        (p.quantity || 0) <= (p.minThreshold || 0)
    ).length;
    
    // Get recent orders for daily metrics
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const recentOrders = orders.filter(order => {
        const orderDate = order.createdAt || order.timestamp;
        return orderDate && orderDate >= todayStart;
    });
    
    const dailyRevenue = recentOrders.reduce((sum, order) => {
        const orderTotal = order.total || order.totalAmount || 0;
        return sum + (typeof orderTotal === 'number' ? orderTotal : 0);
    }, 0);
    
    // Calculate top selling products from orders
    const productSales = new Map();
    orders.forEach(order => {
        const items = order.items || [];
        items.forEach(item => {
            const name = item.productName || item.name;
            const quantity = item.quantity || 1;
            if (name) {
                productSales.set(name, (productSales.get(name) || 0) + quantity);
            }
        });
    });
    
    const topSellingProducts = Array.from(productSales.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, sales]) => ({ name, sales }));
    
    return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        dailyRevenue: Math.round(dailyRevenue * 100) / 100,
        totalCustomers: new Set(orders.map(o => o.userId || o.customerId).filter(Boolean)).size,
        activeCustomers: recentOrders.length,
        totalOrders: orders.length,
        dailyOrders: recentOrders.length,
        averageOrderValue: orders.length > 0 ? Math.round((totalRevenue / orders.length) * 100) / 100 : 0,
        inventoryValue: Math.round(inventoryValue * 100) / 100,
        lowStockItems,
        topSellingProducts
    };
}

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
                version: '1.0.0'
            });
        }

        if (path === '/v1/auth/login' && method === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const { email, password } = body;
            
            const users = await getCachedData('users', fetchUsers);
            const user = users.find(u => u.email === email);
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

        if (path === '/v1/dashboard/summary' && method === 'GET') {
            try {
                const summary = await getCachedData('dashboard-summary', calculateDashboardSummary);
                return createResponse(200, {
                    message: 'Dashboard summary retrieved',
                    data: summary
                });
            } catch (error) {
                console.error('❌ Error retrieving dashboard summary:', error);
                return createResponse(500, {
                    error: 'Database Error',
                    message: 'Failed to retrieve dashboard data. Please try again.',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
        }

        if (path === '/v1/products' && method === 'GET') {
            try {
                const products = await getCachedData('products', fetchProducts);
                return createResponse(200, {
                    message: 'Products retrieved',
                    data: products,
                    total: products.length
                });
            } catch (error) {
                console.error('❌ Error retrieving products:', error);
                return createResponse(500, {
                    error: 'Database Error',
                    message: 'Failed to retrieve products. Please try again.',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
        }

        if (path === '/v1/orders' && method === 'GET') {
            try {
                const orders = await getCachedData('orders', fetchOrders);
                return createResponse(200, {
                    message: 'Orders retrieved',
                    data: orders,
                    total: orders.length
                });
            } catch (error) {
                console.error('❌ Error retrieving orders:', error);
                return createResponse(500, {
                    error: 'Database Error',
                    message: 'Failed to retrieve orders. Please try again.',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
        }

        if (path === '/v1/analytics/sessions' && method === 'GET') {
            try {
                const sessions = await getCachedData('sessions', fetchSessions);
                return createResponse(200, {
                    message: 'Sessions analytics retrieved',
                    data: sessions,
                    total: sessions.length
                });
            } catch (error) {
                console.error('❌ Error retrieving sessions analytics:', error);
                return createResponse(500, {
                    error: 'Database Error',
                    message: 'Failed to retrieve sessions data. Please try again.',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
        }

        // Default 404 for unmatched routes
        return createResponse(404, {
            error: 'Not Found',
            message: `Route ${method} ${path} not found`,
            availableRoutes: [
                'GET /health',
                'GET /v1/health',
                'POST /v1/auth/login',
                'GET /v1/dashboard/summary',
                'GET /v1/products',
                'GET /v1/orders',
                'GET /v1/analytics/sessions'
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