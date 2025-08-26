import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { LoginDto, RefreshTokenDto, AuthResponse, User } from '../common/dto/auth.dto';
export declare class AuthController {
    private authService;
    private usersService;
    constructor(authService: AuthService, usersService: UsersService);
    login(user: User, loginDto: LoginDto): Promise<{
        data: AuthResponse;
        message: string;
    }>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
        data: {
            accessToken: string;
            refreshToken: string;
        };
        message: string;
    }>;
    logout(refreshTokenDto: RefreshTokenDto): Promise<{
        message: string;
    }>;
}
