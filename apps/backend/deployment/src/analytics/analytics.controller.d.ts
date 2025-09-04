import { PerformanceMetricsDto, PerformanceResponseDto } from './dto/performance.dto';
import { RealtimeAnalyticsService } from '../services/realtime-analytics.service';
export declare class AnalyticsController {
    private realtimeAnalyticsService?;
    private readonly logger;
    constructor(realtimeAnalyticsService?: RealtimeAnalyticsService);
    recordPerformanceMetrics(metrics: PerformanceMetricsDto): Promise<PerformanceResponseDto>;
    getPerformanceSummary(): Promise<any>;
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
    }>;
}
