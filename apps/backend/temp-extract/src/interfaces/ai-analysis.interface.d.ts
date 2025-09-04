export interface Purchase {
    id: string;
    customerId: string;
    productId: string;
    productName: string;
    category: string;
    quantity: number;
    price: number;
    purchaseDate: string;
    brand?: string;
    size?: string;
}
export interface ConsumptionPattern {
    productId: string;
    productName: string;
    category: string;
    averageDaysBetweenPurchases: number;
    predictedNextPurchaseDate: string;
    confidence: number;
    seasonalVariation?: boolean;
}
export interface CustomerProfile {
    customerId: string;
    spendingPatterns: {
        averageOrderValue: number;
        preferredCategories: string[];
        shoppingFrequency: 'daily' | 'weekly' | 'monthly' | 'irregular';
        pricePreference: 'budget' | 'mid-range' | 'premium';
    };
    behavioralInsights: {
        plannedShopper: boolean;
        brandLoyal: boolean;
        seasonalShopper: boolean;
        bulkBuyer: boolean;
    };
    demographics: {
        estimatedAgeGroup: string;
        estimatedIncomeLevel: string;
        familySize: number;
        lifestyle: string[];
    };
}
export interface AIAnalysisResult {
    customerId: string;
    analysisDate: string;
    consumptionPatterns: ConsumptionPattern[];
    customerProfile: CustomerProfile;
    recommendations: {
        productId: string;
        productName: string;
        reason: string;
        urgency: 'low' | 'medium' | 'high';
        predictedPurchaseDate: string;
    }[];
    confidence: number;
    dataQuality: 'poor' | 'fair' | 'good' | 'excellent';
}
export interface BedrockAnalysisRequest {
    customerId: string;
    purchases: Purchase[];
    analysisType: 'consumption_prediction' | 'customer_profiling' | 'recommendation_generation';
    maxRecommendations?: number;
}
export interface BedrockAnalysisResponse {
    success: boolean;
    data?: AIAnalysisResult;
    error?: string;
    tokensUsed?: number;
    processingTime?: number;
    cached?: boolean;
}
export interface ABTestResult {
    testId: string;
    testName: string;
    status: 'pending' | 'running' | 'completed' | 'paused';
    modelA: {
        name: string;
        metrics: ModelPerformanceMetrics;
    };
    modelB: {
        name: string;
        metrics: ModelPerformanceMetrics;
    };
    winner: 'A' | 'B' | 'tie';
    significance: number;
    recommendations: string[];
    startDate: string;
    endDate: string;
}
export interface ModelPerformanceMetrics {
    totalRequests: number;
    successRate: number;
    averageProcessingTime: number;
    averageConfidence: number;
    averageTokenCost: number;
    customerSatisfactionScore?: number;
}
