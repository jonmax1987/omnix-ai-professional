import { BedrockAnalysisService } from '../services/bedrock.service';
import { CustomersService } from './customers.service';
import { DynamoDBService } from '../services/dynamodb.service';
import { AIAnalysisResult, ConsumptionPattern } from '../interfaces/ai-analysis.interface';
export declare class AIAnalysisService {
    private readonly bedrockService;
    private readonly customersService;
    private readonly dynamoDBService;
    private readonly analysisResultsTable;
    constructor(bedrockService: BedrockAnalysisService, customersService: CustomersService, dynamoDBService: DynamoDBService);
    analyzeCustomerConsumption(customerId: string): Promise<AIAnalysisResult>;
    analyzeCustomerProfile(customerId: string): Promise<AIAnalysisResult>;
    generateRecommendations(customerId: string, maxRecommendations?: number): Promise<AIAnalysisResult>;
    getCustomerAnalysisHistory(customerId: string, limit?: number): Promise<AIAnalysisResult[]>;
    predictNextPurchaseDate(customerId: string, productId: string): Promise<{
        predictedDate: string;
        confidence: number;
        averageDaysBetween: number;
    }>;
    getReplenishmentAlerts(customerId: string): Promise<{
        urgent: ConsumptionPattern[];
        upcoming: ConsumptionPattern[];
    }>;
    private getOrCreateAnalysis;
    private getRecentAnalysis;
    private convertPurchasesToAnalysisFormat;
    private cacheAnalysisResults;
}
