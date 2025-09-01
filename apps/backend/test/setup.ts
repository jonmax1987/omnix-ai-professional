import { Test } from '@nestjs/testing';

// Global test configuration
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.AWS_REGION = 'eu-central-1';
process.env.DYNAMODB_TABLE_PREFIX = 'omnix-ai-test';

// Mock AWS SDK
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb');
jest.mock('@aws-sdk/client-bedrock-runtime');
jest.mock('@aws-sdk/client-sqs');
jest.mock('@aws-sdk/client-kinesis');

// Global test utilities
global.createMockApp = async (providers = []) => {
  const moduleRef = await Test.createTestingModule({
    providers,
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();
  return { app, moduleRef };
};

// Extend Jest timeout for integration tests
jest.setTimeout(10000);