export interface BedrockCostEntry {
  id: string;
  timestamp: string;
  customerId: string;
  analysisType: 'consumption_prediction' | 'customer_profiling' | 'recommendation_generation';
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  processingTimeMs: number;
  success: boolean;
  usedFallback: boolean;
}

export interface CostAnalytics {
  totalCost: number;
  totalRequests: number;
  averageCostPerRequest: number;
  costByAnalysisType: {
    [key: string]: {
      totalCost: number;
      requestCount: number;
      averageCost: number;
    };
  };
  costByTimeRange: {
    hourly: number;
    daily: number;
    monthly: number;
  };
  tokenUsage: {
    totalInputTokens: number;
    totalOutputTokens: number;
    averageTokensPerRequest: number;
  };
  fallbackRate: number;
  projectedMonthlyCost: number;
}

export interface TopCustomerCost {
  customerId: string;
  totalCost: number;
  requestCount: number;
  averageCostPerRequest: number;
}