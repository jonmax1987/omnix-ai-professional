// Test handler to verify Lambda is working
exports.handler = async (event, context) => {
  console.log('Lambda event:', JSON.stringify(event, null, 2));
  
  // Basic routing simulation
  const { path = '/v1/system/health', httpMethod = 'GET' } = event;
  
  try {
    if (path.includes('/system/health')) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          message: 'Lambda is working! Now we need to fix the NestJS integration.',
          handler: 'data-lambda-temp',
          environment: process.env.NODE_ENV || 'development'
        })
      };
    }
    
    // For other endpoints, return basic mock data
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        message: 'Mock endpoint response',
        path: path,
        method: httpMethod,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Lambda execution error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};