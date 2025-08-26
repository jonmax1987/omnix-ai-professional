import { StockAdjustmentDto, InventoryHistory, InventoryItem, InventoryOverview } from '../common/dto/inventory.dto';
export declare class InventoryService {
    private inventoryHistory;
    private mockProducts;
    getInventoryOverview(): Promise<InventoryOverview>;
    getProductInventory(productId: string): Promise<InventoryItem | null>;
    adjustStock(productId: string, adjustment: StockAdjustmentDto, userId: string): Promise<InventoryItem | null>;
    getInventoryHistory(productId: string, limit?: number): Promise<InventoryHistory[]>;
    getAllInventoryItems(): Promise<InventoryItem[]>;
}
