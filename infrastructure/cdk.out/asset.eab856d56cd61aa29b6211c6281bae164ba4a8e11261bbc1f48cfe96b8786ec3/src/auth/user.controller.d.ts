import { UsersService } from './users.service';
import { UpdateProfileDto, UserProfile, User } from '../common/dto/auth.dto';
export declare class UserController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(user: User): Promise<{
        data: UserProfile;
        message: string;
    }>;
    updateProfile(user: User, updateProfileDto: UpdateProfileDto): Promise<{
        data: UserProfile;
        message: string;
    }>;
}
