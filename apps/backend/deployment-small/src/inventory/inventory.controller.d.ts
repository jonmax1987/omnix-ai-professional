import { InventoryService } from './inventory.service';
import { User } from '../common/dto/auth.dto';
import { StockAdjustmentDto, InventoryHistory, InventoryItem, InventoryOverview } from '../common/dto/inventory.dto';
export declare class InventoryController {
    private inventoryService;
    constructor(inventoryService: InventoryService);
    getInventoryOverview(): Promise<{
        data: InventoryOverview;
        message: string;
    }>;
    getAllInventoryItems(): Promise<{
        data: InventoryItem[];
        meta: {
            totalItems: number;
            lowStockItems: number;
            outOfStockItems: number;
        };
        message: string;
    }>;
    getProductInventory(productId: string): Promise<{
        data: InventoryItem;
        message: string;
    }>;
    adjustStock(productId: string, adjustmentDto: StockAdjustmentDto, user: User): Promise<{
        data: InventoryItem;
        message: string;
    }>;
    getInventoryHistory(productId: string, limit?: string): Promise<{
        data: InventoryHistory[];
        meta: {
            productId: string;
            totalRecords: number;
            limit: number;
        };
        message: string;
    }>;
}
