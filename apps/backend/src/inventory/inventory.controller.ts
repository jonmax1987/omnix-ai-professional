import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Body, 
  Query, 
  UseGuards,
  NotFoundException,
  BadRequestException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { User } from '../common/dto/auth.dto';
import { 
  StockAdjustmentDto, 
  InventoryHistory, 
  InventoryItem, 
  InventoryOverview 
} from '../common/dto/inventory.dto';

@ApiTags('Inventory Management')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get comprehensive inventory overview' })
  @ApiResponse({ 
    status: 200, 
    description: 'Inventory overview retrieved successfully',
    type: InventoryOverview
  })
  async getInventoryOverview(): Promise<{
    data: InventoryOverview;
    message: string;
  }> {
    const overview = await this.inventoryService.getInventoryOverview();
    return {
      data: overview,
      message: 'Inventory overview retrieved successfully'
    };
  }

  @Get('items')
  @ApiOperation({ summary: 'Get all inventory items with detailed information' })
  @ApiResponse({ 
    status: 200, 
    description: 'Inventory items retrieved successfully'
  })
  async getAllInventoryItems(): Promise<{
    data: InventoryItem[];
    meta: {
      totalItems: number;
      lowStockItems: number;
      outOfStockItems: number;
    };
    message: string;
  }> {
    const items = await this.inventoryService.getAllInventoryItems();
    
    const meta = {
      totalItems: items.length,
      lowStockItems: items.filter(item => item.stockStatus === 'low' || item.stockStatus === 'critical').length,
      outOfStockItems: items.filter(item => item.currentStock === 0).length,
    };

    return {
      data: items,
      meta,
      message: 'Inventory items retrieved successfully'
    };
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Get detailed inventory information for a specific product' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Product inventory details retrieved successfully',
    type: InventoryItem
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductInventory(@Param('productId') productId: string): Promise<{
    data: InventoryItem;
    message: string;
  }> {
    const inventory = await this.inventoryService.getProductInventory(productId);
    
    if (!inventory) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return {
      data: inventory,
      message: 'Product inventory retrieved successfully'
    };
  }

  @Post(':productId/adjust')
  @ApiOperation({ summary: 'Adjust stock levels for a specific product' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Stock adjustment completed successfully',
    type: InventoryItem
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'Invalid adjustment parameters' })
  async adjustStock(
    @Param('productId') productId: string,
    @Body() adjustmentDto: StockAdjustmentDto,
    @CurrentUser() user: User
  ): Promise<{
    data: InventoryItem;
    message: string;
  }> {
    try {
      const updatedInventory = await this.inventoryService.adjustStock(
        productId, 
        adjustmentDto, 
        user.id
      );

      if (!updatedInventory) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      return {
        data: updatedInventory,
        message: `Stock adjustment completed successfully. ${adjustmentDto.type} of ${adjustmentDto.quantity} units.`
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid adjustment parameters: ' + error.message);
    }
  }

  @Get(':productId/history')
  @ApiOperation({ summary: 'Get inventory adjustment history for a specific product' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of history records to return (default: 50)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Inventory history retrieved successfully'
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getInventoryHistory(
    @Param('productId') productId: string,
    @Query('limit') limit?: string
  ): Promise<{
    data: InventoryHistory[];
    meta: {
      productId: string;
      totalRecords: number;
      limit: number;
    };
    message: string;
  }> {
    // Verify product exists
    const inventory = await this.inventoryService.getProductInventory(productId);
    if (!inventory) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const limitNum = limit ? parseInt(limit, 10) : 50;
    const history = await this.inventoryService.getInventoryHistory(productId, limitNum);

    return {
      data: history,
      meta: {
        productId,
        totalRecords: history.length,
        limit: limitNum,
      },
      message: 'Inventory history retrieved successfully'
    };
  }
}