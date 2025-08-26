import { Controller, Post, Get, Body, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { KinesisStreamingService } from '../services/kinesis-streaming.service';
import { RealtimeAnalyticsService } from '../services/realtime-analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { 
  PurchaseEvent, 
  CustomerSegmentUpdateEvent, 
  ConsumptionPredictionEvent,
  RealtimeInsight,
  KinesisStreamMetrics 
} from '../interfaces/streaming-analytics.interface';

@ApiTags('Streaming Analytics')
@Controller('v1/streaming')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StreamingAnalyticsController {
  private readonly logger = new Logger(StreamingAnalyticsController.name);

  constructor(
    private kinesisStreamingService: KinesisStreamingService,
    private realtimeAnalyticsService: RealtimeAnalyticsService
  ) {}

  @Post('events/purchase')
  @ApiOperation({ summary: 'Publish a purchase event to Kinesis stream' })
  @ApiResponse({ status: 201, description: 'Purchase event published successfully' })
  async publishPurchaseEvent(@Body() event: PurchaseEvent): Promise<{ message: string; insights: RealtimeInsight[] }> {
    try {
      // Publish to Kinesis stream
      await this.kinesisStreamingService.publishPurchaseEvent(event);
      
      // Process for immediate insights
      const insights = await this.realtimeAnalyticsService.processPurchaseEvent(event);
      
      this.logger.log(`Published purchase event for customer ${event.customerId}`);
      
      return {
        message: 'Purchase event published successfully',
        insights
      };
    } catch (error) {
      this.logger.error(`Failed to publish purchase event: ${error.message}`);
      throw error;
    }
  }

  @Post('events/segment-update')
  @ApiOperation({ summary: 'Publish a customer segment update event' })
  @ApiResponse({ status: 201, description: 'Segment update event published successfully' })
  async publishSegmentUpdateEvent(@Body() event: CustomerSegmentUpdateEvent): Promise<{ message: string; insights: RealtimeInsight[] }> {
    try {
      await this.kinesisStreamingService.publishSegmentUpdateEvent(event);
      const insights = await this.realtimeAnalyticsService.processSegmentUpdateEvent(event);
      
      this.logger.log(`Published segment update event for customer ${event.customerId}`);
      
      return {
        message: 'Segment update event published successfully',
        insights
      };
    } catch (error) {
      this.logger.error(`Failed to publish segment update event: ${error.message}`);
      throw error;
    }
  }

  @Post('events/consumption-prediction')
  @ApiOperation({ summary: 'Publish a consumption prediction event' })
  @ApiResponse({ status: 201, description: 'Consumption prediction event published successfully' })
  async publishConsumptionPredictionEvent(@Body() event: ConsumptionPredictionEvent): Promise<{ message: string; insights: RealtimeInsight[] }> {
    try {
      await this.kinesisStreamingService.publishConsumptionPredictionEvent(event);
      const insights = await this.realtimeAnalyticsService.processConsumptionPredictionEvent(event);
      
      this.logger.log(`Published consumption prediction event for customer ${event.customerId}`);
      
      return {
        message: 'Consumption prediction event published successfully',
        insights
      };
    } catch (error) {
      this.logger.error(`Failed to publish consumption prediction event: ${error.message}`);
      throw error;
    }
  }

  @Post('events/batch')
  @ApiOperation({ summary: 'Publish multiple events in batch' })
  @ApiResponse({ status: 201, description: 'Batch events published successfully' })
  async publishBatchEvents(
    @Body() events: Array<PurchaseEvent | CustomerSegmentUpdateEvent | ConsumptionPredictionEvent>
  ): Promise<{ message: string; publishedCount: number }> {
    try {
      await this.kinesisStreamingService.publishBatchEvents(events);
      
      this.logger.log(`Published batch of ${events.length} events`);
      
      return {
        message: 'Batch events published successfully',
        publishedCount: events.length
      };
    } catch (error) {
      this.logger.error(`Failed to publish batch events: ${error.message}`);
      throw error;
    }
  }

  @Get('stream/status')
  @ApiOperation({ summary: 'Get Kinesis stream status' })
  @ApiResponse({ status: 200, description: 'Stream status retrieved successfully' })
  async getStreamStatus(): Promise<{ streamName: string; status: string; config: any }> {
    try {
      const status = await this.kinesisStreamingService.getStreamStatus();
      const config = this.kinesisStreamingService.getConfig();
      
      return {
        streamName: config.kinesisStreamName,
        status,
        config: {
          region: config.region,
          shardCount: config.shardCount,
          retentionPeriodHours: config.retentionPeriodHours,
          batchSize: config.batchSize
        }
      };
    } catch (error) {
      this.logger.error(`Failed to get stream status: ${error.message}`);
      throw error;
    }
  }

  @Get('stream/metrics')
  @ApiOperation({ summary: 'Get Kinesis stream metrics' })
  @ApiResponse({ status: 200, description: 'Stream metrics retrieved successfully' })
  async getStreamMetrics(): Promise<KinesisStreamMetrics> {
    try {
      return await this.kinesisStreamingService.getStreamMetrics();
    } catch (error) {
      this.logger.error(`Failed to get stream metrics: ${error.message}`);
      throw error;
    }
  }

  @Get('streams')
  @ApiOperation({ summary: 'List all Kinesis streams' })
  @ApiResponse({ status: 200, description: 'Streams listed successfully' })
  async listStreams(): Promise<{ streams: string[] }> {
    try {
      const streams = await this.kinesisStreamingService.listStreams();
      return { streams };
    } catch (error) {
      this.logger.error(`Failed to list streams: ${error.message}`);
      throw error;
    }
  }

  @Post('stream/create')
  @ApiOperation({ summary: 'Create Kinesis stream if it does not exist' })
  @ApiResponse({ status: 201, description: 'Stream created or already exists' })
  async createStream(): Promise<{ message: string; streamName: string }> {
    try {
      await this.kinesisStreamingService.createStream();
      const config = this.kinesisStreamingService.getConfig();
      
      return {
        message: 'Stream created successfully or already exists',
        streamName: config.kinesisStreamName
      };
    } catch (error) {
      this.logger.error(`Failed to create stream: ${error.message}`);
      throw error;
    }
  }

  @Get('insights/:customerId')
  @ApiOperation({ summary: 'Get recent real-time insights for a customer' })
  @ApiResponse({ status: 200, description: 'Customer insights retrieved successfully' })
  async getCustomerInsights(
    @Param('customerId') customerId: string,
    @Query('hours') hours: string = '24'
  ): Promise<{ customerId: string; insights: RealtimeInsight[]; timeRange: string }> {
    try {
      // In a real implementation, this would fetch from a database or cache
      // For now, return a placeholder response
      const timeRange = `${hours} hours`;
      
      this.logger.log(`Retrieved insights for customer ${customerId} for ${timeRange}`);
      
      return {
        customerId,
        insights: [], // Would be populated from storage
        timeRange
      };
    } catch (error) {
      this.logger.error(`Failed to get customer insights: ${error.message}`);
      throw error;
    }
  }

  @Get('insights/system/overview')
  @ApiOperation({ summary: 'Get system-wide real-time insights overview' })
  @ApiResponse({ status: 200, description: 'System insights overview retrieved successfully' })
  async getSystemInsightsOverview(): Promise<{
    totalInsights: number;
    insightsByType: Record<string, number>;
    insightsByPriority: Record<string, number>;
    processingMetrics: any;
  }> {
    try {
      // In a real implementation, this would aggregate from multiple sources
      return {
        totalInsights: 0,
        insightsByType: {
          'segment_migration': 0,
          'consumption_prediction': 0,
          'behavior_anomaly': 0,
          'recommendation_update': 0
        },
        insightsByPriority: {
          'low': 0,
          'medium': 0,
          'high': 0,
          'critical': 0
        },
        processingMetrics: {
          averageLatencyMs: 0,
          successRate: 100,
          errorRate: 0
        }
      };
    } catch (error) {
      this.logger.error(`Failed to get system insights overview: ${error.message}`);
      throw error;
    }
  }
}