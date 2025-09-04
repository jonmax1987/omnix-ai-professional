import { User, UserRole, UpdateProfileDto } from '../common/dto/auth.dto';
export declare class UsersService {
    private users;
    findOne(email: string): Promise<User | undefined>;
    findById(id: string): Promise<User | undefined>;
    validateUser(email: string, password: string): Promise<User | null>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User | null>;
    updateLastLogin(userId: string): Promise<void>;
    createUser(email: string, password: string, name: string, role?: UserRole): Promise<User>;
    toUserProfile(user: User): {
        id: string;
        email: string;
        name: string;
        role: UserRole;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        lastLoginAt?: string;
    };
}
