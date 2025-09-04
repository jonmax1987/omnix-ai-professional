const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

// Configure AWS DynamoDB client
const client = new DynamoDBClient({
  region: 'eu-central-1',
});

const docClient = DynamoDBDocumentClient.from(client);

// Product IDs from seed-dynamodb.js with seasonal patterns
const productSeasonalPatterns = {
  // High seasonal variation
  'BANANA-001': { baseStock: 150, seasonality: 'high', peakMonths: [6, 7, 8], lowMonths: [12, 1, 2] },
  'ICECREAM-001': { baseStock: 45, seasonality: 'extreme', peakMonths: [5, 6, 7, 8, 9], lowMonths: [11, 12, 1, 2, 3] },
  'APPLES-001': { baseStock: 125, seasonality: 'medium', peakMonths: [9, 10, 11], lowMonths: [6, 7, 8] },
  
  // Medium seasonal variation
  'MILK-001': { baseStock: 120, seasonality: 'low', peakMonths: [12, 1], lowMonths: [7, 8] },
  'BREAD-001': { baseStock: 85, seasonality: 'low', peakMonths: [11, 12], lowMonths: [6, 7] },
  'CHICKEN-001': { baseStock: 25, seasonality: 'medium', peakMonths: [11, 12, 1], lowMonths: [6, 7, 8] },
  
  // Holiday/Event driven
  'CHOCOLATE-001': { baseStock: 90, seasonality: 'event', peakMonths: [2, 10, 11, 12], lowMonths: [1, 3, 4] },
  'COOKIES-001': { baseStock: 75, seasonality: 'event', peakMonths: [11, 12], lowMonths: [1, 2, 3] },
  
  // Summer seasonal
  'WATER-001': { baseStock: 120, seasonality: 'high', peakMonths: [5, 6, 7, 8, 9], lowMonths: [11, 12, 1, 2] },
  'JUICE-001': { baseStock: 95, seasonality: 'medium', peakMonths: [6, 7, 8], lowMonths: [12, 1, 2] },
  
  // Stable products with minor variations
  'TOILET-001': { baseStock: 75, seasonality: 'minimal', peakMonths: [3, 9], lowMonths: [] },
  'DETERGENT-001': { baseStock: 55, seasonality: 'minimal', peakMonths: [3, 4], lowMonths: [] },
  'SHAMPOO-001': { baseStock: 65, seasonality: 'minimal', peakMonths: [], lowMonths: [] },
  'TOOTHPASTE-001': { baseStock: 95, seasonality: 'minimal', peakMonths: [], lowMonths: [] },
  
  // Health products with flu season patterns
  'VITAMINC-001': { baseStock: 45, seasonality: 'medium', peakMonths: [10, 11, 12, 1, 2, 3], lowMonths: [6, 7, 8] },
  'PAINRELIEF-001': { baseStock: 80, seasonality: 'low', peakMonths: [11, 12, 1, 2], lowMonths: [6, 7] },
  
  // Pet care with steady demand
  'DOGFOOD-001': { baseStock: 35, seasonality: 'minimal', peakMonths: [], lowMonths: [] },
  'CATLITTER-001': { baseStock: 50, seasonality: 'minimal', peakMonths: [], lowMonths: [] },
  
  // Cleaning products with spring cleaning spike
  'CLEAN-001': { baseStock: 90, seasonality: 'medium', peakMonths: [3, 4, 5], lowMonths: [12, 1] },
  'PAPERTOWELS-001': { baseStock: 85, seasonality: 'low', peakMonths: [3, 4], lowMonths: [] },
  
  // Coffee with winter preference
  'COFFEE-001': { baseStock: 45, seasonality: 'medium', peakMonths: [10, 11, 12, 1, 2], lowMonths: [6, 7, 8] },
};

