import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import {
  DashboardSummaryDto,
  DashboardQueryDto,
  InventoryGraphQueryDto,
  InventoryGraphDataDto,
} from '@/common/dto/dashboard.dto';
import { SuccessResponseDto, ErrorDto } from '@/common/dto/common.dto';

@ApiTags('Dashboard')
@ApiSecurity('ApiKeyAuth')
@ApiSecurity('BearerAuth')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Get dashboard summary',
    description:
      'Retrieve key metrics for the dashboard including total inventory value, item counts, and category breakdown',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard summary retrieved successfully',
    type: SuccessResponseDto<DashboardSummaryDto>,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
    type: ErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
    type: ErrorDto,
  })
  async getSummary(@Query() query: DashboardQueryDto) {
    try {
      const data = await this.dashboardService.getSummary(query);
      return { data };
    } catch (error) {
      throw new HttpException(
        {
          error: 'Internal Server Error',
          message: 'Failed to retrieve dashboard summary',
          details: error.message,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('inventory-graph')
  @ApiOperation({
    summary: 'Get inventory graph data',
    description: 'Retrieve time-series data for inventory value and item counts',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory graph data retrieved successfully',
    type: SuccessResponseDto<InventoryGraphDataDto>,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
    type: ErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
    type: ErrorDto,
  })
  async getInventoryGraph(@Query() query: InventoryGraphQueryDto) {
    try {
      const data = await this.dashboardService.getInventoryGraphData(query);
      return { data };
    } catch (error) {
      throw new HttpException(
        {
          error: 'Internal Server Error',
          message: 'Failed to retrieve inventory graph data',
          details: error.message,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}