export declare class HealthCheck {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: string;
    checks: {
        database: 'healthy' | 'unhealthy';
        cache: 'healthy' | 'unhealthy';
        external_apis: 'healthy' | 'unhealthy';
        memory: 'healthy' | 'unhealthy';
        disk: 'healthy' | 'unhealthy';
    };
    uptime: number;
    version: string;
    environment: string;
}
export declare class SystemStatus {
    status: 'operational' | 'degraded' | 'outage';
    timestamp: string;
    services: Array<{
        name: string;
        status: 'operational' | 'degraded' | 'outage';
        responseTime?: number;
        lastCheck: string;
    }>;
    performance: {
        avgResponseTime: number;
        requestsPerMinute: number;
        errorRate: number;
        memoryUsage: number;
        cpuUsage: number;
    };
    incidents?: Array<{
        id: string;
        title: string;
        status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
        createdAt: string;
        updatedAt: string;
    }>;
}
export declare class SystemMetrics {
    timestamp: string;
    api: {
        totalRequests: number;
        requestsPerMinute: number;
        avgResponseTime: number;
        errorRate: number;
        activeConnections: number;
    };
    database: {
        connectionPool: {
            active: number;
            idle: number;
            total: number;
        };
        queryPerformance: {
            avgQueryTime: number;
            slowQueries: number;
        };
    };
    system: {
        memory: {
            used: number;
            free: number;
            total: number;
            percentage: number;
        };
        cpu: {
            usage: number;
            loadAverage: number[];
        };
        disk: {
            used: number;
            free: number;
            total: number;
            percentage: number;
        };
    };
    application: {
        version: string;
        uptime: number;
        environment: string;
        nodeVersion: string;
        activeUsers: number;
    };
}
