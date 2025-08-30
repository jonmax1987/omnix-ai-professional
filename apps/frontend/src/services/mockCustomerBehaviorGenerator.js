/**
 * OMNIX AI - Mock Customer Behavior Generator
 * Generates realistic customer behavior data for development/testing
 * STREAM-001: Real-time customer behavior tracking
 */

class MockCustomerBehaviorGenerator {
  constructor() {
    this.isGenerating = false;
    this.generateInterval = null;
    this.behaviorCount = 0;
    
    // Mock customers
    this.customers = [
      {
        id: 'cust-001',
        name: 'Alice Johnson',
        segment: 'premium',
        device: 'desktop',
        location: 'New York',
        isNew: false
      },
      {
        id: 'cust-002',
        name: 'Bob Smith',
        segment: 'regular',
        device: 'mobile',
        location: 'Los Angeles',
        isNew: true
      },
      {
        id: 'cust-003',
        name: 'Carol Davis',
        segment: 'premium',
        device: 'tablet',
        location: 'Chicago',
        isNew: false
      },
      {
        id: 'cust-004',
        name: 'David Wilson',
        segment: 'budget',
        device: 'mobile',
        location: 'Houston',
        isNew: false
      },
      {
        id: 'cust-005',
        name: 'Emma Brown',
        segment: 'regular',
        device: 'desktop',
        location: 'Phoenix',
        isNew: true
      },
      {
        id: 'cust-006',
        name: 'Frank Miller',
        segment: 'premium',
        device: 'mobile',
        location: 'Philadelphia',
        isNew: false
      }
    ];
    
    // Behavior templates with realistic weights and patterns
    this.behaviorTemplates = [
      // Page views (40% of all behaviors)
      {
        type: 'page_view',
        weight: 40,
        actions: [
          'Viewed homepage',
          'Browsed category page',
          'Visited product listing',
          'Checked promotional page',
          'Viewed about page',
          'Browsed deals section'
        ],
        categories: ['navigation', 'discovery', 'research'],
        pages: ['/home', '/categories', '/products', '/deals', '/about', '/contact'],
        baseValue: 0
      },
      
      // Product views (25% of behaviors)
      {
        type: 'product_view',
        weight: 25,
        actions: [
          'Viewed product details',
          'Checked product reviews',
          'Compared product options',
          'Viewed product gallery',
          'Read product specifications',
          'Watched product video'
        ],
        categories: ['products', 'research', 'comparison'],
        products: [
          { name: 'Organic Milk', category: 'dairy', price: 4.99 },
          { name: 'Fresh Bread', category: 'bakery', price: 2.49 },
          { name: 'Premium Coffee', category: 'beverages', price: 12.99 },
          { name: 'Greek Yogurt', category: 'dairy', price: 5.99 },
          { name: 'Seasonal Fruits', category: 'produce', price: 8.49 },
          { name: 'Artisan Cheese', category: 'dairy', price: 15.99 }
        ],
        baseValue: 0
      },
      
      // Search behaviors (15% of behaviors)
      {
        type: 'search',
        weight: 15,
        actions: [
          'Searched for products',
          'Used search filters',
          'Searched by category',
          'Searched for deals',
          'Voice search query',
          'Barcode search'
        ],
        categories: ['search', 'discovery'],
        queries: [
          'organic milk',
          'gluten free bread',
          'coffee beans',
          'fresh vegetables',
          'dairy products',
          'healthy snacks',
          'breakfast items',
          'dinner ingredients'
        ],
        baseValue: 0
      },
      
      // Cart additions (10% of behaviors)
      {
        type: 'cart_add',
        weight: 10,
        actions: [
          'Added item to cart',
          'Updated cart quantity',
          'Applied coupon code',
          'Saved item for later',
          'Added bulk items',
          'Quick add from wishlist'
        ],
        categories: ['shopping', 'conversion'],
        baseValue: 5
      },
      
      // Purchases (5% of behaviors - highest value)
      {
        type: 'purchase',
        weight: 5,
        actions: [
          'Completed purchase',
          'Used mobile checkout',
          'Applied loyalty points',
          'Scheduled delivery',
          'Chose pickup option',
          'Added tip for delivery'
        ],
        categories: ['transaction', 'conversion'],
        baseValue: 50
      },
      
      // Reviews and engagement (3% of behaviors)
      {
        type: 'review',
        weight: 3,
        actions: [
          'Left product review',
          'Rated purchase experience',
          'Uploaded product photo',
          'Shared review on social',
          'Marked review helpful',
          'Reported review issue'
        ],
        categories: ['engagement', 'feedback'],
        baseValue: 0
      },
      
      // Wishlist and favorites (2% of behaviors)
      {
        type: 'wishlist_add',
        weight: 2,
        actions: [
          'Added to wishlist',
          'Created shopping list',
          'Shared wishlist',
          'Organized favorites',
          'Set price alert',
          'Added to meal plan'
        ],
        categories: ['planning', 'engagement'],
        baseValue: 0
      }
    ];
    
    // Customer journey patterns
    this.journeyPatterns = {
      'browser': {
        behaviors: ['page_view', 'search', 'product_view', 'page_view'],
        probability: 0.4,
        sessionDuration: 300000 // 5 minutes
      },
      'researcher': {
        behaviors: ['search', 'product_view', 'product_view', 'review', 'product_view'],
        probability: 0.3,
        sessionDuration: 600000 // 10 minutes
      },
      'buyer': {
        behaviors: ['search', 'product_view', 'cart_add', 'cart_add', 'purchase'],
        probability: 0.2,
        sessionDuration: 900000 // 15 minutes
      },
      'impulse': {
        behaviors: ['page_view', 'product_view', 'cart_add', 'purchase'],
        probability: 0.1,
        sessionDuration: 180000 // 3 minutes
      }
    };
    
    // Time-based behavior patterns
    this.timePatterns = {
      morning: { multiplier: 1.2, peak: 9 },
      lunch: { multiplier: 1.5, peak: 12 },
      afternoon: { multiplier: 0.8, peak: 15 },
      evening: { multiplier: 1.3, peak: 19 },
      night: { multiplier: 0.3, peak: 22 }
    };
  }
  
