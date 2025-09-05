const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

// Configure AWS DynamoDB client
const client = new DynamoDBClient({
  region: 'eu-central-1',
});

const docClient = DynamoDBDocumentClient.from(client);

// Customer personas with realistic shopping behaviors
const customerPersonas = {
  'customer-001': { // Sarah Johnson - Vegetarian family
    name: 'Sarah Johnson',
    shoppingFrequency: 'weekly',
    averageOrderValue: 85,
    preferredDays: [6, 3], // Saturday, Wednesday
    categoryPreferences: ['Dairy', 'Produce', 'Bakery', 'Health & Wellness'],
    avoidCategories: ['Meat & Seafood'],
    budgetConsciousness: 'medium',
    seasonalBehavior: 'moderate',
    loyaltyLevel: 'high'
  },
  'customer-002': { // Michael Chen - Premium shopper
    name: 'Michael Chen',
    shoppingFrequency: 'bi-weekly',
    averageOrderValue: 150,
    preferredDays: [0, 2], // Sunday, Tuesday  
    categoryPreferences: ['Meat & Seafood', 'Beverages', 'Snacks', 'Personal Care'],
    avoidCategories: [],
    budgetConsciousness: 'low',
    seasonalBehavior: 'high',
    loyaltyLevel: 'medium'
  },
  'customer-003': { // Emma Mueller - Health-focused family
    name: 'Emma Mueller',
    shoppingFrequency: 'weekly',
    averageOrderValue: 120,
    preferredDays: [5, 1], // Friday, Monday
    categoryPreferences: ['Health & Wellness', 'Personal Care', 'Cleaning', 'Produce'],
    avoidCategories: ['Snacks'],
    budgetConsciousness: 'medium',
    seasonalBehavior: 'high',
    loyaltyLevel: 'high'
  },
  'customer-004': { // David Rodriguez - Budget shopper
    name: 'David Rodriguez',
    shoppingFrequency: 'weekly',
    averageOrderValue: 45,
    preferredDays: [4, 0], // Thursday, Sunday
    categoryPreferences: ['Frozen Foods', 'Household', 'Cleaning'],
    avoidCategories: ['Personal Care'],
    budgetConsciousness: 'high',
    seasonalBehavior: 'low',
    loyaltyLevel: 'low'
  },
  'customer-005': { // Lisa Anderson - Health-conscious senior
    name: 'Lisa Anderson',
    shoppingFrequency: 'bi-weekly',
    averageOrderValue: 95,
    preferredDays: [2, 6], // Tuesday, Saturday
    categoryPreferences: ['Health & Wellness', 'Produce', 'Dairy'],
    avoidCategories: ['Snacks', 'Frozen Foods'],
    budgetConsciousness: 'low',
    seasonalBehavior: 'moderate',
    loyaltyLevel: 'high'
  },
  'customer-006': { // Alex Kim - Vegan young professional
    name: 'Alex Kim',
    shoppingFrequency: 'weekly',
    averageOrderValue: 60,
    preferredDays: [0, 3], // Sunday, Wednesday
    categoryPreferences: ['Produce', 'Beverages', 'Snacks'],
    avoidCategories: ['Dairy', 'Meat & Seafood'],
    budgetConsciousness: 'medium',
    seasonalBehavior: 'moderate',
    loyaltyLevel: 'medium'
  },
  'customer-007': { // Maria Santos - Large family
    name: 'Maria Santos',
    shoppingFrequency: 'weekly',
    averageOrderValue: 180,
    preferredDays: [6, 4], // Saturday, Thursday
    categoryPreferences: ['Bakery', 'Frozen Foods', 'Pet Care', 'Household'],
    avoidCategories: [],
    budgetConsciousness: 'high',
    seasonalBehavior: 'high',
    loyaltyLevel: 'medium'
  }
};

