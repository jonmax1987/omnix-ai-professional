/**
 * OMNIX AI - Mock Inventory Change Generator
 * Generates realistic inventory level changes for real-time testing
 * MGR-025: Instant inventory level changes
 */

class MockInventoryChangeGenerator {
  constructor() {
    this.isActive = false;
    this.intervalId = null;
    this.subscribers = [];
    this.generateInterval = 2000; // 2 seconds
    
    // Sample products with realistic inventory scenarios
    this.products = [
      { id: 'PROD001', name: 'Fresh Milk 1L', category: 'Dairy', supplier: 'DairyFresh Co.', minThreshold: 50, maxStock: 200 },
      { id: 'PROD002', name: 'Whole Wheat Bread', category: 'Bakery', supplier: 'Golden Bakery', minThreshold: 30, maxStock: 150 },
      { id: 'PROD003', name: 'Bananas (kg)', category: 'Produce', supplier: 'Fresh Farms', minThreshold: 25, maxStock: 100 },
      { id: 'PROD004', name: 'Ground Coffee 500g', category: 'Beverages', supplier: 'Bean Masters', minThreshold: 20, maxStock: 80 },
      { id: 'PROD005', name: 'Chicken Breast (kg)', category: 'Meat', supplier: 'Premium Meats', minThreshold: 15, maxStock: 60 },
      { id: 'PROD006', name: 'Cheddar Cheese 400g', category: 'Dairy', supplier: 'Artisan Cheese Co.', minThreshold: 25, maxStock: 100 },
      { id: 'PROD007', name: 'Orange Juice 1L', category: 'Beverages', supplier: 'Citrus Valley', minThreshold: 40, maxStock: 120 },
      { id: 'PROD008', name: 'Tomatoes (kg)', category: 'Produce', supplier: 'Garden Fresh', minThreshold: 20, maxStock: 80 },
      { id: 'PROD009', name: 'Pasta 500g', category: 'Pantry', supplier: 'Italian Classics', minThreshold: 35, maxStock: 140 },
      { id: 'PROD010', name: 'Greek Yogurt 200g', category: 'Dairy', supplier: 'Mediterranean Foods', minThreshold: 30, maxStock: 120 },
      { id: 'PROD011', name: 'Salmon Fillet (kg)', category: 'Fish', supplier: 'Ocean Catch', minThreshold: 10, maxStock: 40 },
      { id: 'PROD012', name: 'Spinach 250g', category: 'Produce', supplier: 'Green Leaf Farms', minThreshold: 15, maxStock: 60 },
      { id: 'PROD013', name: 'Rice 1kg', category: 'Pantry', supplier: 'Grain Masters', minThreshold: 50, maxStock: 200 },
      { id: 'PROD014', name: 'Olive Oil 500ml', category: 'Pantry', supplier: 'Mediterranean Oils', minThreshold: 25, maxStock: 100 },
      { id: 'PROD015', name: 'Dark Chocolate 100g', category: 'Confectionery', supplier: 'Sweet Delights', minThreshold: 40, maxStock: 160 }
    ];
    
    // Initialize current inventory levels
    this.currentInventory = this.products.map(product => ({
      ...product,
      currentStock: this.getRandomStock(product.minThreshold, product.maxStock),
      lastUpdated: new Date(),
      reorderStatus: 'normal'
    }));
    
    // Update reorder statuses
    this.updateReorderStatuses();
    
    // Change types with weighted probabilities
    this.changeTypes = [
      { type: 'sale', weight: 50, minChange: -1, maxChange: -10 },
      { type: 'restock', weight: 15, minChange: 20, maxChange: 100 },
      { type: 'return', weight: 5, minChange: 1, maxChange: 3 },
      { type: 'damage', weight: 8, minChange: -1, maxChange: -5 },
      { type: 'theft', weight: 3, minChange: -1, maxChange: -2 },
      { type: 'adjustment', weight: 10, minChange: -5, maxChange: 5 },
      { type: 'delivery', weight: 12, minChange: 30, maxChange: 80 },
      { type: 'expire', weight: 7, minChange: -1, maxChange: -8 }
    ];
  }
  
  getRandomStock(min, max) {
    // Generate stock level with some bias toward normal levels
    const range = max - min;
    const bias = 0.6; // Bias toward higher stock levels
    return Math.floor(min + (Math.random() ** bias) * range);
  }
  
