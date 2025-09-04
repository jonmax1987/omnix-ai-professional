import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CoreWebVitalsDto {
  @ApiProperty({
    description: 'Largest Contentful Paint in milliseconds',
    example: 2500,
  })
  @IsNumber()
  lcp: number;

  @ApiProperty({
    description: 'First Input Delay in milliseconds',
    example: 100,
  })
  @IsNumber()
  fid: number;

  @ApiProperty({
    description: 'Cumulative Layout Shift score',
    example: 0.1,
  })
  @IsNumber()
  cls: number;

  @ApiPropertyOptional({
    description: 'First Contentful Paint in milliseconds',
    example: 1800,
  })
  @IsOptional()
  @IsNumber()
  fcp?: number;

  @ApiPropertyOptional({
    description: 'Time to Interactive in milliseconds',
    example: 3200,
  })
  @IsOptional()
  @IsNumber()
  tti?: number;
}

export class PerformanceMetricsDto {
  @ApiProperty({
    description: 'Core Web Vitals metrics',
    type: CoreWebVitalsDto,
  })
  @ValidateNested()
  @Type(() => CoreWebVitalsDto)
  metrics: CoreWebVitalsDto;

  @ApiProperty({
    description: 'Timestamp when metrics were collected',
    example: '2024-01-20T15:30:00.000Z',
  })
  @IsString()
  timestamp: string;

  @ApiPropertyOptional({
    description: 'User ID if available',
    example: 'user_123',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Session ID for grouping metrics',
    example: 'session_abc123',
  })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({
    description: 'Page URL where metrics were collected',
    example: '/dashboard',
  })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({
    description: 'User agent information',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class PerformanceResponseDto {
  @ApiProperty({
    description: 'Whether the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Performance metrics recorded successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Timestamp of the response',
    example: '2024-01-20T15:30:00.000Z',
  })
  timestamp: string;

  @ApiPropertyOptional({
    description: 'Unique ID for the recorded metrics',
    example: 'metrics_1705756200000_abc123def',
  })
  @IsOptional()
  metricsId?: string;
}