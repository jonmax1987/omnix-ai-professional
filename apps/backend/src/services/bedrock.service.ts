import { Injectable } from '@nestjs/common';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { MonitoringService } from './monitoring.service';
import { CostAnalyticsService } from './cost-analytics.service';
import { CacheService } from './cache.service';
import {
  Purchase,
  AIAnalysisResult,
  BedrockAnalysisRequest,
  BedrockAnalysisResponse,
  ConsumptionPattern,
  CustomerProfile,
} from '../interfaces/ai-analysis.interface';

@Injectable()
export class BedrockAnalysisService {
  private bedrock: BedrockRuntimeClient;
  private readonly modelId: string;
  private readonly region: string;
  private readonly monitoring: MonitoringService;
  private readonly costAnalytics: CostAnalyticsService;
  private readonly cache: CacheService;

  constructor() {
    this.monitoring = new MonitoringService();
    this.costAnalytics = new CostAnalyticsService();
    this.cache = new CacheService();
    this.region = process.env.AWS_BEDROCK_REGION || process.env.AWS_REGION || 'us-east-1';
    this.modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';

    // Initialize Bedrock client
    const clientConfig: any = {
      region: this.region,
    };

    // In Lambda, use IAM role; locally use explicit credentials if available
    if (!process.env.AWS_LAMBDA_FUNCTION_NAME && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      clientConfig.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      };
    }

    this.bedrock = new BedrockRuntimeClient(clientConfig);

