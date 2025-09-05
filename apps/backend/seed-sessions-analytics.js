const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

// Configure AWS DynamoDB client
const client = new DynamoDBClient({
  region: 'eu-central-1',
});

const docClient = DynamoDBDocumentClient.from(client);

// Customer behavior patterns for session simulation
const customerBehaviorPatterns = {
  'customer-001': { // Sarah Johnson - Organized shopper
    sessionDuration: { min: 15, max: 35 },
    browsingIntensity: 'focused',
    cartAbandonmentRate: 0.1,
    searchBehavior: 'specific',
    pageViewsPerSession: { min: 8, max: 20 },
    devicePreference: ['mobile', 'desktop'],
    timePreferences: ['09:00-11:00', '18:00-20:00']
  },
  'customer-002': { // Michael Chen - Impulse buyer
    sessionDuration: { min: 25, max: 50 },
    browsingIntensity: 'exploratory',
    cartAbandonmentRate: 0.25,
    searchBehavior: 'browsing',
    pageViewsPerSession: { min: 15, max: 40 },
    devicePreference: ['mobile', 'tablet'],
    timePreferences: ['12:00-14:00', '20:00-22:00']
  },
  'customer-003': { // Emma Mueller - Research-focused
    sessionDuration: { min: 20, max: 45 },
    browsingIntensity: 'thorough',
    cartAbandonmentRate: 0.15,
    searchBehavior: 'research',
    pageViewsPerSession: { min: 12, max: 30 },
    devicePreference: ['desktop', 'tablet'],
    timePreferences: ['08:00-10:00', '19:00-21:00']
  },
  'customer-004': { // David Rodriguez - Quick shopper
    sessionDuration: { min: 8, max: 20 },
    browsingIntensity: 'minimal',
    cartAbandonmentRate: 0.2,
    searchBehavior: 'direct',
    pageViewsPerSession: { min: 5, max: 12 },
    devicePreference: ['mobile'],
    timePreferences: ['18:00-19:00', '21:00-22:00']
  },
  'customer-005': { // Lisa Anderson - Careful shopper
    sessionDuration: { min: 30, max: 60 },
    browsingIntensity: 'careful',
    cartAbandonmentRate: 0.05,
    searchBehavior: 'methodical',
    pageViewsPerSession: { min: 20, max: 50 },
    devicePreference: ['desktop'],
    timePreferences: ['10:00-12:00', '14:00-16:00']
  },
  'customer-006': { // Alex Kim - Mobile-first
    sessionDuration: { min: 12, max: 25 },
    browsingIntensity: 'quick',
    cartAbandonmentRate: 0.3,
    searchBehavior: 'mobile-focused',
    pageViewsPerSession: { min: 6, max: 15 },
    devicePreference: ['mobile'],
    timePreferences: ['07:00-09:00', '22:00-23:00']
  },
  'customer-007': { // Maria Santos - List-based shopper
    sessionDuration: { min: 18, max: 35 },
    browsingIntensity: 'systematic',
    cartAbandonmentRate: 0.12,
    searchBehavior: 'list-driven',
    pageViewsPerSession: { min: 10, max: 25 },
    devicePreference: ['mobile', 'desktop'],
    timePreferences: ['09:00-11:00', '15:00-17:00']
  }
};

// Page types and interaction patterns
const pageTypes = {
  'homepage': { weight: 0.15, avgTime: 45, bounceRate: 0.3 },
  'category': { weight: 0.25, avgTime: 120, bounceRate: 0.15 },
  'product': { weight: 0.35, avgTime: 180, bounceRate: 0.2 },
  'search': { weight: 0.1, avgTime: 90, bounceRate: 0.25 },
  'cart': { weight: 0.08, avgTime: 240, bounceRate: 0.4 },
  'checkout': { weight: 0.05, avgTime: 300, bounceRate: 0.5 },
  'profile': { weight: 0.02, avgTime: 150, bounceRate: 0.1 }
};

