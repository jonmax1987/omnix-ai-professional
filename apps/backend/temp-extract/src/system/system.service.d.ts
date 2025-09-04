import { HealthCheck, SystemStatus, SystemMetrics } from '../common/dto/system.dto';
import { WebSocketService } from '../websocket/websocket.service';
export declare class SystemService {
    private readonly webSocketService;
    constructor(webSocketService: WebSocketService);
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
    announceSystemMaintenance(maintenanceData: {
        message: string;
        startTime: string;
        endTime?: string;
        affectedServices?: string[];
    }): Promise<void>;
}
