"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WebSocketService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const common_1 = require("@nestjs/common");
let WebSocketService = WebSocketService_1 = class WebSocketService {
    constructor() {
        this.logger = new common_1.Logger(WebSocketService_1.name);
        this.connectedClients = new Map();
    }
    setServer(server) {
        this.server = server;
    }
    registerClient(client) {
        this.connectedClients.set(client.id, client);
        this.logger.log(`📊 Active connections: ${this.connectedClients.size}`);
    }
    unregisterClient(client) {
        this.connectedClients.delete(client.id);
        this.logger.log(`📊 Active connections: ${this.connectedClients.size}`);
    }
    broadcastToChannel(channel, message) {
        if (!this.server) {
            this.logger.warn('🚫 WebSocket server not initialized');
            return;
        }
        const messageWithTimestamp = {
            ...message,
            timestamp: new Date().toISOString(),
        };
        this.server.to(channel).emit('message', messageWithTimestamp);
        this.logger.log(`📡 Broadcasted to channel '${channel}': ${message.type}`);
    }
    broadcastToAll(message) {
        this.broadcastToChannel('global', message);
    }
    sendToUser(userId, message) {
        this.broadcastToChannel(`user.${userId}`, message);
    }
    emitProductUpdate(productId, productData) {
        const message = {
            channel: 'products',
            type: 'product.updated',
            payload: {
                productId,
                data: productData,
            },
        };
        this.broadcastToChannel('products', message);
        this.broadcastToChannel(`product.${productId}`, message);
    }
    emitProductDeleted(productId) {
        const message = {
            channel: 'products',
            type: 'product.deleted',
            payload: {
                productId,
            },
        };
        this.broadcastToChannel('products', message);
        this.broadcastToChannel(`product.${productId}`, message);
    }
    emitStockChanged(productId, productName, stock, minStock) {
        const message = {
            channel: 'products',
            type: 'product.stock_changed',
            payload: {
                productId,
                productName,
                stock,
                minStock,
                isLowStock: stock <= minStock,
            },
        };
        this.broadcastToChannel('products', message);
        this.broadcastToChannel(`product.${productId}`, message);
        if (stock <= minStock) {
            this.emitNewAlert({
                id: `low-stock-${productId}-${Date.now()}`,
                severity: 'warning',
                title: 'Low Stock Alert',
                message: `${productName} is running low on stock (${stock} remaining, minimum: ${minStock})`,
                productId,
            });
        }
    }
    emitDashboardUpdate(metrics) {
        const message = {
            channel: 'dashboard',
            type: 'metrics.updated',
            payload: {
                metrics,
            },
        };
        this.broadcastToChannel('dashboard', message);
    }
    emitNewAlert(alertData) {
        const message = {
            channel: 'alerts',
            type: 'alert.created',
            payload: alertData,
        };
        this.broadcastToChannel('alerts', message);
        if (alertData.severity === 'critical' || alertData.severity === 'error') {
            this.broadcastToAll({
                channel: 'system',
                type: 'urgent.alert',
                payload: alertData,
            });
        }
    }
    emitAlertUpdate(alertId, updateData) {
        const message = {
            channel: 'alerts',
            type: 'alert.updated',
            payload: {
                id: alertId,
                ...updateData,
            },
        };
        this.broadcastToChannel('alerts', message);
    }
    emitNewOrder(orderData) {
        const message = {
            channel: 'orders',
            type: 'order.created',
            payload: orderData,
        };
        this.broadcastToChannel('orders', message);
    }
    emitOrderStatusChanged(orderId, newStatus, previousStatus) {
        const message = {
            channel: 'orders',
            type: 'order.status_changed',
            payload: {
                id: orderId,
                status: newStatus,
                previousStatus,
            },
        };
        this.broadcastToChannel('orders', message);
    }
    emitNewRecommendation(recommendationData) {
        const message = {
            channel: 'recommendations',
            type: 'recommendation.new',
            payload: recommendationData,
        };
        this.broadcastToChannel('recommendations', message);
    }
    emitSystemMaintenance(maintenanceData) {
        const message = {
            channel: 'system',
            type: 'system.maintenance',
            payload: maintenanceData,
        };
        this.broadcastToAll(message);
    }
    async sendDashboardMetrics(client) {
        try {
            const metrics = {
                totalProducts: 1250,
                lowStockItems: 23,
                totalValue: 125000,
                activeAlerts: 5,
                revenue: {
                    current: 45000,
                    previous: 42000,
                    trend: 7.1,
                },
                lastUpdated: new Date().toISOString(),
            };
            client.emit('message', {
                channel: 'dashboard',
                type: 'metrics.updated',
                payload: { metrics },
                timestamp: new Date().toISOString(),
            });
            this.logger.log(`📊 Sent dashboard metrics to ${client.userEmail}`);
        }
        catch (error) {
            this.logger.error(`❌ Error sending dashboard metrics:`, error);
        }
    }
    async sendCurrentAlerts(client) {
        try {
            const alerts = [
                {
                    id: 'alert-1',
                    severity: 'warning',
                    title: 'Low Stock Alert',
                    message: 'Premium Coffee Beans is running low on stock',
                    productId: '123e4567-e89b-12d3-a456-426614174000',
                    timestamp: new Date().toISOString(),
                },
                {
                    id: 'alert-2',
                    severity: 'info',
                    title: 'Reorder Recommendation',
                    message: 'Consider reordering Organic Green Tea based on sales trends',
                    productId: '223e4567-e89b-12d3-a456-426614174001',
                    timestamp: new Date().toISOString(),
                },
            ];
            client.emit('message', {
                channel: 'alerts',
                type: 'alerts.current',
                payload: { alerts },
                timestamp: new Date().toISOString(),
            });
            this.logger.log(`🚨 Sent current alerts to ${client.userEmail}`);
        }
        catch (error) {
            this.logger.error(`❌ Error sending current alerts:`, error);
        }
    }
    getConnectionStats() {
        return {
            totalConnections: this.connectedClients.size,
            connectedUsers: Array.from(this.connectedClients.values()).map(client => ({
                id: client.id,
                userId: client.userId,
                email: client.userEmail,
                role: client.userRole,
                connectedAt: client.handshake.time,
            })),
        };
    }
};
exports.WebSocketService = WebSocketService;
exports.WebSocketService = WebSocketService = WebSocketService_1 = __decorate([
    (0, common_1.Injectable)()
], WebSocketService);
//# sourceMappingURL=websocket.service.js.map