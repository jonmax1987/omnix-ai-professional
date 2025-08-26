exports.handler = async (event) => {
    console.log('Simple Lambda invoked:', JSON.stringify(event, null, 2));
    
    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://d1vu6p9f5uc16.cloudfront.net',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-API-Key,X-Client-Type,X-Client-Version,X-Request-Id',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
            'Access-Control-Allow-Credentials': 'true'
        },
        body: JSON.stringify({
            message: 'Login successful - simple test',
            data: {
                accessToken: 'test-token-123',
                user: {
                    id: '1',
                    email: 'admin@omnix.ai',
                    name: 'Admin User',
                    role: 'admin'
                }
            }
        })
    };
    
    // Handle OPTIONS preflight
    if (event.httpMethod === 'OPTIONS') {
        response.statusCode = 200;
        response.body = '';
    }
    
    console.log('Simple Lambda response:', JSON.stringify(response, null, 2));
    return response;
};