// OMNIX AI Staging Lambda with Database Integration
// Database utilities for real data integration
const { getProducts, getDashboardSummary, getOrders, getUser } = require('./database-utils');

// Staging-specific CORS origins
const ALLOWED_ORIGINS = [
    'https://dtdnwq4annvk2.cloudfront.net', // Staging CloudFront
    'https://d1vu6p9f5uc16.cloudfront.net', // Production (for testing)
    'http://localhost:5173' // Local development
];

// Dynamic CORS headers based on request origin
const createCORSHeaders = (requestOrigin) => {
    const allowedOrigin = ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : ALLOWED_ORIGINS[0];
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-API-Key,X-Client-Type,X-Client-Version,X-Request-Id',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
        'X-Environment': 'staging'
    };
};

// Success response helper
const createResponse = (statusCode, body, requestOrigin = null) => ({
    statusCode,
    headers: createCORSHeaders(requestOrigin),
    body: JSON.stringify(body)
});

// Health check endpoint
const handleHealthCheck = (event) => {
    console.log('Staging Health check requested');
    return createResponse(200, {
        status: 'healthy',
        message: 'OMNIX AI Staging API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0-staging',
        environment: 'staging'
    }, event.headers?.origin);
};

// Dashboard summary for staging - now using real database data
const getStagingDashboardSummary = async (event) => {
    console.log('Staging dashboard summary requested');
    
    try {
        // Use database utilities to get real dashboard data
        const dashboardData = await getDashboardSummary();
        
        console.log('Retrieved dashboard summary from database');
        return createResponse(200, {
            message: 'Dashboard summary retrieved (staging)',
            data: dashboardData
        }, event.headers?.origin);

    } catch (error) {
        console.error('Error fetching staging dashboard data from database:', error);
        
        // Fallback to basic mock data if database fails
        const fallbackDashboard = {
            totalRevenue: 15825.45,
            dailyRevenue: 1250.30,
            totalCustomers: 12,
            activeCustomers: 8,
            totalOrders: 234,
            dailyOrders: 18,
            averageOrderValue: 67.63,
            inventoryValue: 18445.20,
            lowStockItems: 3,
            topSellingProducts: [
                { name: '[STAGING] Premium Coffee Beans', sales: 156 }
            ],
            environment: 'staging',
            lastUpdated: new Date().toISOString()
        };
        
        console.log('Using fallback dashboard data due to database error');
        return createResponse(200, {
            message: 'Dashboard summary retrieved (staging)',
            data: fallbackDashboard,
            fallback: true,
            error: 'Database temporarily unavailable'
        }, event.headers?.origin);
    }
};

// Products endpoint for staging - now using real database data
const getStagingProducts = async (event) => {
    console.log('Staging products requested');
    
    try {
        // Use database utilities to get real product data
        const products = await getProducts(50); // Get up to 50 products
        
        console.log(`Retrieved ${products.length} products from database`);
        return createResponse(200, { data: products }, event.headers?.origin);

    } catch (error) {
        console.error('Error fetching staging products from database:', error);
        
        // Fallback to basic mock data if database fails
        const fallbackProducts = [
            {
                id: 'stg-prod-001',
                name: '[STAGING] Premium Coffee Beans',
                description: 'Ethically sourced premium coffee beans',
                price: 24.99,
                currency: 'EUR',
                quantity: 75,
                minThreshold: 20,
                supplier: 'Staging Coffee Co.',
                category: 'beverages',
                lastRestocked: '2025-09-01T10:00:00Z'
            }
        ];
        
        console.log('Using fallback products data due to database error');
        return createResponse(200, { 
            data: fallbackProducts,
            fallback: true,
            error: 'Database temporarily unavailable'
        }, event.headers?.origin);
    }
};

