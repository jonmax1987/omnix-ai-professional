import { EnhancedBedrockService } from '../services/enhanced-bedrock.service';
import { ABTestingService, ABTestConfig } from '../services/ab-testing.service';
export declare class CreateABTestDto {
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
}
export declare class ABTestResultsDto {
    testId: string;
    includeRawData?: boolean;
}
export declare class ABTestingController {
    private readonly enhancedBedrockService;
    private readonly abTestingService;
    constructor(enhancedBedrockService: EnhancedBedrockService, abTestingService: ABTestingService);
    createABTest(createTestDto: CreateABTestDto): Promise<{
        success: boolean;
        message: string;
        testId: string;
    }>;
    listABTests(): Promise<{
        success: boolean;
        data: ABTestConfig[];
        totalTests: number;
        activeTests: number;
    }>;
    getABTestResults(testId: string, includeRawData?: boolean): Promise<{
        success: boolean;
        data: import("../interfaces/ai-analysis.interface").ABTestResult;
        summary: any;
    }>;
    deactivateABTest(testId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getABTestStatus(testId: string): Promise<{
        success: boolean;
        data: {
            testId: string;
            testName: string;
            status: "pending" | "running" | "completed" | "paused";
            startDate: string;
            endDate: string;
            modelsCompared: string[];
            totalRequests: number;
            currentWinner: "A" | "B" | "tie";
            significance: number;
        };
    }>;
    createQuickTest(quickTestDto: {
        testName: string;
        analysisType: 'consumption_prediction' | 'customer_profiling' | 'recommendation_generation';
        durationDays?: number;
        trafficSplit?: number;
    }): Promise<{
        success: boolean;
        message: string;
        testId: string;
        config: CreateABTestDto;
        estimatedCompletionDate: string;
    }>;
    getAvailableModels(): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            description: string;
            costPer1kTokens: {
                input: number;
                output: number;
            };
            avgResponseTime: string;
            recommended: boolean;
        }[];
        totalModels: number;
    }>;
    private validateTestConfig;
    private generateResultsSummary;
    private calculateTestDuration;
}
