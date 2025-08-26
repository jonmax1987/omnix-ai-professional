"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const app_module_1 = require("./src/app.module");
const rate_limit_middleware_1 = require("./src/common/middleware/rate-limit.middleware");
const serverless_express_1 = require("@vendia/serverless-express");
const express = require("express");
let cachedServer;
async function createServer() {
    try {
        console.log('🚀 Starting Lambda server creation...');
        if (!cachedServer) {
            console.log('📦 Creating new NestJS application...');
            const expressApp = express();
            console.log('🔧 Initializing NestJS with Express adapter...');
            const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressApp), {
                logger: ['error', 'warn', 'log'],
            });
            console.log('🌐 Configuring CORS...');
            app.enableCors({
                origin: [
                    'http://localhost:3000',
                    'https://omnix-ai.com',
                    'https://www.omnix-ai.com',
                    'https://app.omnix-ai.com',
                    'https://dh5a0lb9qett.cloudfront.net',
                    '*'
                ],
                credentials: true,
                methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
                allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
            });
            console.log('⚡ Setting up rate limiting...');
            try {
                app.use('/v1/', rate_limit_middleware_1.apiLimiter);
                app.use('/v1/auth/login', rate_limit_middleware_1.authLimiter);
                app.use('/v1/auth/refresh', rate_limit_middleware_1.authLimiter);
            }
            catch (rateLimitError) {
                console.warn('⚠️ Rate limiting setup failed:', rateLimitError);
            }
            console.log('✅ Setting up validation pipes...');
            app.useGlobalPipes(new common_1.ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
                disableErrorMessages: false,
            }));
            console.log('🔢 Setting API prefix...');
            console.log('📚 Setting up Swagger documentation...');
            const config = new swagger_1.DocumentBuilder()
                .setTitle('OMNIX AI Inventory Management API')
                .setDescription('OMNIX AI is an advanced smart inventory management platform that helps store managers, purchasing teams, and analysts efficiently control inventory, prevent shortages/losses, and optimize procurement through AI-powered demand forecasting.')
                .setVersion('1.0.0')
                .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'ApiKeyAuth')
                .addBearerAuth({
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            }, 'BearerAuth')
                .build();
            const document = swagger_1.SwaggerModule.createDocument(app, config);
            swagger_1.SwaggerModule.setup('api/docs', app, document);
            console.log('🔄 Initializing NestJS application...');
            await app.init();
            console.log('⚙️ Configuring serverless express...');
            cachedServer = (0, serverless_express_1.configure)({
                app: expressApp,
                binaryMimeTypes: ['application/octet-stream', 'image/*'],
            });
            console.log('✅ Server creation completed successfully!');
        }
        else {
            console.log('♻️ Using cached server instance');
        }
        return cachedServer;
    }
    catch (error) {
        console.error('❌ CRITICAL ERROR during server creation:', error);
        console.error('📋 Error stack:', error.stack);
        console.error('📋 Error details:', JSON.stringify(error, null, 2));
        throw error;
    }
}
const handler = async (event, context) => {
    try {
        console.log('🎯 Lambda handler invoked');
        console.log('📥 Event path:', event.path);
        console.log('📥 Event method:', event.httpMethod);
        console.log('📥 Event headers:', JSON.stringify(event.headers, null, 2));
        context.callbackWaitsForEmptyEventLoop = false;
        console.log('🏗️ Getting server instance...');
        const server = await createServer();
        console.log('📤 Forwarding request to NestJS...');
        const result = await server(event, context);
        console.log('✅ Request completed successfully');
        console.log('📤 Response status:', result.statusCode);
        return result;
    }
    catch (error) {
        console.error('❌ FATAL ERROR in Lambda handler:', error);
        console.error('📋 Error stack:', error.stack);
        console.error('📋 Error details:', JSON.stringify(error, null, 2));
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-API-Key',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
            },
            body: JSON.stringify({
                error: 'Internal Server Error',
                message: 'Lambda function failed to process request',
                details: error.message,
                timestamp: new Date().toISOString(),
            }),
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=lambda.js.map