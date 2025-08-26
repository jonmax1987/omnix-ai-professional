import { OrdersService } from './orders.service';
import { User } from '../common/dto/auth.dto';
import { CreateOrderDto, UpdateOrderDto, Order, OrderStatus, OrderPriority, OrderSummary } from '../common/dto/order.dto';
export declare class OrdersController {
    private ordersService;
    constructor(ordersService: OrdersService);
    getAllOrders(status?: OrderStatus, priority?: OrderPriority, supplier?: string, page?: string, limit?: string): Promise<{
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
    }>;
    getOrderSummary(): Promise<{
        data: OrderSummary;
        message: string;
    }>;
    getOrderById(orderId: string): Promise<{
        data: Order;
        message: string;
    }>;
    createOrder(createOrderDto: CreateOrderDto, user: User): Promise<{
        data: Order;
        message: string;
    }>;
    updateOrder(orderId: string, updateOrderDto: UpdateOrderDto, user: User): Promise<{
        data: Order;
        message: string;
    }>;
    deleteOrder(orderId: string): Promise<{
        message: string;
    }>;
}
