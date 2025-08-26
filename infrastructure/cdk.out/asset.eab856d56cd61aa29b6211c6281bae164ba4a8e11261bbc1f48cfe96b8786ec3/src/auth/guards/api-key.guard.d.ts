import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export declare class ApiKeyGuard implements CanActivate {
    private reflector;
    private readonly validApiKeys;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
