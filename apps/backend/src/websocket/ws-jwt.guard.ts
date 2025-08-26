import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: AuthenticatedSocket = context.switchToWs().getClient();
      
      // Check if user is already authenticated (from connection)
      if (client.userId) {
        return true;
      }

      // If not authenticated during connection, try to authenticate now
      const token = client.handshake.query.token as string || 
                   client.handshake.auth.token as string;

      if (!token) {
        return false;
      }

      const payload = await this.jwtService.verifyAsync(token);
      
      // Attach user info to socket
      client.userId = payload.sub;
      client.userEmail = payload.email;
      client.userRole = payload.role;

      return true;
    } catch (error) {
      return false;
    }
  }
}