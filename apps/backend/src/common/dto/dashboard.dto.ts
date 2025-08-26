import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsInt, IsEnum, IsOptional } from 'class-validator';

export class DashboardSummaryDto {
  @ApiProperty({
    description: 'Total inventory value',
    example: 15432.50,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  totalInventoryValue: number;

  @ApiProperty({
    description: 'Total number of items in stock',
    example: 1250,
  })
  @IsInt()
  totalItems: number;

  @ApiProperty({
    description: 'Number of low stock items',
    example: 5,
  })
  @IsInt()
  lowStockItems: number;

  @ApiProperty({
    description: 'Number of out of stock items',
    example: 2,
  })
  @IsInt()
  outOfStockItems: number;

  @ApiProperty({
    description: 'Number of expired items',
    example: 1,
  })
  @IsInt()
  expiredItems: number;

  @ApiProperty({
    description: 'Number of active alerts',
    example: 8,
  })
  @IsInt()
  activeAlerts: number;

  @ApiProperty({
    description: 'Category breakdown',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        category: { type: 'string' },
        itemCount: { type: 'integer' },
        value: { type: 'number' },
      },
    },
  })
  categoryBreakdown: Array<{
    category: string;
    itemCount: number;
    value: number;
  }>;

  @ApiProperty({
    description: 'Top categories by value percentage',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        category: { type: 'string' },
        percentage: { type: 'number' },
      },
    },
  })
  topCategories: Array<{
    category: string;
    percentage: number;
  }>;
}

export class DashboardQueryDto {
  @ApiPropertyOptional({
    description: 'Time range for data aggregation',
    example: 'month',
    enum: ['today', 'week', 'month', 'quarter', 'year'],
    default: 'month',
  })
  @IsOptional()
  @IsEnum(['today', 'week', 'month', 'quarter', 'year'])
  timeRange?: string = 'month';
}

export class InventoryGraphQueryDto {
  @ApiPropertyOptional({
    description: 'Time range for the graph',
    example: 'month',
    enum: ['week', 'month', 'quarter', 'year'],
    default: 'month',
  })
  @IsOptional()
  @IsEnum(['week', 'month', 'quarter', 'year'])
  timeRange?: string = 'month';

  @ApiPropertyOptional({
    description: 'Filter by specific category',
    example: 'Beverages',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Data point granularity',
    example: 'daily',
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily',
  })
  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly'])
  granularity?: string = 'daily';
}

export class InventoryGraphDataDto {
  @ApiProperty({
    description: 'Time range of the data',
    example: 'month',
  })
  @IsString()
  timeRange: string;

  @ApiProperty({
    description: 'Data granularity',
    example: 'daily',
  })
  @IsString()
  granularity: string;

  @ApiProperty({
    description: 'Graph data points',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        timestamp: { type: 'string', format: 'date-time' },
        inventoryValue: { type: 'number' },
        itemCount: { type: 'integer' },
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              value: { type: 'number' },
              count: { type: 'integer' },
            },
          },
        },
      },
    },
  })
  dataPoints: Array<{
    timestamp: string;
    inventoryValue: number;
    itemCount: number;
    categories: Array<{
      category: string;
      value: number;
      count: number;
    }>;
  }>;
}