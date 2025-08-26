"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("./users.service");
const uuid_1 = require("uuid");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.refreshTokens = new Map();
    }
    async validateUser(email, password) {
        return this.usersService.validateUser(email, password);
    }
    async login(user) {
        const payload = {
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
    async refresh(refreshToken) {
        const tokenData = this.refreshTokens.get(refreshToken);
        if (!tokenData) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const user = await this.usersService.findById(tokenData.userId);
        if (!user) {
            this.refreshTokens.delete(refreshToken);
            throw new common_1.UnauthorizedException('User not found');
        }
        const tokenAge = Date.now() - new Date(tokenData.createdAt).getTime();
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
        if (tokenAge > sevenDaysInMs) {
            this.refreshTokens.delete(refreshToken);
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        this.refreshTokens.delete(refreshToken);
        const payload = {
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
    async logout(refreshToken) {
        this.refreshTokens.delete(refreshToken);
    }
    generateRefreshToken(userId) {
        const tokenId = (0, uuid_1.v4)();
        const token = `${userId}.${tokenId}.${Date.now()}`;
        this.refreshTokens.set(token, {
            userId,
            tokenId,
            createdAt: new Date().toISOString(),
        });
        return token;
    }
    async validateJwtPayload(payload) {
        return this.usersService.findById(payload.sub);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map