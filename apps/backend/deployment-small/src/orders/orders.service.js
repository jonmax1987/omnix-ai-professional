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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const order_dto_1 = require("../common/dto/order.dto");
const uuid_1 = require("uuid");
let OrdersService = class OrdersService {
    constructor() {
        this.orders = [];
        this.orderCounter = 1000;
        this.mockProducts = [
            {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Premium Coffee Beans',
                sku: 'PCB-001',
                price: 24.99,
            },
            {
                id: '223e4567-e89b-12d3-a456-426614174001',
                name: 'Organic Green Tea',
                sku: 'OGT-002',
                price: 12.99,
            },
            {
                id: '323e4567-e89b-12d3-a456-426614174002',
                name: 'Whole Wheat Flour',
                sku: 'WWF-003',
                price: 8.99,
            },
        ];
        this.initializeMockOrders();
    }
    initializeMockOrders() {
        const mockOrder1 = {
            id: (0, uuid_1.v4)(),
            orderNumber: `ORD-${this.orderCounter++}`,
            supplier: 'Global Coffee Co.',
            items: [
                {
                    productId: '123e4567-e89b-12d3-a456-426614174000',
                    productName: 'Premium Coffee Beans',
                    sku: 'PCB-001',
                    quantity: 100,
                    unitPrice: 24.99,
                    totalPrice: 2499.00,
                },
            ],
            totalItems: 100,
            totalAmount: 2499.00,
            status: order_dto_1.OrderStatus.PENDING,
            priority: order_dto_1.OrderPriority.HIGH,
            createdBy: '1',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
            expectedDeliveryDate: new Date(Date.now() + 604800000).toISOString(),
            notes: 'Urgent restock needed',
        };
        const mockOrder2 = {
            id: (0, uuid_1.v4)(),
            orderNumber: `ORD-${this.orderCounter++}`,
            supplier: 'Organic Tea Ltd.',
            items: [
                {
                    productId: '223e4567-e89b-12d3-a456-426614174001',
                    productName: 'Organic Green Tea',
                    sku: 'OGT-002',
                    quantity: 50,
                    unitPrice: 12.99,
                    totalPrice: 649.50,
                },
            ],
            totalItems: 50,
            totalAmount: 649.50,
            status: order_dto_1.OrderStatus.APPROVED,
            priority: order_dto_1.OrderPriority.MEDIUM,
            createdBy: '1',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
            expectedDeliveryDate: new Date(Date.now() + 1209600000).toISOString(),
            approvedBy: '1',
            approvedAt: new Date(Date.now() - 86400000).toISOString(),
        };
        this.orders.push(mockOrder1, mockOrder2);
    }
    async getAllOrders(status, priority, supplier, page = 1, limit = 20) {
        let filteredOrders = [...this.orders];
        if (status) {
            filteredOrders = filteredOrders.filter(order => order.status === status);
        }
        if (priority) {
            filteredOrders = filteredOrders.filter(order => order.priority === priority);
        }
        if (supplier) {
            filteredOrders = filteredOrders.filter(order => order.supplier.toLowerCase().includes(supplier.toLowerCase()));
        }
        filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const total = filteredOrders.length;
        const pages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
        return {
            orders: paginatedOrders,
            total,
            pages,
        };
    }
    async getOrderById(orderId) {
        return this.orders.find(order => order.id === orderId) || null;
    }
    async createOrder(createOrderDto, userId) {
        const enrichedItems = [];
        let totalAmount = 0;
        let totalItems = 0;
        for (const item of createOrderDto.items) {
            const product = this.mockProducts.find(p => p.id === item.productId);
            if (!product) {
                throw new common_1.NotFoundException(`Product with ID ${item.productId} not found`);
            }
            const orderItem = {
                productId: item.productId,
                productName: product.name,
                sku: product.sku,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.quantity * item.unitPrice,
                notes: item.notes,
            };
            enrichedItems.push(orderItem);
            totalAmount += orderItem.totalPrice;
            totalItems += item.quantity;
        }
        const newOrder = {
            id: (0, uuid_1.v4)(),
            orderNumber: `ORD-${this.orderCounter++}`,
            supplier: createOrderDto.supplier,
            items: enrichedItems,
            totalItems,
            totalAmount: Math.round(totalAmount * 100) / 100,
            status: order_dto_1.OrderStatus.PENDING,
            priority: createOrderDto.priority,
            createdBy: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            expectedDeliveryDate: createOrderDto.expectedDeliveryDate,
            notes: createOrderDto.notes,
        };
        this.orders.push(newOrder);
        return newOrder;
    }
    async updateOrder(orderId, updateOrderDto, userId) {
        const orderIndex = this.orders.findIndex(order => order.id === orderId);
        if (orderIndex === -1) {
            return null;
        }
        const order = this.orders[orderIndex];
        if (updateOrderDto.status) {
            if (updateOrderDto.status === order_dto_1.OrderStatus.APPROVED && order.status === order_dto_1.OrderStatus.PENDING) {
                order.approvedBy = userId;
                order.approvedAt = new Date().toISOString();
            }
            if (updateOrderDto.status === order_dto_1.OrderStatus.RECEIVED && order.status !== order_dto_1.OrderStatus.RECEIVED) {
                order.actualDeliveryDate = new Date().toISOString();
            }
            order.status = updateOrderDto.status;
        }
        if (updateOrderDto.priority !== undefined) {
            order.priority = updateOrderDto.priority;
        }
        if (updateOrderDto.expectedDeliveryDate !== undefined) {
            order.expectedDeliveryDate = updateOrderDto.expectedDeliveryDate;
        }
        if (updateOrderDto.trackingNumber !== undefined) {
            order.trackingNumber = updateOrderDto.trackingNumber;
        }
        if (updateOrderDto.notes !== undefined) {
            order.notes = updateOrderDto.notes;
        }
        order.updatedAt = new Date().toISOString();
        this.orders[orderIndex] = order;
        return order;
    }
    async deleteOrder(orderId) {
        const orderIndex = this.orders.findIndex(order => order.id === orderId);
        if (orderIndex === -1) {
            return false;
        }
        const order = this.orders[orderIndex];
        if (order.status !== order_dto_1.OrderStatus.PENDING && order.status !== order_dto_1.OrderStatus.CANCELLED) {
            throw new Error('Cannot delete order that is already in progress');
        }
        this.orders.splice(orderIndex, 1);
        return true;
    }
    async getOrderSummary() {
        const totalOrders = this.orders.length;
        const pendingOrders = this.orders.filter(o => o.status === order_dto_1.OrderStatus.PENDING).length;
        const approvedOrders = this.orders.filter(o => o.status === order_dto_1.OrderStatus.APPROVED).length;
        const shippedOrders = this.orders.filter(o => o.status === order_dto_1.OrderStatus.SHIPPED).length;
        const receivedOrders = this.orders.filter(o => o.status === order_dto_1.OrderStatus.RECEIVED).length;
        const totalOrderValue = this.orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const averageOrderValue = totalOrders > 0 ? totalOrderValue / totalOrders : 0;
        const ordersByPriority = {
            urgent: this.orders.filter(o => o.priority === order_dto_1.OrderPriority.URGENT).length,
            high: this.orders.filter(o => o.priority === order_dto_1.OrderPriority.HIGH).length,
            medium: this.orders.filter(o => o.priority === order_dto_1.OrderPriority.MEDIUM).length,
            low: this.orders.filter(o => o.priority === order_dto_1.OrderPriority.LOW).length,
        };
        const recentOrders = this.orders
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
        return {
            totalOrders,
            pendingOrders,
            approvedOrders,
            shippedOrders,
            receivedOrders,
            totalOrderValue: Math.round(totalOrderValue * 100) / 100,
            averageOrderValue: Math.round(averageOrderValue * 100) / 100,
            ordersByPriority,
            recentOrders,
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], OrdersService);
//# sourceMappingURL=orders.service.js.map