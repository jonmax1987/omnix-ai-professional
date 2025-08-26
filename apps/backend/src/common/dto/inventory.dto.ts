import { IsNumber, IsString, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AdjustmentType {
  INCREASE = 'increase',
  DECREASE = 'decrease',
  SET = 'set',
}

export enum AdjustmentReason {
  RECEIVED_SHIPMENT = 'received_shipment',
  SOLD = 'sold',
  DAMAGED = 'damaged',
  EXPIRED = 'expired',
  THEFT = 'theft',
  INVENTORY_COUNT = 'inventory_count',
  MANUAL_ADJUSTMENT = 'manual_adjustment',
  TRANSFER = 'transfer',
}

export class StockAdjustmentDto {
  @ApiProperty({ example: 50, description: 'Quantity to adjust' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ enum: AdjustmentType, example: AdjustmentType.INCREASE })
  @IsEnum(AdjustmentType)
  type: AdjustmentType;

  @ApiProperty({ enum: AdjustmentReason, example: AdjustmentReason.RECEIVED_SHIPMENT })
  @IsEnum(AdjustmentReason)
  reason: AdjustmentReason;

  @ApiPropertyOptional({ example: 'Received new shipment from supplier' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class InventoryHistory {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  previousQuantity: number;

  @ApiProperty()
  newQuantity: number;

  @ApiProperty()
  adjustmentQuantity: number;

  @ApiProperty({ enum: AdjustmentType })
  adjustmentType: AdjustmentType;

  @ApiProperty({ enum: AdjustmentReason })
  reason: AdjustmentReason;

  @ApiProperty()
  notes?: string;

  @ApiProperty()
  adjustedBy: string; // User ID who made the adjustment

  @ApiProperty()
  adjustedAt: string;
}

export class InventoryItem {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  currentStock: number;

  @ApiProperty()
  minThreshold: number;

  @ApiProperty()
  maxCapacity?: number;

  @ApiProperty()
  reservedStock: number;

  @ApiProperty()
  availableStock: number;

  @ApiProperty()
  stockValue: number;

  @ApiProperty()
  lastMovement?: string;

  @ApiProperty()
  stockStatus: 'critical' | 'low' | 'normal' | 'overstocked';

  @ApiProperty()
  location?: string;

  @ApiProperty()
  supplier: string;

  @ApiProperty()
  updatedAt: string;
}

export class InventoryOverview {
  @ApiProperty()
  totalProducts: number;

  @ApiProperty()
  totalStockValue: number;

  @ApiProperty()
  lowStockProducts: number;

  @ApiProperty()
  outOfStockProducts: number;

  @ApiProperty()
  overstockedProducts: number;

  @ApiProperty()
  recentMovements: number;

  @ApiProperty()
  categoryBreakdown: Array<{
    category: string;
    productCount: number;
    stockValue: number;
    averageStockLevel: number;
  }>;

  @ApiProperty()
  locationBreakdown?: Array<{
    location: string;
    productCount: number;
    stockValue: number;
  }>;
}