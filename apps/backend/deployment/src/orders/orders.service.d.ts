import { CreateOrderDto, UpdateOrderDto, Order, OrderStatus, OrderPriority, OrderSummary } from '../common/dto/order.dto';
import { WebSocketService } from '../websocket/websocket.service';
import { CustomersService } from '../customers/customers.service';
import { KinesisStreamingService } from '../services/kinesis-streaming.service';
export declare class OrdersService {
    private readonly webSocketService;
    private readonly customersService;
    private readonly kinesisStreamingService;
    private readonly logger;
    private orders;
    private orderCounter;
    private mockProducts;
    constructor(webSocketService: WebSocketService, customersService: CustomersService, kinesisStreamingService: KinesisStreamingService);
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
    private trackPurchaseHistory;
    private publishPurchaseEvents;
    private getProductCategory;
}
