import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { apiLimiter, authLimiter } from './common/middleware/rate-limit.middleware';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function bootstrap() {
  console.log('🚀 Starting OMNIX AI Backend...');
  console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
  console.log('🔑 AWS Region:', process.env.AWS_REGION || 'eu-central-1');
  console.log('🔐 AWS Credentials configured:', !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY));
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend integration
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://localhost:5175',
      'https://d1vu6p9f5uc16.cloudfront.net', // Current CloudFront production frontend
      'https://dtdnwq4annvk2.cloudfront.net', // Staging CloudFront URL
      'https://d19s05k3hjfuzv.cloudfront.net', // Legacy CloudFront
      'https://omnix-ai.com',
      'https://www.omnix-ai.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Client-Version', 'X-Client-Type', 'X-Request-Id'],
    optionsSuccessStatus: 200,
  });

  // Apply rate limiting
  app.use('/v1/', apiLimiter);
  app.use('/v1/auth/login', authLimiter);
  app.use('/v1/auth/refresh', authLimiter);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API versioning
  app.setGlobalPrefix('v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('OMNIX AI Inventory Management API')
    .setDescription(
      'OMNIX AI is an advanced smart inventory management platform that helps store managers, purchasing teams, and analysts efficiently control inventory, prevent shortages/losses, and optimize procurement through AI-powered demand forecasting.',
    )
    .setVersion('1.0.0')
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'ApiKeyAuth')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'BearerAuth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 OMNIX AI API running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();