const productPages = [
  'MILK-001', 'BREAD-001', 'EGGS-001', 'BANANA-001', 'APPLES-001', 'CHICKEN-001',
  'YOGURT-001', 'CHEESE-001', 'TOMATO-001', 'CARROT-001', 'COFFEE-001', 'WATER-001',
  'PIZZA-001', 'ICECREAM-001', 'SHAMPOO-001', 'TOOTHPASTE-001', 'CLEAN-001', 'CHOCOLATE-001'
];

const categoryPages = [
  'Dairy', 'Produce', 'Bakery', 'Meat & Seafood', 'Beverages', 'Frozen Foods',
  'Personal Care', 'Cleaning', 'Health & Wellness', 'Pet Care', 'Household', 'Snacks'
];

// Generate realistic session data
function generateSessionData() {
  const sessions = [];
  const startDate = new Date('2024-06-01');
  const endDate = new Date('2025-01-19');
  
  Object.entries(customerBehaviorPatterns).forEach(([customerId, pattern]) => {
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // Generate 1-4 sessions per week per customer
      const sessionsThisWeek = Math.floor(Math.random() * 4) + 1;
      
      for (let sessionNum = 0; sessionNum < sessionsThisWeek; sessionNum++) {
        // Random day this week
        const sessionDate = new Date(currentDate);
        sessionDate.setDate(sessionDate.getDate() + Math.floor(Math.random() * 7));
        
        if (sessionDate > endDate) break;
        
        // Random time based on customer preference
        const timeSlot = pattern.timePreferences[Math.floor(Math.random() * pattern.timePreferences.length)];
        const [startHour, endHour] = timeSlot.split('-').map(time => parseInt(time.split(':')[0]));
        const hour = startHour + Math.floor(Math.random() * (endHour - startHour));
        const minute = Math.floor(Math.random() * 60);
        
        sessionDate.setHours(hour, minute, 0, 0);
        
        // Generate session
        const sessionId = uuidv4();
        const device = pattern.devicePreference[Math.floor(Math.random() * pattern.devicePreference.length)];
        const sessionDuration = Math.floor(Math.random() * (pattern.sessionDuration.max - pattern.sessionDuration.min)) + pattern.sessionDuration.min;
        const pageViews = Math.floor(Math.random() * (pattern.pageViewsPerSession.max - pattern.pageViewsPerSession.min)) + pattern.pageViewsPerSession.min;
        
        // Determine if session leads to purchase
        const makesPurchase = Math.random() > pattern.cartAbandonmentRate;
        const addedToCart = Math.random() < 0.6; // 60% chance to add something to cart
        
        // Generate page journey
        const pageJourney = generatePageJourney(pattern, pageViews, addedToCart, makesPurchase);
        
        // Calculate engagement metrics
        const totalTimeOnSite = sessionDuration * 60; // Convert to seconds
        const avgTimePerPage = totalTimeOnSite / pageViews;
        const bounceRate = pageViews === 1 ? 1 : 0;
        
        // Determine traffic source
        const trafficSources = ['direct', 'google', 'facebook', 'email', 'organic'];
        const source = trafficSources[Math.floor(Math.random() * trafficSources.length)];
        
        sessions.push({
          eventId: sessionId,
          timestamp: sessionDate.toISOString(),
          id: sessionId,
          customerId,
          sessionStart: sessionDate.toISOString(),
          sessionEnd: new Date(sessionDate.getTime() + sessionDuration * 60000).toISOString(),
          device,
          browser: device === 'mobile' ? 'Safari' : device === 'desktop' ? 'Chrome' : 'Safari',
          operatingSystem: device === 'mobile' ? 'iOS' : 'Windows',
          screenResolution: device === 'mobile' ? '375x667' : device === 'tablet' ? '768x1024' : '1920x1080',
          location: {
            country: 'Germany',
            city: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'][Math.floor(Math.random() * 5)],
            timezone: 'Europe/Berlin'
          },
          trafficSource: source,
          referrer: source === 'google' ? 'google.com' : source === 'facebook' ? 'facebook.com' : null,
          landingPage: pageJourney[0].page,
          exitPage: pageJourney[pageJourney.length - 1].page,
          pageViews,
          uniquePageViews: Math.max(1, pageViews - Math.floor(pageViews * 0.2)), // Some repeat views
          sessionDuration: sessionDuration,
          bounceRate: bounceRate,
          timeOnSite: totalTimeOnSite,
          pagesPerSession: pageViews,
          avgTimePerPage: Math.round(avgTimePerPage),
          interactions: {
            clicks: Math.floor(pageViews * (1.5 + Math.random())), // 1.5-2.5 clicks per page
            searches: pageJourney.filter(p => p.page === 'search').length,
            cartActions: addedToCart ? Math.floor(Math.random() * 3) + 1 : 0,
            productViews: pageJourney.filter(p => p.type === 'product').length,
            categoryViews: pageJourney.filter(p => p.type === 'category').length
          },
          conversionData: {
            addedToCart,
            initiatedCheckout: makesPurchase,
            completedPurchase: makesPurchase,
            cartValue: makesPurchase ? Math.floor(Math.random() * 100) + 20 : addedToCart ? Math.floor(Math.random() * 80) + 15 : 0,
            conversionRate: makesPurchase ? 1 : 0
          },
          pageJourney,
          userAgent: generateUserAgent(device),
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          sessionType: determineSessionType(pattern, addedToCart, makesPurchase),
          engagementScore: calculateEngagementScore(sessionDuration, pageViews, addedToCart, makesPurchase),
          metadata: {
            dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][sessionDate.getDay()],
            hour: sessionDate.getHours(),
            month: sessionDate.toLocaleDateString('en-US', { month: 'long' }),
            isWeekend: sessionDate.getDay() === 0 || sessionDate.getDay() === 6,
            isBusinessHours: sessionDate.getHours() >= 9 && sessionDate.getHours() <= 17,
            customerBehaviorType: pattern.browsingIntensity,
            sessionOutcome: makesPurchase ? 'purchase' : addedToCart ? 'cart_abandonment' : 'browsing'
          },
          createdAt: sessionDate.toISOString()
        });
      }
      
      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }
  });
  
  return sessions.sort((a, b) => new Date(a.sessionStart) - new Date(b.sessionStart));
}

