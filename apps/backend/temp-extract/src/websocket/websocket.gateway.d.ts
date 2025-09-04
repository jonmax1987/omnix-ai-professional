import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { WebSocketService } from './websocket.service';
interface AuthenticatedSocket extends Socket {
    userId?: string;
    userEmail?: string;
    userRole?: string;
}
export declare class OmnixWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly jwtService;
    private readonly webSocketService;
    server: Server;
    private readonly logger;
    constructor(jwtService: JwtService, webSocketService: WebSocketService);
    afterInit(server: Server): void;
    handleConnection(client: AuthenticatedSocket, ...args: any[]): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): void;
    handleSubscribe(data: {
        channel: string;
    }, client: AuthenticatedSocket): void;
    handleUnsubscribe(data: {
        channel: string;
    }, client: AuthenticatedSocket): void;
    handleSubscribeProduct(data: {
        productId: string;
    }, client: AuthenticatedSocket): void;
    handleUnsubscribeProduct(data: {
        productId: string;
    }, client: AuthenticatedSocket): void;
    handleGetDashboardMetrics(client: AuthenticatedSocket): void;
    handleSubscribeAlerts(client: AuthenticatedSocket): void;
    handlePing(client: AuthenticatedSocket): void;
    private isValidChannel;
}
export {};
