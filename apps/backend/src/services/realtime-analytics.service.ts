import { Injectable, Logger } from '@nestjs/common';
import { 
  PurchaseEvent, 
  CustomerSegmentUpdateEvent, 
  ConsumptionPredictionEvent,
  RealtimeInsight,
  StreamProcessingResult
} from '../interfaces/streaming-analytics.interface';
import { CustomerSegmentationService } from './customer-segmentation.service';
import { EnhancedBedrockService } from './enhanced-bedrock.service';
import { CacheService } from './cache.service';
import { WebSocketService } from '../websocket/websocket.service';

@Injectable()
export class RealtimeAnalyticsService {
  private readonly logger = new Logger(RealtimeAnalyticsService.name);
  private processingBuffer: Map<string, any[]> = new Map();
  private readonly bufferFlushInterval = 5000; // 5 seconds
  private readonly maxBufferSize = 50;

  constructor(
    private customerSegmentationService: CustomerSegmentationService,
    private enhancedBedrockService: EnhancedBedrockService,
    private cacheService: CacheService,
    private websocketService: WebSocketService
  ) {
    // Start buffer processing timer
    setInterval(() => this.flushProcessingBuffers(), this.bufferFlushInterval);
  }

  async processPurchaseEvent(event: PurchaseEvent): Promise<RealtimeInsight[]> {
    const insights: RealtimeInsight[] = [];
    const startTime = Date.now();

    try {
      // Add to processing buffer for batch analysis
      this.addToBuffer(event.customerId, event);

      // Immediate insights
      const consumptionInsight = await this.generateConsumptionInsight(event);
      if (consumptionInsight) insights.push(consumptionInsight);

      const behaviorInsight = await this.detectBehaviorAnomaly(event);
      if (behaviorInsight) insights.push(behaviorInsight);

      // Check if segment reassignment is needed
      const segmentInsight = await this.checkSegmentReassignment(event);
      if (segmentInsight) insights.push(segmentInsight);

      // Send real-time notifications for high-priority insights
      for (const insight of insights.filter(i => i.priority === 'high' || i.priority === 'critical')) {
        await this.sendRealtimeNotification(insight);
      }

      this.logger.debug(`Processed purchase event for customer ${event.customerId} in ${Date.now() - startTime}ms`);
      return insights;
    } catch (error) {
      this.logger.error(`Failed to process purchase event: ${error.message}`);
      return insights;
    }
  }

  async processSegmentUpdateEvent(event: CustomerSegmentUpdateEvent): Promise<RealtimeInsight[]> {
    const insights: RealtimeInsight[] = [];

    try {
      const insight: RealtimeInsight = {
        customerId: event.customerId,
        insightType: 'segment_migration',
        insight: `Customer migrated from ${event.previousSegment || 'unknown'} to ${event.newSegment} (confidence: ${Math.round(event.confidence * 100)}%)`,
        actionRequired: this.isHighValueSegmentChange(event.previousSegment, event.newSegment),
        priority: this.getSegmentChangePriority(event.previousSegment, event.newSegment),
        timestamp: new Date().toISOString(),
        data: {
          previousSegment: event.previousSegment,
          newSegment: event.newSegment,
          confidence: event.confidence,
          reasonCodes: event.reasonCodes,
          modelVersion: event.modelVersion
        }
      };

      insights.push(insight);

      // Update recommendations based on new segment
      await this.updateSegmentBasedRecommendations(event.customerId, event.newSegment);

      // Send notification for significant segment changes
      if (insight.priority === 'high' || insight.priority === 'critical') {
        await this.sendRealtimeNotification(insight);
      }

      return insights;
    } catch (error) {
      this.logger.error(`Failed to process segment update event: ${error.message}`);
      return insights;
    }
  }

  async processConsumptionPredictionEvent(event: ConsumptionPredictionEvent): Promise<RealtimeInsight[]> {
    const insights: RealtimeInsight[] = [];

    try {
      if (event.alertTriggered && event.confidence > 0.7) {
        const insight: RealtimeInsight = {
          customerId: event.customerId,
          insightType: 'consumption_prediction',
          insight: `High confidence prediction: Customer likely to purchase ${event.productId} on ${event.predictedConsumptionDate}`,
          actionRequired: true,
          priority: event.confidence > 0.9 ? 'high' : 'medium',
          timestamp: new Date().toISOString(),
          data: {
            productId: event.productId,
            predictedDate: event.predictedConsumptionDate,
            confidence: event.confidence,
            predictionType: event.predictionType,
            factors: event.factors
          }
        };

        insights.push(insight);

        // Cache prediction for quick access
        await this.cacheService.set(
          `prediction:${event.customerId}:${event.productId}`,
          JSON.stringify(event),
          60 * 60 * 24 // 24 hours TTL
        );

        // Send notification for high-confidence predictions
        if (insight.priority === 'high') {
          await this.sendRealtimeNotification(insight);
        }
      }

      return insights;
    } catch (error) {
      this.logger.error(`Failed to process consumption prediction event: ${error.message}`);
      return insights;
    }
  }

