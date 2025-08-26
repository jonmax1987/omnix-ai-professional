import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { User, AuthResponse } from '../common/dto/auth.dto';
import { v4 as uuidv4 } from 'uuid';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

interface RefreshTokenData {
  userId: string;
  tokenId: string;
  createdAt: string;
}

@Injectable()
export class AuthService {
  private refreshTokens: Map<string, RefreshTokenData> = new Map();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    return this.usersService.validateUser(email, password);
  }

  async login(user: User): Promise<AuthResponse> {
    const payload: JwtPayload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken(user.id);

    await this.usersService.updateLastLogin(user.id);

    return {
      accessToken,
      refreshToken,
      user: this.usersService.toUserProfile(user),
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenData = this.refreshTokens.get(refreshToken);
    if (!tokenData) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(tokenData.userId);
    if (!user) {
      this.refreshTokens.delete(refreshToken);
      throw new UnauthorizedException('User not found');
    }

    const tokenAge = Date.now() - new Date(tokenData.createdAt).getTime();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

    if (tokenAge > sevenDaysInMs) {
      this.refreshTokens.delete(refreshToken);
      throw new UnauthorizedException('Refresh token expired');
    }

    this.refreshTokens.delete(refreshToken);

    const payload: JwtPayload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };

    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = this.generateRefreshToken(user.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    this.refreshTokens.delete(refreshToken);
  }

  private generateRefreshToken(userId: string): string {
    const tokenId = uuidv4();
    const token = `${userId}.${tokenId}.${Date.now()}`;
    
    this.refreshTokens.set(token, {
      userId,
      tokenId,
      createdAt: new Date().toISOString(),
    });

    return token;
  }

  async validateJwtPayload(payload: JwtPayload): Promise<User | null> {
    return this.usersService.findById(payload.sub);
  }
}