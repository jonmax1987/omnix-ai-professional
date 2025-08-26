import { AIAnalysisResult, BedrockAnalysisRequest } from '../interfaces/ai-analysis.interface';
export declare class CacheService {
    private dynamoClient;
    private monitoring;
    private readonly tableName;
    private readonly cacheConfig;
    constructor();
    getCachedResult(request: BedrockAnalysisRequest): Promise<AIAnalysisResult | null>;
    setCachedResult(request: BedrockAnalysisRequest, result: AIAnalysisResult): Promise<void>;
    private generateCacheKey;
    private generateRequestHash;
    private cleanupOldEntries;
    private deleteCacheEntry;
    private updateAccessStats;
    private recordCacheMetrics;
    getCacheStatistics(): Promise<{
        totalEntries: number;
        entriesByType: Record<string, number>;
        oldestEntry: string;
        newestEntry: string;
        estimatedCostSavings: number;
    }>;
    invalidateCustomerCache(customerId: string): Promise<void>;
    warmCache(customers: Array<{
        customerId: string;
        purchases: any[];
    }>): Promise<void>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
}
