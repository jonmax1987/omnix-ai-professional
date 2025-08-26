import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OmnixWebSocketGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
import { WsJwtGuard } from './ws-jwt.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [OmnixWebSocketGateway, WebSocketService, WsJwtGuard],
  exports: [WebSocketService],
})
export class WebSocketModule {}