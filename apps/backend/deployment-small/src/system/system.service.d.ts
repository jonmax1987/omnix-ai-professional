import { HealthCheck, SystemStatus, SystemMetrics } from '../common/dto/system.dto';
export declare class SystemService {
    private startTime;
    private requestCount;
    private totalResponseTime;
    private errorCount;
    private incidents;
    getHealthCheck(): Promise<HealthCheck>;
    getSystemStatus(): Promise<SystemStatus>;
    getSystemMetrics(): Promise<SystemMetrics>;
    incrementRequestCount(): void;
    addResponseTime(time: number): void;
    incrementErrorCount(): void;
}
