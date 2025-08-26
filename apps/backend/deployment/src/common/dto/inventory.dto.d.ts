export declare enum AdjustmentType {
    INCREASE = "increase",
    DECREASE = "decrease",
    SET = "set"
}
export declare enum AdjustmentReason {
    RECEIVED_SHIPMENT = "received_shipment",
    SOLD = "sold",
    DAMAGED = "damaged",
    EXPIRED = "expired",
    THEFT = "theft",
    INVENTORY_COUNT = "inventory_count",
    MANUAL_ADJUSTMENT = "manual_adjustment",
    TRANSFER = "transfer"
}
export declare class StockAdjustmentDto {
    quantity: number;
    type: AdjustmentType;
    reason: AdjustmentReason;
    notes?: string;
}
export declare class InventoryHistory {
    id: string;
    productId: string;
    productName: string;
    previousQuantity: number;
    newQuantity: number;
    adjustmentQuantity: number;
    adjustmentType: AdjustmentType;
    reason: AdjustmentReason;
    notes?: string;
    adjustedBy: string;
    adjustedAt: string;
}
export declare class InventoryItem {
    productId: string;
    productName: string;
    sku: string;
    category: string;
    currentStock: number;
    minThreshold: number;
    maxCapacity?: number;
    reservedStock: number;
    availableStock: number;
    stockValue: number;
    lastMovement?: string;
    stockStatus: 'critical' | 'low' | 'normal' | 'overstocked';
    location?: string;
    supplier: string;
    updatedAt: string;
}
export declare class InventoryOverview {
    totalProducts: number;
    totalStockValue: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    overstockedProducts: number;
    recentMovements: number;
    categoryBreakdown: Array<{
        category: string;
        productCount: number;
        stockValue: number;
        averageStockLevel: number;
    }>;
    locationBreakdown?: Array<{
        location: string;
        productCount: number;
        stockValue: number;
    }>;
}
