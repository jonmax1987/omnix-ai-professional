import { Injectable } from '@nestjs/common';
import { 
  StockAdjustmentDto, 
  InventoryHistory, 
  InventoryItem, 
  InventoryOverview,
  AdjustmentType
} from '../common/dto/inventory.dto';
import { WebSocketService } from '../websocket/websocket.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InventoryService {
  constructor(private readonly webSocketService: WebSocketService) {}
  
  private inventoryHistory: InventoryHistory[] = [];
  
  // Mock product data for inventory calculations
  private mockProducts = [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Premium Coffee Beans',
      sku: 'PCB-001',
      category: 'Beverages',
      quantity: 150,
      minThreshold: 20,
      price: 24.99,
      cost: 18.50,
      supplier: 'Global Coffee Co.',
      location: 'Warehouse A, Shelf 3',
    },
    {
      id: '223e4567-e89b-12d3-a456-426614174001',
      name: 'Organic Green Tea',
      sku: 'OGT-002',
      category: 'Beverages',
      quantity: 8,
      minThreshold: 15,
      price: 12.99,
      cost: 9.50,
      supplier: 'Organic Tea Ltd.',
      location: 'Warehouse A, Shelf 2',
    },
    {
      id: '323e4567-e89b-12d3-a456-426614174002',
      name: 'Whole Wheat Flour',
      sku: 'WWF-003',
      category: 'Baking',
      quantity: 45,
      minThreshold: 10,
      price: 8.99,
      cost: 6.50,
      supplier: 'Mills & Grains Co.',
      location: 'Warehouse B, Shelf 1',
    },
  ];

  async getInventoryOverview(): Promise<InventoryOverview> {
    const products = this.mockProducts;
    
    const totalProducts = products.length;
    const totalStockValue = products.reduce((sum, p) => sum + (p.quantity * p.cost), 0);
    const lowStockProducts = products.filter(p => p.quantity <= p.minThreshold).length;
    const outOfStockProducts = products.filter(p => p.quantity === 0).length;
    const overstockedProducts = products.filter(p => p.quantity > (p.minThreshold * 4)).length;
    const recentMovements = this.inventoryHistory.filter(
      h => new Date(h.adjustedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;

    // Category breakdown
    const categoryMap = new Map();
    products.forEach(product => {
      const existing = categoryMap.get(product.category) || {
        category: product.category,
        productCount: 0,
        stockValue: 0,
        totalQuantity: 0,
      };
      
      existing.productCount += 1;
      existing.stockValue += product.quantity * product.cost;
      existing.totalQuantity += product.quantity;
      
      categoryMap.set(product.category, existing);
    });

    const categoryBreakdown = Array.from(categoryMap.values()).map(cat => ({
      category: cat.category,
      productCount: cat.productCount,
      stockValue: Math.round(cat.stockValue * 100) / 100,
      averageStockLevel: Math.round((cat.totalQuantity / cat.productCount) * 100) / 100,
    }));

    // Location breakdown
    const locationMap = new Map();
    products.forEach(product => {
      if (product.location) {
        const existing = locationMap.get(product.location) || {
          location: product.location,
          productCount: 0,
          stockValue: 0,
        };
        
        existing.productCount += 1;
        existing.stockValue += product.quantity * product.cost;
        
        locationMap.set(product.location, existing);
      }
    });

    const locationBreakdown = Array.from(locationMap.values()).map(loc => ({
      location: loc.location,
      productCount: loc.productCount,
      stockValue: Math.round(loc.stockValue * 100) / 100,
    }));

    return {
      totalProducts,
      totalStockValue: Math.round(totalStockValue * 100) / 100,
      lowStockProducts,
      outOfStockProducts,
      overstockedProducts,
      recentMovements,
      categoryBreakdown,
      locationBreakdown,
    };
  }

  async getProductInventory(productId: string): Promise<InventoryItem | null> {
    const product = this.mockProducts.find(p => p.id === productId);
    if (!product) {
      return null;
    }

    const reservedStock = 0; // Mock reserved stock
    const availableStock = product.quantity - reservedStock;
    const stockValue = product.quantity * product.cost;
    
    let stockStatus: 'critical' | 'low' | 'normal' | 'overstocked';
    if (product.quantity === 0) {
      stockStatus = 'critical';
    } else if (product.quantity <= product.minThreshold) {
      stockStatus = 'low';
    } else if (product.quantity > product.minThreshold * 4) {
      stockStatus = 'overstocked';
    } else {
      stockStatus = 'normal';
    }

    const lastMovement = this.inventoryHistory
      .filter(h => h.productId === productId)
      .sort((a, b) => new Date(b.adjustedAt).getTime() - new Date(a.adjustedAt).getTime())[0];

    return {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      category: product.category,
      currentStock: product.quantity,
      minThreshold: product.minThreshold,
      reservedStock,
      availableStock,
      stockValue: Math.round(stockValue * 100) / 100,
      lastMovement: lastMovement?.adjustedAt,
      stockStatus,
      location: product.location,
      supplier: product.supplier,
      updatedAt: new Date().toISOString(),
    };
  }

  async adjustStock(productId: string, adjustment: StockAdjustmentDto, userId: string): Promise<InventoryItem | null> {
    const productIndex = this.mockProducts.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      return null;
    }

    const product = this.mockProducts[productIndex];
    const previousQuantity = product.quantity;
    let newQuantity: number;

    switch (adjustment.type) {
      case AdjustmentType.INCREASE:
        newQuantity = previousQuantity + adjustment.quantity;
        break;
      case AdjustmentType.DECREASE:
        newQuantity = Math.max(0, previousQuantity - adjustment.quantity);
        break;
      case AdjustmentType.SET:
        newQuantity = adjustment.quantity;
        break;
      default:
        throw new Error('Invalid adjustment type');
    }

    // Update the product quantity
    this.mockProducts[productIndex].quantity = newQuantity;

    // Record the history
    const historyEntry: InventoryHistory = {
      id: uuidv4(),
      productId,
      productName: product.name,
      previousQuantity,
      newQuantity,
      adjustmentQuantity: adjustment.quantity,
      adjustmentType: adjustment.type,
      reason: adjustment.reason,
      notes: adjustment.notes,
      adjustedBy: userId,
      adjustedAt: new Date().toISOString(),
    };

    this.inventoryHistory.push(historyEntry);

    // Emit WebSocket events for stock change
    this.webSocketService.emitStockChanged(
      productId,
      product.name,
      newQuantity,
      product.minThreshold
    );

    // Return updated inventory item
    return this.getProductInventory(productId);
  }

  async getInventoryHistory(productId: string, limit: number = 50): Promise<InventoryHistory[]> {
    return this.inventoryHistory
      .filter(h => h.productId === productId)
      .sort((a, b) => new Date(b.adjustedAt).getTime() - new Date(a.adjustedAt).getTime())
      .slice(0, limit);
  }

  async getAllInventoryItems(): Promise<InventoryItem[]> {
    const items: InventoryItem[] = [];
    
    for (const product of this.mockProducts) {
      const inventoryItem = await this.getProductInventory(product.id);
      if (inventoryItem) {
        items.push(inventoryItem);
      }
    }

    return items.sort((a, b) => a.productName.localeCompare(b.productName));
  }
}