function generatePageJourney(pattern, totalPages, addedToCart, makesPurchase) {
  const journey = [];
  let currentPage = 'homepage';
  
  for (let i = 0; i < totalPages; i++) {
    let pageType, page;
    
    if (i === 0) {
      // Landing page
      if (Math.random() < 0.7) {
        pageType = 'homepage';
        page = 'homepage';
      } else {
        pageType = 'category';
        page = categoryPages[Math.floor(Math.random() * categoryPages.length)];
      }
    } else {
      // Subsequent pages based on pattern
      const rand = Math.random();
      
      if (pattern.searchBehavior === 'specific' && rand < 0.4) {
        pageType = 'product';
        page = productPages[Math.floor(Math.random() * productPages.length)];
      } else if (pattern.browsingIntensity === 'exploratory' && rand < 0.3) {
        pageType = 'category';
        page = categoryPages[Math.floor(Math.random() * categoryPages.length)];
      } else if (rand < 0.1) {
        pageType = 'search';
        page = 'search';
      } else if (addedToCart && i > totalPages - 3 && rand < 0.4) {
        pageType = 'cart';
        page = 'cart';
      } else if (makesPurchase && i === totalPages - 1) {
        pageType = 'checkout';
        page = 'checkout';
      } else {
        pageType = 'product';
        page = productPages[Math.floor(Math.random() * productPages.length)];
      }
    }
    
    const timeOnPage = Math.max(5, Math.floor(Math.random() * (pageTypes[pageType]?.avgTime || 60)) + 10);
    
    journey.push({
      step: i + 1,
      page,
      type: pageType,
      timeOnPage, // seconds
      timestamp: new Date(Date.now() + i * timeOnPage * 1000).toISOString(),
      interactions: {
        clicks: Math.floor(Math.random() * 3),
        scrollDepth: Math.floor(Math.random() * 100) + 1, // 1-100%
        hovered: Math.random() < 0.6,
        focused: Math.random() < 0.4
      }
    });
    
    currentPage = page;
  }
  
  return journey;
}

function generateUserAgent(device) {
  const userAgents = {
    mobile: [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Mobile Safari/537.36'
    ],
    desktop: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
    ],
    tablet: [
      'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    ]
  };
  
  const agents = userAgents[device] || userAgents.desktop;
  return agents[Math.floor(Math.random() * agents.length)];
}

