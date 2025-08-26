import { Module } from '@nestjs/common';
import { StreamingAnalyticsController } from '../controllers/streaming-analytics.controller';
import { KinesisStreamingService } from '../services/kinesis-streaming.service';
import { RealtimeAnalyticsService } from '../services/realtime-analytics.service';
import { CustomerSegmentationService } from '../services/customer-segmentation.service';
import { EnhancedBedrockService } from '../services/enhanced-bedrock.service';
import { BedrockAnalysisService } from '../services/bedrock.service';
import { ABTestingService } from '../services/ab-testing.service';
import { MonitoringService } from '../services/monitoring.service';
import { CostAnalyticsService } from '../services/cost-analytics.service';
import { CacheService } from '../services/cache.service';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [WebSocketModule],
  controllers: [StreamingAnalyticsController],
  providers: [
    KinesisStreamingService,
    RealtimeAnalyticsService,
    CustomerSegmentationService,
    BedrockAnalysisService,
    ABTestingService,
    MonitoringService,
    CostAnalyticsService,
    EnhancedBedrockService,
    CacheService
  ],
  exports: [
    KinesisStreamingService,
    RealtimeAnalyticsService
  ]
})
export class StreamingModule {}