// Product catalog with realistic consumption patterns
const productCatalog = {
  // Dairy - Weekly/Bi-weekly consumption
  'MILK-001': { name: 'Whole Milk 1L', category: 'Dairy', price: 3.99, frequency: 'high', perishable: true },
  'MILK-002': { name: 'Low-Fat Milk 1L', category: 'Dairy', price: 3.79, frequency: 'high', perishable: true },
  'EGGS-001': { name: 'Fresh Eggs 12-Pack', category: 'Dairy', price: 4.99, frequency: 'medium', perishable: true },
  'CHEESE-001': { name: 'Cheddar Cheese Block', category: 'Dairy', price: 8.99, frequency: 'low', perishable: true },
  'YOGURT-001': { name: 'Greek Yogurt 500g', category: 'Dairy', price: 5.49, frequency: 'medium', perishable: true },
  'BUTTER-001': { name: 'Butter 250g', category: 'Dairy', price: 4.79, frequency: 'low', perishable: true },
  'CREAMCHEESE-001': { name: 'Cream Cheese 250g', category: 'Dairy', price: 6.99, frequency: 'low', perishable: true },

  // Produce - High frequency, seasonal
  'BANANA-001': { name: 'Bananas', category: 'Produce', price: 2.99, frequency: 'high', perishable: true },
  'APPLES-001': { name: 'Apples Red 1kg', category: 'Produce', price: 4.99, frequency: 'high', perishable: true },
  'TOMATO-001': { name: 'Tomatoes', category: 'Produce', price: 5.99, frequency: 'medium', perishable: true },
  'CARROT-001': { name: 'Carrots 1kg Bag', category: 'Produce', price: 3.49, frequency: 'medium', perishable: true },
  'POTATOES-001': { name: 'Potatoes 2kg Bag', category: 'Produce', price: 3.99, frequency: 'low', perishable: true },
  'ONIONS-001': { name: 'Onions 1kg Bag', category: 'Produce', price: 2.99, frequency: 'low', perishable: true },

  // Bakery - Medium frequency
  'BREAD-001': { name: 'White Bread Loaf', category: 'Bakery', price: 2.99, frequency: 'high', perishable: true },
  'CROISSANT-001': { name: 'Croissants 6-Pack', category: 'Bakery', price: 8.99, frequency: 'low', perishable: true },

  // Meat & Seafood - Medium frequency, expensive
  'CHICKEN-001': { name: 'Chicken Breast', category: 'Meat & Seafood', price: 12.99, frequency: 'medium', perishable: true },
  'BEEF-001': { name: 'Ground Beef', category: 'Meat & Seafood', price: 15.99, frequency: 'low', perishable: true },
  'SALMON-001': { name: 'Salmon Fillet', category: 'Meat & Seafood', price: 24.99, frequency: 'low', perishable: true },

  // Beverages - Varied frequency
  'JUICE-001': { name: 'Orange Juice 1L', category: 'Beverages', price: 4.49, frequency: 'medium', perishable: true },
  'WATER-001': { name: 'Sparkling Water 6-Pack', category: 'Beverages', price: 7.99, frequency: 'medium', perishable: false },
  'COFFEE-001': { name: 'Coffee Beans 500g', category: 'Beverages', price: 18.99, frequency: 'low', perishable: false },

  // Frozen Foods - Low frequency, convenience
  'PIZZA-001': { name: 'Frozen Pizza', category: 'Frozen Foods', price: 7.99, frequency: 'low', perishable: false },
  'ICECREAM-001': { name: 'Ice Cream Vanilla 1L', category: 'Frozen Foods', price: 6.99, frequency: 'low', perishable: false },

  // Personal Care - Monthly frequency
  'SHAMPOO-001': { name: 'Shampoo 400ml', category: 'Personal Care', price: 9.99, frequency: 'low', perishable: false },
  'TOOTHPASTE-001': { name: 'Toothpaste 100ml', category: 'Personal Care', price: 4.99, frequency: 'low', perishable: false },
  'CONDITIONER-001': { name: 'Conditioner 400ml', category: 'Personal Care', price: 11.99, frequency: 'low', perishable: false },
  'BODYWASH-001': { name: 'Body Wash 500ml', category: 'Personal Care', price: 7.99, frequency: 'low', perishable: false },
  'DEODORANT-001': { name: 'Deodorant Stick', category: 'Personal Care', price: 5.49, frequency: 'low', perishable: false },

  // Cleaning - Monthly frequency
  'CLEAN-001': { name: 'All-Purpose Cleaner 750ml', category: 'Cleaning', price: 6.99, frequency: 'low', perishable: false },
  'DETERGENT-001': { name: 'Laundry Detergent 2L', category: 'Cleaning', price: 12.99, frequency: 'low', perishable: false },
  'DISH-001': { name: 'Dish Soap 500ml', category: 'Cleaning', price: 3.99, frequency: 'medium', perishable: false },
  'TOILET-001': { name: 'Toilet Paper 12-Pack', category: 'Cleaning', price: 15.99, frequency: 'low', perishable: false },

  // Health & Wellness - Occasional
  'VITAMINC-001': { name: 'Vitamin C Tablets', category: 'Health & Wellness', price: 12.99, frequency: 'low', perishable: false },
  'MULTIVIT-001': { name: 'Multivitamin', category: 'Health & Wellness', price: 18.99, frequency: 'low', perishable: false },
  'PAINRELIEF-001': { name: 'Pain Relief Tablets', category: 'Health & Wellness', price: 7.99, frequency: 'low', perishable: false },
  'FIRSTAID-001': { name: 'First Aid Kit', category: 'Health & Wellness', price: 24.99, frequency: 'very_low', perishable: false },

  // Pet Care - Regular for pet owners
  'DOGFOOD-001': { name: 'Dry Dog Food 5kg', category: 'Pet Care', price: 29.99, frequency: 'low', perishable: false },
  'CATLITTER-001': { name: 'Cat Litter 10L', category: 'Pet Care', price: 14.99, frequency: 'low', perishable: false },
  'DOGTREATS-001': { name: 'Dog Treats 500g', category: 'Pet Care', price: 9.99, frequency: 'low', perishable: false },

  // Household - Occasional
  'FOIL-001': { name: 'Aluminum Foil 30m', category: 'Household', price: 6.99, frequency: 'low', perishable: false },
  'PLASTICWRAP-001': { name: 'Plastic Wrap 100m', category: 'Household', price: 4.99, frequency: 'low', perishable: false },
  'PAPERTOWELS-001': { name: 'Paper Towels 6-Pack', category: 'Household', price: 12.99, frequency: 'low', perishable: false },
  'LIGHTBULBS-001': { name: 'Light Bulbs LED 4-Pack', category: 'Household', price: 19.99, frequency: 'very_low', perishable: false },
  'BATTERIES-001': { name: 'Batteries AA 8-Pack', category: 'Household', price: 11.99, frequency: 'very_low', perishable: false },

  // Snacks - Impulse/regular
  'CHIPS-001': { name: 'Potato Chips 200g', category: 'Snacks', price: 3.99, frequency: 'medium', perishable: false },
  'CHOCOLATE-001': { name: 'Chocolate Bar Dark 70%', category: 'Snacks', price: 4.49, frequency: 'medium', perishable: false },
  'NUTS-001': { name: 'Mixed Nuts 250g', category: 'Snacks', price: 8.99, frequency: 'low', perishable: false },
  'COOKIES-001': { name: 'Cookies Chocolate Chip', category: 'Snacks', price: 5.99, frequency: 'medium', perishable: false }
};