function determineSessionType(pattern, addedToCart, makesPurchase) {
  if (makesPurchase) return 'converter';
  if (addedToCart) return 'cart_abandoner';
  if (pattern.browsingIntensity === 'exploratory') return 'browser';
  if (pattern.browsingIntensity === 'focused') return 'researcher';
  return 'visitor';
}

function calculateEngagementScore(duration, pageViews, addedToCart, makesPurchase) {
  let score = 0;
  
  // Duration component (0-40 points)
  score += Math.min(40, duration * 0.8);
  
  // Page views component (0-30 points)  
  score += Math.min(30, pageViews * 2);
  
  // Conversion components
  if (addedToCart) score += 20;
  if (makesPurchase) score += 30;
  
  return Math.min(100, Math.round(score));
}

async function seedSessionAnalytics() {
  console.log('📱 Starting session analytics seeding with realistic user behavior...');
  
  try {
    const sessions = generateSessionData();
    console.log(`Generated ${sessions.length} realistic user sessions`);
    
    // Calculate statistics
    const totalSessions = sessions.length;
    const totalPageViews = sessions.reduce((sum, s) => sum + s.pageViews, 0);
    const avgSessionDuration = sessions.reduce((sum, s) => sum + s.sessionDuration, 0) / totalSessions;
    const conversionRate = sessions.filter(s => s.conversionData.completedPurchase).length / totalSessions;
    const cartAbandonmentRate = sessions.filter(s => s.conversionData.addedToCart && !s.conversionData.completedPurchase).length / sessions.filter(s => s.conversionData.addedToCart).length;
    
    console.log(`📊 Total page views: ${totalPageViews}`);
    console.log(`⏱️ Average session duration: ${Math.round(avgSessionDuration)} minutes`);
    console.log(`💰 Conversion rate: ${Math.round(conversionRate * 100)}%`);
    console.log(`🛒 Cart abandonment rate: ${Math.round(cartAbandonmentRate * 100)}%`);
    
    // Batch write sessions (DynamoDB limit is 25 items per batch)
    const batchSize = 25;
    let writtenCount = 0;
    
    for (let i = 0; i < sessions.length; i += batchSize) {
      const batch = sessions.slice(i, i + batchSize);
      const requestItems = batch.map(session => ({
        PutRequest: { Item: session }
      }));
      
      await docClient.send(new BatchWriteCommand({
        RequestItems: {
          'omnix-ai-cdk-streaming-analytics-dev-20250820T1533': requestItems
        }
      }));
      
      writtenCount += batch.length;
      console.log(`✅ Written ${writtenCount}/${sessions.length} sessions`);
      
      // Small delay to avoid throttling
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log('\n🎉 Session analytics seeding completed successfully!');
    console.log(`📱 Generated sessions: ${sessions.length}`);
    console.log(`👥 Customer behavior patterns: ${Object.keys(customerBehaviorPatterns).length}`);
    console.log(`🗓️ Date range: June 1, 2024 - January 19, 2025`);
    
    console.log('\n📊 Real-time analytics enabled:');
    console.log('   • User journey tracking and funnel analysis');
    console.log('   • Device and browser usage patterns');
    console.log('   • Peak shopping hours and seasonal trends');
    console.log('   • Cart abandonment and conversion optimization');
    console.log('   • Customer engagement scoring');
    console.log('   • Page performance and bounce rate analysis');
    
    console.log('\n🔍 AI insights ready for:');
    console.log('   • Personalized product recommendations based on browsing');
    console.log('   • Optimal timing for marketing campaigns');
    console.log('   • Mobile vs desktop user experience optimization');
    console.log('   • Customer segmentation by engagement patterns');
    console.log('   • Predictive cart abandonment prevention');
    
  } catch (error) {
    console.error('❌ Error seeding session analytics:', error);
    throw error;
  }
}

// Export for testing
module.exports = {
  seedSessionAnalytics,
  generateSessionData,
  customerBehaviorPatterns,
  pageTypes,
};

// Run if called directly
if (require.main === module) {
  seedSessionAnalytics()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}