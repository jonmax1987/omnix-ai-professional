export declare enum UserRole {
    ADMIN = "admin",
    MANAGER = "manager",
    ANALYST = "analyst"
}
export declare class UserProfile {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    lastLoginAt?: string;
}
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class UpdateProfileDto {
    name?: string;
    email?: string;
    role?: UserRole;
}
export declare class AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: UserProfile;
}
