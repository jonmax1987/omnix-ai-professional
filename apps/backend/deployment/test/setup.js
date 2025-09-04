"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.AWS_REGION = 'eu-central-1';
process.env.DYNAMODB_TABLE_PREFIX = 'omnix-ai-test';
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb');
jest.mock('@aws-sdk/client-bedrock-runtime');
jest.mock('@aws-sdk/client-sqs');
jest.mock('@aws-sdk/client-kinesis');
global.createMockApp = async (providers = []) => {
    const moduleRef = await testing_1.Test.createTestingModule({
        providers,
    }).compile();
    const app = moduleRef.createNestApplication();
    await app.init();
    return { app, moduleRef };
};
jest.setTimeout(10000);
//# sourceMappingURL=setup.js.map