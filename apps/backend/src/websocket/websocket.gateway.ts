import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from './ws-jwt.guard';
import { WebSocketService } from './websocket.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

@Injectable()
@WebSocketGateway({
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
})
export class OmnixWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OmnixWebSocketGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly webSocketService: WebSocketService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('🔌 WebSocket Gateway initialized');
    this.webSocketService.setServer(server);
  }

  async handleConnection(client: AuthenticatedSocket, ...args: any[]) {
    try {
      // Extract token from query or handshake auth
      const token = client.handshake.query.token as string || 
                   client.handshake.auth.token as string;

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

    } catch (error) {
      this.logger.error(`🚫 Authentication failed for client ${client.id}:`, error.message);
      client.emit('error', {
        type: 'authentication_failed',
        message: 'Invalid or expired token',
      });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.webSocketService.unregisterClient(client);
    this.logger.log(`❌ Client disconnected: ${client.userEmail || 'unknown'} (${client.id})`);
  }

  @SubscribeMessage('subscribe')
  @UseGuards(WsJwtGuard)
  handleSubscribe(
    @MessageBody() data: { channel: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
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

  @SubscribeMessage('unsubscribe')
  @UseGuards(WsJwtGuard)
  handleUnsubscribe(
    @MessageBody() data: { channel: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { channel } = data;
    
    client.leave(channel);
    this.logger.log(`📡 Client ${client.userEmail} unsubscribed from channel: ${channel}`);
    
    client.emit('unsubscribed', {
      channel,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('SUBSCRIBE_PRODUCT')
  @UseGuards(WsJwtGuard)
  handleSubscribeProduct(
    @MessageBody() data: { productId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
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

  @SubscribeMessage('UNSUBSCRIBE_PRODUCT')
  @UseGuards(WsJwtGuard)
  handleUnsubscribeProduct(
    @MessageBody() data: { productId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
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

  @SubscribeMessage('GET_DASHBOARD_METRICS')
  @UseGuards(WsJwtGuard)
  handleGetDashboardMetrics(@ConnectedSocket() client: AuthenticatedSocket) {
    this.logger.log(`📊 Client ${client.userEmail} requested dashboard metrics`);
    this.webSocketService.sendDashboardMetrics(client);
  }

  @SubscribeMessage('SUBSCRIBE_ALERTS')
  @UseGuards(WsJwtGuard)
  handleSubscribeAlerts(@ConnectedSocket() client: AuthenticatedSocket) {
    client.join('alerts');
    this.logger.log(`🚨 Client ${client.userEmail} subscribed to alerts`);
    
    client.emit('subscribed', {
      channel: 'alerts',
      timestamp: new Date().toISOString(),
    });

    // Send current alerts
    this.webSocketService.sendCurrentAlerts(client);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('pong', {
      timestamp: new Date().toISOString(),
    });
  }

  private isValidChannel(channel: string): boolean {
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
}