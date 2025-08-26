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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const websocket_service_1 = require("../websocket/websocket.service");
let AlertsService = class AlertsService {
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
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
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
                createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: 'alert-003',
                type: 'system',
                severity: 'low',
                message: 'Weekly inventory report is ready for review',
                details: 'Your automated weekly inventory summary has been generated.',
                actionRequired: false,
                createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            },
        ];
    }
    async findAll(type, severity, limit = 50) {
        let filteredAlerts = [...this.alerts];
        if (type) {
            filteredAlerts = filteredAlerts.filter(alert => alert.type === type);
        }
        if (severity) {
            filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
        }
        filteredAlerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
            dismissedBy: 'user',
        };
        this.webSocketService.emitAlertUpdate(id, {
            dismissed: true,
            dismissedAt: this.alerts[alertIndex].dismissedAt,
            dismissedBy: this.alerts[alertIndex].dismissedBy,
        });
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
        this.webSocketService.emitNewAlert(newAlert);
        return newAlert;
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [websocket_service_1.WebSocketService])
], AlertsService);
//# sourceMappingURL=alerts.service.js.map