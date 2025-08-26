import { DynamoDBService } from './dynamodb.service';
import { MonitoringService } from './monitoring.service';
import { BedrockAnalysisRequest, ABTestResult } from '../interfaces/ai-analysis.interface';
export interface ABTestConfig {
    testId: string;
    testName: string;
    modelA: {
        id: string;
        name: string;
        weight: number;
    };
    modelB: {
        id: string;
        name: string;
        weight: number;
    };
    startDate: string;
    endDate: string;
    active: boolean;
    metrics: string[];
}
export interface ABTestMetrics {
    testId: string;
    modelId: string;
    totalRequests: number;
    successRate: number;
    averageProcessingTime: number;
    averageConfidence: number;
    averageTokenCost: number;
    customerSatisfactionScore?: number;
}
export declare class ABTestingService {
    private readonly dynamoDBService;
    private readonly monitoring;
    private bedrock;
    private readonly testsTable;
    private readonly metricsTable;
    private readonly availableModels;
    constructor(dynamoDBService: DynamoDBService, monitoring: MonitoringService);
    createABTest(config: ABTestConfig): Promise<void>;
    getModelAssignment(customerId: string, analysisType: string): Promise<{
        modelId: string;
        modelName: string;
        testId?: string;
    }>;
    invokeModelWithABTesting(request: BedrockAnalysisRequest, prompt: string): Promise<{
        response: string;
        modelUsed: string;
        testId?: string;
        processingTime: number;
        inputTokens: number;
        outputTokens: number;
    }>;
    getABTestResults(testId: string): Promise<ABTestResult>;
    private assignCustomerToModel;
    private hashString;
    private invokeBedrockModel;
    private getActiveTests;
    private initializeTestMetrics;
    private recordABTestMetrics;
    private getTestConfig;
    private getModelMetrics;
    private calculateStatisticalSignificance;
    private determineWinner;
    private generateRecommendations;
    private getTestStatus;
    private extractConfidenceFromResponse;
    private calculateTokenCost;
    private estimateTokens;
    listABTests(): Promise<ABTestConfig[]>;
    deactivateABTest(testId: string): Promise<void>;
}
