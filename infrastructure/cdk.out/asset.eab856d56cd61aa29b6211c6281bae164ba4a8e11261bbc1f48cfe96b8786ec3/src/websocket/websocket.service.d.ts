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
export declare class WebSocketService {
    private server;
    private readonly logger;
    private connectedClients;
    setServer(server: Server): void;
    registerClient(client: AuthenticatedSocket): void;
    unregisterClient(client: AuthenticatedSocket): void;
    broadcastToChannel(channel: string, message: WebSocketMessage): void;
    broadcastToAll(message: WebSocketMessage): void;
    sendToUser(userId: string, message: WebSocketMessage): void;
    emitProductUpdate(productId: string, productData: any): void;
    emitProductDeleted(productId: string): void;
    emitStockChanged(productId: string, productName: string, stock: number, minStock: number): void;
    emitDashboardUpdate(metrics: any): void;
    emitNewAlert(alertData: any): void;
    emitAlertUpdate(alertId: string, updateData: any): void;
    emitNewOrder(orderData: any): void;
    emitOrderStatusChanged(orderId: string, newStatus: string, previousStatus: string): void;
    emitNewRecommendation(recommendationData: any): void;
    emitSystemMaintenance(maintenanceData: any): void;
    sendDashboardMetrics(client: AuthenticatedSocket): Promise<void>;
    sendCurrentAlerts(client: AuthenticatedSocket): Promise<void>;
    getConnectionStats(): {
        totalConnections: number;
        connectedUsers: {
            id: string;
            userId: string;
            email: string;
            role: string;
            connectedAt: string;
        }[];
    };
}
export {};
