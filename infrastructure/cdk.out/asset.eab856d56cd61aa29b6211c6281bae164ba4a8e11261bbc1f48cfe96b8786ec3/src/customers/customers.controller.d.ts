import { CustomersService } from './customers.service';
import { AIAnalysisService } from './ai-analysis.service';
import { CostAnalyticsService } from '../services/cost-analytics.service';
import { BatchProcessingService } from '../services/batch-processing.service';
import { CustomerSegmentationService } from '../services/customer-segmentation.service';
import { CostAnalytics, TopCustomerCost } from '../interfaces/cost-analytics.interface';
import { BatchStatusResponse, QueueStats, BatchRequest } from '../interfaces/batch-processing.interface';
import { SegmentationRequest, SegmentationResponse, SegmentPerformanceMetrics, CustomerSegment } from '../interfaces/customer-segmentation.interface';
import { CustomerProfileDto, CreateCustomerProfileDto, UpdateCustomerProfileDto, CustomerPreferencesDto, CreatePurchaseHistoryDto, CreateProductInteractionDto, ImportPurchaseHistoryDto } from '../common/dto/customer.dto';
export declare class CustomersController {
    private readonly customersService;
    private readonly aiAnalysisService;
    private readonly costAnalyticsService;
    private readonly batchProcessingService;
    private readonly segmentationService;
    constructor(customersService: CustomersService, aiAnalysisService: AIAnalysisService, costAnalyticsService: CostAnalyticsService, batchProcessingService: BatchProcessingService, segmentationService: CustomerSegmentationService);
    registerCustomer(createDto: CreateCustomerProfileDto, user: any): Promise<CustomerProfileDto>;
    getCustomerProfile(customerId: string): Promise<CustomerProfileDto>;
    updateCustomerProfile(customerId: string, updateDto: UpdateCustomerProfileDto): Promise<CustomerProfileDto>;
    updateCustomerPreferences(customerId: string, preferences: CustomerPreferencesDto): Promise<CustomerProfileDto>;
    getCustomerPurchases(customerId: string, limit?: string): Promise<import("../common/dto/customer.dto").PurchaseHistoryDto[]>;
    addPurchaseHistory(customerId: string, purchaseDto: CreatePurchaseHistoryDto): Promise<import("../common/dto/customer.dto").PurchaseHistoryDto>;
    importPurchaseHistory(customerId: string, importDto: ImportPurchaseHistoryDto): Promise<{
        imported: number;
        failed: number;
    }>;
    trackProductInteraction(customerId: string, interactionDto: CreateProductInteractionDto): Promise<import("../common/dto/customer.dto").ProductInteractionDto>;
    getCustomerInteractions(customerId: string, limit?: string): Promise<import("../common/dto/customer.dto").ProductInteractionDto[]>;
    getProductInteractions(productId: string, limit?: string): Promise<import("../common/dto/customer.dto").ProductInteractionDto[]>;
    getCustomersBySegment(segment: string): Promise<CustomerProfileDto[]>;
    getAllCustomers(limit?: string): Promise<CustomerProfileDto[]>;
    getCustomerAIAnalysis(customerId: string): Promise<import("../interfaces/ai-analysis.interface").AIAnalysisResult>;
    getConsumptionPredictions(customerId: string): Promise<import("../interfaces/ai-analysis.interface").AIAnalysisResult>;
    getCustomerProfileAnalysis(customerId: string): Promise<import("../interfaces/ai-analysis.interface").AIAnalysisResult>;
    getAIRecommendations(customerId: string, limit?: string): Promise<import("../interfaces/ai-analysis.interface").AIAnalysisResult>;
    getReplenishmentAlerts(customerId: string): Promise<{
        urgent: import("../interfaces/ai-analysis.interface").ConsumptionPattern[];
        upcoming: import("../interfaces/ai-analysis.interface").ConsumptionPattern[];
    }>;
    predictNextPurchase(customerId: string, productId: string): Promise<{
        predictedDate: string;
        confidence: number;
        averageDaysBetween: number;
    }>;
    triggerAIAnalysis(customerId: string): Promise<import("../interfaces/ai-analysis.interface").AIAnalysisResult>;
    getAnalysisHistory(customerId: string, limit?: string): Promise<import("../interfaces/ai-analysis.interface").AIAnalysisResult[]>;
    getCustomerCostAnalytics(customerId: string, days?: string): Promise<CostAnalytics>;
    getCostOverview(timeRange?: 'hour' | 'day' | 'week' | 'month'): Promise<CostAnalytics>;
    getTopCustomersByCost(limit?: string, days?: string): Promise<TopCustomerCost[]>;
    submitBatchAnalysis(batchRequest: BatchRequest): Promise<{
        batchId: string;
        jobCount: number;
        estimatedCost: number;
    }>;
    getBatchStatus(batchId: string): Promise<BatchStatusResponse>;
    getQueueStats(): Promise<QueueStats>;
    segmentCustomer(customerId: string, request?: Partial<SegmentationRequest>): Promise<SegmentationResponse>;
    segmentCustomersBatch(request: SegmentationRequest): Promise<SegmentationResponse>;
    getCustomerSegment(customerId: string): Promise<SegmentationResponse>;
    getSegmentOverview(): Promise<{
        segments: CustomerSegment[];
        statistics: any;
    }>;
    getSegmentPerformance(segmentId: string): Promise<SegmentPerformanceMetrics>;
    trackSegmentMigration(migration: {
        customerId: string;
        fromSegment: string;
        toSegment: string;
        reason: string;
        impactScore?: number;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getSegmentBasedRecommendations(customerId: string, includeStrategy?: string): Promise<{
        segment: string;
        recommendations: any[];
        strategy?: any;
    }>;
}
