/**
 * OMNIX AI - Mock Revenue Data Generator
 * Generates simulated real-time revenue transactions for testing
 * MGR-023: Live manager revenue updates
 */

class MockRevenueGenerator {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.subscribers = new Set();
    this.transactionId = 1000;
    this.totalDailyRevenue = 0;
    this.dailyTarget = 150000;
    this.transactionCount = 0;
  }

  /**
   * Start generating mock revenue data
   */
  start(intervalMs = 3000) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.resetDaily();
    
    // Generate initial burst
    setTimeout(() => {
      this.generateTransaction();
    }, 1000);
    
    // Regular interval generation
    this.interval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance to generate transaction
        this.generateTransaction();
      }
      
      // Sometimes generate multiple transactions (busy period)
      if (Math.random() > 0.9) {
        setTimeout(() => this.generateTransaction(), 500);
        setTimeout(() => this.generateTransaction(), 1000);
      }
    }, intervalMs);
    
    console.log('[MockRevenueGenerator] Started generating revenue data');
  }

  /**
   * Stop generating data
   */
  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    console.log('[MockRevenueGenerator] Stopped generating revenue data');
  }

  /**
   * Subscribe to revenue events
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Generate a single transaction
   */
  generateTransaction() {
    const transaction = this.createRandomTransaction();
    this.totalDailyRevenue += transaction.amount;
    this.transactionCount++;
    
    // Emit transaction event
    this.emit('transaction', transaction);
    this.emit('revenue_update', {
      ...transaction,
      dailyTotal: this.totalDailyRevenue,
      dailyTarget: this.dailyTarget,
      dailyProgress: (this.totalDailyRevenue / this.dailyTarget) * 100,
      transactionCount: this.transactionCount
    });
    
    // Emit hourly revenue data periodically
    if (this.transactionCount % 10 === 0) {
      this.emitHourlyData();
    }
  }

  /**
   * Create a random transaction
   */
  createRandomTransaction() {
    const transactionTypes = [
      { type: 'product_sale', min: 15.99, max: 299.99, descriptions: [
        'Electronics Purchase', 'Grocery Items', 'Clothing Sale', 
        'Home & Garden', 'Health & Beauty', 'Sports Equipment'
      ]},
      { type: 'bulk_order', min: 500, max: 2500, descriptions: [
        'Bulk Grocery Order', 'Office Supplies', 'Restaurant Supply',
        'Wholesale Purchase', 'Corporate Order'
      ]},
      { type: 'premium_service', min: 99.99, max: 799.99, descriptions: [
        'Installation Service', 'Premium Delivery', 'Extended Warranty',
        'Professional Consultation', 'VIP Service'
      ]},
      { type: 'subscription', min: 29.99, max: 149.99, descriptions: [
        'Monthly Subscription', 'Annual Plan', 'Premium Membership',
        'Service Package', 'Loyalty Program'
      ]}
    ];

    const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const amount = Math.round((Math.random() * (transactionType.max - transactionType.min) + transactionType.min) * 100) / 100;
    const description = transactionType.descriptions[Math.floor(Math.random() * transactionType.descriptions.length)];

    return {
      id: `TXN-${this.transactionId++}`,
      orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      amount: amount,
      type: transactionType.type,
      description: description,
      timestamp: new Date().toISOString(),
      customerId: `CUST-${Math.floor(Math.random() * 10000)}`,
      paymentMethod: this.getRandomPaymentMethod(),
      status: 'completed',
      location: this.getRandomLocation()
    };
  }

  /**
   * Get random payment method
   */
  getRandomPaymentMethod() {
    const methods = ['credit_card', 'debit_card', 'cash', 'digital_wallet', 'bank_transfer'];
    return methods[Math.floor(Math.random() * methods.length)];
  }

  /**
   * Get random store location
   */
  getRandomLocation() {
    const locations = [
      'Main Store', 'North Branch', 'Downtown Location', 
      'Mall Outlet', 'Online Store', 'Mobile Unit'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  /**
   * Emit hourly revenue data
   */
  emitHourlyData() {
    const now = new Date();
    const hourlyData = [];
    
    // Generate last 24 hours of data
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - (i * 60 * 60 * 1000));
      const baseRevenue = 2000 + (Math.random() * 3000);
      
      // Add some patterns (higher during business hours)
      const hourOfDay = hour.getHours();
      let multiplier = 1;
      if (hourOfDay >= 9 && hourOfDay <= 17) {
        multiplier = 1.5; // Business hours boost
      } else if (hourOfDay >= 18 && hourOfDay <= 21) {
        multiplier = 1.3; // Evening shopping boost
      } else if (hourOfDay >= 0 && hourOfDay <= 6) {
        multiplier = 0.3; // Low overnight activity
      }
      
      hourlyData.push({
        hour: hour.toISOString(),
        revenue: Math.round(baseRevenue * multiplier * 100) / 100,
        transactionCount: Math.floor((baseRevenue * multiplier) / 75), // Avg $75 per transaction
        hourLabel: hour.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
      });
    }
    
    this.emit('hourly_revenue', {
      data: hourlyData,
      totalRevenue: hourlyData.reduce((sum, h) => sum + h.revenue, 0),
      totalTransactions: hourlyData.reduce((sum, h) => sum + h.transactionCount, 0),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit event to all subscribers
   */
  emit(eventType, data) {
    this.subscribers.forEach(callback => {
      try {
        callback({
          type: eventType,
          payload: data,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('[MockRevenueGenerator] Error in subscriber callback:', error);
      }
    });
  }

  /**
   * Reset daily counters
   */
  resetDaily() {
    this.totalDailyRevenue = 0;
    this.transactionCount = 0;
    
    // Simulate some existing daily progress (20-40%)
    const existingProgress = Math.random() * 0.2 + 0.2; // 20-40%
    this.totalDailyRevenue = this.dailyTarget * existingProgress;
    this.transactionCount = Math.floor(this.totalDailyRevenue / 85); // Avg $85 per transaction
    
    console.log(`[MockRevenueGenerator] Daily reset - Starting with $${this.totalDailyRevenue.toFixed(2)}`);
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      totalDailyRevenue: this.totalDailyRevenue,
      dailyTarget: this.dailyTarget,
      dailyProgress: (this.totalDailyRevenue / this.dailyTarget) * 100,
      transactionCount: this.transactionCount,
      subscriberCount: this.subscribers.size
    };
  }

  /**
   * Set daily target
   */
  setDailyTarget(target) {
    this.dailyTarget = target;
  }

  /**
   * Force generate specific transaction
   */
  generateSpecificTransaction(amount, description) {
    const transaction = {
      id: `TXN-${this.transactionId++}`,
      orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      amount: amount,
      type: 'manual',
      description: description || 'Manual Transaction',
      timestamp: new Date().toISOString(),
      customerId: `CUST-${Math.floor(Math.random() * 10000)}`,
      paymentMethod: 'manual',
      status: 'completed',
      location: 'Manual Entry'
    };

    this.totalDailyRevenue += amount;
    this.transactionCount++;

    this.emit('transaction', transaction);
    this.emit('revenue_update', {
      ...transaction,
      dailyTotal: this.totalDailyRevenue,
      dailyTarget: this.dailyTarget,
      dailyProgress: (this.totalDailyRevenue / this.dailyTarget) * 100,
      transactionCount: this.transactionCount
    });

    return transaction;
  }
}

// Export singleton instance
export const mockRevenueGenerator = new MockRevenueGenerator();

// Export class for custom instances
export default MockRevenueGenerator;