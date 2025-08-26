const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'eu-central-1',
});

const docClient = DynamoDBDocumentClient.from(client);

// Sample customer for AI testing
const testCustomerId = 'ai-test-customer-001';

// Products for realistic shopping patterns
const products = [
  { id: 'prod-milk', name: 'Whole Milk 1L', category: 'Dairy', price: 3.99 },
  { id: 'prod-bread', name: 'Whole Wheat Bread', category: 'Bakery', price: 2.49 },
  { id: 'prod-eggs', name: 'Free Range Eggs (12)', category: 'Dairy', price: 4.99 },
  { id: 'prod-bananas', name: 'Bananas (1kg)', category: 'Fruits', price: 2.99 },
  { id: 'prod-apples', name: 'Gala Apples (1kg)', category: 'Fruits', price: 3.49 },
  { id: 'prod-chicken', name: 'Chicken Breast (500g)', category: 'Meat', price: 8.99 },
  { id: 'prod-rice', name: 'Basmati Rice (1kg)', category: 'Grains', price: 4.49 },
  { id: 'prod-pasta', name: 'Spaghetti Pasta', category: 'Grains', price: 1.99 },
  { id: 'prod-tomatoes', name: 'Fresh Tomatoes (500g)', category: 'Vegetables', price: 2.79 },
  { id: 'prod-onions', name: 'Yellow Onions (1kg)', category: 'Vegetables', price: 1.89 },
  { id: 'prod-coffee', name: 'Ground Coffee (250g)', category: 'Beverages', price: 6.99 },
  { id: 'prod-yogurt', name: 'Greek Yogurt (500g)', category: 'Dairy', price: 3.79 },
];

