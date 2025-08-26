import { SystemService } from './system.service';
import { HealthCheck, SystemStatus, SystemMetrics } from '../common/dto/system.dto';
export declare class SystemController {
    private systemService;
    constructor(systemService: SystemService);
    getHealthCheck(): Promise<HealthCheck>;
    getSystemStatus(): Promise<{
        data: SystemStatus;
        message: string;
    }>;
    getSystemMetrics(): Promise<{
        data: SystemMetrics;
        message: string;
    }>;
}
