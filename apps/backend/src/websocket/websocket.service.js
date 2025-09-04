"use strict";
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const common_1 = require("@nestjs/common");
let WebSocketService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var WebSocketService = _classThis = class {
        constructor() {
            this.logger = new common_1.Logger(WebSocketService.name);
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
        // Broadcast to specific channel
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
        // Broadcast to all connected clients
        broadcastToAll(message) {
            this.broadcastToChannel('global', message);
        }
        // Send message to specific user
        sendToUser(userId, message) {
            this.broadcastToChannel(`user.${userId}`, message);
        }
        // Product Events
        emitProductUpdate(productId, productData) {
            const message = {
                channel: 'products',
                type: 'product.updated',
                payload: {
                    productId,
                    data: productData,
                },
            };
            // Send to products channel
            this.broadcastToChannel('products', message);
            // Send to specific product channel
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
            // If low stock, also send to alerts channel
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
        // Dashboard Events
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
        // Alert Events
        emitNewAlert(alertData) {
            const message = {
                channel: 'alerts',
                type: 'alert.created',
                payload: alertData,
            };
            this.broadcastToChannel('alerts', message);
            // Also send to global for urgent alerts
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
        // Order Events
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
        // Recommendation Events
        emitNewRecommendation(recommendationData) {
            const message = {
                channel: 'recommendations',
                type: 'recommendation.new',
                payload: recommendationData,
            };
            this.broadcastToChannel('recommendations', message);
        }
        // System Events
        emitSystemMaintenance(maintenanceData) {
            const message = {
                channel: 'system',
                type: 'system.maintenance',
                payload: maintenanceData,
            };
            this.broadcastToAll(message);
        }
        // Helper methods for sending data to specific clients
        async sendDashboardMetrics(client) {
            try {
                // Mock dashboard metrics - in real implementation, fetch from database
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
                // Mock alerts - in real implementation, fetch from database
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
        // Get connection statistics
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
    __setFunctionName(_classThis, "WebSocketService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WebSocketService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WebSocketService = _classThis;
})();
exports.WebSocketService = WebSocketService;
