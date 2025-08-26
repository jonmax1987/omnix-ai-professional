import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { AIAnalysisService } from './ai-analysis.service';
import { CostAnalyticsService } from '../services/cost-analytics.service';
import { BatchProcessingService } from '../services/batch-processing.service';
import { CustomerSegmentationService } from '../services/customer-segmentation.service';
import { CostAnalytics, TopCustomerCost } from '../interfaces/cost-analytics.interface';
import { BatchStatusResponse, QueueStats, BatchRequest } from '../interfaces/batch-processing.interface';
import { 
  SegmentationRequest, 
  SegmentationResponse, 
  SegmentPerformanceMetrics,
  CustomerSegment 
} from '../interfaces/customer-segmentation.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import {
  CustomerProfileDto,
  CreateCustomerProfileDto,
  UpdateCustomerProfileDto,
  CustomerPreferencesDto,
  CreatePurchaseHistoryDto,
  CreateProductInteractionDto,
  ImportPurchaseHistoryDto,
} from '../common/dto/customer.dto';

@Controller('v1/customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly aiAnalysisService: AIAnalysisService,
    private readonly costAnalyticsService: CostAnalyticsService,
    private readonly batchProcessingService: BatchProcessingService,
    private readonly segmentationService: CustomerSegmentationService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async registerCustomer(
    @Body() createDto: CreateCustomerProfileDto,
    @CurrentUser() user: any,
  ): Promise<CustomerProfileDto> {
    const customerId = createDto.customerId || user.id;
    return this.customersService.createCustomerProfile({
      ...createDto,
      customerId,
    });
  }

  @Get(':id/profile')
  async getCustomerProfile(
    @Param('id') customerId: string,
  ): Promise<CustomerProfileDto> {
    return this.customersService.getCustomerProfile(customerId);
  }

  @Put(':id/profile')
  async updateCustomerProfile(
    @Param('id') customerId: string,
    @Body() updateDto: UpdateCustomerProfileDto,
  ): Promise<CustomerProfileDto> {
    return this.customersService.updateCustomerProfile(customerId, updateDto);
  }

  @Patch(':id/preferences')
  async updateCustomerPreferences(
    @Param('id') customerId: string,
    @Body() preferences: CustomerPreferencesDto,
  ): Promise<CustomerProfileDto> {
    return this.customersService.updateCustomerPreferences(customerId, preferences);
  }

  @Get(':id/purchases')
  async getCustomerPurchases(
    @Param('id') customerId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.customersService.getCustomerPurchases(customerId, limitNum);
  }

  @Post(':id/purchases')
  @HttpCode(HttpStatus.CREATED)
  async addPurchaseHistory(
    @Param('id') customerId: string,
    @Body() purchaseDto: CreatePurchaseHistoryDto,
  ) {
    return this.customersService.addPurchaseHistory(customerId, purchaseDto);
  }

  @Post(':id/purchases/import')
  async importPurchaseHistory(
    @Param('id') customerId: string,
    @Body() importDto: ImportPurchaseHistoryDto,
  ) {
    return this.customersService.importPurchaseHistory(
      customerId,
      importDto.purchases,
    );
  }

  @Post(':id/interactions')
  @HttpCode(HttpStatus.CREATED)
  async trackProductInteraction(
    @Param('id') customerId: string,
    @Body() interactionDto: CreateProductInteractionDto,
  ) {
    return this.customersService.trackProductInteraction(customerId, interactionDto);
  }

  @Get(':id/interactions')
  async getCustomerInteractions(
    @Param('id') customerId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.customersService.getCustomerInteractions(customerId, limitNum);
  }

  @Get('products/:productId/interactions')
  async getProductInteractions(
    @Param('productId') productId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.customersService.getProductInteractions(productId, limitNum);
  }

  @Get('segment/:segment')
  async getCustomersBySegment(@Param('segment') segment: string) {
    return this.customersService.getCustomersBySegment(segment);
  }

  @Get()
  async getAllCustomers(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.customersService.getAllCustomers(limitNum);
  }

  // AI Analysis Endpoints
  @Get(':id/ai-analysis')
  async getCustomerAIAnalysis(@Param('id') customerId: string) {
    return this.aiAnalysisService.analyzeCustomerConsumption(customerId);
  }

  @Get(':id/consumption-predictions')
  async getConsumptionPredictions(@Param('id') customerId: string) {
    return this.aiAnalysisService.analyzeCustomerConsumption(customerId);
  }

  @Get(':id/customer-profile-analysis')
  async getCustomerProfileAnalysis(@Param('id') customerId: string) {
    return this.aiAnalysisService.analyzeCustomerProfile(customerId);
  }

  @Get(':id/ai-recommendations')
  async getAIRecommendations(
    @Param('id') customerId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.aiAnalysisService.generateRecommendations(customerId, limitNum);
  }

  @Get(':id/replenishment-alerts')
  async getReplenishmentAlerts(@Param('id') customerId: string) {
    return this.aiAnalysisService.getReplenishmentAlerts(customerId);
  }

  @Get(':id/purchase-prediction/:productId')
  async predictNextPurchase(
    @Param('id') customerId: string,
    @Param('productId') productId: string,
  ) {
    return this.aiAnalysisService.predictNextPurchaseDate(customerId, productId);
  }

  @Post(':id/analyze')
  @HttpCode(HttpStatus.OK)
  async triggerAIAnalysis(@Param('id') customerId: string) {
    return this.aiAnalysisService.analyzeCustomerConsumption(customerId);
  }

  @Get(':id/analysis-history')
  async getAnalysisHistory(
    @Param('id') customerId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.aiAnalysisService.getCustomerAnalysisHistory(customerId, limitNum);
  }

  // Cost Analytics Endpoints
  @Get(':id/cost-analytics')
  async getCustomerCostAnalytics(
    @Param('id') customerId: string,
    @Query('days') days?: string,
  ): Promise<CostAnalytics> {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.costAnalyticsService.getCustomerCostAnalytics(customerId, daysNum);
  }

  @Get('cost-analytics/overview')
  async getCostOverview(
    @Query('timeRange') timeRange: 'hour' | 'day' | 'week' | 'month' = 'day',
  ): Promise<CostAnalytics> {
    return this.costAnalyticsService.getCostAnalytics(timeRange);
  }

  @Get('cost-analytics/top-customers')
  async getTopCustomersByCost(
    @Query('limit') limit?: string,
    @Query('days') days?: string,
  ): Promise<TopCustomerCost[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.costAnalyticsService.getTopCustomersByCost(limitNum, daysNum);
  }

  // Batch Processing Endpoints
  @Post('batch-analysis')
  async submitBatchAnalysis(@Body() batchRequest: BatchRequest): Promise<{
    batchId: string;
    jobCount: number;
    estimatedCost: number;
  }> {
    return this.batchProcessingService.submitBatchRequest(batchRequest);
  }

  @Get('batch-analysis/:batchId')
  async getBatchStatus(@Param('batchId') batchId: string): Promise<BatchStatusResponse> {
    return this.batchProcessingService.getBatchStatus(batchId);
  }

  @Get('batch-analysis/queue/stats')
  async getQueueStats(): Promise<QueueStats> {
    return this.batchProcessingService.getQueueStats();
  }

  // Customer Segmentation Endpoints
  @Post(':id/segmentation')
  async segmentCustomer(
    @Param('id') customerId: string,
    @Body() request?: Partial<SegmentationRequest>
  ): Promise<SegmentationResponse> {
    const segmentationRequest: SegmentationRequest = {
      customerId,
      analysisDepth: request?.analysisDepth || 'detailed',
      includeRecommendations: request?.includeRecommendations !== false,
      forceRecalculation: request?.forceRecalculation || false
    };
    return this.segmentationService.segmentCustomers(segmentationRequest);
  }

  @Post('segmentation/batch')
  async segmentCustomersBatch(
    @Body() request: SegmentationRequest
  ): Promise<SegmentationResponse> {
    return this.segmentationService.segmentCustomers(request);
  }

  @Get(':id/segment')
  async getCustomerSegment(
    @Param('id') customerId: string
  ): Promise<SegmentationResponse> {
    return this.segmentationService.segmentCustomers({
      customerId,
      analysisDepth: 'basic',
      includeRecommendations: false
    });
  }

  @Get('segments/overview')
  async getSegmentOverview(): Promise<{
    segments: CustomerSegment[];
    statistics: any;
  }> {
    const result = await this.segmentationService.segmentCustomers({
      analysisDepth: 'basic',
      includeRecommendations: false
    });
    
    return {
      segments: result.segments || [],
      statistics: result.statistics
    };
  }

  @Get('segments/:segmentId/performance')
  async getSegmentPerformance(
    @Param('segmentId') segmentId: string
  ): Promise<SegmentPerformanceMetrics> {
    return this.segmentationService.getSegmentPerformance(segmentId);
  }

  @Post('segments/migrate')
  async trackSegmentMigration(
    @Body() migration: {
      customerId: string;
      fromSegment: string;
      toSegment: string;
      reason: string;
      impactScore?: number;
    }
  ): Promise<{ success: boolean; message: string }> {
    await this.segmentationService.trackSegmentMigration({
      customerId: migration.customerId,
      fromSegment: migration.fromSegment,
      toSegment: migration.toSegment,
      migrationDate: new Date().toISOString(),
      reason: migration.reason,
      impactScore: migration.impactScore || 0
    });

    return {
      success: true,
      message: `Migration tracked for customer ${migration.customerId}`
    };
  }

  @Get(':id/segment-recommendations')
  async getSegmentBasedRecommendations(
    @Param('id') customerId: string,
    @Query('includeStrategy') includeStrategy?: string
  ): Promise<{
    segment: string;
    recommendations: any[];
    strategy?: any;
  }> {
    const segmentation = await this.segmentationService.segmentCustomers({
      customerId,
      analysisDepth: 'detailed',
      includeRecommendations: true
    });

    const assignment = segmentation.assignments?.[0];
    if (!assignment) {
      throw new Error('Customer segment not found');
    }

    const segment = segmentation.segments?.find(s => s.segmentId === assignment.segmentId);
    
    // Get AI recommendations tailored to the segment
    const recommendations = await this.aiAnalysisService.generateRecommendations(customerId, 5);

    return {
      segment: assignment.segmentName,
      recommendations: recommendations.recommendations || [],
      strategy: includeStrategy === 'true' ? segment?.recommendations : undefined
    };
  }
}