  private async generateConsumptionInsight(event: PurchaseEvent): Promise<RealtimeInsight | null> {
    try {
      // Get historical purchase frequency for this product
      const cacheKey = `frequency:${event.customerId}:${event.productId}`;
      const historicalFrequencyStr = await this.cacheService.get(cacheKey);

      if (historicalFrequencyStr) {
        const historicalFrequency = JSON.parse(historicalFrequencyStr);
        const daysSinceLast = this.calculateDaysSinceLastPurchase(event);
        const expectedFrequency = historicalFrequency.averageDaysBetweenPurchases;

        if (daysSinceLast < expectedFrequency * 0.7) {
          return {
            customerId: event.customerId,
            insightType: 'behavior_anomaly',
            insight: `Customer purchased ${event.productName} ${Math.round((expectedFrequency - daysSinceLast) / expectedFrequency * 100)}% earlier than usual pattern`,
            actionRequired: true,
            priority: 'medium',
            timestamp: new Date().toISOString(),
            data: {
              productId: event.productId,
              expectedFrequency,
              actualDays: daysSinceLast,
              deviation: expectedFrequency - daysSinceLast
            }
          };
        }
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to generate consumption insight: ${error.message}`);
      return null;
    }
  }

  private async detectBehaviorAnomaly(event: PurchaseEvent): Promise<RealtimeInsight | null> {
    try {
      // Check for unusual spending patterns
      const recentSpendingStr = await this.cacheService.get(`spending:${event.customerId}:recent`);
      
      if (recentSpendingStr) {
        const recentSpending = JSON.parse(recentSpendingStr);
        const averageSpending = recentSpending.averageAmount;
        const spendingDeviation = Math.abs(event.totalAmount - averageSpending) / averageSpending;

        if (spendingDeviation > 0.5) { // 50% deviation from average
          return {
            customerId: event.customerId,
            insightType: 'behavior_anomaly',
            insight: `Unusual spending detected: ${spendingDeviation > 0 ? 'Significantly higher' : 'Lower'} than average (${Math.round(spendingDeviation * 100)}% deviation)`,
            actionRequired: spendingDeviation > 1.0,
            priority: spendingDeviation > 1.0 ? 'high' : 'medium',
            timestamp: new Date().toISOString(),
            data: {
              currentAmount: event.totalAmount,
              averageAmount: averageSpending,
              deviation: spendingDeviation,
              productCategory: event.productCategory
            }
          };
        }
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to detect behavior anomaly: ${error.message}`);
      return null;
    }
  }

