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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const auth_dto_1 = require("../common/dto/auth.dto");
const bcrypt = __importStar(require("bcryptjs"));
const uuid_1 = require("uuid");
let UsersService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var UsersService = _classThis = class {
        constructor() {
            this.users = [
                {
                    id: '1',
                    email: 'admin@omnix.ai',
                    passwordHash: '$2b$10$9djHvmN6iQW6ch1CFYPT1Ogt7XVctTee.SBAsRyD7PnnC91hAQQra', // password: admin123
                    name: 'Admin User',
                    role: auth_dto_1.UserRole.ADMIN,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: '2',
                    email: 'manager@omnix.ai',
                    passwordHash: '$2b$10$F/27b68iP4U2Gjd6zCfIqONMg46dRy/Ip/ChdrF1riY7QBhrUHxwi', // password: manager123
                    name: 'Store Manager',
                    role: auth_dto_1.UserRole.MANAGER,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: 'customer-001',
                    email: 'customer@omnix.ai',
                    passwordHash: '$2b$12$DVN8hsgG4Xm3p2t3ZsEo9upSsiFyzoRj.hVv71TeAbTw2fFTJGouG', // password: customer123
                    name: 'Sarah Johnson',
                    role: auth_dto_1.UserRole.CUSTOMER,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: 'customer-002',
                    email: 'john.customer@omnix.ai',
                    passwordHash: '$2b$12$DVN8hsgG4Xm3p2t3ZsEo9upSsiFyzoRj.hVv71TeAbTw2fFTJGouG', // password: customer123
                    name: 'John Smith',
                    role: auth_dto_1.UserRole.CUSTOMER,
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
    __setFunctionName(_classThis, "UsersService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UsersService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UsersService = _classThis;
})();
exports.UsersService = UsersService;