// Generate realistic order history with consumption patterns
function generateOrderHistory() {
  const orders = [];
  const startDate = new Date('2024-06-01');
  const endDate = new Date('2025-01-19');
  
  Object.entries(customerPersonas).forEach(([customerId, persona]) => {
    let currentDate = new Date(startDate);
    let customerOrderHistory = {}; // Track what customer has bought and when
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const isPreferredDay = persona.preferredDays.includes(dayOfWeek);
      const weeksSinceStart = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24 * 7));
      
      // Determine if customer shops today
      let shouldShop = false;
      if (persona.shoppingFrequency === 'weekly') {
        shouldShop = isPreferredDay && weeksSinceStart % 1 === 0;
      } else if (persona.shoppingFrequency === 'bi-weekly') {
        shouldShop = isPreferredDay && weeksSinceStart % 2 === 0;
      }
      
      // Add some randomness (sometimes skip, sometimes extra trip)
      if (shouldShop && Math.random() < 0.15) shouldShop = false; // 15% chance to skip
      if (!shouldShop && isPreferredDay && Math.random() < 0.05) shouldShop = true; // 5% chance for extra trip
      
      if (shouldShop) {
        const orderId = uuidv4();
        const orderItems = [];
        let totalAmount = 0;
        const month = currentDate.getMonth() + 1;
        
        // Generate shopping basket based on persona
        Object.entries(productCatalog).forEach(([productId, product]) => {
          const categoryMatch = persona.categoryPreferences.includes(product.category);
          const categoryAvoid = persona.avoidCategories.includes(product.category);
          
          if (categoryAvoid) return;
          
          // Calculate purchase probability based on multiple factors
          let purchaseProbability = 0;
          
          if (categoryMatch) {
            if (product.frequency === 'high') purchaseProbability = 0.7;
            else if (product.frequency === 'medium') purchaseProbability = 0.4;
            else if (product.frequency === 'low') purchaseProbability = 0.15;
            else if (product.frequency === 'very_low') purchaseProbability = 0.05;
          } else {
            if (product.frequency === 'high') purchaseProbability = 0.3;
            else if (product.frequency === 'medium') purchaseProbability = 0.15;
            else if (product.frequency === 'low') purchaseProbability = 0.05;
            else if (product.frequency === 'very_low') purchaseProbability = 0.01;
          }
          
          // Adjust for customer loyalty and budget consciousness
          if (persona.loyaltyLevel === 'high' && categoryMatch) purchaseProbability *= 1.3;
          if (persona.budgetConsciousness === 'high' && product.price > 10) purchaseProbability *= 0.6;
          if (persona.budgetConsciousness === 'low') purchaseProbability *= 1.2;
          
          // Check if customer bought this recently (avoid overbuying non-perishables)
          const lastPurchase = customerOrderHistory[productId];
          if (lastPurchase && !product.perishable) {
            const daysSinceLastPurchase = (currentDate - lastPurchase) / (1000 * 60 * 60 * 24);
            if (daysSinceLastPurchase < 30) purchaseProbability *= 0.1; // Much less likely to rebuy
          } else if (lastPurchase && product.perishable) {
            const daysSinceLastPurchase = (currentDate - lastPurchase) / (1000 * 60 * 60 * 24);
            if (daysSinceLastPurchase < 7 && product.frequency === 'high') purchaseProbability *= 0.3;
          }
          
          // Seasonal adjustments
          if (persona.seasonalBehavior === 'high') {
            if (product.category === 'Frozen Foods' && [6, 7, 8].includes(month)) purchaseProbability *= 1.5; // Summer ice cream
            if (product.category === 'Health & Wellness' && [10, 11, 12, 1, 2].includes(month)) purchaseProbability *= 1.4; // Flu season
            if (product.category === 'Beverages' && [5, 6, 7, 8, 9].includes(month)) purchaseProbability *= 1.3; // Summer drinks
          }
          
          // Holiday effects for chocolate, cookies, etc.
          if (['CHOCOLATE-001', 'COOKIES-001'].includes(productId)) {
            if (month === 12 && currentDate.getDate() > 15) purchaseProbability *= 2.5; // Christmas
            if (month === 2 && currentDate.getDate() === 14) purchaseProbability *= 2.0; // Valentine's
            if (month === 10 && currentDate.getDate() > 25) purchaseProbability *= 1.8; // Halloween
          }
          
          if (Math.random() < purchaseProbability) {
            let quantity = 1;
            
            // Adjust quantity based on household size and product type
            if (customerId === 'customer-007' && ['MILK-001', 'BREAD-001', 'EGGS-001'].includes(productId)) {
              quantity = Math.ceil(Math.random() * 2 + 1); // Large family buys more staples
            }
            if (product.frequency === 'high' && Math.random() < 0.3) {
              quantity = 2; // Sometimes buy 2 of frequently used items
            }
            
            const itemTotal = product.price * quantity;
            totalAmount += itemTotal;
            
            orderItems.push({
              productId,
              productName: product.name,
              category: product.category,
              quantity,
              unitPrice: product.price,
              totalPrice: itemTotal,
              wasOnSale: Math.random() < 0.15, // 15% chance item was on sale
              discountAmount: Math.random() < 0.15 ? Math.round(itemTotal * 0.1 * 100) / 100 : 0
            });
            
            customerOrderHistory[productId] = new Date(currentDate);
          }
        });
        
        // Only create order if basket has items and meets minimum spend
        if (orderItems.length > 0 && totalAmount >= 10) {
          // Apply customer-level discount occasionally
          const loyaltyDiscount = persona.loyaltyLevel === 'high' && Math.random() < 0.1 ? totalAmount * 0.05 : 0;
          const finalAmount = totalAmount - loyaltyDiscount;
          
          orders.push({
            id: orderId,
            customerId,
            customerName: persona.name,
            orderDate: currentDate.toISOString(),
            status: 'completed',
            paymentMethod: Math.random() < 0.7 ? 'card' : 'cash',
            items: orderItems,
            subtotal: totalAmount,
            loyaltyDiscount: loyaltyDiscount,
            tax: Math.round(finalAmount * 0.19 * 100) / 100, // 19% VAT in Germany
            total: finalAmount + Math.round(finalAmount * 0.19 * 100) / 100,
            itemCount: orderItems.reduce((sum, item) => sum + item.quantity, 0),
            averageItemPrice: Math.round((totalAmount / orderItems.length) * 100) / 100,
            shoppingDuration: Math.round(15 + Math.random() * 45), // 15-60 minutes
            storeLocation: 'Main Store',
            createdAt: currentDate.toISOString(),
            metadata: {
              dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
              month: currentDate.toLocaleDateString('en-US', { month: 'long' }),
              season: Math.floor(month / 3) + 1,
              isHolidayPeriod: (month === 12 && currentDate.getDate() > 15) || (month === 1 && currentDate.getDate() < 7),
              basketComposition: {
                categories: [...new Set(orderItems.map(item => item.category))],
                perishableRatio: orderItems.filter(item => productCatalog[item.productId]?.perishable).length / orderItems.length
              }
            }
          });
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });
  
  return orders.sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
}