// Generate realistic inventory history with seasonal patterns
function generateInventoryHistory() {
  const inventoryHistory = [];
  const startDate = new Date('2024-06-01');
  const endDate = new Date('2025-01-19');
  
  Object.entries(productSeasonalPatterns).forEach(([productId, pattern]) => {
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const month = currentDate.getMonth() + 1; // 1-12
      const dayOfYear = Math.floor((currentDate - new Date(currentDate.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      
      // Calculate seasonal multiplier
      let seasonalMultiplier = 1.0;
      
      if (pattern.seasonality === 'extreme') {
        if (pattern.peakMonths.includes(month)) {
          seasonalMultiplier = 1.8 + 0.3 * Math.sin(dayOfYear * 0.1);
        } else if (pattern.lowMonths.includes(month)) {
          seasonalMultiplier = 0.3 + 0.2 * Math.sin(dayOfYear * 0.1);
        }
      } else if (pattern.seasonality === 'high') {
        if (pattern.peakMonths.includes(month)) {
          seasonalMultiplier = 1.5 + 0.2 * Math.sin(dayOfYear * 0.1);
        } else if (pattern.lowMonths.includes(month)) {
          seasonalMultiplier = 0.6 + 0.2 * Math.sin(dayOfYear * 0.1);
        }
      } else if (pattern.seasonality === 'medium') {
        if (pattern.peakMonths.includes(month)) {
          seasonalMultiplier = 1.3 + 0.15 * Math.sin(dayOfYear * 0.1);
        } else if (pattern.lowMonths.includes(month)) {
          seasonalMultiplier = 0.7 + 0.15 * Math.sin(dayOfYear * 0.1);
        }
      } else if (pattern.seasonality === 'low') {
        if (pattern.peakMonths.includes(month)) {
          seasonalMultiplier = 1.15 + 0.1 * Math.sin(dayOfYear * 0.1);
        } else if (pattern.lowMonths.includes(month)) {
          seasonalMultiplier = 0.85 + 0.1 * Math.sin(dayOfYear * 0.1);
        }
      } else if (pattern.seasonality === 'event') {
        if (pattern.peakMonths.includes(month)) {
          // Event-driven spikes (Valentine's, Halloween, Christmas)
          const dayOfMonth = currentDate.getDate();
          if (month === 2 && dayOfMonth === 14) seasonalMultiplier = 2.5; // Valentine's
          else if (month === 10 && dayOfMonth === 31) seasonalMultiplier = 2.2; // Halloween
          else if (month === 12 && dayOfMonth >= 20) seasonalMultiplier = 2.8; // Christmas
          else if (pattern.peakMonths.includes(month)) seasonalMultiplier = 1.4;
        } else if (pattern.lowMonths.includes(month)) {
          seasonalMultiplier = 0.6;
        }
      }
      
      // Add day-of-week variation (weekend shopping spikes)
      const dayOfWeek = currentDate.getDay();
      let weekdayMultiplier = 1.0;
      if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday/Saturday
        weekdayMultiplier = 1.2;
      } else if (dayOfWeek === 0 || dayOfWeek === 1) { // Sunday/Monday
        weekdayMultiplier = 0.8;
      }
      
      // Calculate consumption (items sold)
      const baseConsumption = pattern.baseStock * 0.15; // 15% daily turnover rate
      const consumption = Math.max(1, Math.round(
        baseConsumption * seasonalMultiplier * weekdayMultiplier * (0.8 + Math.random() * 0.4)
      ));
      
      // Calculate stock level (accounting for restocking)
      const isRestockDay = currentDate.getDay() === 1 || currentDate.getDay() === 4; // Monday/Thursday deliveries
      let currentStock = pattern.baseStock * seasonalMultiplier;
      
      if (!isRestockDay) {
        // Simulate stock depletion throughout the week
        const daysSinceRestock = Math.min(3, (7 + currentDate.getDay() - 1) % 7);
        currentStock = Math.max(10, currentStock - (consumption * daysSinceRestock * 1.2));
      }
      
      // Add random variation
      currentStock = Math.max(5, Math.round(currentStock * (0.9 + Math.random() * 0.2)));
      
      // Calculate metrics
      const stockValue = currentStock * getProductPrice(productId);
      const turnoverRate = consumption / currentStock;
      const daysOfStock = Math.round(currentStock / (consumption || 1));
      const stockoutRisk = currentStock < (pattern.baseStock * 0.2) ? 'high' : 
                          currentStock < (pattern.baseStock * 0.5) ? 'medium' : 'low';
      
      inventoryHistory.push({
        productId,
        timestamp: currentDate.toISOString(),
        quantity: currentStock,
        minThreshold: Math.round(pattern.baseStock * 0.25),
        maxThreshold: Math.round(pattern.baseStock * 1.5),
        unitPrice: getProductPrice(productId),
        totalValue: stockValue,
        consumedToday: consumption,
        restocked: isRestockDay,
        seasonalMultiplier: Math.round(seasonalMultiplier * 100) / 100,
        turnoverRate: Math.round(turnoverRate * 1000) / 1000,
        daysOfStock,
        stockoutRisk,
        lastUpdated: currentDate.toISOString(),
        metadata: {
          seasonality: pattern.seasonality,
          dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
          month: currentDate.toLocaleDateString('en-US', { month: 'long' }),
          weekOfYear: Math.ceil(dayOfYear / 7)
        }
      });
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });
  
  return inventoryHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// Helper function to get product prices (approximate from seed-dynamodb.js)
function getProductPrice(productId) {
  const prices = {
    'BANANA-001': 2.99,
    'ICECREAM-001': 6.99,
    'APPLES-001': 4.99,
    'MILK-001': 3.99,
    'BREAD-001': 2.99,
    'CHICKEN-001': 12.99,
    'CHOCOLATE-001': 4.49,
    'COOKIES-001': 5.99,
    'WATER-001': 7.99,
    'JUICE-001': 4.49,
    'TOILET-001': 15.99,
    'DETERGENT-001': 12.99,
    'SHAMPOO-001': 9.99,
    'TOOTHPASTE-001': 4.99,
    'VITAMINC-001': 12.99,
    'PAINRELIEF-001': 7.99,
    'DOGFOOD-001': 29.99,
    'CATLITTER-001': 14.99,
    'CLEAN-001': 6.99,
    'PAPERTOWELS-001': 12.99,
    'COFFEE-001': 18.99
  };
  return prices[productId] || 5.99;
}

async function seedInventoryHistory() {
  console.log('📊 Starting inventory history seeding with seasonal patterns...');
  
  try {
    const inventoryHistory = generateInventoryHistory();
    console.log(`Generated ${inventoryHistory.length} inventory records`);
    
    // Batch write inventory history (DynamoDB limit is 25 items per batch)
    const batchSize = 25;
    let writtenCount = 0;
    
    for (let i = 0; i < inventoryHistory.length; i += batchSize) {
      const batch = inventoryHistory.slice(i, i + batchSize);
      const requestItems = batch.map(record => ({
        PutRequest: { Item: record }
      }));
      
      await docClient.send(new BatchWriteCommand({
        RequestItems: {
          'omnix-ai-dev-inventory': requestItems
        }
      }));
      
      writtenCount += batch.length;
      console.log(`✅ Written ${writtenCount}/${inventoryHistory.length} inventory records`);
      
      // Small delay to avoid throttling
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🎉 Inventory history seeding completed successfully!');
    console.log(`📊 Generated records: ${inventoryHistory.length}`);
    console.log(`🗓️ Date range: June 1, 2024 - January 19, 2025`);
    console.log(`🏪 Products with seasonal patterns: ${Object.keys(productSeasonalPatterns).length}`);
    console.log(`📈 Seasonal patterns included: extreme, high, medium, low, minimal, event-driven`);
    
    console.log('\n📊 Sample seasonal insights:');
    console.log('   • Ice cream peaks in summer (180% of base stock)');
    console.log('   • Vitamins peak during flu season');
    console.log('   • Chocolate spikes during holidays');
    console.log('   • Cleaning products surge in spring');
    console.log('   • Water/beverages high in summer months');
    
  } catch (error) {
    console.error('❌ Error seeding inventory history:', error);
    throw error;
  }
}

// Export for testing
module.exports = {
  seedInventoryHistory,
  generateInventoryHistory,
  productSeasonalPatterns,
};

// Run if called directly
if (require.main === module) {
  seedInventoryHistory()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}