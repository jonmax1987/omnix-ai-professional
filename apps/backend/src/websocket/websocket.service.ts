import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

interface WebSocketMessage {
  channel: string;
  type: string;
  payload: any;
  timestamp?: string;
}

@Injectable()
export class WebSocketService {
  private server: Server;
  private readonly logger = new Logger(WebSocketService.name);
  private connectedClients = new Map<string, AuthenticatedSocket>();

  setServer(server: Server) {
    this.server = server;
  }

  registerClient(client: AuthenticatedSocket) {
    this.connectedClients.set(client.id, client);
    this.logger.log(`📊 Active connections: ${this.connectedClients.size}`);
  }

  unregisterClient(client: AuthenticatedSocket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`📊 Active connections: ${this.connectedClients.size}`);
  }

  // Broadcast to specific channel
  broadcastToChannel(channel: string, message: WebSocketMessage) {
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
  broadcastToAll(message: WebSocketMessage) {
    this.broadcastToChannel('global', message);
  }

  // Send message to specific user
  sendToUser(userId: string, message: WebSocketMessage) {
    this.broadcastToChannel(`user.${userId}`, message);
  }

  // Product Events
  emitProductUpdate(productId: string, productData: any) {
    const message: WebSocketMessage = {
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

  emitProductDeleted(productId: string) {
    const message: WebSocketMessage = {
      channel: 'products',
      type: 'product.deleted',
      payload: {
        productId,
      },
    };

    this.broadcastToChannel('products', message);
    this.broadcastToChannel(`product.${productId}`, message);
  }

  emitStockChanged(productId: string, productName: string, stock: number, minStock: number) {
    const message: WebSocketMessage = {
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
  emitDashboardUpdate(metrics: any) {
    const message: WebSocketMessage = {
      channel: 'dashboard',
      type: 'metrics.updated',
      payload: {
        metrics,
      },
    };

    this.broadcastToChannel('dashboard', message);
  }

  // Alert Events
  emitNewAlert(alertData: any) {
    const message: WebSocketMessage = {
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

  emitAlertUpdate(alertId: string, updateData: any) {
    const message: WebSocketMessage = {
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
  emitNewOrder(orderData: any) {
    const message: WebSocketMessage = {
      channel: 'orders',
      type: 'order.created',
      payload: orderData,
    };

    this.broadcastToChannel('orders', message);
  }

  emitOrderStatusChanged(orderId: string, newStatus: string, previousStatus: string) {
    const message: WebSocketMessage = {
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
  emitNewRecommendation(recommendationData: any) {
    const message: WebSocketMessage = {
      channel: 'recommendations',
      type: 'recommendation.new',
      payload: recommendationData,
    };

    this.broadcastToChannel('recommendations', message);
  }

  // System Events
  emitSystemMaintenance(maintenanceData: any) {
    const message: WebSocketMessage = {
      channel: 'system',
      type: 'system.maintenance',
      payload: maintenanceData,
    };

    this.broadcastToAll(message);
  }

  // Helper methods for sending data to specific clients
  async sendDashboardMetrics(client: AuthenticatedSocket) {
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
    } catch (error) {
      this.logger.error(`❌ Error sending dashboard metrics:`, error);
    }
  }

  async sendCurrentAlerts(client: AuthenticatedSocket) {
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
    } catch (error) {
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
}