  updateReorderStatuses() {
    this.currentInventory = this.currentInventory.map(item => {
      const stockRatio = item.currentStock / item.maxStock;
      const criticalRatio = item.minThreshold / item.maxStock;
      
      let reorderStatus;
      if (item.currentStock <= item.minThreshold * 0.5) {
        reorderStatus = 'critical';
      } else if (item.currentStock <= item.minThreshold) {
        reorderStatus = 'low';
      } else if (stockRatio > 0.8) {
        reorderStatus = 'overstock';
      } else {
        reorderStatus = 'normal';
      }
      
      return { ...item, reorderStatus };
    });
  }
  
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }
  
  notifySubscribers(change) {
    this.subscribers.forEach(callback => {
      try {
        callback(change);
      } catch (error) {
        console.error('Error notifying inventory change subscriber:', error);
      }
    });
  }
  
  getWeightedChangeType() {
    const totalWeight = this.changeTypes.reduce((sum, type) => sum + type.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const changeType of this.changeTypes) {
      if (random < changeType.weight) {
        return changeType;
      }
      random -= changeType.weight;
    }
    
    return this.changeTypes[0]; // Fallback
  }
  
  generateInventoryChange() {
    // Select random product
    const productIndex = Math.floor(Math.random() * this.currentInventory.length);
    const product = this.currentInventory[productIndex];
    
    // Select change type
    const changeType = this.getWeightedChangeType();
    
    // Calculate change amount
    const changeAmount = Math.floor(
      Math.random() * (changeType.maxChange - changeType.minChange + 1) + changeType.minChange
    );
    
    // Apply change with constraints
    const previousStock = product.currentStock;
    const newStock = Math.max(0, Math.min(product.maxStock, previousStock + changeAmount));
    const actualChange = newStock - previousStock;
    
    // Skip if no actual change occurred
    if (actualChange === 0) {
      return null;
    }
    
    // Update inventory
    this.currentInventory[productIndex] = {
      ...product,
      currentStock: newStock,
      lastUpdated: new Date()
    };
    
    // Update reorder statuses
    this.updateReorderStatuses();
    
    // Create change event
    const change = {
      id: `INV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      productName: product.name,
      category: product.category,
      supplier: product.supplier,
      changeType: changeType.type,
      previousStock: previousStock,
      newStock: newStock,
      changeAmount: actualChange,
      minThreshold: product.minThreshold,
      maxStock: product.maxStock,
      reorderStatus: this.currentInventory[productIndex].reorderStatus,
      timestamp: new Date(),
      reason: this.getChangeReason(changeType.type, actualChange),
      urgent: this.isUrgentChange(this.currentInventory[productIndex])
    };
    
    return change;
  }
  
  getChangeReason(type, amount) {
    const reasons = {
      sale: [`${Math.abs(amount)} units sold`, `Customer purchase`, `POS transaction`],
      restock: [`Delivery received`, `Manual restock`, `Supplier delivery`],
      return: [`Customer return`, `Defective return`, `Exchange processed`],
      damage: [`Product damaged`, `Handling damage`, `Quality issue`],
      theft: [`Loss prevention`, `Inventory shrinkage`, `Security incident`],
      adjustment: [`Stock adjustment`, `Count correction`, `System sync`],
      delivery: [`New shipment`, `Scheduled delivery`, `Bulk order received`],
      expire: [`Expired items removed`, `Quality control`, `Date check removal`]
    };
    
    const typeReasons = reasons[type] || [`${type} change`];
    return typeReasons[Math.floor(Math.random() * typeReasons.length)];
  }
  
  isUrgentChange(product) {
    return product.reorderStatus === 'critical' || 
           (product.reorderStatus === 'low' && product.currentStock <= product.minThreshold * 0.8);
  }
  
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('📦 Mock Inventory Change Generator started');
    
    this.intervalId = setInterval(() => {
      const change = this.generateInventoryChange();
      if (change) {
        this.notifySubscribers(change);
      }
    }, this.generateInterval);
  }
  
  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('📦 Mock Inventory Change Generator stopped');
  }
  
  generateBurst(count = 5) {
    console.log(`📦 Generating ${count} inventory changes...`);
    
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const change = this.generateInventoryChange();
        if (change) {
          this.notifySubscribers(change);
        }
      }, i * 200); // Stagger by 200ms
    }
  }
  
  generateSpecificChange(productId, changeType, amount) {
    const productIndex = this.currentInventory.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      console.error(`Product ${productId} not found`);
      return null;
    }
    
    const product = this.currentInventory[productIndex];
    const previousStock = product.currentStock;
    const newStock = Math.max(0, Math.min(product.maxStock, previousStock + amount));
    const actualChange = newStock - previousStock;
    
    if (actualChange === 0) {
      console.warn(`No change applied to ${product.name}`);
      return null;
    }
    
    // Update inventory
    this.currentInventory[productIndex] = {
      ...product,
      currentStock: newStock,
      lastUpdated: new Date()
    };
    
    // Update reorder statuses
    this.updateReorderStatuses();
    
    // Create change event
    const change = {
      id: `INV_MANUAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      productName: product.name,
      category: product.category,
      supplier: product.supplier,
      changeType: changeType,
      previousStock: previousStock,
      newStock: newStock,
      changeAmount: actualChange,
      minThreshold: product.minThreshold,
      maxStock: product.maxStock,
      reorderStatus: this.currentInventory[productIndex].reorderStatus,
      timestamp: new Date(),
      reason: `Manual ${changeType} - ${Math.abs(actualChange)} units`,
      urgent: this.isUrgentChange(this.currentInventory[productIndex])
    };
    
    this.notifySubscribers(change);
    return change;
  }
  
  getCurrentInventory() {
    return [...this.currentInventory];
  }
  
  getInventoryStats() {
    const total = this.currentInventory.length;
    const critical = this.currentInventory.filter(item => item.reorderStatus === 'critical').length;
    const low = this.currentInventory.filter(item => item.reorderStatus === 'low').length;
    const normal = this.currentInventory.filter(item => item.reorderStatus === 'normal').length;
    const overstock = this.currentInventory.filter(item => item.reorderStatus === 'overstock').length;
    
    const totalValue = this.currentInventory.reduce((sum, item) => sum + item.currentStock, 0);
    
    return {
      total,
      critical,
      low,
      normal,
      overstock,
      totalUnits: totalValue,
      averageStock: Math.round(totalValue / total),
      criticalPercentage: Math.round((critical / total) * 100),
      lowPercentage: Math.round((low / total) * 100)
    };
  }
}

// Export singleton instance
const mockInventoryChangeGenerator = new MockInventoryChangeGenerator();

export default mockInventoryChangeGenerator;