async function seedOrderHistory() {
  console.log('🛒 Starting order history seeding with realistic consumption patterns...');
  
  try {
    const orders = generateOrderHistory();
    console.log(`Generated ${orders.length} realistic orders`);
    
    // Calculate some statistics
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = totalRevenue / orders.length;
    const customerStats = {};
    
    orders.forEach(order => {
      if (!customerStats[order.customerId]) {
        customerStats[order.customerId] = { orders: 0, total: 0 };
      }
      customerStats[order.customerId].orders++;
      customerStats[order.customerId].total += order.total;
    });
    
    console.log(`💰 Total simulated revenue: €${Math.round(totalRevenue)}`);
    console.log(`📊 Average order value: €${Math.round(avgOrderValue)}`);
    
    // Batch write orders (DynamoDB limit is 25 items per batch)
    const batchSize = 25;
    let writtenCount = 0;
    
    for (let i = 0; i < orders.length; i += batchSize) {
      const batch = orders.slice(i, i + batchSize);
      const requestItems = batch.map(order => ({
        PutRequest: { Item: order }
      }));
      
      await docClient.send(new BatchWriteCommand({
        RequestItems: {
          'omnix-ai-dev-orders': requestItems
        }
      }));
      
      writtenCount += batch.length;
      console.log(`✅ Written ${writtenCount}/${orders.length} orders`);
      
      // Small delay to avoid throttling
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🎉 Order history seeding completed successfully!');
    console.log(`🛒 Generated orders: ${orders.length}`);
    console.log(`👥 Customer profiles: ${Object.keys(customerPersonas).length}`);
    console.log(`📦 Product catalog: ${Object.keys(productCatalog).length} items`);
    console.log(`🗓️ Date range: June 1, 2024 - January 19, 2025`);
    
    console.log('\n📊 Customer insights enabled:');
    console.log('   • Consumption pattern prediction ("buys milk every 5 days")');
    console.log('   • Category preference analysis');
    console.log('   • Seasonal shopping behavior');
    console.log('   • Budget and loyalty segmentation');
    console.log('   • Replenishment cycle tracking');
    
    console.log('\n🔍 AI Analytics ready for:');
    Object.entries(customerStats).forEach(([customerId, stats]) => {
      const avgValue = Math.round(stats.total / stats.orders);
      console.log(`   • ${customerId}: ${stats.orders} orders, €${avgValue} avg`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding order history:', error);
    throw error;
  }
}

// Export for testing
module.exports = {
  seedOrderHistory,
  generateOrderHistory,
  customerPersonas,
  productCatalog,
};

// Run if called directly
if (require.main === module) {
  seedOrderHistory()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}