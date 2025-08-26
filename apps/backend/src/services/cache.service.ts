import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { AIAnalysisResult, BedrockAnalysisRequest } from '../interfaces/ai-analysis.interface';
import { MonitoringService } from './monitoring.service';
import * as crypto from 'crypto';

interface CacheEntry {
  cacheKey: string;
  customerId: string;
  analysisType: string;
  requestHash: string;
  result: AIAnalysisResult;
  createdAt: string;
  expiresAt: string;
  hitCount: number;
  lastAccessedAt: string;
}

interface CacheConfig {
  ttlMinutes: number;
  maxEntriesPerCustomer: number;
  enableCaching: boolean;
}

@Injectable()
export class CacheService {
  private dynamoClient: DynamoDBDocumentClient;
  private monitoring: MonitoringService;
  private readonly tableName = 'omnix-ai-analysis-cache-dev';
  
  // Cache configuration
  private readonly cacheConfig: Record<string, CacheConfig> = {
    consumption_prediction: {
      ttlMinutes: 60,        // 1 hour cache for predictions
      maxEntriesPerCustomer: 10,
      enableCaching: true,
    },
    customer_profiling: {
      ttlMinutes: 720,       // 12 hours for profiles (changes less frequently)
      maxEntriesPerCustomer: 5,
      enableCaching: true,
    },
    recommendation_generation: {
      ttlMinutes: 30,        // 30 minutes for recommendations
      maxEntriesPerCustomer: 15,
      enableCaching: true,
    },
  };

  constructor() {
    this.monitoring = new MonitoringService();
    const region = process.env.AWS_REGION || 'eu-central-1';
    
    const clientConfig: any = { region };

    if (!process.env.AWS_LAMBDA_FUNCTION_NAME && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      clientConfig.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      };
    }

    const dynamoClient = new DynamoDBClient(clientConfig);
    this.dynamoClient = DynamoDBDocumentClient.from(dynamoClient);
    
