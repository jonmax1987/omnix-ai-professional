import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { User, AuthResponse } from '../common/dto/auth.dto';
interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}
export declare class AuthService {
    private usersService;
    private jwtService;
    private refreshTokens;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<User | null>;
    login(user: User): Promise<AuthResponse>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<void>;
    private generateRefreshToken;
    validateJwtPayload(payload: JwtPayload): Promise<User | null>;
}
export {};
