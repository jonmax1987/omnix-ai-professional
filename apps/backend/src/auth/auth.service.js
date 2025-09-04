"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let AuthService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = _classThis = class {
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
    __setFunctionName(_classThis, "AuthService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthService = _classThis;
})();
exports.AuthService = AuthService;