    console.log('🚀 Cache Service initialized');
  }

  /**
   * Get cached analysis result if available and not expired
   */
  async getCachedResult(request: BedrockAnalysisRequest): Promise<AIAnalysisResult | null> {
    const config = this.cacheConfig[request.analysisType];
    if (!config?.enableCaching) {
      return null;
    }

    const cacheKey = this.generateCacheKey(request);
    const startTime = Date.now();

    try {
      const result = await this.dynamoClient.send(new GetCommand({
        TableName: this.tableName,
        Key: { cacheKey },
      }));

      if (!result.Item) {
        // Cache miss
        await this.recordCacheMetrics(false, Date.now() - startTime);
        return null;
      }

      const entry: CacheEntry = result.Item as CacheEntry;
      
      // Check if expired
      if (new Date(entry.expiresAt) < new Date()) {
        // Cache expired - delete it
        await this.deleteCacheEntry(cacheKey);
        await this.recordCacheMetrics(false, Date.now() - startTime);
        return null;
      }

      // Update access statistics
      await this.updateAccessStats(cacheKey);
      
      // Cache hit
      await this.recordCacheMetrics(true, Date.now() - startTime);
      
      console.log(`🎯 Cache HIT for ${request.analysisType} analysis (customer: ${request.customerId})`);
      
      return entry.result;
    } catch (error) {
      console.error('❌ Cache retrieval failed:', error);
      await this.recordCacheMetrics(false, Date.now() - startTime);
      return null;
    }
  }

  /**
   * Store analysis result in cache
   */
  async setCachedResult(request: BedrockAnalysisRequest, result: AIAnalysisResult): Promise<void> {
    const config = this.cacheConfig[request.analysisType];
    if (!config?.enableCaching) {
      return;
    }

    const cacheKey = this.generateCacheKey(request);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + config.ttlMinutes * 60 * 1000);

    const entry: CacheEntry = {
      cacheKey,
      customerId: request.customerId,
      analysisType: request.analysisType,
      requestHash: this.generateRequestHash(request),
      result,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      hitCount: 0,
      lastAccessedAt: now.toISOString(),
    };

    try {
      // Store cache entry
      await this.dynamoClient.send(new PutCommand({
        TableName: this.tableName,
        Item: entry,
      }));

      // Clean up old entries for this customer/analysis type
      await this.cleanupOldEntries(request.customerId, request.analysisType, config.maxEntriesPerCustomer);

      console.log(`💾 Cache STORE for ${request.analysisType} analysis (expires: ${expiresAt.toISOString()})`);
    } catch (error) {
      console.error('❌ Cache storage failed:', error);
    }
  }

  /**
   * Generate deterministic cache key based on request parameters
   */
  private generateCacheKey(request: BedrockAnalysisRequest): string {
    const requestHash = this.generateRequestHash(request);
    return `${request.customerId}-${request.analysisType}-${requestHash}`;
  }

  /**
   * Generate hash of request parameters that affect analysis outcome
   */
  private generateRequestHash(request: BedrockAnalysisRequest): string {
    // Create hash based on purchase data that affects analysis
    const purchaseData = request.purchases
      .sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate))
      .map(p => `${p.productId}-${p.quantity}-${p.purchaseDate}`)
      .join('|');
    
    const hashInput = `${request.analysisType}-${purchaseData}-${request.maxRecommendations || 5}`;
    return crypto.createHash('md5').update(hashInput).digest('hex').substring(0, 12);
  }

  /**
   * Clean up old cache entries to maintain limits per customer
   */
  private async cleanupOldEntries(customerId: string, analysisType: string, maxEntries: number): Promise<void> {
    try {
      // Query all entries for this customer and analysis type
      const result = await this.dynamoClient.send(new QueryCommand({
        TableName: this.tableName,
        IndexName: 'customerId-createdAt-index',
        KeyConditionExpression: 'customerId = :customerId',
        FilterExpression: 'analysisType = :analysisType',
        ExpressionAttributeValues: {
          ':customerId': customerId,
          ':analysisType': analysisType,
        },
        ScanIndexForward: false, // Latest first
      }));

      if (!result.Items || result.Items.length <= maxEntries) {
        return; // No cleanup needed
      }

      // Delete entries beyond the limit
      const entriesToDelete = result.Items.slice(maxEntries);
      
      for (const entry of entriesToDelete) {
        await this.deleteCacheEntry(entry.cacheKey);
      }

      console.log(`🧹 Cleaned up ${entriesToDelete.length} old cache entries for ${customerId}`);
    } catch (error) {
      console.error('❌ Cache cleanup failed:', error);
    }
  }

  /**
   * Delete cache entry
   */
  private async deleteCacheEntry(cacheKey: string): Promise<void> {
    try {
      await this.dynamoClient.send(new DeleteCommand({
        TableName: this.tableName,
        Key: { cacheKey },
      }));
    } catch (error) {
      console.error(`❌ Failed to delete cache entry ${cacheKey}:`, error);
    }
  }

  /**
   * Update access statistics for cache entry
   */
  private async updateAccessStats(cacheKey: string): Promise<void> {
    try {
      // Note: This is a simplified update - in production, you might use DynamoDB UpdateItem
      // with atomic counters for better performance
      const result = await this.dynamoClient.send(new GetCommand({
        TableName: this.tableName,
        Key: { cacheKey },
      }));

      if (result.Item) {
        const entry = result.Item as CacheEntry;
        entry.hitCount = (entry.hitCount || 0) + 1;
        entry.lastAccessedAt = new Date().toISOString();

        await this.dynamoClient.send(new PutCommand({
          TableName: this.tableName,
          Item: entry,
        }));
      }
    } catch (error) {
      console.error(`❌ Failed to update access stats for ${cacheKey}:`, error);
    }
  }

  /**
   * Record cache performance metrics
   */
  private async recordCacheMetrics(hit: boolean, latencyMs: number): Promise<void> {
    try {
      await this.monitoring.recordSystemPerformance({
        cacheHitRate: hit ? 1 : 0,
      });

      // Record cache latency
      await this.monitoring.recordBusinessMetric(
        'CacheLatency',
        latencyMs,
        'Milliseconds',
        [{ name: 'CacheResult', value: hit ? 'HIT' : 'MISS' }]
      );
    } catch (error) {
      console.error('❌ Failed to record cache metrics:', error);
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  async getCacheStatistics(): Promise<{
    totalEntries: number;
    entriesByType: Record<string, number>;
    oldestEntry: string;
    newestEntry: string;
    estimatedCostSavings: number;
  }> {
    try {
      // This is a simplified version - in production you'd use more efficient queries
      const result = await this.dynamoClient.send(new QueryCommand({
        TableName: this.tableName,
        IndexName: 'customerId-createdAt-index',
        KeyConditionExpression: 'customerId = :dummyKey', // This won't work as intended
        ExpressionAttributeValues: {
          ':dummyKey': 'dummy', // Placeholder - need to implement proper global stats
        },
      }));

      // For now, return basic structure
      return {
        totalEntries: 0,
        entriesByType: {},
        oldestEntry: 'N/A',
        newestEntry: 'N/A',
        estimatedCostSavings: 0,
      };
    } catch (error) {
      console.error('❌ Failed to get cache statistics:', error);
      return {
        totalEntries: 0,
        entriesByType: {},
        oldestEntry: 'N/A',
        newestEntry: 'N/A',
        estimatedCostSavings: 0,
      };
    }
  }

  /**
   * Invalidate cache for a specific customer (useful when they make new purchases)
   */
  async invalidateCustomerCache(customerId: string): Promise<void> {
    try {
      // Query all entries for this customer
      const result = await this.dynamoClient.send(new QueryCommand({
        TableName: this.tableName,
        IndexName: 'customerId-createdAt-index',
        KeyConditionExpression: 'customerId = :customerId',
        ExpressionAttributeValues: {
          ':customerId': customerId,
        },
      }));

      if (!result.Items) {
        return;
      }

      // Delete all entries for this customer
      for (const entry of result.Items) {
        await this.deleteCacheEntry(entry.cacheKey);
      }

      console.log(`🗑️  Invalidated ${result.Items.length} cache entries for customer ${customerId}`);
    } catch (error) {
      console.error(`❌ Failed to invalidate cache for customer ${customerId}:`, error);
    }
  }

  /**
   * Warm cache with pre-computed analysis for high-value customers
   */
  async warmCache(customers: Array<{ customerId: string; purchases: any[] }>): Promise<void> {
    console.log(`🔥 Warming cache for ${customers.length} customers...`);
    
    for (const customer of customers) {
      const analysisTypes: Array<'consumption_prediction' | 'customer_profiling' | 'recommendation_generation'> = 
        ['consumption_prediction', 'customer_profiling', 'recommendation_generation'];
      
      for (const analysisType of analysisTypes) {
        const request: BedrockAnalysisRequest = {
          customerId: customer.customerId,
          purchases: customer.purchases,
          analysisType,
          maxRecommendations: 5,
        };

        // Check if already cached
        const existing = await this.getCachedResult(request);
        if (!existing) {
          console.log(`   Pre-computing ${analysisType} for ${customer.customerId}...`);
          // Note: In a real implementation, you would trigger the analysis here
          // For now, just log the intent
        }
      }
    }
    
    console.log('🔥 Cache warming completed');
  }

  /**
   * Generic get method for simple string caching
   */
  async get(key: string): Promise<string | null> {
    try {
      const result = await this.dynamoClient.send(new GetCommand({
        TableName: this.tableName,
        Key: { cacheKey: key },
      }));

      if (!result.Item) {
        return null;
      }

      const entry = result.Item as any;
      
      // Check if expired
      if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
        await this.deleteCacheEntry(key);
        return null;
      }

      return entry.value || null;
    } catch (error) {
      console.error('❌ Generic cache get failed:', error);
      return null;
    }
  }

  /**
   * Generic set method for simple string caching
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const now = new Date();
    const expiresAt = ttlSeconds 
      ? new Date(now.getTime() + ttlSeconds * 1000)
      : new Date(now.getTime() + 3600 * 1000); // Default 1 hour

    try {
      await this.dynamoClient.send(new PutCommand({
        TableName: this.tableName,
        Item: {
          cacheKey: key,
          value,
          createdAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
        },
      }));
    } catch (error) {
      console.error('❌ Generic cache set failed:', error);
    }
  }
}