  private async checkSegmentReassignment(event: PurchaseEvent): Promise<RealtimeInsight | null> {
    try {
      // Get current segment from cache
      const currentSegmentStr = await this.cacheService.get(`segment:${event.customerId}`);
      
      if (!currentSegmentStr) return null;

      const currentSegment = JSON.parse(currentSegmentStr);

      // Simple rule-based check for segment reassignment triggers
      const triggers = [];
      
      // High-value purchase trigger
      if (event.totalAmount > 100) {
        triggers.push('high_value_purchase');
      }

      // Frequent purchase trigger (would need purchase frequency data)
      // Category expansion trigger (would need category history)

      if (triggers.length > 0) {
        return {
          customerId: event.customerId,
          insightType: 'recommendation_update',
          insight: `Purchase triggers detected for potential segment reassignment: ${triggers.join(', ')}`,
          actionRequired: true,
          priority: 'low',
          timestamp: new Date().toISOString(),
          data: {
            currentSegment: currentSegment.segment,
            triggers,
            purchaseAmount: event.totalAmount,
            productCategory: event.productCategory
          }
        };
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to check segment reassignment: ${error.message}`);
      return null;
    }
  }

  private async updateSegmentBasedRecommendations(customerId: string, newSegment: string): Promise<void> {
    try {
      // Cache new segment for quick access
      await this.cacheService.set(
        `segment:${customerId}`,
        JSON.stringify({ segment: newSegment, updatedAt: new Date().toISOString() }),
        60 * 60 * 24 * 7 // 7 days TTL
      );

      this.logger.debug(`Updated recommendations cache for customer ${customerId} with new segment ${newSegment}`);
    } catch (error) {
      this.logger.error(`Failed to update segment-based recommendations: ${error.message}`);
    }
  }

  private async sendRealtimeNotification(insight: RealtimeInsight): Promise<void> {
    try {
      // Send WebSocket notification to customer dashboard
      await this.websocketService.sendToUser(insight.customerId, {
        channel: 'insights',
        type: 'insight',
        payload: insight,
        timestamp: new Date().toISOString()
      });
      
      this.logger.debug(`Sent real-time notification for customer ${insight.customerId}`);
    } catch (error) {
      this.logger.error(`Failed to send real-time notification: ${error.message}`);
    }
  }

  private addToBuffer(customerId: string, event: any): void {
    if (!this.processingBuffer.has(customerId)) {
      this.processingBuffer.set(customerId, []);
    }

    const customerBuffer = this.processingBuffer.get(customerId);
    customerBuffer.push(event);

    // Flush if buffer is full
    if (customerBuffer.length >= this.maxBufferSize) {
      this.flushCustomerBuffer(customerId);
    }
  }

  private async flushProcessingBuffers(): Promise<void> {
    for (const customerId of this.processingBuffer.keys()) {
      await this.flushCustomerBuffer(customerId);
    }
  }

  private async flushCustomerBuffer(customerId: string): Promise<void> {
    const buffer = this.processingBuffer.get(customerId);
    if (!buffer || buffer.length === 0) return;

    try {
      // Process buffered events for batch insights
      await this.processBatchInsights(customerId, buffer);
      
      // Clear buffer
      this.processingBuffer.set(customerId, []);
      
      this.logger.debug(`Flushed buffer for customer ${customerId} with ${buffer.length} events`);
    } catch (error) {
      this.logger.error(`Failed to flush buffer for customer ${customerId}: ${error.message}`);
    }
  }

  private async processBatchInsights(customerId: string, events: any[]): Promise<void> {
    try {
      // Analyze purchase patterns across events
      const purchaseEvents = events.filter(e => e.eventType === 'purchase' || e.totalAmount);
      
      if (purchaseEvents.length >= 3) {
        // For now, just log the batch processing - would integrate with enhanced bedrock service
        this.logger.debug(`Processing batch insights for customer ${customerId} with ${purchaseEvents.length} events`);

        // Cache batch processing flag
        await this.cacheService.set(
          `batch_insights:${customerId}`,
          JSON.stringify({ 
            eventCount: purchaseEvents.length, 
            processedAt: new Date().toISOString() 
          }),
          60 * 60 * 2 // 2 hours TTL
        );
      }
    } catch (error) {
      this.logger.error(`Failed to process batch insights: ${error.message}`);
    }
  }

  private calculateDaysSinceLastPurchase(event: PurchaseEvent): number {
    // This would typically fetch from purchase history
    // For now, return a placeholder
    return 7; // 7 days placeholder
  }

  private isHighValueSegmentChange(previousSegment: string | null, newSegment: string): boolean {
    const highValueSegments = ['Champions', 'Loyal Customers', 'Potential Loyalists'];
    const atRiskSegments = ['At Risk', 'Cannot Lose Them', 'Hibernating'];

    // High priority if moving to/from high-value segments
    return (
      (highValueSegments.includes(newSegment) && !highValueSegments.includes(previousSegment || '')) ||
      (atRiskSegments.includes(newSegment) && highValueSegments.includes(previousSegment || '')) ||
      (highValueSegments.includes(previousSegment || '') && atRiskSegments.includes(newSegment))
    );
  }

  private getSegmentChangePriority(previousSegment: string | null, newSegment: string): 'low' | 'medium' | 'high' | 'critical' {
    if (this.isHighValueSegmentChange(previousSegment, newSegment)) {
      // Critical if customer is moving to at-risk from high-value
      if (previousSegment && ['Champions', 'Loyal Customers'].includes(previousSegment) && 
          ['At Risk', 'Cannot Lose Them'].includes(newSegment)) {
        return 'critical';
      }
      return 'high';
    }
    return 'medium';
  }
}