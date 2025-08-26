import { Injectable } from '@nestjs/common';
import { HealthCheck, SystemStatus, SystemMetrics } from '../common/dto/system.dto';
import { WebSocketService } from '../websocket/websocket.service';
import * as os from 'os';
import * as process from 'process';

@Injectable()
export class SystemService {
  constructor(private readonly webSocketService: WebSocketService) {}
  
  private startTime = Date.now();
  private requestCount = 0;
  private totalResponseTime = 0;
  private errorCount = 0;

  // Mock incidents for demonstration
  private incidents = [
    {
      id: 'inc-001',
      title: 'Database connection timeout',
      status: 'resolved' as const,
      createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      updatedAt: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
    },
  ];

  async getHealthCheck(): Promise<HealthCheck> {
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    
    // Mock health checks
    const databaseHealthy = true;
    const cacheHealthy = true;
    const externalApisHealthy = true;
    const memoryHealthy = (memoryUsage.heapUsed / memoryUsage.heapTotal) < 0.9;
    const diskHealthy = true;

    const allHealthy = databaseHealthy && cacheHealthy && externalApisHealthy && memoryHealthy && diskHealthy;

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database: databaseHealthy ? 'healthy' : 'unhealthy',
        cache: cacheHealthy ? 'healthy' : 'unhealthy',
        external_apis: externalApisHealthy ? 'healthy' : 'unhealthy',
        memory: memoryHealthy ? 'healthy' : 'unhealthy',
        disk: diskHealthy ? 'healthy' : 'unhealthy',
      },
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  async getSystemStatus(): Promise<SystemStatus> {
    const avgResponseTime = this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0;
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;
    
    const memoryUsage = process.memoryUsage();
    const loadAverage = os.loadavg()[0];

    const services = [
      {
        name: 'API Gateway',
        status: 'operational' as const,
        responseTime: Math.floor(avgResponseTime),
        lastCheck: new Date().toISOString(),
      },
      {
        name: 'Database',
        status: 'operational' as const,
        responseTime: 5,
        lastCheck: new Date().toISOString(),
      },
      {
        name: 'Authentication Service',
        status: 'operational' as const,
        responseTime: 12,
        lastCheck: new Date().toISOString(),
      },
      {
        name: 'AI/ML Service',
        status: 'operational' as const,
        responseTime: 150,
        lastCheck: new Date().toISOString(),
      },
    ];

    const allOperational = services.every(s => s.status === 'operational');

    return {
      status: allOperational ? 'operational' : 'degraded',
      timestamp: new Date().toISOString(),
      services,
      performance: {
        avgResponseTime: Math.floor(avgResponseTime),
        requestsPerMinute: Math.floor(this.requestCount / ((Date.now() - this.startTime) / 60000)) || 0,
        errorRate: Math.round(errorRate * 100) / 100,
        memoryUsage: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100, // MB
        cpuUsage: Math.round(loadAverage * 100) / 100,
      },
      incidents: this.incidents.filter(i => i.status !== 'resolved'),
    };
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    const avgResponseTime = this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0;
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);

    return {
      timestamp: new Date().toISOString(),
      api: {
        totalRequests: this.requestCount,
        requestsPerMinute: Math.floor(this.requestCount / (uptime / 60)) || 0,
        avgResponseTime: Math.floor(avgResponseTime),
        errorRate: Math.round(errorRate * 100) / 100,
        activeConnections: Math.floor(Math.random() * 50) + 10, // Mock active connections
      },
      database: {
        connectionPool: {
          active: Math.floor(Math.random() * 10) + 2,
          idle: Math.floor(Math.random() * 5) + 1,
          total: 15,
        },
        queryPerformance: {
          avgQueryTime: Math.floor(Math.random() * 50) + 5,
          slowQueries: Math.floor(Math.random() * 3),
        },
      },
      system: {
        memory: {
          used: Math.round(usedMemory / 1024 / 1024), // MB
          free: Math.round(freeMemory / 1024 / 1024), // MB
          total: Math.round(totalMemory / 1024 / 1024), // MB
          percentage: Math.round((usedMemory / totalMemory) * 100),
        },
        cpu: {
          usage: Math.round(os.loadavg()[0] * 100) / 100,
          loadAverage: os.loadavg(),
        },
        disk: {
          used: 15000, // Mock disk usage in MB
          free: 50000,
          total: 65000,
          percentage: 23,
        },
      },
      application: {
        version: '1.0.0',
        uptime,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        activeUsers: Math.floor(Math.random() * 100) + 10, // Mock active users
      },
    };
  }

  // Helper methods to track metrics
  incrementRequestCount(): void {
    this.requestCount++;
  }

  addResponseTime(time: number): void {
    this.totalResponseTime += time;
  }

  incrementErrorCount(): void {
    this.errorCount++;
  }

  async announceSystemMaintenance(maintenanceData: { message: string; startTime: string; endTime?: string; affectedServices?: string[] }): Promise<void> {
    // Emit WebSocket event for system maintenance
    this.webSocketService.emitSystemMaintenance({
      ...maintenanceData,
      timestamp: new Date().toISOString(),
    });
  }
}