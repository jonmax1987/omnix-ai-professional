export declare class DashboardSummaryDto {
    totalInventoryValue: number;
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    expiredItems: number;
    activeAlerts: number;
    categoryBreakdown: Array<{
        category: string;
        itemCount: number;
        value: number;
    }>;
    topCategories: Array<{
        category: string;
        percentage: number;
    }>;
}
export declare class DashboardQueryDto {
    timeRange?: string;
}
export declare class InventoryGraphQueryDto {
    timeRange?: string;
    category?: string;
    granularity?: string;
}
export declare class InventoryGraphDataDto {
    timeRange: string;
    granularity: string;
    dataPoints: Array<{
        timestamp: string;
        inventoryValue: number;
        itemCount: number;
        categories: Array<{
            category: string;
            value: number;
            count: number;
        }>;
    }>;
}
