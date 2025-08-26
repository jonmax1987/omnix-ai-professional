import { BedrockAnalysisService } from './bedrock.service';
import { ABTestingService } from './ab-testing.service';
import { MonitoringService } from './monitoring.service';
import { CostAnalyticsService } from './cost-analytics.service';
import { BedrockAnalysisRequest, BedrockAnalysisResponse } from '../interfaces/ai-analysis.interface';
export declare class EnhancedBedrockService {
    private readonly bedrockService;
    private readonly abTestingService;
    private readonly monitoring;
    private readonly costAnalytics;
    constructor(bedrockService: BedrockAnalysisService, abTestingService: ABTestingService, monitoring: MonitoringService, costAnalytics: CostAnalyticsService);
    analyzeCustomerWithABTesting(request: BedrockAnalysisRequest): Promise<BedrockAnalysisResponse & {
        modelUsed?: string;
        testId?: string;
    }>;
    private performABTestAnalysis;
    private buildAnalysisPrompt;
    private parseBedrockResponse;
    private calculateOverallConfidence;
    private getDefaultCustomerProfile;
    private recordABTestMetrics;
    private recordFailureMetrics;
    getABTestResults(testId: string): Promise<import("../interfaces/ai-analysis.interface").ABTestResult>;
    listABTests(): Promise<import("./ab-testing.service").ABTestConfig[]>;
    createABTest(config: {
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
        metrics: string[];
    }): Promise<void>;
    deactivateABTest(testId: string): Promise<void>;
}
