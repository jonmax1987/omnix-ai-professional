import { ProductsService } from '../products/products.service';
import { WebSocketService } from '../websocket/websocket.service';
import { DashboardSummaryDto, DashboardQueryDto, InventoryGraphQueryDto, InventoryGraphDataDto } from '@/common/dto/dashboard.dto';
export declare class DashboardService {
    private readonly productsService;
    private readonly webSocketService;
    constructor(productsService: ProductsService, webSocketService: WebSocketService);
    getSummary(query: DashboardQueryDto): Promise<DashboardSummaryDto>;
    getInventoryGraphData(query: InventoryGraphQueryDto): Promise<InventoryGraphDataDto>;
    private generateMockTimeSeriesData;
}
