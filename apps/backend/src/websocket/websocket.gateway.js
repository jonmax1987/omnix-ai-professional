"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OmnixWebSocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const ws_jwt_guard_1 = require("./ws-jwt.guard");
let OmnixWebSocketGateway = (() => {
    let _classDecorators = [(0, common_1.Injectable)(), (0, websockets_1.WebSocketGateway)({
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
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _server_decorators;
    let _server_initializers = [];
    let _server_extraInitializers = [];
    let _handleSubscribe_decorators;
    let _handleUnsubscribe_decorators;
    let _handleSubscribeProduct_decorators;
    let _handleUnsubscribeProduct_decorators;
    let _handleGetDashboardMetrics_decorators;
    let _handleSubscribeAlerts_decorators;
    let _handlePing_decorators;
    var OmnixWebSocketGateway = _classThis = class {
        constructor(jwtService, webSocketService) {
            this.jwtService = (__runInitializers(this, _instanceExtraInitializers), jwtService);
            this.webSocketService = webSocketService;
            this.server = __runInitializers(this, _server_initializers, void 0);
            this.logger = (__runInitializers(this, _server_extraInitializers), new common_1.Logger(OmnixWebSocketGateway.name));
        }
        afterInit(server) {
            this.logger.log('🔌 WebSocket Gateway initialized');
            this.webSocketService.setServer(server);
        }
        async handleConnection(client, ...args) {
            try {
                // Extract token from query or handshake auth
                const token = client.handshake.query.token ||
                    client.handshake.auth.token;
                if (!token) {
                    this.logger.warn(`🚫 Connection rejected: No token provided`);
                    client.disconnect();
                    return;
                }
                // Verify JWT token
                const payload = await this.jwtService.verifyAsync(token);
                // Attach user info to socket
                client.userId = payload.sub;
                client.userEmail = payload.email;
                client.userRole = payload.role;
                // Register client with WebSocket service
                this.webSocketService.registerClient(client);
                // Join default channels
                await client.join('global');
                await client.join('dashboard');
                await client.join(`user.${client.userId}`);
                this.logger.log(`✅ Client connected: ${client.userEmail} (${client.id})`);
                // Send connection confirmation
                client.emit('connection', {
                    status: 'connected',
                    userId: client.userId,
                    channels: ['global', 'dashboard', `user.${client.userId}`],
                    timestamp: new Date().toISOString(),
                });
                // Send initial dashboard metrics
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
            // Send current alerts
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
    __setFunctionName(_classThis, "OmnixWebSocketGateway");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _server_decorators = [(0, websockets_1.WebSocketServer)()];
        _handleSubscribe_decorators = [(0, websockets_1.SubscribeMessage)('subscribe'), (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard)];
        _handleUnsubscribe_decorators = [(0, websockets_1.SubscribeMessage)('unsubscribe'), (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard)];
        _handleSubscribeProduct_decorators = [(0, websockets_1.SubscribeMessage)('SUBSCRIBE_PRODUCT'), (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard)];
        _handleUnsubscribeProduct_decorators = [(0, websockets_1.SubscribeMessage)('UNSUBSCRIBE_PRODUCT'), (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard)];
        _handleGetDashboardMetrics_decorators = [(0, websockets_1.SubscribeMessage)('GET_DASHBOARD_METRICS'), (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard)];
        _handleSubscribeAlerts_decorators = [(0, websockets_1.SubscribeMessage)('SUBSCRIBE_ALERTS'), (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard)];
        _handlePing_decorators = [(0, websockets_1.SubscribeMessage)('ping')];
        __esDecorate(_classThis, null, _handleSubscribe_decorators, { kind: "method", name: "handleSubscribe", static: false, private: false, access: { has: obj => "handleSubscribe" in obj, get: obj => obj.handleSubscribe }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleUnsubscribe_decorators, { kind: "method", name: "handleUnsubscribe", static: false, private: false, access: { has: obj => "handleUnsubscribe" in obj, get: obj => obj.handleUnsubscribe }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleSubscribeProduct_decorators, { kind: "method", name: "handleSubscribeProduct", static: false, private: false, access: { has: obj => "handleSubscribeProduct" in obj, get: obj => obj.handleSubscribeProduct }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleUnsubscribeProduct_decorators, { kind: "method", name: "handleUnsubscribeProduct", static: false, private: false, access: { has: obj => "handleUnsubscribeProduct" in obj, get: obj => obj.handleUnsubscribeProduct }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleGetDashboardMetrics_decorators, { kind: "method", name: "handleGetDashboardMetrics", static: false, private: false, access: { has: obj => "handleGetDashboardMetrics" in obj, get: obj => obj.handleGetDashboardMetrics }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleSubscribeAlerts_decorators, { kind: "method", name: "handleSubscribeAlerts", static: false, private: false, access: { has: obj => "handleSubscribeAlerts" in obj, get: obj => obj.handleSubscribeAlerts }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handlePing_decorators, { kind: "method", name: "handlePing", static: false, private: false, access: { has: obj => "handlePing" in obj, get: obj => obj.handlePing }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, null, _server_decorators, { kind: "field", name: "server", static: false, private: false, access: { has: obj => "server" in obj, get: obj => obj.server, set: (obj, value) => { obj.server = value; } }, metadata: _metadata }, _server_initializers, _server_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OmnixWebSocketGateway = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OmnixWebSocketGateway = _classThis;
})();
exports.OmnixWebSocketGateway = OmnixWebSocketGateway;
