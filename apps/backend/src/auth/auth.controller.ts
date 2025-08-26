import { 
  Controller, 
  Post, 
  Get, 
  Patch, 
  Body, 
  UseGuards, 
  HttpCode, 
  HttpStatus,
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/user.decorator';
import { 
  LoginDto, 
  RefreshTokenDto, 
  UpdateProfileDto, 
  AuthResponse, 
  UserProfile,
  User
} from '../common/dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Successful login',
    type: AuthResponse
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@CurrentUser() user: User, @Body() loginDto: LoginDto): Promise<{
    data: AuthResponse;
    message: string;
  }> {
    const authResponse = await this.authService.login(user);
    return {
      data: authResponse,
      message: 'Login successful'
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully'
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<{
    data: { accessToken: string; refreshToken: string };
    message: string;
  }> {
    try {
      const tokens = await this.authService.refresh(refreshTokenDto.refreshToken);
      return {
        data: tokens,
        message: 'Token refreshed successfully'
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout - invalidate refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiBearerAuth()
  async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<{
    message: string;
  }> {
    await this.authService.logout(refreshTokenDto.refreshToken);
    return {
      message: 'Logout successful'
    };
  }

}