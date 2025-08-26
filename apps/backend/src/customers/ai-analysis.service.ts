import { Injectable, NotFoundException } from '@nestjs/common';
import { BedrockAnalysisService } from '../services/bedrock.service';
import { CustomersService } from './customers.service';
import { DynamoDBService } from '../services/dynamodb.service';
import {
  AIAnalysisResult,
  BedrockAnalysisRequest,
  Purchase,
  ConsumptionPattern,
} from '../interfaces/ai-analysis.interface';
import { PurchaseHistoryDto } from '../common/dto/customer.dto';

@Injectable()
export class AIAnalysisService {
  private readonly analysisResultsTable = 'ai-analysis-results';

  constructor(
    private readonly bedrockService: BedrockAnalysisService,
    private readonly customersService: CustomersService,
    private readonly dynamoDBService: DynamoDBService,
  ) {}

  async analyzeCustomerConsumption(customerId: string): Promise<AIAnalysisResult> {
    console.log(`🔍 Starting consumption analysis for customer ${customerId}`);

    // Get customer purchase history
    const purchases = await this.customersService.getCustomerPurchases(customerId, 20);
    
    if (purchases.length === 0) {
      throw new NotFoundException(`No purchase history found for customer ${customerId}`);
    }

    // Convert to AI analysis format
    const purchaseData = await this.convertPurchasesToAnalysisFormat(purchases);

    // Perform AI analysis
    const analysisRequest: BedrockAnalysisRequest = {
      customerId,
      purchases: purchaseData,
      analysisType: 'consumption_prediction',
    };

    const response = await this.bedrockService.analyzeCustomer(analysisRequest);
    
    if (!response.success) {
      throw new Error(`AI analysis failed: ${response.error}`);
    }

    // Cache the results
    await this.cacheAnalysisResults(response.data);

    return response.data;
  }

  async analyzeCustomerProfile(customerId: string): Promise<AIAnalysisResult> {
    console.log(`👤 Starting profile analysis for customer ${customerId}`);

    const purchases = await this.customersService.getCustomerPurchases(customerId, 50);
    
    if (purchases.length === 0) {
      throw new NotFoundException(`No purchase history found for customer ${customerId}`);
    }

    const purchaseData = await this.convertPurchasesToAnalysisFormat(purchases);

    const analysisRequest: BedrockAnalysisRequest = {
      customerId,
      purchases: purchaseData,
      analysisType: 'customer_profiling',
    };

    const response = await this.bedrockService.analyzeCustomer(analysisRequest);
    
    if (!response.success) {
      throw new Error(`AI profile analysis failed: ${response.error}`);
    }

    await this.cacheAnalysisResults(response.data);

    return response.data;
  }

  async generateRecommendations(customerId: string, maxRecommendations: number = 5): Promise<AIAnalysisResult> {
    console.log(`💡 Generating AI recommendations for customer ${customerId}`);

    const purchases = await this.customersService.getCustomerPurchases(customerId, 30);
    
    if (purchases.length === 0) {
      throw new NotFoundException(`No purchase history found for customer ${customerId}`);
    }

    const purchaseData = await this.convertPurchasesToAnalysisFormat(purchases);

    const analysisRequest: BedrockAnalysisRequest = {
      customerId,
      purchases: purchaseData,
      analysisType: 'recommendation_generation',
      maxRecommendations,
    };

    const response = await this.bedrockService.analyzeCustomer(analysisRequest);
    
    if (!response.success) {
      throw new Error(`AI recommendation generation failed: ${response.error}`);
    }

    await this.cacheAnalysisResults(response.data);

    return response.data;
  }

  async getCustomerAnalysisHistory(customerId: string, limit: number = 10): Promise<AIAnalysisResult[]> {
    const results = await this.dynamoDBService.query(
      this.analysisResultsTable,
      'customerId-analysisDate-index',
      'customerId = :customerId',
      { ':customerId': customerId },
    );

    return (results || []).slice(0, limit) as AIAnalysisResult[];
  }

  async predictNextPurchaseDate(customerId: string, productId: string): Promise<{
    predictedDate: string;
    confidence: number;
    averageDaysBetween: number;
  }> {
    // Get recent analysis or perform new one
    const analysis = await this.getOrCreateAnalysis(customerId);
    
    const pattern = analysis.consumptionPatterns.find(p => p.productId === productId);
    
    if (!pattern) {
      return {
        predictedDate: '',
        confidence: 0,
        averageDaysBetween: 0,
      };
    }

    return {
      predictedDate: pattern.predictedNextPurchaseDate,
      confidence: pattern.confidence,
      averageDaysBetween: pattern.averageDaysBetweenPurchases,
    };
  }

  async getReplenishmentAlerts(customerId: string): Promise<{
    urgent: ConsumptionPattern[];
    upcoming: ConsumptionPattern[];
  }> {
    const analysis = await this.getOrCreateAnalysis(customerId);
    const today = new Date();
    
    const urgent: ConsumptionPattern[] = [];
    const upcoming: ConsumptionPattern[] = [];

    analysis.consumptionPatterns.forEach(pattern => {
      const predictedDate = new Date(pattern.predictedNextPurchaseDate);
      const daysUntilNeeded = Math.ceil((predictedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilNeeded <= 1 && pattern.confidence > 0.7) {
        urgent.push(pattern);
      } else if (daysUntilNeeded <= 7 && pattern.confidence > 0.6) {
        upcoming.push(pattern);
      }
    });

    return { urgent, upcoming };
  }

  private async getOrCreateAnalysis(customerId: string): Promise<AIAnalysisResult> {
    // Check for recent analysis (within last 24 hours)
    const recentAnalysis = await this.getRecentAnalysis(customerId);
    
    if (recentAnalysis) {
      return recentAnalysis;
    }

    // Create new analysis
    return await this.analyzeCustomerConsumption(customerId);
  }

  private async getRecentAnalysis(customerId: string): Promise<AIAnalysisResult | null> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const results = await this.dynamoDBService.query(
      this.analysisResultsTable,
      'customerId-analysisDate-index',
      'customerId = :customerId AND analysisDate > :date',
      { 
        ':customerId': customerId,
        ':date': oneDayAgo,
      },
    );

    return results && results.length > 0 ? results[0] as AIAnalysisResult : null;
  }

  private async convertPurchasesToAnalysisFormat(purchases: PurchaseHistoryDto[]): Promise<Purchase[]> {
    // For now, we'll need to get product details from products service
    // This is a simplified version that uses available data
    return purchases.map(p => ({
      id: p.id,
      customerId: p.customerId,
      productId: p.productId,
      productName: `Product-${p.productId}`, // This should come from products service
      category: 'General', // This should come from products service
      quantity: p.quantity,
      price: p.totalPrice,
      purchaseDate: p.purchaseDate,
    }));
  }

  private async cacheAnalysisResults(analysis: AIAnalysisResult): Promise<void> {
    const cacheKey = `${analysis.customerId}-${Date.now()}`;
    
    const cacheData = {
      ...analysis,
      id: cacheKey,
      ttl: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days TTL
    };

    try {
      await this.dynamoDBService.put(this.analysisResultsTable, cacheData);
      console.log(`✅ Cached analysis results for customer ${analysis.customerId}`);
    } catch (error) {
      console.error('❌ Failed to cache analysis results:', error);
      // Don't throw - caching failure shouldn't break the analysis
    }
  }
}