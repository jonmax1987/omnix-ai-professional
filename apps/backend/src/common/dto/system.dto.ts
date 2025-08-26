import { ApiProperty } from '@nestjs/swagger';

export class HealthCheck {
  @ApiProperty({ example: 'healthy' })
  status: 'healthy' | 'unhealthy' | 'degraded';

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  checks: {
    database: 'healthy' | 'unhealthy';
    cache: 'healthy' | 'unhealthy';
    external_apis: 'healthy' | 'unhealthy';
    memory: 'healthy' | 'unhealthy';
    disk: 'healthy' | 'unhealthy';
  };

  @ApiProperty()
  uptime: number; // seconds

  @ApiProperty()
  version: string;

  @ApiProperty()
  environment: string;
}

export class SystemStatus {
  @ApiProperty()
  status: 'operational' | 'degraded' | 'outage';

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  services: Array<{
    name: string;
    status: 'operational' | 'degraded' | 'outage';
    responseTime?: number;
    lastCheck: string;
  }>;

  @ApiProperty()
  performance: {
    avgResponseTime: number;
    requestsPerMinute: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
  };

  @ApiProperty()
  incidents?: Array<{
    id: string;
    title: string;
    status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
    createdAt: string;
    updatedAt: string;
  }>;
}

export class SystemMetrics {
  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  api: {
    totalRequests: number;
    requestsPerMinute: number;
    avgResponseTime: number;
    errorRate: number;
    activeConnections: number;
  };

  @ApiProperty()
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

  @ApiProperty()
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

  @ApiProperty()
  application: {
    version: string;
    uptime: number;
    environment: string;
    nodeVersion: string;
    activeUsers: number;
  };
}