// Generate realistic purchase history with patterns
function generatePurchaseHistory() {
  const purchases = [];
  const startDate = new Date('2024-10-01');
  const endDate = new Date('2025-01-19');
  
  // Weekly shopping pattern with some variation
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Main weekly shop (Saturdays)
    if (currentDate.getDay() === 6) {
      const weeklyItems = [
        { product: products[0], quantity: 2 }, // Milk - twice weekly
        { product: products[1], quantity: 1 }, // Bread - weekly
        { product: products[2], quantity: 1 }, // Eggs - weekly
        { product: products[3], quantity: 1 }, // Bananas - weekly
        { product: products[4], quantity: 1 }, // Apples - weekly
        { product: products[5], quantity: 1 }, // Chicken - weekly
      ];
      
      weeklyItems.forEach(item => {
        purchases.push({
          id: uuidv4(),
          customerId: testCustomerId,
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.price,
          totalPrice: item.product.price * item.quantity,
          purchaseDate: currentDate.toISOString(),
          storeLocation: 'Main Store',
          promotionUsed: Math.random() > 0.8,
        });
      });
    }
    
    // Mid-week top-ups (Wednesday)
    if (currentDate.getDay() === 3 && Math.random() > 0.3) {
      const topUpItems = [
        { product: products[0], quantity: 1 }, // Extra milk
        { product: products[1], quantity: 1 }, // Extra bread
      ];
      
      topUpItems.forEach(item => {
        if (Math.random() > 0.5) { // Not every item every time
          purchases.push({
            id: uuidv4(),
            customerId: testCustomerId,
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.price,
            totalPrice: item.product.price * item.quantity,
            purchaseDate: currentDate.toISOString(),
            storeLocation: 'Main Store',
            promotionUsed: false,
          });
        }
      });
    }
    
    // Monthly bulk items (first Saturday of month)
    if (currentDate.getDay() === 6 && currentDate.getDate() <= 7) {
      const bulkItems = [
        { product: products[6], quantity: 2 }, // Rice - monthly
        { product: products[7], quantity: 3 }, // Pasta - monthly
        { product: products[10], quantity: 1 }, // Coffee - monthly
      ];
      
      bulkItems.forEach(item => {
        purchases.push({
          id: uuidv4(),
          customerId: testCustomerId,
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.price,
          totalPrice: item.product.price * item.quantity,
          purchaseDate: currentDate.toISOString(),
          storeLocation: 'Main Store',
          promotionUsed: Math.random() > 0.7,
        });
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return purchases.sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));
}

// Customer profile for testing
const testCustomerProfile = {
  customerId: testCustomerId,
  demographics: {
    age: 32,
    gender: 'female',
    location: 'Berlin, Germany',
    householdSize: 3,
  },
  preferences: {
    dietaryRestrictions: [],
    favoriteCategories: ['Organic', 'Fresh'],
    budgetRange: { min: 50, max: 150 },
    brandPreferences: ['Organic Valley', 'Local Farms'],
  },
  shoppingPatterns: {
    preferredShoppingTimes: ['Saturday Morning', 'Wednesday Evening'],
    averageOrderValue: 45.50,
    shoppingFrequency: 'weekly',
    seasonalPatterns: {
      summer: 'more_fruits',
      winter: 'comfort_foods',
    },
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Product interactions for more realistic data
function generateProductInteractions() {
  const interactions = [];
  const purchases = generatePurchaseHistory();
  
  purchases.forEach(purchase => {
    // View interaction before purchase
    interactions.push({
      id: uuidv4(),
      customerId: testCustomerId,
      productId: purchase.productId,
      interactionType: 'view',
      timestamp: new Date(new Date(purchase.purchaseDate).getTime() - 5 * 60 * 1000).toISOString(),
      sessionId: uuidv4(),
      metadata: { source: 'product_page' },
    });
    
    // Purchase interaction
    interactions.push({
      id: uuidv4(),
      customerId: testCustomerId,
      productId: purchase.productId,
      interactionType: 'purchase',
      timestamp: purchase.purchaseDate,
      sessionId: uuidv4(),
      metadata: { 
        quantity: purchase.quantity,
        price: purchase.totalPrice,
      },
    });
  });
  
  return interactions;
}

async function seedAITestData() {
  console.log('🌱 Starting AI test data seeding...');
  
  try {
    // 1. Create customer profile
    console.log('👤 Creating test customer profile...');
    await docClient.send(new PutCommand({
      TableName: 'omnix-ai-customer-profiles-dev',
      Item: testCustomerProfile,
    }));
    console.log('✅ Customer profile created');
    
    // 2. Create purchase history
    console.log('🛒 Creating purchase history...');
    const purchases = generatePurchaseHistory();
    
    // Batch write purchases (DynamoDB limit is 25 items per batch)
    const batchSize = 25;
    for (let i = 0; i < purchases.length; i += batchSize) {
      const batch = purchases.slice(i, i + batchSize);
      const requestItems = batch.map(purchase => ({
        PutRequest: { Item: purchase }
      }));
      
      await docClient.send(new BatchWriteCommand({
        RequestItems: {
          'omnix-ai-purchase-history-dev': requestItems
        }
      }));
      
      console.log(`✅ Written ${Math.min(i + batchSize, purchases.length)}/${purchases.length} purchases`);
    }
    
    // 3. Create product interactions
    console.log('👆 Creating product interactions...');
    const interactions = generateProductInteractions();
    
    for (let i = 0; i < interactions.length; i += batchSize) {
      const batch = interactions.slice(i, i + batchSize);
      const requestItems = batch.map(interaction => ({
        PutRequest: { Item: interaction }
      }));
      
      await docClient.send(new BatchWriteCommand({
        RequestItems: {
          'omnix-ai-product-interactions-dev': requestItems
        }
      }));
      
      console.log(`✅ Written ${Math.min(i + batchSize, interactions.length)}/${interactions.length} interactions`);
    }
    
    console.log('\n🎉 AI test data seeding completed successfully!');
    console.log(`📊 Test Customer ID: ${testCustomerId}`);
    console.log(`📈 Generated ${purchases.length} purchases`);
    console.log(`👆 Generated ${interactions.length} interactions`);
    console.log(`📅 Date range: 2024-10-01 to 2025-01-19`);
    
    console.log('\n🧪 Test this data with AI analysis endpoints:');
    console.log(`GET /v1/customers/${testCustomerId}/ai-analysis`);
    console.log(`GET /v1/customers/${testCustomerId}/consumption-predictions`);
    console.log(`GET /v1/customers/${testCustomerId}/ai-recommendations`);
    
  } catch (error) {
    console.error('❌ Error seeding AI test data:', error);
    throw error;
  }
}

// Export for testing
module.exports = {
  seedAITestData,
  testCustomerId,
  products,
  generatePurchaseHistory,
};

// Run if called directly
if (require.main === module) {
  seedAITestData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}