    console.log('🤖 Bedrock Analysis Service initialized');
    console.log('🌍 Region:', this.region);
    console.log('🧠 Model:', this.modelId);
    console.log('🔑 Using credentials:', !!clientConfig.credentials ? 'Yes (from env)' : 'No (using IAM role)');
  }

  async analyzeCustomer(request: BedrockAnalysisRequest): Promise<BedrockAnalysisResponse> {
    const startTime = Date.now();
    let usedFallback = false;
    let success = true;
    let usedCache = false;
    
    try {
      // Check cache first for significant cost savings
      const cachedResult = await this.cache.getCachedResult(request);
      if (cachedResult) {
        usedCache = true;
        const processingTime = Date.now() - startTime;
        
        console.log(`🎯 Using cached result for customer ${request.customerId} (${request.analysisType})`);
        
        // Record cache hit metrics
        await this.recordAnalysisMetrics(request, processingTime, true, false, cachedResult.confidence);
        
        // No cost for cached results
        await this.costAnalytics.recordBedrockCall({
          customerId: request.customerId,
          analysisType: request.analysisType,
          modelId: this.modelId,
          inputTokens: 0, // No API call made
          outputTokens: 0,
          processingTimeMs: processingTime,
          success: true,
          usedFallback: false,
        });
        
        return {
          success: true,
          data: cachedResult,
          processingTime,
          cached: true,
        };
      }

      // Check if AI analysis is enabled
      if (!this.isAIAnalysisEnabled()) {
        usedFallback = true;
        const fallbackResponse = this.getFallbackResponse(request, 'AI analysis is disabled');
        await this.recordAnalysisMetrics(request, Date.now() - startTime, false, true, fallbackResponse.data.confidence);
        return fallbackResponse;
      }

      console.log(`🔍 Starting AI analysis for customer ${request.customerId}`);
      console.log(`📊 Analyzing ${request.purchases.length} purchases`);

      // Validate input data
      if (request.purchases.length === 0) {
        usedFallback = true;
        const fallbackResponse = this.getFallbackResponse(request, 'No purchase history available');
        await this.recordAnalysisMetrics(request, Date.now() - startTime, false, true, fallbackResponse.data.confidence);
        return fallbackResponse;
      }

      // Build analysis prompt based on request type
      const prompt = this.buildAnalysisPrompt(request);
      
      // Estimate input tokens for cost tracking
      const inputTokens = this.estimateTokens(prompt);
      
      // Call Bedrock with retry logic
      const response = await this.invokeBedrockModelWithRetry(prompt, 2);
      
      // Estimate output tokens from response
      const outputTokens = this.estimateTokens(response);
      
      // Parse and validate response
      const analysisResult = this.parseBedrockResponse(response, request.customerId);
      
      const processingTime = Date.now() - startTime;
      
      // Record comprehensive analytics for successful analysis
      await this.recordAnalysisMetrics(request, processingTime, true, false, analysisResult.confidence);
      
      // Record detailed cost analytics
      await this.costAnalytics.recordBedrockCall({
        customerId: request.customerId,
        analysisType: request.analysisType,
        modelId: this.modelId,
        inputTokens,
        outputTokens,
        processingTimeMs: processingTime,
        success: true,
        usedFallback: false,
      });
      
      // Cache the successful result for future requests
      await this.cache.setCachedResult(request, analysisResult);
      
      console.log(`✅ AI analysis completed in ${processingTime}ms`);
      
      return {
        success: true,
        data: analysisResult,
        processingTime,
        cached: false,
      };
    } catch (error) {
      console.error('❌ Bedrock analysis failed:', error);
      
      success = false;
      usedFallback = true;
      
      // Return fallback analysis instead of complete failure
      const fallbackResult = this.generateFallbackAnalysis(request);
      const processingTime = Date.now() - startTime;
      
      // Record failed analysis metrics
      await this.recordAnalysisMetrics(request, processingTime, false, true, fallbackResult.confidence);
      
      // Record cost analytics for failed attempt (no tokens used since fallback)
      await this.costAnalytics.recordBedrockCall({
        customerId: request.customerId,
        analysisType: request.analysisType,
        modelId: this.modelId,
        inputTokens: 0, // No API call made
        outputTokens: 0,
        processingTimeMs: processingTime,
        success: false,
        usedFallback: true,
      });
      
      return {
        success: false,
        data: fallbackResult,
        error: this.sanitizeErrorMessage(error.message),
        processingTime,
      };
    }
  }

  private async invokeBedrockModel(prompt: string): Promise<string> {
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    };

    const command = new InvokeModelCommand({
      modelId: this.modelId,
      body: JSON.stringify(payload),
      contentType: 'application/json',
    });

    console.log('🚀 Invoking Bedrock model...');
    const response = await this.bedrock.send(command);
    
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    console.log('📊 Bedrock response received');
    
    return responseBody.content[0].text;
  }

  private parseBedrockResponse(response: string, customerId: string): AIAnalysisResult {
    try {
      // Extract JSON from response (Claude might wrap it in explanation text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Bedrock response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Build complete analysis result
      const analysisResult: AIAnalysisResult = {
        customerId,
        analysisDate: new Date().toISOString(),
        consumptionPatterns: parsed.consumptionPatterns || [],
        customerProfile: parsed.customerProfile || this.getDefaultCustomerProfile(customerId),
        recommendations: parsed.recommendations || [],
        confidence: this.calculateOverallConfidence(parsed),
        dataQuality: parsed.dataQuality || 'fair',
      };

      return analysisResult;
    } catch (error) {
      console.error('❌ Failed to parse Bedrock response:', error);
      console.error('Raw response:', response);
      
      // Return fallback result
      return {
        customerId,
        analysisDate: new Date().toISOString(),
        consumptionPatterns: [],
        customerProfile: this.getDefaultCustomerProfile(customerId),
        recommendations: [],
        confidence: 0,
        dataQuality: 'poor',
      };
    }
  }

  private calculateOverallConfidence(parsed: any): number {
    if (parsed.consumptionPatterns && parsed.consumptionPatterns.length > 0) {
      const avgConfidence = parsed.consumptionPatterns.reduce((sum: number, pattern: any) => 
        sum + (pattern.confidence || 0), 0) / parsed.consumptionPatterns.length;
      return avgConfidence;
    }
    return 0.5; // Default medium confidence
  }

  private getDefaultCustomerProfile(customerId: string): CustomerProfile {
    return {
      customerId,
      spendingPatterns: {
        averageOrderValue: 0,
        preferredCategories: [],
        shoppingFrequency: 'irregular',
        pricePreference: 'mid-range',
      },
      behavioralInsights: {
        plannedShopper: false,
        brandLoyal: false,
        seasonalShopper: false,
        bulkBuyer: false,
      },
      demographics: {
        estimatedAgeGroup: 'unknown',
        estimatedIncomeLevel: 'unknown',
        familySize: 1,
        lifestyle: [],
      },
    };
  }

  private buildAnalysisPrompt(request: BedrockAnalysisRequest): string {
    const { customerId, purchases, analysisType } = request;
    
    // Sort purchases by date (most recent first)
    const sortedPurchases = purchases.sort((a, b) => 
      new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    );

    const purchaseHistory = sortedPurchases.map(p => 
      `${p.purchaseDate}: ${p.productName} (${p.category}) - Qty: ${p.quantity}, Price: $${p.price}`
    ).join('\n');

    let systemPrompt = '';
    let userPrompt = '';

    switch (analysisType) {
      case 'consumption_prediction':
        systemPrompt = `You are an AI shopping pattern analyst. Analyze customer purchase history to predict when they will need to buy products again. Focus on:
1. Regular consumption patterns (e.g., "buys milk every 5-7 days")
2. Seasonal variations
3. Quantity patterns
4. Brand preferences

Return your analysis as a valid JSON object with this structure:
{
  "consumptionPatterns": [
    {
      "productId": "string",
      "productName": "string", 
      "category": "string",
      "averageDaysBetweenPurchases": number,
      "predictedNextPurchaseDate": "YYYY-MM-DD",
      "confidence": number (0-1),
      "seasonalVariation": boolean
    }
  ],
  "dataQuality": "poor|fair|good|excellent"
}`;

        userPrompt = `Analyze this customer's purchase history for consumption patterns:

Customer ID: ${customerId}
Purchase History (${purchases.length} purchases):
${purchaseHistory}

Focus on products purchased multiple times. Calculate average days between purchases and predict next purchase dates. Only include patterns with confidence > 0.6.`;
        break;

      case 'customer_profiling':
        systemPrompt = `You are an AI customer profiling expert. Analyze shopping behavior to create a detailed customer profile. Consider:
1. Spending patterns and preferences
2. Shopping frequency and timing
3. Brand loyalty and price sensitivity
4. Lifestyle indicators from product choices

Return analysis as valid JSON:
{
  "customerProfile": {
    "customerId": "${customerId}",
    "spendingPatterns": {
      "averageOrderValue": number,
      "preferredCategories": ["string"],
      "shoppingFrequency": "daily|weekly|monthly|irregular", 
      "pricePreference": "budget|mid-range|premium"
    },
    "behavioralInsights": {
      "plannedShopper": boolean,
      "brandLoyal": boolean,
      "seasonalShopper": boolean,
      "bulkBuyer": boolean
    },
    "demographics": {
      "estimatedAgeGroup": "string",
      "estimatedIncomeLevel": "string", 
      "familySize": number,
      "lifestyle": ["string"]
    }
  }
}`;

        userPrompt = `Create a detailed profile for this customer based on their shopping behavior:

Customer ID: ${customerId}
Purchase History:
${purchaseHistory}

Analyze spending patterns, brand preferences, product categories, and shopping timing to infer demographics and lifestyle.`;
        break;

      case 'recommendation_generation':
        systemPrompt = `You are an AI recommendation engine. Generate personalized product recommendations based on purchase history. Consider:
1. Consumption patterns and timing
2. Complementary products
3. Seasonal needs
4. Brand preferences

Return recommendations as valid JSON:
{
  "recommendations": [
    {
      "productId": "string",
      "productName": "string",
      "reason": "string",
      "urgency": "low|medium|high",
      "predictedPurchaseDate": "YYYY-MM-DD"
    }
  ]
}`;

        userPrompt = `Generate ${request.maxRecommendations || 5} personalized recommendations for this customer:

Customer ID: ${customerId}
Recent Purchase History:
${purchaseHistory}

Focus on items they likely need soon based on consumption patterns, complementary products, and seasonal timing.`;
        break;
    }

    return `Human: ${systemPrompt}

${userPrompt}`;
  }

  private isAIAnalysisEnabled(): boolean {
    return process.env.AI_ANALYSIS_ENABLED !== 'false';
  }

  private async invokeBedrockModelWithRetry(prompt: string, maxRetries: number): Promise<string> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🚀 Invoking Bedrock model (attempt ${attempt}/${maxRetries})...`);
        return await this.invokeBedrockModel(prompt);
      } catch (error) {
        lastError = error;
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        
        // Check if it's a retryable error
        if (!this.isRetryableError(error)) {
          throw error;
        }
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
          console.log(`⏳ Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError;
  }

  private isRetryableError(error: any): boolean {
    // Retry on network errors, throttling, and temporary service issues
    const retryableErrors = [
      'TimeoutError',
      'NetworkError',
      'ThrottlingException',
      'ServiceUnavailableException',
      'InternalServerException',
      'ModelTimeoutException'
    ];
    
    return retryableErrors.some(errorType => 
      error.name === errorType || 
      error.code === errorType || 
      error.message.includes(errorType)
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getFallbackResponse(request: BedrockAnalysisRequest, reason: string): BedrockAnalysisResponse {
    const fallbackResult = this.generateFallbackAnalysis(request);
    
    return {
      success: false,
      data: fallbackResult,
      error: reason,
      processingTime: 0,
    };
  }

  private generateFallbackAnalysis(request: BedrockAnalysisRequest): AIAnalysisResult {
    console.log('🔄 Generating fallback analysis using rule-based approach');
    
    const { customerId, purchases, analysisType } = request;
    const fallbackResult: AIAnalysisResult = {
      customerId,
      analysisDate: new Date().toISOString(),
      consumptionPatterns: [],
      customerProfile: this.getDefaultCustomerProfile(customerId),
      recommendations: [],
      confidence: 0.3, // Low confidence for fallback
      dataQuality: purchases.length > 10 ? 'fair' : 'poor',
    };

    // Generate basic consumption patterns using simple frequency analysis
    if (analysisType === 'consumption_prediction' || analysisType === 'recommendation_generation') {
      fallbackResult.consumptionPatterns = this.generateBasicConsumptionPatterns(purchases);
    }

    // Generate basic customer profile analysis
    if (analysisType === 'customer_profiling') {
      fallbackResult.customerProfile = this.generateBasicCustomerProfile(customerId, purchases);
    }

    // Generate basic recommendations
    if (analysisType === 'recommendation_generation') {
      fallbackResult.recommendations = this.generateBasicRecommendations(purchases);
    }

    return fallbackResult;
  }

  private generateBasicConsumptionPatterns(purchases: Purchase[]): ConsumptionPattern[] {
    const productFrequency = new Map<string, { 
      purchases: Purchase[], 
      totalQuantity: number, 
      avgDaysBetween: number 
    }>();
    
    // Group purchases by product
    purchases.forEach(purchase => {
      if (!productFrequency.has(purchase.productId)) {
        productFrequency.set(purchase.productId, { 
          purchases: [], 
          totalQuantity: 0, 
          avgDaysBetween: 0 
        });
      }
      const info = productFrequency.get(purchase.productId)!;
      info.purchases.push(purchase);
      info.totalQuantity += purchase.quantity;
    });

    const patterns: ConsumptionPattern[] = [];
    
    productFrequency.forEach((info, productId) => {
      if (info.purchases.length >= 2) {
        // Calculate average days between purchases
        const sortedPurchases = info.purchases.sort((a, b) => 
          new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()
        );
        
        let totalDays = 0;
        for (let i = 1; i < sortedPurchases.length; i++) {
          const daysDiff = (new Date(sortedPurchases[i].purchaseDate).getTime() - 
                           new Date(sortedPurchases[i-1].purchaseDate).getTime()) / (1000 * 60 * 60 * 24);
          totalDays += daysDiff;
        }
        
        const avgDaysBetween = totalDays / (sortedPurchases.length - 1);
        const lastPurchase = sortedPurchases[sortedPurchases.length - 1];
        const predictedDate = new Date(
          new Date(lastPurchase.purchaseDate).getTime() + avgDaysBetween * 24 * 60 * 60 * 1000
        );

        patterns.push({
          productId,
          productName: lastPurchase.productName,
          category: lastPurchase.category,
          averageDaysBetweenPurchases: Math.round(avgDaysBetween),
          predictedNextPurchaseDate: predictedDate.toISOString().split('T')[0],
          confidence: Math.min(0.7, info.purchases.length / 10), // Max 0.7 confidence for fallback
          seasonalVariation: false,
        });
      }
    });

    return patterns.slice(0, 10); // Limit to top 10 patterns
  }

  private generateBasicCustomerProfile(customerId: string, purchases: Purchase[]): CustomerProfile {
    const totalValue = purchases.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const avgOrderValue = purchases.length > 0 ? totalValue / purchases.length : 0;
    
    // Count categories
    const categoryCount = new Map<string, number>();
    purchases.forEach(p => {
      categoryCount.set(p.category, (categoryCount.get(p.category) || 0) + 1);
    });
    
    const preferredCategories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);

    return {
      customerId,
      spendingPatterns: {
        averageOrderValue: Math.round(avgOrderValue * 100) / 100,
        preferredCategories,
        shoppingFrequency: this.inferShoppingFrequency(purchases),
        pricePreference: avgOrderValue > 50 ? 'premium' : avgOrderValue > 25 ? 'mid-range' : 'budget',
      },
      behavioralInsights: {
        plannedShopper: purchases.length > 20,
        brandLoyal: false, // Cannot determine without brand data
        seasonalShopper: false,
        bulkBuyer: purchases.some(p => p.quantity > 3),
      },
      demographics: {
        estimatedAgeGroup: 'unknown',
        estimatedIncomeLevel: avgOrderValue > 40 ? 'medium-high' : 'medium',
        familySize: preferredCategories.includes('Family') ? 4 : 2,
        lifestyle: preferredCategories.includes('Organic') ? ['health-conscious'] : ['standard'],
      },
    };
  }

  private inferShoppingFrequency(purchases: Purchase[]): 'daily' | 'weekly' | 'monthly' | 'irregular' {
    if (purchases.length < 2) return 'irregular';
    
    const dates = purchases.map(p => new Date(p.purchaseDate).getTime()).sort();
    const intervals = [];
    
    for (let i = 1; i < dates.length; i++) {
      intervals.push((dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24));
    }
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    if (avgInterval <= 3) return 'daily';
    if (avgInterval <= 10) return 'weekly';
    if (avgInterval <= 35) return 'monthly';
    return 'irregular';
  }

  private generateBasicRecommendations(purchases: Purchase[]): any[] {
    // Simple recommendation: suggest frequently bought items that haven't been purchased recently
    const productLastPurchase = new Map<string, Date>();
    
    purchases.forEach(p => {
      const currentDate = productLastPurchase.get(p.productId);
      const purchaseDate = new Date(p.purchaseDate);
      
      if (!currentDate || purchaseDate > currentDate) {
        productLastPurchase.set(p.productId, purchaseDate);
      }
    });

    const now = new Date();
    const recommendations = [];
    
    for (const [productId, lastPurchase] of productLastPurchase.entries()) {
      const daysSinceLastPurchase = (now.getTime() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastPurchase > 7) { // Haven't bought in a week
        const purchase = purchases.find(p => p.productId === productId);
        if (purchase) {
          recommendations.push({
            productId,
            productName: purchase.productName,
            reason: `You typically buy this item regularly. Last purchased ${Math.round(daysSinceLastPurchase)} days ago.`,
            urgency: daysSinceLastPurchase > 14 ? 'high' : 'medium',
            predictedPurchaseDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          });
        }
      }
    }

    return recommendations.slice(0, 5);
  }

  private sanitizeErrorMessage(error: string): string {
    // Remove sensitive information from error messages
    return error
      .replace(/access[_\s]*key[_\s]*id/gi, '[ACCESS_KEY]')
      .replace(/secret[_\s]*access[_\s]*key/gi, '[SECRET_KEY]')
      .replace(/token/gi, '[TOKEN]')
      .replace(/arn:aws:[^:]*:[^:]*:[^:]*:[^\s]*/g, '[AWS_ARN]');
  }

  /**
   * Record analysis metrics for monitoring and alerting
   */
  private async recordAnalysisMetrics(
    request: BedrockAnalysisRequest, 
    processingTime: number, 
    success: boolean, 
    usedFallback: boolean, 
    confidence: number
  ): Promise<void> {
    try {
      await this.monitoring.recordAIAnalysisMetrics({
        analysisType: request.analysisType,
        processingTime,
        success,
        usedFallback,
        confidence,
        customerId: request.customerId,
      });
    } catch (error) {
      console.error('❌ Failed to record analysis metrics:', error);
      // Don't throw - monitoring should not break main functionality
    }
  }

  /**
   * Estimate token count for cost tracking (rough approximation)
   */
  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for English text
    // This is approximate - actual tokenization varies by model
    return Math.ceil(text.length / 4);
  }

  /**
   * Record customer engagement metrics for business intelligence
   */
  async recordCustomerEngagement(customerId: string, recommendationCount: number, accuracy?: number): Promise<void> {
    try {
      await this.monitoring.recordCustomerEngagement({
        customerId,
        recommendationCount,
        predictionAccuracy: accuracy,
      });
    } catch (error) {
      console.error('❌ Failed to record customer engagement metrics:', error);
    }
  }
}