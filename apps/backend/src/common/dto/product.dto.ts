import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  IsUUID,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';

export class ProductDto {
  @ApiProperty({
    description: 'Product unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Premium Coffee Beans',
    maxLength: 255,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Stock Keeping Unit',
    example: 'PCB-001',
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  sku: string;

  @ApiPropertyOptional({
    description: 'Product barcode',
    example: '1234567890123',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  barcode?: string;

  @ApiProperty({
    description: 'Product category',
    example: 'Beverages',
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  category: string;

  @ApiProperty({
    description: 'Current stock quantity',
    example: 150,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiProperty({
    description: 'Minimum stock threshold for alerts',
    example: 20,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  minThreshold: number;

  @ApiProperty({
    description: 'Product selling price',
    example: 24.99,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Product cost price',
    example: 18.50,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cost?: number;

  @ApiProperty({
    description: 'Product supplier',
    example: 'Global Coffee Co.',
    maxLength: 255,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  supplier: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'High-quality arabica coffee beans sourced from Colombia',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Unit of measurement',
    example: 'kg',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional({
    description: 'Product expiration date',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiPropertyOptional({
    description: 'Storage location',
    example: 'Warehouse A, Shelf 3',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @ApiProperty({
    description: 'Product creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDateString()
  createdAt: string;

  @ApiProperty({
    description: 'Product last update timestamp',
    example: '2024-01-20T14:45:00Z',
  })
  @IsDateString()
  updatedAt: string;

  @ApiProperty({
    description: 'Product last update timestamp (alias)',
    example: '2024-01-20T14:45:00Z',
  })
  @IsDateString()
  lastUpdated: string;
}

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Premium Coffee Beans',
    maxLength: 255,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Stock Keeping Unit',
    example: 'PCB-001',
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  sku: string;

  @ApiPropertyOptional({
    description: 'Product barcode',
    example: '1234567890123',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  barcode?: string;

  @ApiProperty({
    description: 'Product category',
    example: 'Beverages',
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  category: string;

  @ApiProperty({
    description: 'Initial stock quantity',
    example: 150,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiProperty({
    description: 'Minimum stock threshold for alerts',
    example: 20,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  minThreshold: number;

  @ApiProperty({
    description: 'Product selling price',
    example: 24.99,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Product cost price',
    example: 18.50,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cost?: number;

  @ApiProperty({
    description: 'Product supplier',
    example: 'Global Coffee Co.',
    maxLength: 255,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  supplier: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'High-quality arabica coffee beans sourced from Colombia',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Unit of measurement',
    example: 'kg',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional({
    description: 'Product expiration date',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiPropertyOptional({
    description: 'Storage location',
    example: 'Warehouse A, Shelf 3',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Product name',
    example: 'Premium Coffee Beans',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Product barcode',
    example: '1234567890123',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Product category',
    example: 'Beverages',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({
    description: 'Stock quantity',
    example: 150,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Minimum stock threshold for alerts',
    example: 20,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  minThreshold?: number;

  @ApiPropertyOptional({
    description: 'Product selling price',
    example: 24.99,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    description: 'Product cost price',
    example: 18.50,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cost?: number;

  @ApiPropertyOptional({
    description: 'Product supplier',
    example: 'Global Coffee Co.',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  supplier?: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'High-quality arabica coffee beans sourced from Colombia',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Unit of measurement',
    example: 'kg',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional({
    description: 'Product expiration date',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiPropertyOptional({
    description: 'Storage location',
    example: 'Warehouse A, Shelf 3',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;
}