  /**
   * Start generating mock customer behaviors
   */
  startGenerating(customerBehaviorStore, options = {}) {
    if (this.isGenerating) {
      console.warn('Customer behavior generation already running');
      return;
    }
    
    const {
      behaviorInterval = 2000,  // Generate behavior every 2 seconds
      batchSize = 1,
      enableJourneyPatterns = true
    } = options;
    
    this.isGenerating = true;
    this.behaviorCount = 0;
    
    // Generate behaviors
    this.generateInterval = setInterval(() => {
      for (let i = 0; i < batchSize; i++) {
        if (enableJourneyPatterns && Math.random() < 0.3) {
          this.generateJourneySequence(customerBehaviorStore);
        } else {
          this.generateRandomBehavior(customerBehaviorStore);
        }
      }
    }, behaviorInterval);
    
    console.log('🔄 Customer Behavior Generator: Started generating behaviors');
  }
  
  /**
   * Stop generating mock behaviors
   */
  stopGenerating() {
    if (!this.isGenerating) return;
    
    this.isGenerating = false;
    
    if (this.generateInterval) {
      clearInterval(this.generateInterval);
      this.generateInterval = null;
    }
    
    console.log('⏹️ Customer Behavior Generator: Stopped generating behaviors');
  }
  
  /**
   * Generate a single random behavior
   */
  generateRandomBehavior(customerBehaviorStore) {
    const customer = this.getRandomCustomer();
    const template = this.getWeightedBehaviorTemplate();
    const action = this.getRandomArrayItem(template.actions);
    
    // Apply time-based multipliers
    const currentHour = new Date().getHours();
    const timePattern = this.getTimePattern(currentHour);
    
    // Generate behavior based on customer segment
    let value = template.baseValue;
    if (template.type === 'purchase') {
      value = this.generatePurchaseValue(customer.segment);
    } else if (template.type === 'cart_add') {
      value = this.generateCartValue(customer.segment);
    }
    
    const behavior = {
      id: `behavior-${Date.now()}-${this.behaviorCount++}`,
      customerId: customer.id,
      sessionId: `session-${customer.id}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      
      type: template.type,
      action,
      category: this.getRandomArrayItem(template.categories),
      value,
      
      page: template.pages ? this.getRandomArrayItem(template.pages) : '/dashboard',
      product: template.products ? this.getRandomArrayItem(template.products) : null,
      search_query: template.queries ? this.getRandomArrayItem(template.queries) : null,
      referrer: this.getRandomReferrer(),
      device: customer.device,
      location: customer.location,
      
      session_duration: Math.floor(Math.random() * 1800000), // 0-30 minutes
      page_views: Math.floor(Math.random() * 10) + 1,
      is_new_customer: customer.isNew,
      
      is_purchase: template.type === 'purchase',
      is_conversion: template.type === 'purchase' || template.type === 'cart_add',
      is_bounce: Math.random() < 0.1, // 10% bounce rate
      
      metadata: {
        customerSegment: customer.segment,
        timePattern: timePattern.name,
        generatedBy: 'mockCustomerBehaviorGenerator',
        customerName: customer.name
      }
    };
    
    customerBehaviorStore.getState().trackBehavior(behavior);
    return behavior;
  }
  
  /**
   * Generate a customer journey sequence
   */
  generateJourneySequence(customerBehaviorStore) {
    const customer = this.getRandomCustomer();
    const journeyType = this.getWeightedJourneyPattern();
    const journey = this.journeyPatterns[journeyType];
    
    const sessionId = `session-${customer.id}-${Date.now()}`;
    const baseTime = Date.now();
    const stepInterval = journey.sessionDuration / journey.behaviors.length;
    
    journey.behaviors.forEach((behaviorType, index) => {
      setTimeout(() => {
        const template = this.behaviorTemplates.find(t => t.type === behaviorType);
        if (!template) return;
        
        const action = this.getRandomArrayItem(template.actions);
        let value = template.baseValue;
        
        if (template.type === 'purchase') {
          value = this.generatePurchaseValue(customer.segment);
        } else if (template.type === 'cart_add') {
          value = this.generateCartValue(customer.segment);
        }
        
        const behavior = {
          id: `behavior-${baseTime}-${index}`,
          customerId: customer.id,
          sessionId,
          timestamp: new Date(baseTime + (stepInterval * index)).toISOString(),
          
          type: template.type,
          action,
          category: this.getRandomArrayItem(template.categories),
          value,
          
          page: template.pages ? this.getRandomArrayItem(template.pages) : '/dashboard',
          product: template.products ? this.getRandomArrayItem(template.products) : null,
          search_query: template.queries ? this.getRandomArrayItem(template.queries) : null,
          referrer: index === 0 ? this.getRandomReferrer() : null,
          device: customer.device,
          location: customer.location,
          
          session_duration: stepInterval * (index + 1),
          page_views: index + 1,
          is_new_customer: customer.isNew,
          
          is_purchase: template.type === 'purchase',
          is_conversion: template.type === 'purchase' || template.type === 'cart_add',
          is_bounce: index === 0 && journey.behaviors.length === 1,
          
          metadata: {
            customerSegment: customer.segment,
            journeyType,
            stepIndex: index,
            totalSteps: journey.behaviors.length,
            generatedBy: 'mockCustomerBehaviorGenerator',
            customerName: customer.name
          }
        };
        
        customerBehaviorStore.getState().trackBehavior(behavior);
      }, stepInterval * index);
    });
    
    console.log(`🛒 Generated ${journeyType} journey for ${customer.name} (${journey.behaviors.length} steps)`);
  }
  
  /**
   * Generate purchase value based on customer segment
   */
  generatePurchaseValue(segment) {
    const baseValues = {
      premium: { min: 50, max: 200 },
      regular: { min: 20, max: 80 },
      budget: { min: 10, max: 40 }
    };
    
    const range = baseValues[segment] || baseValues.regular;
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }
  
  /**
   * Generate cart addition value
   */
  generateCartValue(segment) {
    const multiplier = segment === 'premium' ? 2 : segment === 'budget' ? 0.5 : 1;
    return Math.floor((Math.random() * 30 + 5) * multiplier);
  }
  
  /**
   * Get time pattern for current hour
   */
  getTimePattern(hour) {
    if (hour >= 6 && hour < 11) return { name: 'morning', ...this.timePatterns.morning };
    if (hour >= 11 && hour < 14) return { name: 'lunch', ...this.timePatterns.lunch };
    if (hour >= 14 && hour < 17) return { name: 'afternoon', ...this.timePatterns.afternoon };
    if (hour >= 17 && hour < 22) return { name: 'evening', ...this.timePatterns.evening };
    return { name: 'night', ...this.timePatterns.night };
  }
  
  /**
   * Get random customer
   */
  getRandomCustomer() {
    return this.customers[Math.floor(Math.random() * this.customers.length)];
  }
  
  /**
   * Get weighted behavior template
   */
  getWeightedBehaviorTemplate() {
    const totalWeight = this.behaviorTemplates.reduce((sum, template) => sum + template.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const template of this.behaviorTemplates) {
      if (random < template.weight) {
        return template;
      }
      random -= template.weight;
    }
    
    return this.behaviorTemplates[0];
  }
  
  /**
   * Get weighted journey pattern
   */
  getWeightedJourneyPattern() {
    const patterns = Object.keys(this.journeyPatterns);
    const random = Math.random();
    let cumulativeProbability = 0;
    
    for (const pattern of patterns) {
      cumulativeProbability += this.journeyPatterns[pattern].probability;
      if (random < cumulativeProbability) {
        return pattern;
      }
    }
    
    return patterns[0];
  }
  
  /**
   * Get random array item
   */
  getRandomArrayItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  /**
   * Get random referrer
   */
  getRandomReferrer() {
    const referrers = [
      'google.com',
      'facebook.com',
      'instagram.com',
      'twitter.com',
      'direct',
      'email_campaign',
      'affiliate_link'
    ];
    return this.getRandomArrayItem(referrers);
  }
  
  /**
   * Generate batch of behaviors at once
   */
  generateBehaviorBatch(customerBehaviorStore, count = 10) {
    const behaviors = [];
    for (let i = 0; i < count; i++) {
      const behavior = this.generateRandomBehavior(customerBehaviorStore);
      behaviors.push(behavior);
      // Space out timestamps slightly
      if (i < count - 1) {
        const delay = Math.random() * 5000; // 0-5 seconds
        behavior.timestamp = new Date(Date.now() - delay).toISOString();
      }
    }
    
    console.log(`📊 Generated batch of ${count} customer behaviors`);
    return behaviors;
  }
  
  /**
   * Get current generator statistics
   */
  getStats() {
    return {
      isGenerating: this.isGenerating,
      behaviorCount: this.behaviorCount,
      customerCount: this.customers.length,
      behaviorTypes: this.behaviorTemplates.length,
      journeyPatterns: Object.keys(this.journeyPatterns).length
    };
  }
  
  /**
   * Reset generator state
   */
  reset() {
    this.stopGenerating();
    this.behaviorCount = 0;
    console.log('🔄 Customer Behavior Generator: Reset state');
  }
}

// Export singleton instance
const mockCustomerBehaviorGenerator = new MockCustomerBehaviorGenerator();

export default mockCustomerBehaviorGenerator;