// Orders endpoint for staging - now using real database data
const getStagingOrders = async (event) => {
    console.log('Staging orders requested');
    
    try {
        // Use database utilities to get real order data
        const orders = await getOrders(30); // Get up to 30 recent orders
        
        console.log(`Retrieved ${orders.length} orders from database`);
        return createResponse(200, { data: orders }, event.headers?.origin);

    } catch (error) {
        console.error('Error fetching staging orders from database:', error);
        
        // Fallback to basic mock data if database fails
        const fallbackOrders = [
            {
                id: 'stg-order-001',
                customerId: 'stg-customer-001',
                items: [
                    { productId: 'stg-prod-001', name: '[STAGING] Premium Coffee Beans', quantity: 2, price: 24.99 }
                ],
                totalAmount: 49.98,
                status: 'completed',
                orderDate: '2025-09-07T14:30:00Z',
                environment: 'staging'
            }
        ];
        
        console.log('Using fallback orders data due to database error');
        return createResponse(200, { 
            data: fallbackOrders,
            fallback: true,
            error: 'Database temporarily unavailable'
        }, event.headers?.origin);
    }
};

// Auth login mock
const handleStagingLogin = async (event) => {
    console.log('Staging login attempt');
    
    try {
        const requestBody = JSON.parse(event.body || '{}');
        const { email, password } = requestBody;
        
        // Mock authentication for staging - Manager account
        if (email === 'staging@omnix.ai' && password === 'staging123') {
            return createResponse(200, {
                message: 'Login successful (staging)',
                token: 'staging-jwt-token-mock',
                user: {
                    id: 'staging-user-001',
                    email: 'staging@omnix.ai',
                    name: 'Staging Manager',
                    role: 'admin',
                    environment: 'staging'
                }
            }, event.headers?.origin);
        }
        
        // Mock authentication for staging - Customer account
        if (email === 'customer@staging.omnix.ai' && password === 'customer123') {
            return createResponse(200, {
                message: 'Login successful (staging customer)',
                token: 'staging-customer-jwt-token-mock',
                user: {
                    id: 'staging-customer-001',
                    email: 'customer@staging.omnix.ai',
                    name: 'John Doe',
                    role: 'customer',
                    environment: 'staging',
                    customerProfile: {
                        segment: 'Premium',
                        loyaltyPoints: 1250,
                        memberSince: '2024-01-15',
                        preferredStore: 'Main Store'
                    }
                }
            }, event.headers?.origin);
        }
        
        return createResponse(401, {
            message: 'Invalid credentials',
            environment: 'staging'
        }, event.headers?.origin);
        
    } catch (error) {
        console.error('Error in staging login:', error);
        return createResponse(500, {
            message: 'Login error',
            error: error.message,
            environment: 'staging'
        }, event.headers?.origin);
    }
};

