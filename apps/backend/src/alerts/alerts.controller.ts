import { Controller, Get, Post, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiSecurity, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';

@ApiTags('Alerts')
@ApiSecurity('ApiKeyAuth')
@ApiSecurity('BearerAuth')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get alerts',
    description: 'Retrieve current alerts including low stock, expired items, and urgent notifications',
  })
  @ApiQuery({ name: 'type', required: false, enum: ['low-stock', 'out-of-stock', 'expired', 'forecast-warning', 'system'] })
  @ApiQuery({ name: 'severity', required: false, enum: ['high', 'medium', 'low'] })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 50 })
  @ApiResponse({ status: 200, description: 'Alerts retrieved successfully' })
  async getAlerts(
    @Query('type') type?: string,
    @Query('severity') severity?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 50;
      return await this.alertsService.findAll(type, severity, limitNum);
    } catch (error) {
      throw new HttpException(
        {
          error: 'Internal Server Error',
          message: 'Failed to retrieve alerts',
          details: error.message,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':alertId/dismiss')
  @ApiOperation({
    summary: 'Dismiss an alert',
    description: 'Mark an alert as dismissed',
  })
  @ApiParam({ name: 'alertId', description: 'Alert ID to dismiss' })
  @ApiResponse({ status: 200, description: 'Alert dismissed successfully' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  async dismissAlert(@Param('alertId') alertId: string) {
    try {
      const dismissed = await this.alertsService.dismissAlert(alertId);
      if (!dismissed) {
        throw new HttpException(
          {
            error: 'Not Found',
            message: 'Alert not found',
            code: HttpStatus.NOT_FOUND,
            timestamp: new Date().toISOString(),
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return { message: 'Alert dismissed successfully' };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        {
          error: 'Internal Server Error',
          message: 'Failed to dismiss alert',
          details: error.message,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}