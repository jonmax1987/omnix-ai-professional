import { CreateOrderDto, UpdateOrderDto, Order, OrderStatus, OrderPriority, OrderSummary } from '../common/dto/order.dto';
export declare class OrdersService {
    private orders;
    private orderCounter;
    private mockProducts;
    constructor();
    private initializeMockOrders;
    getAllOrders(status?: OrderStatus, priority?: OrderPriority, supplier?: string, page?: number, limit?: number): Promise<{
        orders: Order[];
        total: number;
        pages: number;
    }>;
    getOrderById(orderId: string): Promise<Order | null>;
    createOrder(createOrderDto: CreateOrderDto, userId: string): Promise<Order>;
    updateOrder(orderId: string, updateOrderDto: UpdateOrderDto, userId: string): Promise<Order | null>;
    deleteOrder(orderId: string): Promise<boolean>;
    getOrderSummary(): Promise<OrderSummary>;
}