// Main Lambda handler
exports.handler = async (event, context) => {
    console.log('Staging Lambda invocation:', {
        httpMethod: event.httpMethod,
        path: event.path,
        pathParameters: event.pathParameters,
        headers: event.headers
    });

    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return createResponse(200, { message: 'CORS preflight successful' }, event.headers?.origin);
    }

    try {
        const path = event.path;
        const method = event.httpMethod;

        // Health check endpoints (handle both full path and stripped path)
        if ((path === '/health' || path === '/staging/health' || path === '/v1/health' || path === '/staging/v1/health') && method === 'GET') {
            return handleHealthCheck(event);
        }

        // Dashboard endpoints
        if ((path === '/v1/dashboard/summary' || path === '/staging/v1/dashboard/summary') && method === 'GET') {
            return getStagingDashboardSummary(event);
        }

        // Products endpoints
        if ((path === '/v1/products' || path === '/staging/v1/products') && method === 'GET') {
            return getStagingProducts(event);
        }

        // Orders endpoints
        if ((path === '/v1/orders' || path === '/staging/v1/orders') && method === 'GET') {
            return getStagingOrders(event);
        }
        
        // Auth endpoints
        if ((path === '/v1/auth/login' || path === '/staging/v1/auth/login') && method === 'POST') {
            return handleStagingLogin(event);
        }
        
        // Analytics endpoints (mock responses for staging with rate limiting)
        if ((path === '/v1/analytics/performance' || path === '/staging/v1/analytics/performance') && method === 'POST') {
            console.log('Analytics spam detected - returning cached response');
            return createResponse(200, {
                message: 'Performance analytics cached (staging - rate limited)',
                environment: 'staging',
                recorded: false,
                rateLimited: true,
                note: 'Frontend is sending too many analytics requests. This is a staging environment mock response.'
            }, event.headers?.origin);
        }

        // Orders statistics endpoints
        if ((path === '/v1/orders/statistics' || path === '/staging/v1/orders/statistics') && method === 'GET') {
            return createResponse(200, {
                message: 'Order statistics retrieved (staging)',
                data: {
                    totalOrders: 234,
                    completedOrders: 198,
                    pendingOrders: 36,
                    totalRevenue: 15825.45,
                    averageOrderValue: 67.63,
                    ordersToday: 18,
                    revenueToday: 1250.30,
                    topProducts: [
                        { name: '[STAGING] Premium Coffee Beans', orders: 24 },
                        { name: '[STAGING] Organic Milk 1L', orders: 19 },
                        { name: '[STAGING] Artisan Bread Loaf', orders: 16 }
                    ]
                },
                environment: 'staging'
            }, event.headers?.origin);
        }

        // Alerts endpoints
        if ((path === '/v1/alerts' || path === '/staging/v1/alerts') && method === 'GET') {
            return createResponse(200, {
                message: 'Alerts retrieved (staging)',
                data: [
                    {
                        id: 'stg-alert-001',
                        type: 'inventory',
                        severity: 'medium',
                        title: '[STAGING] Low Stock Alert',
                        message: 'Premium Coffee Beans running low (15 units remaining)',
                        timestamp: new Date().toISOString(),
                        status: 'active'
                    },
                    {
                        id: 'stg-alert-002',
                        type: 'revenue',
                        severity: 'low',
                        title: '[STAGING] Revenue Update',
                        message: 'Daily revenue target 80% achieved',
                        timestamp: new Date(Date.now() - 3600000).toISOString(),
                        status: 'active'
                    }
                ],
                environment: 'staging'
            }, event.headers?.origin);
        }

        // AI Insights endpoints
        if ((path === '/v1/ai/insights/consumption-predictions' || path === '/staging/v1/ai/insights/consumption-predictions') && method === 'GET') {
            const timeHorizon = event.queryStringParameters?.['params[timeHorizon]'] || '7d';
            const customerId = event.queryStringParameters?.['params[customerId]'] || 'staging-customer-001';
            
            return createResponse(200, {
                message: 'Consumption predictions retrieved (staging)',
                data: {
                    customerId: customerId,
                    timeHorizon: timeHorizon,
                    predictions: [
                        {
                            productId: 'stg-prod-002',
                            productName: '[STAGING] Organic Milk 1L',
                            predictedNeedDate: new Date(Date.now() + 432000000).toISOString(), // 5 days
                            confidence: 0.92,
                            pattern: 'Regular weekly purchase',
                            averageConsumptionRate: '1 unit per 5 days',
                            factors: ['Historical purchase pattern', 'Seasonal adjustment', 'Day of week preference']
                        },
                        {
                            productId: 'stg-prod-003',
                            productName: '[STAGING] Artisan Bread Loaf',
                            predictedNeedDate: new Date(Date.now() + 259200000).toISOString(), // 3 days
                            confidence: 0.85,
                            pattern: 'Bi-weekly purchase',
                            averageConsumptionRate: '2 units per week',
                            factors: ['Purchase frequency', 'Product shelf life', 'Household size estimate']
                        },
                        {
                            productId: 'stg-prod-001',
                            productName: '[STAGING] Premium Coffee Beans',
                            predictedNeedDate: new Date(Date.now() + 1209600000).toISOString(), // 14 days
                            confidence: 0.78,
                            pattern: 'Monthly bulk purchase',
                            averageConsumptionRate: '500g per month',
                            factors: ['Bulk buying behavior', 'Price sensitivity', 'Storage capacity']
                        }
                    ],
                    insights: {
                        savingsOpportunity: 'Bundle milk and bread purchases to save €2.50/month',
                        consumptionTrend: 'Your dairy consumption increased 15% this month',
                        recommendation: 'Consider subscribing to weekly essentials for 10% discount'
                    }
                },
                environment: 'staging'
            }, event.headers?.origin);
        }

        if ((path === '/v1/ai/insights/personalization' || path === '/staging/v1/ai/insights/personalization') && method === 'POST') {
            return createResponse(200, {
                message: 'Personalization insights generated (staging)',
                data: {
                    personalityProfile: {
                        shoppingStyle: 'Practical Planner',
                        priceSegment: 'Value Conscious',
                        brandLoyalty: 'Moderate',
                        innovationAdoption: 'Early Majority'
                    },
                    recommendations: {
                        products: [
                            {
                                reason: 'Based on your vegetarian preference',
                                items: ['Plant-based protein', 'Organic vegetables', 'Quinoa']
                            },
                            {
                                reason: 'Complementary to your regular purchases',
                                items: ['Whole grain pasta', 'Olive oil', 'Fresh herbs']
                            }
                        ],
                        timing: {
                            bestShoppingDay: 'Saturday',
                            optimalTime: '10:00-12:00',
                            reason: 'Lower prices and fresher produce'
                        }
                    },
                    aiConfidence: 0.88
                },
                environment: 'staging'
            }, event.headers?.origin);
        }

        if ((path === '/v1/ai/insights/realtime' || path === '/staging/v1/ai/insights/realtime') && method === 'GET') {
            return createResponse(200, {
                message: 'Real-time AI insights retrieved (staging)',
                data: {
                    insights: [
                        {
                            id: 'insight-001',
                            type: 'savings',
                            priority: 'high',
                            title: 'Price Drop Alert',
                            description: 'Premium Coffee Beans now 20% off - matches your buying pattern',
                            actionable: true,
                            expiresIn: '2 days',
                            potentialSavings: 4.99,
                            timestamp: new Date().toISOString()
                        },
                        {
                            id: 'insight-002',
                            type: 'behavior',
                            priority: 'medium',
                            title: 'Shopping Pattern Detected',
                            description: 'You typically shop on weekends. Tomorrow is Saturday - perfect time for your weekly shopping',
                            actionable: false,
                            timestamp: new Date(Date.now() - 3600000).toISOString()
                        },
                        {
                            id: 'insight-003',
                            type: 'health',
                            priority: 'low',
                            title: 'Nutritional Balance',
                            description: 'Your recent purchases are high in dairy. Consider adding more fruits and vegetables',
                            actionable: true,
                            suggestedProducts: ['Fresh fruits basket', 'Seasonal vegetables'],
                            timestamp: new Date(Date.now() - 7200000).toISOString()
                        },
                        {
                            id: 'insight-004',
                            type: 'efficiency',
                            priority: 'medium',
                            title: 'Bundle Opportunity',
                            description: 'Items you buy separately could be bundled for 15% savings',
                            actionable: true,
                            bundleItems: ['Milk', 'Bread', 'Eggs'],
                            potentialSavings: 3.20,
                            timestamp: new Date(Date.now() - 10800000).toISOString()
                        }
                    ],
                    summary: {
                        totalInsights: 4,
                        actionableInsights: 3,
                        totalPotentialSavings: 8.19,
                        lastUpdated: new Date().toISOString()
                    }
                },
                environment: 'staging'
            }, event.headers?.origin);
        }

        // Customer-specific endpoints
        if ((path === '/v1/customer/profile' || path === '/staging/v1/customer/profile') && method === 'GET') {
            return createResponse(200, {
                message: 'Customer profile retrieved (staging)',
                data: {
                    id: 'staging-customer-001',
                    name: 'John Doe',
                    email: 'customer@staging.omnix.ai',
                    segment: 'Premium',
                    loyaltyPoints: 1250,
                    memberSince: '2024-01-15',
                    preferredStore: 'Main Store',
                    purchaseHistory: {
                        totalOrders: 48,
                        totalSpent: 2847.50,
                        averageOrderValue: 59.32,
                        lastOrder: new Date(Date.now() - 86400000).toISOString()
                    },
                    preferences: {
                        dietaryRestrictions: ['vegetarian'],
                        favoriteCategories: ['dairy', 'bakery', 'produce'],
                        communicationPreferences: {
                            email: true,
                            sms: false,
                            push: true
                        }
                    }
                },
                environment: 'staging'
            }, event.headers?.origin);
        }

        if ((path === '/v1/customer/recommendations' || path === '/staging/v1/customer/recommendations') && method === 'GET') {
            return createResponse(200, {
                message: 'Customer recommendations retrieved (staging)',
                data: {
                    personalizedProducts: [
                        {
                            productId: 'stg-prod-002',
                            productName: '[STAGING] Organic Milk 1L',
                            reason: 'You usually buy milk every 5 days',
                            nextPurchaseDate: new Date(Date.now() + 172800000).toISOString(),
                            confidence: 0.92
                        },
                        {
                            productId: 'stg-prod-003',
                            productName: '[STAGING] Artisan Bread Loaf',
                            reason: 'Frequently purchased with milk',
                            crossSellProbability: 0.78
                        }
                    ],
                    deals: [
                        {
                            title: '20% off Premium Coffee',
                            description: 'Exclusive offer for Premium members',
                            validUntil: new Date(Date.now() + 604800000).toISOString(),
                            code: 'PREMIUM20'
                        }
                    ],
                    shoppingList: [
                        { item: 'Milk', quantity: 2, estimatedNeed: 'in 2 days' },
                        { item: 'Bread', quantity: 1, estimatedNeed: 'in 3 days' },
                        { item: 'Coffee', quantity: 1, estimatedNeed: 'running low' }
                    ]
                },
                environment: 'staging'
            }, event.headers?.origin);
        }

        // Recommendations endpoints
        if ((path === '/v1/recommendations/orders' || path === '/staging/v1/recommendations/orders') && method === 'GET') {
            return createResponse(200, {
                message: 'Order recommendations retrieved (staging)',
                data: [
                    {
                        id: 'stg-rec-001',
                        productId: 'stg-prod-001',
                        productName: '[STAGING] Premium Coffee Beans',
                        recommendedQuantity: 50,
                        reason: 'High demand expected based on historical data',
                        confidence: 0.85,
                        urgency: 'medium',
                        estimatedRevenue: 1249.50
                    },
                    {
                        id: 'stg-rec-002',
                        productId: 'stg-prod-002',
                        productName: '[STAGING] Organic Milk 1L',
                        recommendedQuantity: 30,
                        reason: 'Regular restocking cycle due',
                        confidence: 0.92,
                        urgency: 'low',
                        estimatedRevenue: 104.70
                    }
                ],
                environment: 'staging'
            }, event.headers?.origin);
        }

        // Default 404 response for unmatched routes
        return createResponse(404, {
            message: 'Endpoint not found',
            path: path,
            method: method,
            environment: 'staging',
            availableEndpoints: [
                'GET /staging/v1/health',
                'GET /staging/v1/dashboard/summary',
                'GET /staging/v1/products',
                'GET /staging/v1/orders',
                'GET /staging/v1/orders/statistics',
                'GET /staging/v1/alerts',
                'GET /staging/v1/recommendations/orders',
                'GET /staging/v1/customer/profile',
                'GET /staging/v1/customer/recommendations',
                'GET /staging/v1/ai/insights/consumption-predictions',
                'POST /staging/v1/ai/insights/personalization',
                'GET /staging/v1/ai/insights/realtime',
                'POST /staging/v1/auth/login',
                'POST /staging/v1/analytics/performance'
            ]
        }, event.headers?.origin);

    } catch (error) {
        console.error('Staging Lambda error:', error);
        return createResponse(500, {
            message: 'Internal server error',
            error: error.message,
            environment: 'staging'
        }, event.headers?.origin);
    }
};