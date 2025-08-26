import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly validApiKeys = [
    process.env.API_KEY_1 || 'omnix-api-key-development-2024',
    process.env.API_KEY_2 || 'omnix-api-key-testing-2024',
    process.env.API_KEY_3 || 'omnix-api-key-production-2024',
  ];

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if API key validation is disabled for this route
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }

    // Check if the route already has JWT authentication
    const requiresAuth = this.reflector.getAllAndOverride<boolean>('requiresAuth', [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    // If JWT auth is present and valid, skip API key check
    if (requiresAuth && request.user) {
      return true;
    }

    // Otherwise, require valid API key
    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    if (!this.validApiKeys.includes(apiKey)) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}