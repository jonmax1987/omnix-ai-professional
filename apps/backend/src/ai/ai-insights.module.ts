import { Module } from '@nestjs/common';
import { AIInsightsController } from './ai-insights.controller';
import { EnhancedBedrockService } from '../services/enhanced-bedrock.service';
import { RealtimeAnalyticsService } from '../services/realtime-analytics.service';
import { CustomerSegmentationService } from '../services/customer-segmentation.service';
import { RecommendationsModule } from '../recommendations/recommendations.module';
import { CacheService } from '../services/cache.service';
import { DynamoDBService } from '../services/dynamodb.service';
import { WebSocketModule } from '../websocket/websocket.module';
import { BedrockAnalysisService } from '../services/bedrock.service';
import { ABTestingService } from '../services/ab-testing.service';
import { MonitoringService } from '../services/monitoring.service';
import { CostAnalyticsService } from '../services/cost-analytics.service';

@Module({
  imports: [
    RecommendationsModule,
    WebSocketModule,
  ],
  controllers: [AIInsightsController],
  providers: [
    // Core services for AI insights
    BedrockAnalysisService,
    ABTestingService,
    MonitoringService,
    CostAnalyticsService,
    CacheService,
    DynamoDBService,
    
    // Enhanced AI services
    EnhancedBedrockService,
    RealtimeAnalyticsService,
    CustomerSegmentationService,
  ],
  exports: [
    EnhancedBedrockService,
    RealtimeAnalyticsService,
    CustomerSegmentationService,
  ],
})
export class AIInsightsModule {}