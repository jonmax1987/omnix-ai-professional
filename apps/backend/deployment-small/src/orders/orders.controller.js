"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const orders_service_1 = require("./orders.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const user_decorator_1 = require("../auth/decorators/user.decorator");
const auth_dto_1 = require("../common/dto/auth.dto");
const order_dto_1 = require("../common/dto/order.dto");
let OrdersController = class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async getAllOrders(status, priority, supplier, page, limit) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 20;
        const result = await this.ordersService.getAllOrders(status, priority, supplier, pageNum, limitNum);
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
    async getOrderSummary() {
        const summary = await this.ordersService.getOrderSummary();
        return {
            data: summary,
            message: 'Order summary retrieved successfully'
        };
    }
    async getOrderById(orderId) {
        const order = await this.ordersService.getOrderById(orderId);
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${orderId} not found`);
        }
        return {
            data: order,
            message: 'Order retrieved successfully'
        };
    }
    async createOrder(createOrderDto, user) {
        try {
            const order = await this.ordersService.createOrder(createOrderDto, user.id);
            return {
                data: order,
                message: `Order ${order.orderNumber} created successfully`
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async updateOrder(orderId, updateOrderDto, user) {
        const updatedOrder = await this.ordersService.updateOrder(orderId, updateOrderDto, user.id);
        if (!updatedOrder) {
            throw new common_1.NotFoundException(`Order with ID ${orderId} not found`);
        }
        let message = 'Order updated successfully';
        if (updateOrderDto.status === order_dto_1.OrderStatus.APPROVED) {
            message = `Order ${updatedOrder.orderNumber} approved successfully`;
        }
        else if (updateOrderDto.status === order_dto_1.OrderStatus.RECEIVED) {
            message = `Order ${updatedOrder.orderNumber} marked as received`;
        }
        return {
            data: updatedOrder,
            message
        };
    }
    async deleteOrder(orderId) {
        try {
            const deleted = await this.ordersService.deleteOrder(orderId);
            if (!deleted) {
                throw new common_1.NotFoundException(`Order with ID ${orderId} not found`);
            }
            return {
                message: 'Order deleted successfully'
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all orders with optional filtering' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: order_dto_1.OrderStatus }),
    (0, swagger_1.ApiQuery)({ name: 'priority', required: false, enum: order_dto_1.OrderPriority }),
    (0, swagger_1.ApiQuery)({ name: 'supplier', required: false, description: 'Filter by supplier name' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number (default: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page (default: 20)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Orders retrieved successfully',
        type: [order_dto_1.Order]
    }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('priority')),
    __param(2, (0, common_1.Query)('supplier')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getAllOrders", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order management summary and statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Order summary retrieved successfully',
        type: order_dto_1.OrderSummary
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order details by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Order details retrieved successfully',
        type: order_dto_1.Order
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new purchase order' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Order created successfully',
        type: order_dto_1.Order
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid order data' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_dto_1.CreateOrderDto,
        auth_dto_1.User]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update order status and details' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Order updated successfully',
        type: order_dto_1.Order
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid update data' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, order_dto_1.UpdateOrderDto,
        auth_dto_1.User]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateOrder", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel/delete an order (only pending or cancelled orders)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Order deleted successfully'
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot delete order in progress' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "deleteOrder", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiTags)('Order Management'),
    (0, common_1.Controller)('orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map