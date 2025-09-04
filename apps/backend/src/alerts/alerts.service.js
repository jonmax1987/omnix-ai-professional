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
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
let AlertsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AlertsService = _classThis = class {
        constructor(webSocketService) {
            this.webSocketService = webSocketService;
            this.alerts = [
                {
                    id: 'alert-001',
                    type: 'low-stock',
                    productId: '223e4567-e89b-12d3-a456-426614174001',
                    productName: 'Organic Green Tea',
                    severity: 'medium',
                    message: 'Organic Green Tea stock is running low (8 remaining, threshold: 15)',
                    details: 'Current stock level is below the minimum threshold. Consider reordering soon.',
                    actionRequired: true,
                    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                },
                {
                    id: 'alert-002',
                    type: 'forecast-warning',
                    productId: '123e4567-e89b-12d3-a456-426614174000',
                    productName: 'Premium Coffee Beans',
                    severity: 'low',
                    message: 'Expected increase in demand for Premium Coffee Beans next week',
                    details: 'AI forecasting suggests 25% increase in demand. Current stock should be sufficient.',
                    actionRequired: false,
                    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
                },
                {
                    id: 'alert-003',
                    type: 'system',
                    severity: 'low',
                    message: 'Weekly inventory report is ready for review',
                    details: 'Your automated weekly inventory summary has been generated.',
                    actionRequired: false,
                    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
                },
            ];
        }
        async findAll(type, severity, limit = 50) {
            let filteredAlerts = [...this.alerts];
            // Filter by type
            if (type) {
                filteredAlerts = filteredAlerts.filter(alert => alert.type === type);
            }
            // Filter by severity
            if (severity) {
                filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
            }
            // Sort by creation date (newest first)
            filteredAlerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            // Apply limit
            filteredAlerts = filteredAlerts.slice(0, limit);
            return {
                data: filteredAlerts,
                count: filteredAlerts.length,
            };
        }
        async dismissAlert(id) {
            const alertIndex = this.alerts.findIndex(alert => alert.id === id);
            if (alertIndex === -1) {
                return false;
            }
            this.alerts[alertIndex] = {
                ...this.alerts[alertIndex],
                dismissedAt: new Date().toISOString(),
                dismissedBy: 'user', // In production, this would be the authenticated user
            };
            // Emit WebSocket event for alert dismissal
            this.webSocketService.emitAlertUpdate(id, {
                dismissed: true,
                dismissedAt: this.alerts[alertIndex].dismissedAt,
                dismissedBy: this.alerts[alertIndex].dismissedBy,
            });
            // Remove dismissed alert from active list
            this.alerts.splice(alertIndex, 1);
            return true;
        }
        async createAlert(alertData) {
            const newAlert = {
                ...alertData,
                id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                createdAt: new Date().toISOString(),
            };
            this.alerts.unshift(newAlert);
            // Emit WebSocket event for new alert
            this.webSocketService.emitNewAlert(newAlert);
            return newAlert;
        }
    };
    __setFunctionName(_classThis, "AlertsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AlertsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AlertsService = _classThis;
})();
exports.AlertsService = AlertsService;
