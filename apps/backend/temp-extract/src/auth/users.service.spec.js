"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const users_service_1 = require("./users.service");
const jwt_1 = require("@nestjs/jwt");
describe('UsersService', () => {
    let service;
    let jwtService;
    const mockJwtService = {
        sign: jest.fn(() => 'mock-jwt-token'),
        verify: jest.fn(() => ({ sub: '1', email: 'test@example.com' })),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                users_service_1.UsersService,
                {
                    provide: jwt_1.JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();
        service = module.get(users_service_1.UsersService);
        jwtService = module.get(jwt_1.JwtService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('validateUser', () => {
        it('should return user data when credentials are valid', async () => {
            const email = 'manager@omnix.ai';
            const password = 'password123';
            const result = await service.validateUser(email, password);
            expect(result).toBeDefined();
            expect(result.email).toBe(email);
            expect(result.role).toBe('manager');
        });
        it('should return null when credentials are invalid', async () => {
            const result = await service.validateUser('invalid@email.com', 'wrongpassword');
            expect(result).toBeNull();
        });
    });
    describe('toUserProfile', () => {
        it('should return user profile without password hash', async () => {
            const user = {
                id: '1',
                email: 'manager@omnix.ai',
                role: 'manager',
                name: 'Test Manager',
                passwordHash: 'hashed-password',
                isActive: true,
                createdAt: '2023-01-01',
                updatedAt: '2023-01-01'
            };
            const result = service.toUserProfile(user);
            expect(result).toBeDefined();
            expect(result.passwordHash).toBeUndefined();
            expect(result.id).toBe(user.id);
            expect(result.email).toBe(user.email);
        });
    });
    describe('findById', () => {
        it('should return user by ID', async () => {
            const userId = '1';
            const result = await service.findById(userId);
            expect(result).toBeDefined();
            expect(result.id).toBe(userId);
            expect(result.email).toBe('admin@omnix.ai');
        });
        it('should return undefined for non-existent user', async () => {
            const result = await service.findById('non-existent');
            expect(result).toBeUndefined();
        });
    });
});
//# sourceMappingURL=users.service.spec.js.map