"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const auth_dto_1 = require("../common/dto/auth.dto");
const bcrypt = __importStar(require("bcryptjs"));
const uuid_1 = require("uuid");
let UsersService = class UsersService {
    constructor() {
        this.users = [
            {
                id: '1',
                email: 'admin@omnix.ai',
                passwordHash: '$2b$10$9djHvmN6iQW6ch1CFYPT1Ogt7XVctTee.SBAsRyD7PnnC91hAQQra',
                name: 'Admin User',
                role: auth_dto_1.UserRole.ADMIN,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: '2',
                email: 'manager@omnix.ai',
                passwordHash: '$2b$10$F/27b68iP4U2Gjd6zCfIqONMg46dRy/Ip/ChdrF1riY7QBhrUHxwi',
                name: 'Store Manager',
                role: auth_dto_1.UserRole.MANAGER,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ];
    }
    async findOne(email) {
        return this.users.find(user => user.email === email && user.isActive);
    }
    async findById(id) {
        return this.users.find(user => user.id === id && user.isActive);
    }
    async validateUser(email, password) {
        const user = await this.findOne(email);
        if (user && await bcrypt.compare(password, user.passwordHash)) {
            return user;
        }
        return null;
    }
    async updateProfile(userId, updateProfileDto) {
        const userIndex = this.users.findIndex(user => user.id === userId);
        if (userIndex === -1) {
            return null;
        }
        const user = this.users[userIndex];
        this.users[userIndex] = {
            ...user,
            ...updateProfileDto,
            updatedAt: new Date().toISOString(),
        };
        return this.users[userIndex];
    }
    async updateLastLogin(userId) {
        const userIndex = this.users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
            this.users[userIndex].lastLoginAt = new Date().toISOString();
            this.users[userIndex].updatedAt = new Date().toISOString();
        }
    }
    async createUser(email, password, name, role = auth_dto_1.UserRole.ANALYST) {
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = {
            id: (0, uuid_1.v4)(),
            email,
            passwordHash,
            name,
            role,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.users.push(newUser);
        return newUser;
    }
    toUserProfile(user) {
        const { passwordHash, ...userProfile } = user;
        return userProfile;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)()
], UsersService);
//# sourceMappingURL=users.service.js.map