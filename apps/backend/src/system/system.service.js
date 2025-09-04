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
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemService = void 0;
const common_1 = require("@nestjs/common");
const os = __importStar(require("os"));
const process = __importStar(require("process"));
let SystemService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SystemService = _classThis = class {
        constructor(webSocketService) {
            this.webSocketService = webSocketService;
            this.startTime = Date.now();
            this.requestCount = 0;
            this.totalResponseTime = 0;
            this.errorCount = 0;
            // Mock incidents for demonstration
            this.incidents = [
                {
                    id: 'inc-001',
                    title: 'Database connection timeout',
                    status: 'resolved',
                    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                    updatedAt: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
                },
            ];
        }
        async getHealthCheck() {
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
                    memoryUsage: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100, // MB
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
            // Emit WebSocket event for system maintenance
            this.webSocketService.emitSystemMaintenance({
                ...maintenanceData,
                timestamp: new Date().toISOString(),
            });
        }
    };
    __setFunctionName(_classThis, "SystemService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SystemService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SystemService = _classThis;
})();
exports.SystemService = SystemService;
