import { StockAdjustmentDto, InventoryHistory, InventoryItem, InventoryOverview } from '../common/dto/inventory.dto';
import { WebSocketService } from '../websocket/websocket.service';
export declare class InventoryService {
    private readonly webSocketService;
    constructor(webSocketService: WebSocketService);
    private inventoryHistory;
    private mockProducts;
    getInventoryOverview(): Promise<InventoryOverview>;
    getProductInventory(productId: string): Promise<InventoryItem | null>;
    adjustStock(productId: string, adjustment: StockAdjustmentDto, userId: string): Promise<InventoryItem | null>;
    getInventoryHistory(productId: string, limit?: number): Promise<InventoryHistory[]>;
    getAllInventoryItems(): Promise<InventoryItem[]>;
}
