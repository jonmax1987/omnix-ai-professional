import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { WebSocketService } from '../websocket/websocket.service';
import {
  DashboardSummaryDto,
  DashboardQueryDto,
  InventoryGraphQueryDto,
  InventoryGraphDataDto,
} from '@/common/dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly webSocketService: WebSocketService,
  ) {}

  async getSummary(query: DashboardQueryDto): Promise<DashboardSummaryDto> {
    const totalInventoryValue = await this.productsService.getTotalInventoryValue();
    const totalItems = await this.productsService.getTotalItemCount();
    const lowStockProducts = await this.productsService.findLowStockProducts();
    const categoryBreakdown = await this.productsService.getCategoryBreakdown();
    
    const lowStockItems = lowStockProducts.filter(p => p.quantity > 0).length;
    const outOfStockItems = lowStockProducts.filter(p => p.quantity === 0).length;
    
    // Mock expired items calculation
    const expiredItems = 1;
    
    // Calculate active alerts
    const activeAlerts = lowStockItems + outOfStockItems + expiredItems;
    
    // Calculate top categories by percentage
    const topCategories = categoryBreakdown
      .map(cat => ({
        category: cat.category,
        percentage: Math.round((cat.value / totalInventoryValue) * 100 * 100) / 100
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);

    const summary = {
      totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
      totalItems,
      lowStockItems,
      outOfStockItems,
      expiredItems,
      activeAlerts,
      categoryBreakdown,
      topCategories,
    };

    // Emit WebSocket event for dashboard update
    this.webSocketService.emitDashboardUpdate(summary);
    
    return summary;
  }

  async getInventoryGraphData(query: InventoryGraphQueryDto): Promise<InventoryGraphDataDto> {
    const dataPoints = this.generateMockTimeSeriesData(query.timeRange, query.granularity, query.category);
    
    return {
      timeRange: query.timeRange,
      granularity: query.granularity,
      dataPoints,
    };
  }

  private generateMockTimeSeriesData(
    timeRange: string,
    granularity: string,
    category?: string
  ) {
    const now = new Date();
    const dataPoints = [];
    let pointCount = 7;
    let intervalDays = 1;
    
    // Generate mock data points
    for (let i = pointCount - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * intervalDays * 24 * 60 * 60 * 1000));
      const inventoryValue = Math.round((15000 + (Math.random() - 0.5) * 2000) * 100) / 100;
      const itemCount = Math.round(1200 + (Math.random() - 0.5) * 200);
      
      const categories = [
        { category: 'Beverages', value: inventoryValue * 0.4, count: Math.round(itemCount * 0.3) },
        { category: 'Baking', value: inventoryValue * 0.3, count: Math.round(itemCount * 0.25) },
        { category: 'Snacks', value: inventoryValue * 0.2, count: Math.round(itemCount * 0.3) },
        { category: 'Dairy', value: inventoryValue * 0.1, count: Math.round(itemCount * 0.15) },
      ];
      
      dataPoints.push({
        timestamp: timestamp.toISOString(),
        inventoryValue,
        itemCount,
        categories: category ? categories.filter(c => c.category === category) : categories,
      });
    }
    
    return dataPoints;
  }
}