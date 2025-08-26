// For now, we'll use mock data without DynamoDB
// TODO: Integrate with real DynamoDB using @aws-sdk packages

const TABLE_PREFIX = 'omnix-ai-dev-';

// Mock data structures that match the real application
const mockDashboardData = {
    revenue: {
        today: 15420.50,
        weekly: 87650.25,
        monthly: 340250.75,
        growth: 12.5
    },
    orders: {
        total: 1247,
        pending: 23,
        completed: 1224,
        cancelled: 15
    },
    inventory: {
        totalProducts: 8942,
        lowStock: 45,
        outOfStock: 12,
        recentUpdates: 156
    },
    customers: {
        totalActive: 5847,
        newToday: 23,
        returningCustomers: 892,
        satisfaction: 4.6
    }
};

const mockOrders = Array.from({ length: 25 }, (_, i) => ({
    id: `ORD${Date.now() - i * 86400000 + Math.random() * 1000}`,
    customerName: `Customer ${i + 1}`,
    totalAmount: Math.round((Math.random() * 500 + 50) * 100) / 100,
    status: ['completed', 'pending', 'processing'][Math.floor(Math.random() * 3)],
    itemsCount: Math.floor(Math.random() * 10) + 1,
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - i * 86400000 + Math.random() * 86400000).toISOString()
}));

const mockProducts = Array.from({ length: 50 }, (_, i) => ({
    id: `PROD${1000 + i}`,
    name: `Product ${i + 1}`,
    description: `High-quality product for various uses - Item ${i + 1}`,
    price: Math.round((Math.random() * 200 + 10) * 100) / 100,
    stock: Math.floor(Math.random() * 100),
    category: ['Electronics', 'Clothing', 'Food', 'Home', 'Sports'][Math.floor(Math.random() * 5)],
    sku: `SKU-${1000 + i}`,
    createdAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
}));

const mockInventory = Array.from({ length: 30 }, (_, i) => ({
    id: `INV${2000 + i}`,
    productId: `PROD${1000 + i}`,
    productName: `Product ${i + 1}`,
    currentStock: Math.floor(Math.random() * 100),
    minStock: Math.floor(Math.random() * 20) + 5,
    maxStock: Math.floor(Math.random() * 200) + 100,
    lastRestocked: new Date(Date.now() - Math.random() * 15 * 86400000).toISOString(),
    supplier: `Supplier ${Math.floor(Math.random() * 5) + 1}`,
    costPerUnit: Math.round((Math.random() * 50 + 5) * 100) / 100
}));

exports.handler = async (event) => {
    try {
        console.log('Data Lambda invoked:', JSON.stringify(event, null, 2));
        
        const path = event.path || event.pathParameters?.proxy || '';
        const method = event.httpMethod;
        
        let responseData = {};
        
        // Route handling
        if (path.includes('/auth/login') && method === 'POST') {
            const body = JSON.parse(event.body || '{}');
            if (body.email === 'admin@omnix.ai' && body.password === 'admin123') {
                responseData = {
                    data: {
                        accessToken: generateJWT(),
                        refreshToken: `refresh_${Date.now()}_${Math.random().toString(36)}`,
                        user: {
                            id: "1",
                            email: "admin@omnix.ai",
                            name: "Admin User",
                            role: "admin",
                            isActive: true,
                            createdAt: "2024-08-24T10:20:30.162Z",
                            updatedAt: new Date().toISOString(),
                            lastLoginAt: new Date().toISOString()
                        }
                    },
                    message: "Login successful"
                };
            } else {
                return createResponse(401, { message: 'Invalid credentials', error: 'Unauthorized' });
            }
        } 
        else if (path.includes('/dashboard/summary')) {
            // Return data according to API specification DashboardSummary schema
            responseData = { 
                data: {
                    totalInventoryValue: 2450000.75,
                    totalItems: 8942,
                    lowStockItems: 45,
                    outOfStockItems: 12,
                    expiredItems: 8,
                    activeAlerts: 23,
                    categoryBreakdown: [
                        { category: "Electronics", itemCount: 2156, value: 850000.25 },
                        { category: "Clothing", itemCount: 1847, value: 420000.50 },
                        { category: "Food", itemCount: 2345, value: 650000.00 },
                        { category: "Home", itemCount: 1678, value: 380000.75 },
                        { category: "Sports", itemCount: 916, value: 149000.25 }
                    ],
                    topCategories: [
                        { category: "Electronics", percentage: 34.6 },
                        { category: "Food", percentage: 26.5 },
                        { category: "Clothing", percentage: 17.1 },
                        { category: "Home", percentage: 15.5 },
                        { category: "Sports", percentage: 6.3 }
                    ]
                },
                message: "Dashboard summary retrieved successfully"
            };
        }
        else if (path.includes('/orders/statistics')) {
            responseData = {
                data: {
                    totalOrders: 1247,
                    completedOrders: 1224,
                    pendingOrders: 23,
                    cancelledOrders: 15,
                    totalRevenue: 340250.75,
                    averageOrderValue: 274.26,
                    todayOrders: 47,
                    thisWeekOrders: 312
                },
                message: "Order statistics retrieved successfully"
            };
        }
        else if (path.includes('/orders') && !path.includes('statistics')) {
            responseData = {
                data: {
                    orders: mockOrders,
                    total: mockOrders.length,
                    page: 1,
                    limit: 25,
                    totalPages: 1
                },
                message: "Orders retrieved successfully"
            };
        }
        else if (path.includes('/products')) {
            responseData = {
                data: {
                    products: mockProducts,
                    total: mockProducts.length,
                    page: 1,
                    limit: 50,
                    totalPages: 1
                },
                message: "Products retrieved successfully"
            };
        }
        else if (path.includes('/inventory')) {
            responseData = {
                data: {
                    inventory: mockInventory,
                    total: mockInventory.length,
                    lowStockItems: mockInventory.filter(item => item.currentStock <= item.minStock).length,
                    outOfStockItems: mockInventory.filter(item => item.currentStock === 0).length
                },
                message: "Inventory retrieved successfully"
            };
        }
        else {
            responseData = {
                message: `Endpoint ${path} with method ${method} is working`,
                timestamp: new Date().toISOString(),
                path: path,
                method: method
            };
        }
        
        return createResponse(200, responseData);
        
    } catch (error) {
        console.error('Data Lambda error:', error);
        return createResponse(500, {
            error: 'Internal Server Error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

function createResponse(statusCode, data) {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://d1vu6p9f5uc16.cloudfront.net',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-API-Key,X-Client-Type,X-Client-Version,X-Request-Id',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
            'Access-Control-Allow-Credentials': 'true'
        },
        body: JSON.stringify(data)
    };
}

function generateJWT() {
    // Simple JWT-like token for demo purposes
    const header = Buffer.from(JSON.stringify({alg:"HS256",typ:"JWT"})).toString('base64');
    const payload = Buffer.from(JSON.stringify({
        sub: "1",
        email: "admin@omnix.ai", 
        role: "admin",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
    })).toString('base64');
    const signature = Buffer.from(`signature-${Date.now()}`).toString('base64');
    
    return `${header}.${payload}.${signature}`;
}