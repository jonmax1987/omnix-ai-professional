"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var OmnixWebSocketGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OmnixWebSocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const ws_jwt_guard_1 = require("./ws-jwt.guard");
const websocket_service_1 = require("./websocket.service");
let OmnixWebSocketGateway = OmnixWebSocketGateway_1 = class OmnixWebSocketGateway {
    constructor(jwtService, webSocketService) {
        this.jwtService = jwtService;
        this.webSocketService = webSocketService;
        this.logger = new common_1.Logger(OmnixWebSocketGateway_1.name);
    }
    afterInit(server) {
        this.logger.log('🔌 WebSocket Gateway initialized');
        this.webSocketService.setServer(server);
    }
    async handleConnection(client, ...args) {
        try {
            const token = client.handshake.query.token ||
                client.handshake.auth.token;
            if (!token) {
                this.logger.warn(`🚫 Connection rejected: No token provided`);
                client.disconnect();
                return;
            }
            const payload = await this.jwtService.verifyAsync(token);
            client.userId = payload.sub;
            client.userEmail = payload.email;
            client.userRole = payload.role;
            this.webSocketService.registerClient(client);
            await client.join('global');
            await client.join('dashboard');
            await client.join(`user.${client.userId}`);
            this.logger.log(`✅ Client connected: ${client.userEmail} (${client.id})`);
            client.emit('connection', {
                status: 'connected',
                userId: client.userId,
                channels: ['global', 'dashboard', `user.${client.userId}`],
                timestamp: new Date().toISOString(),
            });
            this.webSocketService.sendDashboardMetrics(client);
        }
        catch (error) {
            this.logger.error(`🚫 Authentication failed for client ${client.id}:`, error.message);
            client.emit('error', {
                type: 'authentication_failed',
                message: 'Invalid or expired token',
            });
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.webSocketService.unregisterClient(client);
        this.logger.log(`❌ Client disconnected: ${client.userEmail || 'unknown'} (${client.id})`);
    }
    handleSubscribe(data, client) {
        const { channel } = data;
        if (!this.isValidChannel(channel)) {
            client.emit('error', {
                type: 'invalid_channel',
                message: `Channel '${channel}' is not valid`,
            });
            return;
        }
        client.join(channel);
        this.logger.log(`📡 Client ${client.userEmail} subscribed to channel: ${channel}`);
        client.emit('subscribed', {
            channel,
            timestamp: new Date().toISOString(),
        });
    }
    handleUnsubscribe(data, client) {
        const { channel } = data;
        client.leave(channel);
        this.logger.log(`📡 Client ${client.userEmail} unsubscribed from channel: ${channel}`);
        client.emit('unsubscribed', {
            channel,
            timestamp: new Date().toISOString(),
        });
    }
    handleSubscribeProduct(data, client) {
        const { productId } = data;
        const productChannel = `product.${productId}`;
        client.join(productChannel);
        this.logger.log(`📦 Client ${client.userEmail} subscribed to product: ${productId}`);
        client.emit('subscribed', {
            channel: productChannel,
            productId,
            timestamp: new Date().toISOString(),
        });
    }
    handleUnsubscribeProduct(data, client) {
        const { productId } = data;
        const productChannel = `product.${productId}`;
        client.leave(productChannel);
        this.logger.log(`📦 Client ${client.userEmail} unsubscribed from product: ${productId}`);
        client.emit('unsubscribed', {
            channel: productChannel,
            productId,
            timestamp: new Date().toISOString(),
        });
    }
    handleGetDashboardMetrics(client) {
        this.logger.log(`📊 Client ${client.userEmail} requested dashboard metrics`);
        this.webSocketService.sendDashboardMetrics(client);
    }
    handleSubscribeAlerts(client) {
        client.join('alerts');
        this.logger.log(`🚨 Client ${client.userEmail} subscribed to alerts`);
        client.emit('subscribed', {
            channel: 'alerts',
            timestamp: new Date().toISOString(),
        });
        this.webSocketService.sendCurrentAlerts(client);
    }
    handlePing(client) {
        client.emit('pong', {
            timestamp: new Date().toISOString(),
        });
    }
    isValidChannel(channel) {
        const validChannels = [
            'global',
            'products',
            'dashboard',
            'alerts',
            'orders',
            'inventory',
            'recommendations',
            'system',
        ];
        return validChannels.includes(channel) || channel.startsWith('product.') || channel.startsWith('user.');
    }
};
exports.OmnixWebSocketGateway = OmnixWebSocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], OmnixWebSocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe'),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OmnixWebSocketGateway.prototype, "handleSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe'),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OmnixWebSocketGateway.prototype, "handleUnsubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('SUBSCRIBE_PRODUCT'),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OmnixWebSocketGateway.prototype, "handleSubscribeProduct", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('UNSUBSCRIBE_PRODUCT'),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OmnixWebSocketGateway.prototype, "handleUnsubscribeProduct", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('GET_DASHBOARD_METRICS'),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OmnixWebSocketGateway.prototype, "handleGetDashboardMetrics", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('SUBSCRIBE_ALERTS'),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OmnixWebSocketGateway.prototype, "handleSubscribeAlerts", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OmnixWebSocketGateway.prototype, "handlePing", null);
exports.OmnixWebSocketGateway = OmnixWebSocketGateway = OmnixWebSocketGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: [
                'http://localhost:3000',
                'http://localhost:5173',
                'https://d1vu6p9f5uc16.cloudfront.net',
                'https://dh5a0lb9qett.cloudfront.net',
                'https://omnix-ai.com',
                'https://app.omnix-ai.com',
            ],
            credentials: true,
        },
        namespace: '/ws',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        websocket_service_1.WebSocketService])
], OmnixWebSocketGateway);
//# sourceMappingURL=websocket.gateway.js.map