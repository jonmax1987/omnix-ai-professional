import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { AIAnalysisService } from './ai-analysis.service';
import { DynamoDBService } from '../services/dynamodb.service';
import { BedrockAnalysisService } from '../services/bedrock.service';
import { ABTestingService } from '../services/ab-testing.service';
import { EnhancedBedrockService } from '../services/enhanced-bedrock.service';
import { ABTestingController } from '../controllers/ab-testing.controller';
import { MonitoringService } from '../services/monitoring.service';
import { CostAnalyticsService } from '../services/cost-analytics.service';
import { BatchProcessingService } from '../services/batch-processing.service';
import { CustomerSegmentationService } from '../services/customer-segmentation.service';
import { CacheService } from '../services/cache.service';

@Module({
  imports: [],
  controllers: [CustomersController, ABTestingController],
  providers: [
    CustomersService, 
    AIAnalysisService, 
    BedrockAnalysisService,
    ABTestingService,
    EnhancedBedrockService,
    DynamoDBService,
    MonitoringService,
    CostAnalyticsService,
    BatchProcessingService,
    CustomerSegmentationService,
    CacheService
  ],
  exports: [CustomersService, AIAnalysisService, EnhancedBedrockService],
})
export class CustomersModule {}