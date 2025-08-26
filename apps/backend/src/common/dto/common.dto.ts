import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, IsEnum, IsBoolean } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  @IsInt()
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  @IsInt()
  limit: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 150,
  })
  @IsInt()
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 8,
  })
  @IsInt()
  pages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  @IsBoolean()
  hasNext: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  @IsBoolean()
  hasPrev: boolean;
}

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

export class ProductQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by product name, SKU, or barcode',
    example: 'coffee',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by product category',
    example: 'Beverages',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter by supplier',
    example: 'Global Coffee Co.',
  })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'name',
    enum: ['name', 'sku', 'quantity', 'price', 'lastUpdated'],
    default: 'name',
  })
  @IsOptional()
  @IsEnum(['name', 'sku', 'quantity', 'price', 'lastUpdated'])
  sortBy?: string = 'name';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'asc',
    enum: ['asc', 'desc'],
    default: 'asc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string = 'asc';

  @ApiPropertyOptional({
    description: 'Filter products with low stock (below minimum threshold)',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  lowStock?: boolean;
}

export class ErrorDto {
  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request',
  })
  @IsString()
  error: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Invalid input parameters',
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    description: 'Additional error details',
    example: 'SKU field is required',
  })
  @IsOptional()
  @IsString()
  details?: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  @IsInt()
  code: number;

  @ApiProperty({
    description: 'Error timestamp',
    example: '2024-01-20T15:30:00Z',
  })
  @IsString()
  timestamp: string;
}

export class SuccessResponseDto<T> {
  @ApiProperty({
    description: 'Response data',
  })
  data: T;

  @ApiPropertyOptional({
    description: 'Success message',
    example: 'Operation completed successfully',
  })
  @IsOptional()
  @IsString()
  message?: string;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Response data array',
  })
  data: T[];

  @ApiProperty({
    description: 'Pagination information',
  })
  pagination: PaginationDto;

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  @IsOptional()
  meta?: any;
}