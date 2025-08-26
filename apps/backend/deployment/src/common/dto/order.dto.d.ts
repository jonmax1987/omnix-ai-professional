export declare enum OrderStatus {
    PENDING = "pending",
    APPROVED = "approved",
    ORDERED = "ordered",
    SHIPPED = "shipped",
    RECEIVED = "received",
    CANCELLED = "cancelled"
}
export declare enum OrderPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export declare class OrderItemDto {
    productId: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
}
export declare class CreateOrderDto {
    supplier: string;
    items: OrderItemDto[];
    priority: OrderPriority;
    expectedDeliveryDate?: string;
    notes?: string;
}
export declare class UpdateOrderDto {
    status?: OrderStatus;
    priority?: OrderPriority;
    expectedDeliveryDate?: string;
    notes?: string;
    trackingNumber?: string;
}
export declare class OrderItem {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
}
export declare class Order {
    id: string;
    orderNumber: string;
    supplier: string;
    items: OrderItem[];
    totalItems: number;
    totalAmount: number;
    status: OrderStatus;
    priority: OrderPriority;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    expectedDeliveryDate?: string;
    actualDeliveryDate?: string;
    trackingNumber?: string;
    notes?: string;
    approvedBy?: string;
    approvedAt?: string;
}
export declare class OrderSummary {
    totalOrders: number;
    pendingOrders: number;
    approvedOrders: number;
    shippedOrders: number;
    receivedOrders: number;
    totalOrderValue: number;
    averageOrderValue: number;
    ordersByPriority: {
        urgent: number;
        high: number;
        medium: number;
        low: number;
    };
    recentOrders: Order[];
}
