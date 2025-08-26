import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete,
  Param, 
  Body, 
  Query, 
  UseGuards,
  NotFoundException,
  BadRequestException,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBearerAuth 
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { User } from '../common/dto/auth.dto';
import { 
  CreateOrderDto, 
  UpdateOrderDto, 
  Order,
  OrderStatus,
  OrderPriority,
  OrderSummary
} from '../common/dto/order.dto';

@ApiTags('Order Management')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders with optional filtering' })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiQuery({ name: 'priority', required: false, enum: OrderPriority })
  @ApiQuery({ name: 'supplier', required: false, description: 'Filter by supplier name' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Orders retrieved successfully',
    type: [Order]
  })
  async getAllOrders(
    @Query('status') status?: OrderStatus,
    @Query('priority') priority?: OrderPriority,
    @Query('supplier') supplier?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{
    data: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    message: string;
  }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    const result = await this.ordersService.getAllOrders(
      status,
      priority,
      supplier,
      pageNum,
      limitNum
    );

    return {
      data: result.orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        pages: result.pages,
        hasNext: pageNum < result.pages,
        hasPrev: pageNum > 1,
      },
      message: 'Orders retrieved successfully'
    };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get order management summary and statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Order summary retrieved successfully',
    type: OrderSummary
  })
  async getOrderSummary(): Promise<{
    data: OrderSummary;
    message: string;
  }> {
    const summary = await this.ordersService.getOrderSummary();
    return {
      data: summary,
      message: 'Order summary retrieved successfully'
    };
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get order statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Order statistics retrieved successfully'
  })
  async getOrderStatistics(): Promise<{
    data: {
      totalOrders: number;
      pendingOrders: number;
      completedOrders: number;
      cancelledOrders: number;
      totalRevenue: number;
      averageOrderValue: number;
      todayOrders: number;
      weekOrders: number;
      monthOrders: number;
    };
    message: string;
  }> {
    const summary = await this.ordersService.getOrderSummary();
    
    // Map the summary data to the expected statistics format
    // Note: The service doesn't track cancelled orders or date-based stats yet
    // These would need to be implemented in the service layer
    return {
      data: {
        totalOrders: summary.totalOrders || 0,
        pendingOrders: summary.pendingOrders || 0,
        completedOrders: summary.receivedOrders || 0,  // Using received as completed
        cancelledOrders: 0,  // Not tracked in current implementation
        totalRevenue: summary.totalOrderValue || 0,
        averageOrderValue: summary.averageOrderValue || 0,
        todayOrders: 0,  // Would need date filtering in service
        weekOrders: 0,   // Would need date filtering in service
        monthOrders: 0   // Would need date filtering in service
      },
      message: 'Order statistics retrieved successfully'
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details by ID' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Order details retrieved successfully',
    type: Order
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(@Param('id') orderId: string): Promise<{
    data: Order;
    message: string;
  }> {
    const order = await this.ordersService.getOrderById(orderId);
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return {
      data: order,
      message: 'Order retrieved successfully'
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new purchase order' })
  @ApiResponse({ 
    status: 201, 
    description: 'Order created successfully',
    type: Order
  })
  @ApiResponse({ status: 400, description: 'Invalid order data' })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: User
  ): Promise<{
    data: Order;
    message: string;
  }> {
    try {
      const order = await this.ordersService.createOrder(createOrderDto, user.id);
      return {
        data: order,
        message: `Order ${order.orderNumber} created successfully`
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order status and details' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Order updated successfully',
    type: Order
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 400, description: 'Invalid update data' })
  async updateOrder(
    @Param('id') orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() user: User
  ): Promise<{
    data: Order;
    message: string;
  }> {
    const updatedOrder = await this.ordersService.updateOrder(
      orderId, 
      updateOrderDto, 
      user.id
    );

    if (!updatedOrder) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    let message = 'Order updated successfully';
    if (updateOrderDto.status === OrderStatus.APPROVED) {
      message = `Order ${updatedOrder.orderNumber} approved successfully`;
    } else if (updateOrderDto.status === OrderStatus.RECEIVED) {
      message = `Order ${updatedOrder.orderNumber} marked as received`;
    }

    return {
      data: updatedOrder,
      message
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel/delete an order (only pending or cancelled orders)' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Order deleted successfully'
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete order in progress' })
  async deleteOrder(@Param('id') orderId: string): Promise<{
    message: string;
  }> {
    try {
      const deleted = await this.ordersService.deleteOrder(orderId);
      
      if (!deleted) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      return {
        message: 'Order deleted successfully'
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }
}