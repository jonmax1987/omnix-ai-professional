import { CostAnalytics, TopCustomerCost } from '../interfaces/cost-analytics.interface';
export declare class CostAnalyticsService {
    private dynamoClient;
    private monitoring;
    private readonly tableName;
    private readonly PRICING;
    constructor();
    recordBedrockCall(params: {
        customerId: string;
        analysisType: 'consumption_prediction' | 'customer_profiling' | 'recommendation_generation';
        modelId: string;
        inputTokens: number;
        outputTokens: number;
        processingTimeMs: number;
        success: boolean;
        usedFallback: boolean;
    }): Promise<void>;
    private calculateCost;
    getCostAnalytics(timeRange?: 'hour' | 'day' | 'week' | 'month'): Promise<CostAnalytics>;
    getCustomerCostAnalytics(customerId: string, days?: number): Promise<CostAnalytics>;
    private calculateAnalytics;
    private calculateCostByTimeRange;
    private projectMonthlyCost;
    private getEmptyAnalytics;
    getTopCustomersByCost(limit?: number, days?: number): Promise<TopCustomerCost[]>;
    setupCostAlerts(thresholds: {
        dailyThreshold: number;
        monthlyThreshold: number;
        perCustomerThreshold: number;
    }): Promise<void>;
}
