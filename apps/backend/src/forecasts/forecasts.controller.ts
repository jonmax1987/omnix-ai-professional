import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ForecastsService } from './forecasts.service';

@ApiTags('forecasts')
@Controller('forecasts')
export class ForecastsController {
  constructor(private readonly forecastsService: ForecastsService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get forecast metrics overview' })
  @ApiResponse({ status: 200, description: 'Returns forecast metrics' })
  async getMetrics() {
    return { data: await this.forecastsService.getMetrics() };
  }

  @Get()
  @ApiOperation({ summary: 'Get demand forecasts with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiQuery({ name: 'trend', required: false, enum: ['increasing', 'decreasing', 'stable'] })
  @ApiResponse({ status: 200, description: 'Returns paginated list of demand forecasts' })
  async getForecasts(@Query() query: any) {
    return await this.forecastsService.getForecasts(query);
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Get forecast for a specific product' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns demand forecast for specific product' })
  async getForecast(@Param('productId') productId: string, @Query('days') days?: number) {
    return { data: await this.forecastsService.getForecast(productId, days) };
  }
}