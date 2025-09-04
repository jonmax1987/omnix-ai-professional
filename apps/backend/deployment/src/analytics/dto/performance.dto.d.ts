export declare class CoreWebVitalsDto {
    lcp: number;
    fid: number;
    cls: number;
    fcp?: number;
    tti?: number;
}
export declare class PerformanceMetricsDto {
    metrics: CoreWebVitalsDto;
    timestamp: string;
    userId?: string;
    sessionId?: string;
    url?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
}
export declare class PerformanceResponseDto {
    success: boolean;
    message: string;
    timestamp: string;
    metricsId?: string;
}
