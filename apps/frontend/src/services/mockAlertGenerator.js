/**
 * OMNIX AI - Mock Alert Generator
 * Generates realistic alert notifications for real-time testing
 * MGR-026: Real-time alert notifications
 */

class MockAlertGenerator {
  constructor() {
    this.isActive = false;
    this.intervalId = null;
    this.subscribers = [];
    this.generateInterval = 4000; // 4 seconds
    
    // Alert templates with realistic scenarios
    this.alertTemplates = [
      // Critical Inventory Alerts
      {
        type: 'inventory',
        alertType: 'critical',
        weight: 15,
        templates: [
          {
            title: 'Critical Stock Alert',
            content: 'Fresh Milk 1L is critically low (3 units remaining)',
            data: { productName: 'Fresh Milk 1L', currentStock: 3, minThreshold: 20, category: 'Dairy' }
          },
          {
            title: 'Out of Stock Warning',
            content: 'Organic Bananas will be out of stock in 2 hours',
            data: { productName: 'Organic Bananas', currentStock: 8, minThreshold: 25, category: 'Produce' }
          },
          {
            title: 'Popular Item Low',
            content: 'Sourdough Bread running low during peak hours (5 units left)',
            data: { productName: 'Sourdough Bread', currentStock: 5, minThreshold: 15, category: 'Bakery' }
          }
        ]
      },
      
      // Revenue & Transaction Alerts
      {
        type: 'revenue',
        alertType: 'success',
        weight: 20,
        templates: [
          {
            title: 'High-Value Transaction',
            content: 'Large purchase: $247.83 - Premium customer transaction',
            data: { amount: 247.83, customerType: 'Premium', items: 12 }
          },
          {
            title: 'Revenue Milestone',
            content: 'Daily revenue target 85% reached ($12,750 of $15,000)',
            data: { current: 12750, target: 15000, percentage: 85 }
          },
          {
            title: 'Bulk Order Alert',
            content: 'Corporate order received: $1,250.00 (Office supplies)',
            data: { amount: 1250.00, orderType: 'Corporate', category: 'Office supplies' }
          }
        ]
      },
      
      // Warning Alerts
      {
        type: 'system',
        alertType: 'warning',
        weight: 12,
        templates: [
          {
            title: 'System Performance',
            content: 'POS system response time above normal (2.8s average)',
            data: { responseTime: 2.8, threshold: 2.0, affectedSystems: ['POS', 'Inventory'] }
          },
          {
            title: 'Temperature Alert',
            content: 'Dairy section temperature slightly elevated (4.2°C)',
            data: { temperature: 4.2, threshold: 4.0, section: 'Dairy' }
          },
          {
            title: 'Low Battery Warning',
            content: 'Scanner #3 battery low (15% remaining)',
            data: { device: 'Scanner #3', batteryLevel: 15, location: 'Checkout 3' }
          }
        ]
      },
      
      // Customer Activity Alerts
      {
        type: 'customer',
        alertType: 'info',
        weight: 25,
        templates: [
          {
            title: 'VIP Customer',
            content: 'Premium member Sarah Johnson entered store - Avg spend: $180',
            data: { customerName: 'Sarah Johnson', tier: 'Premium', avgSpend: 180 }
          },
          {
            title: 'Customer Milestone',
            content: 'John Davis reached 50th visit - Loyalty reward triggered',
            data: { customerName: 'John Davis', visits: 50, reward: 'Loyalty discount' }
          },
          {
            title: 'Unusual Activity',
            content: 'Customer in store for 45+ minutes - May need assistance',
            data: { duration: 47, location: 'Electronics section', assistanceNeeded: true }
          }
        ]
      },
      
      // Security & Loss Prevention
      {
        type: 'security',
        alertType: 'warning',
        weight: 8,
        templates: [
          {
            title: 'Security Alert',
            content: 'Unusual movement detected in storage area after hours',
            data: { location: 'Storage area', time: 'After hours', cameraId: 'CAM-07' }
          },
          {
            title: 'Access Control',
            content: 'Unauthorized badge scan attempt at manager office',
            data: { location: 'Manager office', badgeId: 'Unknown', attempts: 3 }
          }
        ]
      },
      
      // Quality & Health
      {
        type: 'quality',
        alertType: 'critical',
        weight: 10,
        templates: [
          {
            title: 'Expiry Alert',
            content: '8 items expiring today in Dairy section - Action required',
            data: { count: 8, section: 'Dairy', action: 'Remove or discount' }
          },
          {
            title: 'Quality Check',
            content: 'Produce quality inspection overdue (Last: 2 days ago)',
            data: { section: 'Produce', lastInspection: 2, overdue: true }
          }
        ]
      },
      
      // Success & Achievement Alerts
      {
        type: 'achievement',
        alertType: 'success',
        weight: 10,
        templates: [
          {
            title: 'Sales Goal Achieved',
            content: 'Weekly organic produce sales target exceeded by 15%',
            data: { category: 'Organic produce', target: 100, actual: 115, percentage: 115 }
          },
          {
            title: 'Customer Satisfaction',
            content: 'Today\'s customer satisfaction score: 4.8/5.0 (Above target)',
            data: { score: 4.8, target: 4.5, responses: 23 }
          },
          {
            title: 'Efficiency Milestone',
            content: 'Checkout efficiency improved 12% this week',
            data: { improvement: 12, metric: 'Checkout efficiency', timeframe: 'This week' }
          }
        ]
      }
    ];
    
    // Customer names for personalized alerts
    this.customerNames = [
      'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Williams', 
      'Lisa Anderson', 'James Thompson', 'Maria Garcia', 'Robert Davis',
      'Jennifer Wilson', 'Christopher Lee', 'Amanda Brown', 'Daniel Miller',
      'Jessica Martinez', 'Matthew Taylor', 'Ashley Thomas', 'Joshua Jackson'
    ];
    
    // Product names for inventory alerts
    this.products = [
      'Fresh Milk 1L', 'Organic Bananas', 'Sourdough Bread', 'Greek Yogurt',
      'Free-Range Eggs', 'Organic Spinach', 'Wild Salmon', 'Olive Oil',
      'Tomatoes', 'Chicken Breast', 'Cheddar Cheese', 'Orange Juice',
      'Whole Wheat Pasta', 'Ground Coffee', 'Dark Chocolate'
    ];
  }
  
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }
  
  notifySubscribers(alert) {
    this.subscribers.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error notifying alert subscriber:', error);
      }
    });
  }
  
  getWeightedAlertType() {
    const totalWeight = this.alertTemplates.reduce((sum, type) => sum + type.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const alertType of this.alertTemplates) {
      if (random < alertType.weight) {
        return alertType;
      }
      random -= alertType.weight;
    }
    
    return this.alertTemplates[0]; // Fallback
  }
  
  personalizeName(template) {
    if (template.content.includes('Customer') && !template.data.customerName) {
      const randomName = this.customerNames[Math.floor(Math.random() * this.customerNames.length)];
      template.content = template.content.replace('Customer', randomName);
      template.data.customerName = randomName;
    }
    return template;
  }
  
  personalizeProduct(template) {
    if (template.type === 'inventory' && !template.data.productName) {
      const randomProduct = this.products[Math.floor(Math.random() * this.products.length)];
      template.content = template.content.replace(/[A-Z][a-z\s]+(?=\sis|\swill|\srunning)/g, randomProduct);
      template.data.productName = randomProduct;
    }
    return template;
  }
  
  generateRandomValues(template) {
    // Add some randomness to numeric values
    if (template.data.amount) {
      template.data.amount = Math.round((template.data.amount + (Math.random() - 0.5) * 100) * 100) / 100;
    }
    if (template.data.currentStock) {
      template.data.currentStock = Math.max(1, template.data.currentStock + Math.floor(Math.random() * 10 - 5));
    }
    if (template.data.percentage) {
      template.data.percentage = Math.max(50, template.data.percentage + Math.floor(Math.random() * 20 - 10));
    }
    
    return template;
  }
  
  generateAlert() {
    const alertTypeTemplate = this.getWeightedAlertType();
    const template = alertTypeTemplate.templates[
      Math.floor(Math.random() * alertTypeTemplate.templates.length)
    ];
    
    // Create a copy to avoid mutating the original
    let alertTemplate = JSON.parse(JSON.stringify(template));
    
    // Personalize the alert
    alertTemplate = this.personalizeName(alertTemplate);
    alertTemplate = this.personalizeProduct(alertTemplate);
    alertTemplate = this.generateRandomValues(alertTemplate);
    
    // Create the final alert object
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: alertTypeTemplate.type,
      alertType: alertTypeTemplate.alertType,
      title: alertTemplate.title,
      content: alertTemplate.content,
      data: alertTemplate.data,
      timestamp: new Date(),
      read: false,
      urgent: alertTypeTemplate.alertType === 'critical',
      actions: this.generateActions(alertTypeTemplate.type, alertTemplate.data)
    };
    
    return alert;
  }
  
  generateActions(type, data) {
    const actions = [];
    
    switch (type) {
      case 'inventory':
        actions.push(
          { label: 'View Product', action: () => console.log('View product:', data.productName) },
          { label: 'Reorder Now', action: () => console.log('Reorder:', data.productName) }
        );
        break;
      case 'customer':
        actions.push(
          { label: 'View Profile', action: () => console.log('View customer:', data.customerName) },
          { label: 'Send Offer', action: () => console.log('Send offer to:', data.customerName) }
        );
        break;
      case 'revenue':
        actions.push(
          { label: 'View Details', action: () => console.log('View revenue details') },
          { label: 'Generate Report', action: () => console.log('Generate revenue report') }
        );
        break;
      case 'system':
        actions.push(
          { label: 'Check System', action: () => console.log('System check initiated') },
          { label: 'View Logs', action: () => console.log('View system logs') }
        );
        break;
      default:
        actions.push(
          { label: 'View Details', action: () => console.log('View alert details') }
        );
    }
    
    return actions;
  }
  
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('🚨 Mock Alert Generator started');
    
    this.intervalId = setInterval(() => {
      const alert = this.generateAlert();
      this.notifySubscribers(alert);
    }, this.generateInterval);
  }
  
  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('🚨 Mock Alert Generator stopped');
  }
  
  generateBurst(count = 3) {
    console.log(`🚨 Generating ${count} alerts...`);
    
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const alert = this.generateAlert();
        this.notifySubscribers(alert);
      }, i * 500); // Stagger by 500ms
    }
  }
  
  generateSpecificAlert(type, alertType) {
    const alertTypeTemplate = this.alertTemplates.find(t => t.type === type && t.alertType === alertType);
    if (!alertTypeTemplate) {
      console.error(`Alert type ${type}:${alertType} not found`);
      return null;
    }
    
    const template = alertTypeTemplate.templates[
      Math.floor(Math.random() * alertTypeTemplate.templates.length)
    ];
    
    let alertTemplate = JSON.parse(JSON.stringify(template));
    alertTemplate = this.personalizeName(alertTemplate);
    alertTemplate = this.personalizeProduct(alertTemplate);
    alertTemplate = this.generateRandomValues(alertTemplate);
    
    const alert = {
      id: `alert_manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: alertTypeTemplate.type,
      alertType: alertTypeTemplate.alertType,
      title: alertTemplate.title,
      content: alertTemplate.content,
      data: alertTemplate.data,
      timestamp: new Date(),
      read: false,
      urgent: alertTypeTemplate.alertType === 'critical',
      actions: this.generateActions(alertTypeTemplate.type, alertTemplate.data)
    };
    
    this.notifySubscribers(alert);
    return alert;
  }
  
  getAlertStats() {
    const totalWeight = this.alertTemplates.reduce((sum, type) => sum + type.weight, 0);
    return {
      totalTypes: this.alertTemplates.length,
      totalTemplates: this.alertTemplates.reduce((sum, type) => sum + type.templates.length, 0),
      weightDistribution: this.alertTemplates.map(type => ({
        type: type.type,
        alertType: type.alertType,
        weight: type.weight,
        percentage: Math.round((type.weight / totalWeight) * 100)
      }))
    };
  }
}

// Export singleton instance
const mockAlertGenerator = new MockAlertGenerator();

export default mockAlertGenerator;