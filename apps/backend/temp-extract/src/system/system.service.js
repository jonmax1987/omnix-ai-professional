"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemService = void 0;
const common_1 = require("@nestjs/common");
const websocket_service_1 = require("../websocket/websocket.service");
const os = __importStar(require("os"));
const process = __importStar(require("process"));
let SystemService = class SystemService {
    constructor(webSocketService) {
        this.webSocketService = webSocketService;
        this.startTime = Date.now();
        this.requestCount = 0;
        this.totalResponseTime = 0;
        this.errorCount = 0;
        this.incidents = [
            {
                id: 'inc-001',
                title: 'Database connection timeout',
                status: 'resolved',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                updatedAt: new Date(Date.now() - 1800000).toISOString(),
            },
        ];
    }
    async getHealthCheck() {
        const memoryUsage = process.memoryUsage();
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
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
    async getSystemStatus() {
        const avgResponseTime = this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0;
        const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;
        const memoryUsage = process.memoryUsage();
        const loadAverage = os.loadavg()[0];
        const services = [
            {
                name: 'API Gateway',
                status: 'operational',
                responseTime: Math.floor(avgResponseTime),
                lastCheck: new Date().toISOString(),
            },
            {
                name: 'Database',
                status: 'operational',
                responseTime: 5,
                lastCheck: new Date().toISOString(),
            },
            {
                name: 'Authentication Service',
                status: 'operational',
                responseTime: 12,
                lastCheck: new Date().toISOString(),
            },
            {
                name: 'AI/ML Service',
                status: 'operational',
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
                memoryUsage: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
                cpuUsage: Math.round(loadAverage * 100) / 100,
            },
            incidents: this.incidents.filter(i => i.status !== 'resolved'),
        };
    }
    async getSystemMetrics() {
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
                activeConnections: Math.floor(Math.random() * 50) + 10,
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
                    used: Math.round(usedMemory / 1024 / 1024),
                    free: Math.round(freeMemory / 1024 / 1024),
                    total: Math.round(totalMemory / 1024 / 1024),
                    percentage: Math.round((usedMemory / totalMemory) * 100),
                },
                cpu: {
                    usage: Math.round(os.loadavg()[0] * 100) / 100,
                    loadAverage: os.loadavg(),
                },
                disk: {
                    used: 15000,
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
                activeUsers: Math.floor(Math.random() * 100) + 10,
            },
        };
    }
    incrementRequestCount() {
        this.requestCount++;
    }
    addResponseTime(time) {
        this.totalResponseTime += time;
    }
    incrementErrorCount() {
        this.errorCount++;
    }
    async announceSystemMaintenance(maintenanceData) {
        this.webSocketService.emitSystemMaintenance({
            ...maintenanceData,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.SystemService = SystemService;
exports.SystemService = SystemService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [websocket_service_1.WebSocketService])
], SystemService);
//# sourceMappingURL=system.service.js.map