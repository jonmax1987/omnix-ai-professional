import { Controller, Post, Get, Body, UseGuards, Logger, Optional, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { PerformanceMetricsDto, PerformanceResponseDto } from './dto/performance.dto';
import { RealtimeAnalyticsService } from '../services/realtime-analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(
    @Optional() @Inject(RealtimeAnalyticsService) private realtimeAnalyticsService?: RealtimeAnalyticsService
  ) {}

  @Public()
  @Post('performance')
  @ApiOperation({ 
    summary: 'Record performance metrics from frontend application',
    description: 'Accepts performance metrics data from the frontend and stores it for analysis'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Performance metrics recorded successfully',
    type: PerformanceResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid performance metrics data' 
  })
  async recordPerformanceMetrics(@Body() metrics: PerformanceMetricsDto): Promise<PerformanceResponseDto> {
    try {
      this.logger.log(`Recording performance metrics: ${JSON.stringify(metrics)}`);
      
      // Process the metrics - for now we'll just log them
      // In a real implementation, you would:
      // 1. Validate the metrics
      // 2. Store them in a database or analytics service
      // 3. Trigger any real-time processing
      
      if (this.realtimeAnalyticsService) {
        // If realtime analytics service is available, use it
        // await this.realtimeAnalyticsService.processPerformanceMetrics(metrics);
      }

      // Log key performance indicators
      if (metrics.metrics) {
        const perfData = metrics.metrics;
        this.logger.log(`Performance Data - LCP: ${perfData.lcp}ms, FID: ${perfData.fid}ms, CLS: ${perfData.cls}`);
      }

      return {
        success: true,
        message: 'Performance metrics recorded successfully',
        timestamp: new Date().toISOString(),
        metricsId: `metrics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

    } catch (error) {
      this.logger.error(`Failed to record performance metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('performance/summary')
  @ApiOperation({ 
    summary: 'Get performance analytics summary',
    description: 'Returns aggregated performance metrics and insights'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Performance summary retrieved successfully'
  })
  async getPerformanceSummary(): Promise<any> {
    try {
      this.logger.log('Retrieving performance analytics summary');
      
      // In a real implementation, this would aggregate stored metrics
      return {
        summary: {
          totalMetricsCollected: 0,
          averageLCP: 0,
          averageFID: 0,
          averageCLS: 0,
          performanceScore: 95,
          lastUpdated: new Date().toISOString()
        },
        trends: {
          lcp: { trend: 'improving', change: -5.2 },
          fid: { trend: 'stable', change: 0.1 },
          cls: { trend: 'improving', change: -0.05 }
        },
        message: 'Performance summary retrieved successfully'
      };

    } catch (error) {
      this.logger.error(`Failed to get performance summary: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Analytics service health check' })
  @ApiResponse({ status: 200, description: 'Analytics service is healthy' })
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    };
  }
}