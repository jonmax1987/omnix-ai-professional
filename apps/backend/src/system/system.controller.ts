import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SystemService } from './system.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { HealthCheck, SystemStatus, SystemMetrics } from '../common/dto/system.dto';

@ApiTags('System Monitoring')
@Controller('system')
export class SystemController {
  constructor(private systemService: SystemService) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'System health check endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'System health status',
    type: HealthCheck
  })
  async getHealthCheck(): Promise<HealthCheck> {
    return this.systemService.getHealthCheck();
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detailed system status and service information' })
  @ApiResponse({ 
    status: 200, 
    description: 'System status retrieved successfully',
    type: SystemStatus
  })
  async getSystemStatus(): Promise<{
    data: SystemStatus;
    message: string;
  }> {
    const status = await this.systemService.getSystemStatus();
    return {
      data: status,
      message: 'System status retrieved successfully'
    };
  }

  @Get('metrics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Comprehensive system metrics and performance data' })
  @ApiResponse({ 
    status: 200, 
    description: 'System metrics retrieved successfully',
    type: SystemMetrics
  })
  async getSystemMetrics(): Promise<{
    data: SystemMetrics;
    message: string;
  }> {
    const metrics = await this.systemService.getSystemMetrics();
    return {
      data: metrics,
      message: 'System metrics retrieved successfully'
    };
  }
}