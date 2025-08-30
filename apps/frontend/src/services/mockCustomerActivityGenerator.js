/**
 * OMNIX AI - Mock Customer Activity Generator
 * Generates simulated real-time customer activity for testing
 * MGR-024: Live customer activity feed
 */

class MockCustomerActivityGenerator {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.subscribers = new Set();
    this.customerId = 1000;
    this.activityId = 1;
    this.activeUsers = new Set();
    this.products = this.generateMockProducts();
    this.customers = this.generateMockCustomers();
  }

  /**
   * Generate mock products for activities
   */
  generateMockProducts() {
    return [
      { id: 'prod_001', name: 'Organic Bananas', price: 3.99, category: 'Fruits' },
      { id: 'prod_002', name: 'Whole Milk (1L)', price: 2.49, category: 'Dairy' },
      { id: 'prod_003', name: 'Sourdough Bread', price: 4.99, category: 'Bakery' },
      { id: 'prod_004', name: 'Greek Yogurt', price: 5.99, category: 'Dairy' },
      { id: 'prod_005', name: 'Free-Range Eggs', price: 6.99, category: 'Dairy' },
      { id: 'prod_006', name: 'Organic Spinach', price: 3.49, category: 'Vegetables' },
      { id: 'prod_007', name: 'Wild Salmon Fillet', price: 15.99, category: 'Seafood' },
      { id: 'prod_008', name: 'Olive Oil (500ml)', price: 12.99, category: 'Pantry' },
      { id: 'prod_009', name: 'Tomatoes', price: 4.49, category: 'Vegetables' },
      { id: 'prod_010', name: 'Chicken Breast', price: 11.99, category: 'Meat' },
      { id: 'prod_011', name: 'Brown Rice', price: 3.99, category: 'Pantry' },
      { id: 'prod_012', name: 'Avocados', price: 2.99, category: 'Fruits' },
      { id: 'prod_013', name: 'Dark Chocolate', price: 5.49, category: 'Snacks' },
      { id: 'prod_014', name: 'Almonds', price: 8.99, category: 'Nuts' },
      { id: 'prod_015', name: 'Honey', price: 7.99, category: 'Pantry' }
    ];
  }

  /**
   * Generate mock customers
   */
  generateMockCustomers() {
    const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: `cust_${String(i + 1).padStart(3, '0')}`,
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      segment: ['premium', 'regular', 'budget'][Math.floor(Math.random() * 3)],
      location: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'][Math.floor(Math.random() * 6)]
    })).map(customer => ({
      ...customer,
      name: `${customer.firstName} ${customer.lastName}`
    }));
  }

  /**
   * Start generating mock customer activity
   */
  start(intervalMs = 4000) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Generate initial burst of activities
    setTimeout(() => this.generateActivity(), 500);
    setTimeout(() => this.generateActivity(), 1000);
    setTimeout(() => this.generateActivity(), 1500);
    
    // Regular interval generation
    this.interval = setInterval(() => {
      // 80% chance to generate activity
      if (Math.random() > 0.2) {
        this.generateActivity();
      }
      
      // Sometimes generate multiple activities (busy periods)
      if (Math.random() > 0.85) {
        setTimeout(() => this.generateActivity(), 1000);
        setTimeout(() => this.generateActivity(), 2000);
      }
      
      // Occasional burst of activities
      if (Math.random() > 0.95) {
        setTimeout(() => this.generateActivity(), 500);
        setTimeout(() => this.generateActivity(), 1000);
        setTimeout(() => this.generateActivity(), 1500);
        setTimeout(() => this.generateActivity(), 2000);
      }
    }, intervalMs);
    
    console.log('[MockCustomerActivityGenerator] Started generating customer activity');
  }

  /**
   * Stop generating activities
   */
  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    console.log('[MockCustomerActivityGenerator] Stopped generating customer activity');
  }

  /**
   * Subscribe to activity events
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Generate a single customer activity
   */
  generateActivity() {
    const activity = this.createRandomActivity();
    
    // Add to active users set
    this.activeUsers.add(activity.customerId);
    
    // Emit activity event
    this.emit('customer_activity', activity);
    
    // Clean up old active users periodically
    if (this.activeUsers.size > 20) {
      const usersArray = Array.from(this.activeUsers);
      this.activeUsers.clear();
      // Keep last 15 users
      usersArray.slice(-15).forEach(userId => this.activeUsers.add(userId));
    }
  }

  /**
   * Create a random customer activity
   */
  createRandomActivity() {
    const customer = this.customers[Math.floor(Math.random() * this.customers.length)];
    const product = this.products[Math.floor(Math.random() * this.products.length)];
    
    const activityTypes = [
      {
        type: 'product_view',
        weight: 40,
        generator: () => ({
          type: 'product_view',
          description: `Viewed ${product.name}`,
          productId: product.id,
          productName: product.name,
          category: product.category,
          value: null
        })
      },
      {
        type: 'add_to_cart',
        weight: 15,
        generator: () => ({
          type: 'add_to_cart',
          description: `Added ${product.name} to cart`,
          productId: product.id,
          productName: product.name,
          category: product.category,
          value: product.price
        })
      },
      {
        type: 'purchase',
        weight: 8,
        generator: () => {
          const quantity = Math.floor(Math.random() * 3) + 1;
          const amount = (product.price * quantity).toFixed(2);
          return {
            type: 'purchase',
            description: `Purchased ${product.name}`,
            productId: product.id,
            productName: product.name,
            category: product.category,
            value: amount,
            details: { quantity, amount }
          };
        }
      },
      {
        type: 'search',
        weight: 12,
        generator: () => {
          const searchTerms = [
            'organic fruits', 'dairy products', 'fresh vegetables', 'seafood',
            'protein powder', 'gluten free', 'vegan options', 'local produce',
            'sale items', 'healthy snacks', product.category.toLowerCase()
          ];
          const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
          return {
            type: 'search',
            description: `Searched for "${searchTerm}"`,
            searchTerm,
            value: null
          };
        }
      },
      {
        type: 'wishlist_add',
        weight: 8,
        generator: () => ({
          type: 'wishlist_add',
          description: `Added ${product.name} to wishlist`,
          productId: product.id,
          productName: product.name,
          category: product.category,
          value: null
        })
      },
      {
        type: 'category_browse',
        weight: 10,
        generator: () => ({
          type: 'category_browse',
          description: `Browsed ${product.category}`,
          category: product.category,
          value: null
        })
      },
      {
        type: 'login',
        weight: 3,
        generator: () => ({
          type: 'login',
          description: 'Logged in to account',
          value: null
        })
      },
      {
        type: 'checkout_start',
        weight: 2,
        generator: () => ({
          type: 'checkout_start',
          description: 'Started checkout process',
          value: (Math.random() * 50 + 10).toFixed(2)
        })
      },
      {
        type: 'checkout_complete',
        weight: 2,
        generator: () => ({
          type: 'checkout_complete',
          description: 'Completed purchase',
          value: (Math.random() * 50 + 10).toFixed(2)
        })
      }
    ];

    // Weighted random selection
    const totalWeight = activityTypes.reduce((sum, type) => sum + type.weight, 0);
    let randomWeight = Math.random() * totalWeight;
    
    let selectedType = activityTypes[0];
    for (const activityType of activityTypes) {
      randomWeight -= activityType.weight;
      if (randomWeight <= 0) {
        selectedType = activityType;
        break;
      }
    }

    const baseActivity = selectedType.generator();
    
    return {
      id: `activity_${this.activityId++}`,
      customerId: customer.id,
      customerName: customer.name,
      timestamp: new Date().toISOString(),
      location: customer.location,
      deviceType: this.getRandomDeviceType(),
      sessionId: `sess_${customer.id}_${Date.now()}`,
      userAgent: this.getRandomUserAgent(),
      ipAddress: this.getRandomIP(),
      ...baseActivity
    };
  }

  /**
   * Get random device type
   */
  getRandomDeviceType() {
    const devices = ['desktop', 'mobile', 'tablet'];
    const weights = [0.4, 0.5, 0.1]; // Mobile-heavy distribution
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < devices.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return devices[i];
      }
    }
    
    return 'mobile';
  }

  /**
   * Get random user agent
   */
  getRandomUserAgent() {
    const userAgents = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (Android 13; Mobile; rv:109.0) Gecko/109.0',
      'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
    ];
    
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  /**
   * Get random IP address
   */
  getRandomIP() {
    return `${Math.floor(Math.random() * 255) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
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
        console.error('[MockCustomerActivityGenerator] Error in subscriber callback:', error);
      }
    });
  }

  /**
   * Get current statistics
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeUsers: this.activeUsers.size,
      totalCustomers: this.customers.length,
      totalProducts: this.products.length,
      subscriberCount: this.subscribers.size,
      generatedActivities: this.activityId - 1
    };
  }

  /**
   * Force generate specific activity
   */
  generateSpecificActivity(customerId, activityType, details = {}) {
    const customer = this.customers.find(c => c.id === customerId) || this.customers[0];
    const product = details.productId 
      ? this.products.find(p => p.id === details.productId) 
      : this.products[Math.floor(Math.random() * this.products.length)];

    const activity = {
      id: `activity_${this.activityId++}`,
      customerId: customer.id,
      customerName: customer.name,
      type: activityType,
      timestamp: new Date().toISOString(),
      location: customer.location,
      deviceType: details.deviceType || this.getRandomDeviceType(),
      sessionId: `sess_${customer.id}_${Date.now()}`,
      productId: product?.id,
      productName: product?.name,
      category: product?.category,
      ...details
    };

    this.activeUsers.add(customer.id);
    this.emit('customer_activity', activity);
    
    return activity;
  }

  /**
   * Generate burst of activities (busy period simulation)
   */
  generateBurst(count = 5, delayBetween = 500) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.generateActivity();
      }, i * delayBetween);
    }
  }

  /**
   * Get random customer
   */
  getRandomCustomer() {
    return this.customers[Math.floor(Math.random() * this.customers.length)];
  }

  /**
   * Get random product
   */
  getRandomProduct() {
    return this.products[Math.floor(Math.random() * this.products.length)];
  }
}

// Export singleton instance
export const mockCustomerActivityGenerator = new MockCustomerActivityGenerator();

// Export class for custom instances
export default MockCustomerActivityGenerator;