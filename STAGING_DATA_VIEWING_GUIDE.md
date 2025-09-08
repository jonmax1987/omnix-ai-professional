# OMNIX AI - Staging Environment Data Viewing Guide

## 🌐 Staging Environment Access

### Primary URL
**https://dtdnwq4annvk2.cloudfront.net**

This is your staging environment where you can view all the populated data through the dual-interface system.

## 🔐 Login Credentials

### Manager Dashboard Access
- **URL**: https://dtdnwq4annvk2.cloudfront.net/login
- **Test Manager Account**:
  - Email: `manager@omnix.ai`
  - Password: `Manager123!`
  - Role: Manager (full admin access)

### Customer Interface Access
- **URL**: https://dtdnwq4annvk2.cloudfront.net/customer
- **Test Customer Accounts**:
  1. **Sarah Johnson** (Premium Customer)
     - Email: `sarah.johnson@email.com`
     - Password: `Customer123!`
     - Customer ID: `customer-001`
  
  2. **Michael Chen** (Regular Customer)
     - Email: `michael.chen@email.com`
     - Password: `Customer123!`
     - Customer ID: `customer-002`

## 📊 Manager Dashboard - Data Views

### 1. **Main Dashboard** (`/dashboard`)
View comprehensive business metrics:
- **Real-time Revenue**: Live revenue tracking with hourly updates
- **Customer Analytics**: 
  - Total customers: 5 profiles
  - Active sessions: 571 tracked sessions
  - Conversion rates: 82% average
- **Inventory Status**: 
  - 48 products across 10 categories
  - Stock levels with AI depletion predictions
- **Order Overview**: 
  - 655 historical orders
  - Order trends and patterns

### 2. **Analytics Page** (`/analytics`)
Deep dive into business intelligence:
- **Session Analytics**:
  - User journey visualization
  - Device distribution (Mobile/Desktop/Tablet)
  - Peak shopping hours heatmap
  - Conversion funnel analysis
- **Revenue Trends**:
  - 7+ months of historical data (June 2024 - Jan 2025)
  - Seasonal patterns and predictions
- **Customer Behavior**:
  - Average session duration: 28 minutes
  - Cart abandonment rate: 16%
  - Page views per session metrics

### 3. **Products Management** (`/products`)
Complete product catalog:
- **48 Products** organized by categories:
  - Dairy & Eggs
  - Fresh Produce
  - Bakery
  - Beverages
  - Snacks & Confectionery
  - Meat & Seafood
  - Frozen Foods
  - Health & Beauty
  - Household
  - Pantry Staples
- **Product Details**:
  - Current stock levels
  - Min/max thresholds
  - Supplier information
  - Price and nutritional data
  - AI demand predictions

### 4. **Orders Management** (`/orders`)
Historical order tracking:
- **655 Orders** with complete details
- **Order Analytics**:
  - Customer purchase patterns
  - Seasonal order variations
  - Average order value trends
- **Filter Options**:
  - By date range
  - By customer
  - By status
  - By product category

### 5. **Customer Segmentation** (`/dashboard`)
AI-powered customer insights:
- **Customer Segment Wheel**: Visual representation of 8 customer segments
- **Profiles Available**:
  1. Sarah Johnson - Organized Shopper
  2. Michael Chen - Impulse Buyer
  3. Emma Mueller - Research-Focused
  4. David Rodriguez - Quick Shopper
  5. Lisa Anderson - Careful Shopper
- **Segment Analytics**:
  - Shopping frequency patterns
  - Preferred shopping times
  - Device preferences
  - Cart behavior analysis

### 6. **AI Insights Panel** 
Real-time AI recommendations:
- **Inventory Predictions**: Stock depletion forecasts
- **Customer Predictions**: Next purchase predictions
- **Revenue Forecasts**: AI-driven revenue projections
- **Demand Patterns**: Seasonal and weekly patterns

### 7. **A/B Testing** (`/ab-testing`)
Model performance comparison:
- **Claude Haiku vs Sonnet** performance metrics
- **Test Results**:
  - Accuracy comparisons
  - Response time analysis
  - Cost optimization data
- **Active Experiments**:
  - Customer recommendation accuracy
  - Inventory prediction precision
  - Demand forecasting effectiveness

## 🛒 Customer Interface - Data Views

### 1. **Customer Dashboard** (`/customer-dashboard`)
Personalized shopping experience:
- **Personal Analytics**:
  - Shopping history visualization
  - Spending patterns by category
  - Savings opportunities
- **Smart Recommendations**:
  - AI-predicted needs based on consumption patterns
  - "You usually buy milk every 5 days"
  - Personalized product suggestions

### 2. **Shopping Features**
- **Smart Shopping List**: Auto-generated based on patterns
- **Reorder Predictions**: Items due for repurchase
- **Bundle Suggestions**: Frequently bought together
- **Recipe Integration**: Meal planning with shopping list

## 📈 Data Population Summary

### Current Database Status:
- ✅ **Products**: 48 items across 10 categories
- ✅ **Users**: 5 customer profiles with demographics
- ✅ **Orders**: 655 historical orders (7+ months)
- ✅ **Inventory**: 4,875 historical records with patterns
- ✅ **Sessions**: 571 user sessions with behavior data

### Data Characteristics:
- **Time Range**: June 2024 - January 2025
- **Realistic Patterns**: Seasonal variations, weekly cycles
- **Customer Behaviors**: Diverse shopping patterns
- **Conversion Metrics**: Real-world conversion rates
- **Device Distribution**: Mobile-first with tablet/desktop

## 🚀 Quick Start Navigation

1. **Access Staging**: https://dtdnwq4annvk2.cloudfront.net
2. **Login as Manager**: Use manager@omnix.ai credentials
3. **View Dashboard**: See real-time metrics and KPIs
4. **Explore Analytics**: Click Analytics tab for deep insights
5. **Check Products**: Browse full product catalog
6. **Review Orders**: Analyze 655 historical orders
7. **Switch to Customer View**: Login as customer to see personalization

## 🔧 Technical Features to Explore

### Real-Time Updates (WebSocket)
- Live revenue counter on dashboard
- Real-time inventory updates
- Instant alert notifications
- Live customer activity feed

### AI Features
- Hover over products for AI predictions
- Check AI Insights panel for recommendations
- View A/B test results for model comparisons
- Explore customer segment wheel for behavior patterns

### Mobile Responsiveness
- Test on mobile devices for mobile-first experience
- Check touch gestures and swipe navigation
- Verify responsive charts and visualizations

## 🐛 Debug Features (Development Mode)

If running locally with `npm run dev`:
- `/api-debug` - API request monitoring
- `/websocket-debug` - WebSocket message viewer
- `/cdn-performance` - CDN performance metrics
- `/query-debug` - React Query cache viewer

## 📝 Notes

- All data is test data populated via seed scripts
- Session analytics uses the streaming analytics table
- Customer profiles include realistic behavior patterns
- Order history spans 7+ months for trend analysis
- AI predictions are based on historical patterns

## 🆘 Troubleshooting

If data doesn't appear:
1. Clear browser cache and cookies
2. Check browser console for errors
3. Verify you're using the correct URL
4. Ensure you're logged in with correct credentials
5. API endpoints use: https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod

For WebSocket features:
- WebSocket URL: wss://5oo31khrrj.execute-api.eu-central-1.amazonaws.com/prod
- Real-time features require active WebSocket connection
- Check network tab for WS connection status

---

**Last Updated**: September 2025
**Environment**: Staging (CloudFront + API Gateway)
**Data Status**: Fully populated with 571 sessions, 655 orders, 48 products