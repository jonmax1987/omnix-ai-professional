import { Injectable } from '@nestjs/common';
import { WebSocketService } from '../websocket/websocket.service';

export interface Alert {
  id: string;
  type: 'low-stock' | 'out-of-stock' | 'expired' | 'forecast-warning' | 'system';
  productId?: string;
  productName?: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  details?: string;
  actionRequired: boolean;
  createdAt: string;
  expiresAt?: string;
  dismissedAt?: string;
  dismissedBy?: string;
}

@Injectable()
export class AlertsService {
  constructor(private readonly webSocketService: WebSocketService) {}
  
  private alerts: Alert[] = [
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

  async findAll(type?: string, severity?: string, limit: number = 50) {
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

  async dismissAlert(id: string): Promise<boolean> {
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

  async createAlert(alertData: Omit<Alert, 'id' | 'createdAt'>): Promise<Alert> {
    const newAlert: Alert = {
      ...alertData,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    this.alerts.unshift(newAlert);

    // Emit WebSocket event for new alert
    this.webSocketService.emitNewAlert(newAlert);

    return newAlert;
  }
}