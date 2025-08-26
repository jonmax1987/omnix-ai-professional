import { DashboardService } from './dashboard.service';
import { DashboardSummaryDto, DashboardQueryDto, InventoryGraphQueryDto, InventoryGraphDataDto } from '@/common/dto/dashboard.dto';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(query: DashboardQueryDto): Promise<{
        data: DashboardSummaryDto;
    }>;
    getInventoryGraph(query: InventoryGraphQueryDto): Promise<{
        data: InventoryGraphDataDto;
    }>;
}
