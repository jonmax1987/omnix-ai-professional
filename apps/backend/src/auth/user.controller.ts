import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/user.decorator';
import { UpdateProfileDto, UserProfile, User } from '../common/dto/auth.dto';

@ApiTags('User Management')
@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully',
    type: UserProfile
  })
  async getProfile(@CurrentUser() user: User): Promise<{
    data: UserProfile;
    message: string;
  }> {
    const userProfile = this.usersService.toUserProfile(user);
    return {
      data: userProfile,
      message: 'Profile retrieved successfully'
    };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile information' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile updated successfully',
    type: UserProfile
  })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto
  ): Promise<{
    data: UserProfile;
    message: string;
  }> {
    const updatedUser = await this.usersService.updateProfile(user.id, updateProfileDto);
    
    if (!updatedUser) {
      throw new Error('Failed to update profile');
    }

    const userProfile = this.usersService.toUserProfile(updatedUser);
    return {
      data: userProfile,
      message: 'Profile updated successfully'
    };
  }
}