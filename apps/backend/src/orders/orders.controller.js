"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const order_dto_1 = require("../common/dto/order.dto");
let OrdersController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('Order Management'), (0, common_1.Controller)('orders'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiBearerAuth)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getAllOrders_decorators;
    let _getOrderSummary_decorators;
    let _getOrderStatistics_decorators;
    let _getOrderById_decorators;
    let _createOrder_decorators;
    let _updateOrder_decorators;
    let _deleteOrder_decorators;
    var OrdersController = _classThis = class {
        constructor(ordersService) {
            this.ordersService = (__runInitializers(this, _instanceExtraInitializers), ordersService);
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
        async getOrderStatistics() {
            const summary = await this.ordersService.getOrderSummary();
            // Map the summary data to the expected statistics format
            // Note: The service doesn't track cancelled orders or date-based stats yet
            // These would need to be implemented in the service layer
            return {
                data: {
                    totalOrders: summary.totalOrders || 0,
                    pendingOrders: summary.pendingOrders || 0,
                    completedOrders: summary.receivedOrders || 0, // Using received as completed
                    cancelledOrders: 0, // Not tracked in current implementation
                    totalRevenue: summary.totalOrderValue || 0,
                    averageOrderValue: summary.averageOrderValue || 0,
                    todayOrders: 0, // Would need date filtering in service
                    weekOrders: 0, // Would need date filtering in service
                    monthOrders: 0 // Would need date filtering in service
                },
                message: 'Order statistics retrieved successfully'
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
    __setFunctionName(_classThis, "OrdersController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getAllOrders_decorators = [(0, common_1.Get)(), (0, swagger_1.ApiOperation)({ summary: 'Get all orders with optional filtering' }), (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: order_dto_1.OrderStatus }), (0, swagger_1.ApiQuery)({ name: 'priority', required: false, enum: order_dto_1.OrderPriority }), (0, swagger_1.ApiQuery)({ name: 'supplier', required: false, description: 'Filter by supplier name' }), (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number (default: 1)' }), (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page (default: 20)' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Orders retrieved successfully',
                type: [order_dto_1.Order]
            })];
        _getOrderSummary_decorators = [(0, common_1.Get)('summary'), (0, swagger_1.ApiOperation)({ summary: 'Get order management summary and statistics' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Order summary retrieved successfully',
                type: order_dto_1.OrderSummary
            })];
        _getOrderStatistics_decorators = [(0, common_1.Get)('statistics'), (0, swagger_1.ApiOperation)({ summary: 'Get order statistics' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Order statistics retrieved successfully'
            })];
        _getOrderById_decorators = [(0, common_1.Get)(':id'), (0, swagger_1.ApiOperation)({ summary: 'Get order details by ID' }), (0, swagger_1.ApiParam)({ name: 'id', description: 'Order UUID' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Order details retrieved successfully',
                type: order_dto_1.Order
            }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' })];
        _createOrder_decorators = [(0, common_1.Post)(), (0, swagger_1.ApiOperation)({ summary: 'Create a new purchase order' }), (0, swagger_1.ApiResponse)({
                status: 201,
                description: 'Order created successfully',
                type: order_dto_1.Order
            }), (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid order data' })];
        _updateOrder_decorators = [(0, common_1.Patch)(':id'), (0, swagger_1.ApiOperation)({ summary: 'Update order status and details' }), (0, swagger_1.ApiParam)({ name: 'id', description: 'Order UUID' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Order updated successfully',
                type: order_dto_1.Order
            }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }), (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid update data' })];
        _deleteOrder_decorators = [(0, common_1.Delete)(':id'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Cancel/delete an order (only pending or cancelled orders)' }), (0, swagger_1.ApiParam)({ name: 'id', description: 'Order UUID' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Order deleted successfully'
            }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }), (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot delete order in progress' })];
        __esDecorate(_classThis, null, _getAllOrders_decorators, { kind: "method", name: "getAllOrders", static: false, private: false, access: { has: obj => "getAllOrders" in obj, get: obj => obj.getAllOrders }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getOrderSummary_decorators, { kind: "method", name: "getOrderSummary", static: false, private: false, access: { has: obj => "getOrderSummary" in obj, get: obj => obj.getOrderSummary }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getOrderStatistics_decorators, { kind: "method", name: "getOrderStatistics", static: false, private: false, access: { has: obj => "getOrderStatistics" in obj, get: obj => obj.getOrderStatistics }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getOrderById_decorators, { kind: "method", name: "getOrderById", static: false, private: false, access: { has: obj => "getOrderById" in obj, get: obj => obj.getOrderById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createOrder_decorators, { kind: "method", name: "createOrder", static: false, private: false, access: { has: obj => "createOrder" in obj, get: obj => obj.createOrder }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateOrder_decorators, { kind: "method", name: "updateOrder", static: false, private: false, access: { has: obj => "updateOrder" in obj, get: obj => obj.updateOrder }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteOrder_decorators, { kind: "method", name: "deleteOrder", static: false, private: false, access: { has: obj => "deleteOrder" in obj, get: obj => obj.deleteOrder }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OrdersController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OrdersController = _classThis;
})();
exports.OrdersController = OrdersController;
