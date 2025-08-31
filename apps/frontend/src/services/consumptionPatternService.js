/**
 * OMNIX AI - Consumption Pattern Service
 * Real-time customer consumption pattern analysis and prediction
 * STREAM-003: Instant consumption pattern updates
 */

class ConsumptionPatternService {
  constructor() {
    this.customerPatterns = new Map(); // customerId -> patterns
    this.productPatterns = new Map(); // productId -> consumption data
    this.patternListeners = new Set();
    this.patternTypes = this.initializePatternTypes();
    this.analysisThresholds = {
      minDataPoints: 3,
      confidenceThreshold: 0.7,
      seasonalityDetectionPeriod: 90, // days
      trendAnalysisPeriod: 30 // days
    };
  }

  /**
   * Initialize pattern type definitions
   */
  initializePatternTypes() {
    return {
      // Purchase frequency patterns
      'regular_weekly': {
        type: 'frequency',
        interval: 7,
        tolerance: 2,
        description: 'Weekly recurring purchases',
        prediction: 'next_purchase_date',
        confidence: 0.8
      },
      'biweekly': {
        type: 'frequency',
        interval: 14,
        tolerance: 3,
        description: 'Bi-weekly recurring purchases',
        prediction: 'next_purchase_date',
        confidence: 0.75
      },
      'monthly': {
        type: 'frequency',
        interval: 30,
        tolerance: 5,
        description: 'Monthly recurring purchases',
        prediction: 'next_purchase_date',
        confidence: 0.85
      },
      'quarterly': {
        type: 'frequency',
        interval: 90,
        tolerance: 10,
        description: 'Quarterly bulk purchases',
        prediction: 'next_purchase_date',
        confidence: 0.7
      },

      // Seasonal patterns
      'seasonal_summer': {
        type: 'seasonal',
        season: 'summer',
        months: [6, 7, 8],
        description: 'Summer seasonal consumption',
        prediction: 'seasonal_demand',
        confidence: 0.8
      },
      'seasonal_winter': {
        type: 'seasonal',
        season: 'winter',
        months: [12, 1, 2],
        description: 'Winter seasonal consumption',
        prediction: 'seasonal_demand',
        confidence: 0.8
      },
      'holiday_spikes': {
        type: 'event_driven',
        events: ['christmas', 'thanksgiving', 'easter'],
        description: 'Holiday-driven consumption spikes',
        prediction: 'event_demand',
        confidence: 0.9
      },

      // Usage patterns
      'bulk_buyer': {
        type: 'volume',
        characteristics: { averageQuantity: 10, frequency: 'low' },
        description: 'Bulk purchase pattern',
        prediction: 'bulk_timing',
        confidence: 0.75
      },
      'frequent_small': {
        type: 'volume',
        characteristics: { averageQuantity: 2, frequency: 'high' },
        description: 'Frequent small purchases',
        prediction: 'daily_need',
        confidence: 0.8
      },

      // Lifestyle patterns
      'family_size_large': {
        type: 'demographic',
        characteristics: { familySize: 4, consumptionRate: 'high' },
        description: 'Large family consumption',
        prediction: 'family_demand',
        confidence: 0.85
      },
      'single_household': {
        type: 'demographic',
        characteristics: { familySize: 1, consumptionRate: 'low' },
        description: 'Single person household',
        prediction: 'individual_demand',
        confidence: 0.7
      },

      // Time-based patterns
      'weekend_shopper': {
        type: 'temporal',
        timePattern: { daysOfWeek: [6, 7], preferredHours: [10, 11, 12] },
        description: 'Weekend shopping pattern',
        prediction: 'shopping_time',
        confidence: 0.8
      },
      'evening_buyer': {
        type: 'temporal',
        timePattern: { daysOfWeek: [1,2,3,4,5], preferredHours: [18, 19, 20] },
        description: 'Evening shopping pattern',
        prediction: 'shopping_time',
        confidence: 0.75
      }
    };
  }

  /**
   * Track consumption event and update patterns
   */
  trackConsumption(consumptionData) {
    const {
      customerId,
      productId,
      category,
      quantity,
      timestamp,
      value,
      metadata = {}
    } = consumptionData;

    // Update customer patterns
    this.updateCustomerPatterns(customerId, consumptionData);
    
    // Update product patterns
    this.updateProductPatterns(productId, consumptionData);
    
    // Detect new patterns
    const newPatterns = this.detectPatterns(customerId, productId);
    
    // Generate predictions
    const predictions = this.generatePredictions(customerId, productId, newPatterns);
    
    // Notify listeners of pattern updates
    const update = {
      customerId,
      productId,
      category,
      timestamp: new Date().toISOString(),
      patterns: newPatterns,
      predictions,
      confidence: this.calculateOverallConfidence(newPatterns),
      insights: this.generateInsights(customerId, newPatterns, predictions)
    };

    this.notifyListeners(update);
    
    return update;
  }

  /**
   * Update customer-specific consumption patterns
   */
  updateCustomerPatterns(customerId, consumptionData) {
    let customerData = this.customerPatterns.get(customerId);
    
    if (!customerData) {
      customerData = {
        customerId,
        totalConsumption: 0,
        totalSpent: 0,
        consumptionHistory: [],
        categories: new Map(),
        products: new Map(),
        timePatterns: new Map(),
        seasonalData: new Map(),
        lastAnalysis: null,
        patterns: []
      };
      this.customerPatterns.set(customerId, customerData);
    }

    // Add to consumption history
    customerData.consumptionHistory.push({
      ...consumptionData,
      analysisTimestamp: new Date().toISOString()
    });

    // Update aggregated data
    customerData.totalConsumption += consumptionData.quantity || 1;
    customerData.totalSpent += consumptionData.value || 0;

    // Update category data
    const categoryData = customerData.categories.get(consumptionData.category) || {
      totalQuantity: 0,
      totalSpent: 0,
      purchaseCount: 0,
      averageQuantity: 0,
      averageSpent: 0,
      lastPurchase: null
    };
    
    categoryData.totalQuantity += consumptionData.quantity || 1;
    categoryData.totalSpent += consumptionData.value || 0;
    categoryData.purchaseCount += 1;
    categoryData.averageQuantity = categoryData.totalQuantity / categoryData.purchaseCount;
    categoryData.averageSpent = categoryData.totalSpent / categoryData.purchaseCount;
    categoryData.lastPurchase = consumptionData.timestamp;
    
    customerData.categories.set(consumptionData.category, categoryData);

    // Update product-specific data
    const productData = customerData.products.get(consumptionData.productId) || {
      productId: consumptionData.productId,
      totalQuantity: 0,
      totalSpent: 0,
      purchaseCount: 0,
      purchaseDates: [],
      averageInterval: null,
      lastPurchase: null
    };
    
    productData.totalQuantity += consumptionData.quantity || 1;
    productData.totalSpent += consumptionData.value || 0;
    productData.purchaseCount += 1;
    productData.purchaseDates.push(new Date(consumptionData.timestamp).getTime());
    productData.lastPurchase = consumptionData.timestamp;
    
    // Calculate average purchase interval
    if (productData.purchaseDates.length > 1) {
      const intervals = [];
      for (let i = 1; i < productData.purchaseDates.length; i++) {
        intervals.push(productData.purchaseDates[i] - productData.purchaseDates[i - 1]);
      }
      productData.averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    }
    
    customerData.products.set(consumptionData.productId, productData);

    // Update temporal patterns
    const date = new Date(consumptionData.timestamp);
    const dayOfWeek = date.getDay();
    const hour = date.getHours();
    const timeKey = `${dayOfWeek}-${hour}`;
    
    const timeData = customerData.timePatterns.get(timeKey) || { count: 0, totalValue: 0 };
    timeData.count += 1;
    timeData.totalValue += consumptionData.value || 0;
    customerData.timePatterns.set(timeKey, timeData);

    // Update seasonal data
    const month = date.getMonth() + 1;
    const seasonalData = customerData.seasonalData.get(month) || { count: 0, totalValue: 0, totalQuantity: 0 };
    seasonalData.count += 1;
    seasonalData.totalValue += consumptionData.value || 0;
    seasonalData.totalQuantity += consumptionData.quantity || 1;
    customerData.seasonalData.set(month, seasonalData);

    // Keep history manageable
    if (customerData.consumptionHistory.length > 1000) {
      customerData.consumptionHistory = customerData.consumptionHistory.slice(-1000);
    }

    customerData.lastAnalysis = new Date().toISOString();
    return customerData;
  }

  /**
   * Update product-level consumption patterns
   */
  updateProductPatterns(productId, consumptionData) {
    let productData = this.productPatterns.get(productId);
    
    if (!productData) {
      productData = {
        productId,
        category: consumptionData.category,
        totalCustomers: new Set(),
        totalConsumption: 0,
        totalRevenue: 0,
        consumptionEvents: [],
        demographicPatterns: new Map(),
        seasonalTrends: new Map(),
        averageConsumptionRate: 0,
        popularityScore: 0,
        lastUpdated: null
      };
      this.productPatterns.set(productId, productData);
    }

    // Add customer to set
    productData.totalCustomers.add(consumptionData.customerId);
    
    // Update totals
    productData.totalConsumption += consumptionData.quantity || 1;
    productData.totalRevenue += consumptionData.value || 0;
    
    // Add event
    productData.consumptionEvents.push({
      customerId: consumptionData.customerId,
      quantity: consumptionData.quantity || 1,
      value: consumptionData.value || 0,
      timestamp: consumptionData.timestamp,
      metadata: consumptionData.metadata
    });

    // Calculate metrics
    productData.averageConsumptionRate = productData.totalConsumption / productData.totalCustomers.size;
    productData.popularityScore = this.calculatePopularityScore(productData);
    
    // Keep events manageable
    if (productData.consumptionEvents.length > 5000) {
      productData.consumptionEvents = productData.consumptionEvents.slice(-5000);
    }
    
    productData.lastUpdated = new Date().toISOString();
    return productData;
  }

  /**
   * Detect consumption patterns using ML-like algorithms
   */
  detectPatterns(customerId, productId) {
    const customerData = this.customerPatterns.get(customerId);
    const productData = this.customerData?.products.get(productId);
    
    if (!customerData || !productData) {
      return [];
    }

    const detectedPatterns = [];

    // Frequency pattern detection
    if (productData.averageInterval && productData.purchaseCount >= this.analysisThresholds.minDataPoints) {
      const intervalDays = productData.averageInterval / (24 * 60 * 60 * 1000);
      
      // Check against known frequency patterns
      for (const [patternKey, pattern] of Object.entries(this.patternTypes)) {
        if (pattern.type === 'frequency') {
          const deviation = Math.abs(intervalDays - pattern.interval);
          if (deviation <= pattern.tolerance) {
            const confidence = Math.max(0, 1 - (deviation / pattern.tolerance));
            detectedPatterns.push({
              type: patternKey,
              confidence: confidence * pattern.confidence,
              data: {
                averageInterval: intervalDays,
                lastPurchase: productData.lastPurchase,
                nextPredictedPurchase: this.predictNextPurchase(productData, pattern.interval)
              },
              metadata: {
                purchaseCount: productData.purchaseCount,
                consistency: this.calculateConsistency(productData.purchaseDates, pattern.interval)
              }
            });
          }
        }
      }
    }

    // Volume pattern detection
    const averageQuantity = productData.totalQuantity / productData.purchaseCount;
    if (averageQuantity >= 10 && productData.purchaseCount <= 5) {
      detectedPatterns.push({
        type: 'bulk_buyer',
        confidence: 0.8,
        data: {
          averageQuantity,
          purchaseFrequency: 'low',
          totalSpent: productData.totalSpent
        }
      });
    } else if (averageQuantity <= 3 && productData.purchaseCount >= 10) {
      detectedPatterns.push({
        type: 'frequent_small',
        confidence: 0.85,
        data: {
          averageQuantity,
          purchaseFrequency: 'high',
          totalSpent: productData.totalSpent
        }
      });
    }

    // Seasonal pattern detection
    const seasonalPattern = this.detectSeasonalPattern(customerData.seasonalData);
    if (seasonalPattern) {
      detectedPatterns.push(seasonalPattern);
    }

    // Temporal pattern detection
    const temporalPattern = this.detectTemporalPattern(customerData.timePatterns);
    if (temporalPattern) {
      detectedPatterns.push(temporalPattern);
    }

    return detectedPatterns;
  }

  /**
   * Detect seasonal consumption patterns
   */
  detectSeasonalPattern(seasonalData) {
    if (seasonalData.size < 6) return null; // Need at least 6 months of data
    
    const monthlyData = Array.from(seasonalData.entries()).map(([month, data]) => ({
      month,
      ...data,
      averageValue: data.totalValue / data.count
    }));
    
    // Check for summer pattern (June, July, August)
    const summerMonths = monthlyData.filter(d => [6, 7, 8].includes(d.month));
    const nonSummerMonths = monthlyData.filter(d => ![6, 7, 8].includes(d.month));
    
    if (summerMonths.length >= 2 && nonSummerMonths.length >= 3) {
      const summerAvg = summerMonths.reduce((sum, m) => sum + m.averageValue, 0) / summerMonths.length;
      const nonSummerAvg = nonSummerMonths.reduce((sum, m) => sum + m.averageValue, 0) / nonSummerMonths.length;
      
      if (summerAvg > nonSummerAvg * 1.5) {
        return {
          type: 'seasonal_summer',
          confidence: 0.8,
          data: {
            summerMultiplier: summerAvg / nonSummerAvg,
            peakMonths: summerMonths.map(m => m.month),
            seasonalIncrease: ((summerAvg - nonSummerAvg) / nonSummerAvg) * 100
          }
        };
      }
    }

    // Check for winter pattern (December, January, February)
    const winterMonths = monthlyData.filter(d => [12, 1, 2].includes(d.month));
    const nonWinterMonths = monthlyData.filter(d => ![12, 1, 2].includes(d.month));
    
    if (winterMonths.length >= 2 && nonWinterMonths.length >= 3) {
      const winterAvg = winterMonths.reduce((sum, m) => sum + m.averageValue, 0) / winterMonths.length;
      const nonWinterAvg = nonWinterMonths.reduce((sum, m) => sum + m.averageValue, 0) / nonWinterMonths.length;
      
      if (winterAvg > nonWinterAvg * 1.5) {
        return {
          type: 'seasonal_winter',
          confidence: 0.8,
          data: {
            winterMultiplier: winterAvg / nonWinterAvg,
            peakMonths: winterMonths.map(m => m.month),
            seasonalIncrease: ((winterAvg - nonWinterAvg) / nonWinterAvg) * 100
          }
        };
      }
    }

    return null;
  }

  /**
   * Detect temporal (time-based) consumption patterns
   */
  detectTemporalPattern(timePatterns) {
    if (timePatterns.size < 10) return null; // Need sufficient data
    
    const timeData = Array.from(timePatterns.entries()).map(([timeKey, data]) => {
      const [dayOfWeek, hour] = timeKey.split('-').map(Number);
      return {
        dayOfWeek,
        hour,
        count: data.count,
        averageValue: data.totalValue / data.count
      };
    });

    // Check for weekend shopping pattern
    const weekendData = timeData.filter(t => t.dayOfWeek === 0 || t.dayOfWeek === 6);
    const weekdayData = timeData.filter(t => t.dayOfWeek >= 1 && t.dayOfWeek <= 5);
    
    if (weekendData.length >= 3 && weekdayData.length >= 3) {
      const weekendTotal = weekendData.reduce((sum, t) => sum + t.count, 0);
      const weekdayTotal = weekdayData.reduce((sum, t) => sum + t.count, 0);
      
      if (weekendTotal > weekdayTotal * 1.5) {
        return {
          type: 'weekend_shopper',
          confidence: 0.75,
          data: {
            weekendPercentage: (weekendTotal / (weekendTotal + weekdayTotal)) * 100,
            preferredTimes: weekendData.sort((a, b) => b.count - a.count).slice(0, 3)
          }
        };
      }
    }

    // Check for evening shopping pattern
    const eveningData = timeData.filter(t => t.hour >= 17 && t.hour <= 21);
    const totalActivity = timeData.reduce((sum, t) => sum + t.count, 0);
    const eveningActivity = eveningData.reduce((sum, t) => sum + t.count, 0);
    
    if (eveningActivity / totalActivity > 0.6) {
      return {
        type: 'evening_buyer',
        confidence: 0.8,
        data: {
          eveningPercentage: (eveningActivity / totalActivity) * 100,
          peakHours: eveningData.sort((a, b) => b.count - a.count).slice(0, 2).map(t => t.hour)
        }
      };
    }

    return null;
  }

  /**
   * Generate predictions based on detected patterns
   */
  generatePredictions(customerId, productId, patterns) {
    const predictions = {
      nextPurchaseDate: null,
      nextPurchaseQuantity: null,
      monthlyConsumption: null,
      seasonalAdjustment: null,
      replenishmentReminder: null,
      confidence: 0
    };

    patterns.forEach(pattern => {
      switch (pattern.type) {
        case 'regular_weekly':
        case 'biweekly':
        case 'monthly':
          if (pattern.data.nextPredictedPurchase) {
            predictions.nextPurchaseDate = pattern.data.nextPredictedPurchase;
            predictions.confidence = Math.max(predictions.confidence, pattern.confidence);
          }
          break;
          
        case 'bulk_buyer':
          predictions.nextPurchaseQuantity = pattern.data.averageQuantity;
          predictions.monthlyConsumption = pattern.data.averageQuantity / 4; // Assuming monthly bulk buying
          break;
          
        case 'frequent_small':
          predictions.nextPurchaseQuantity = pattern.data.averageQuantity;
          predictions.monthlyConsumption = pattern.data.averageQuantity * 8; // Assuming weekly purchases
          break;
          
        case 'seasonal_summer':
        case 'seasonal_winter':
          const currentMonth = new Date().getMonth() + 1;
          if (pattern.data.peakMonths.includes(currentMonth)) {
            predictions.seasonalAdjustment = pattern.data.seasonalIncrease;
          }
          break;
      }
    });

    // Generate replenishment reminder
    if (predictions.nextPurchaseDate) {
      const nextPurchase = new Date(predictions.nextPurchaseDate);
      const reminderDate = new Date(nextPurchase.getTime() - (2 * 24 * 60 * 60 * 1000)); // 2 days before
      if (reminderDate > new Date()) {
        predictions.replenishmentReminder = reminderDate.toISOString();
      }
    }

    return predictions;
  }

  /**
   * Generate insights from patterns and predictions
   */
  generateInsights(customerId, patterns, predictions) {
    const insights = [];

    patterns.forEach(pattern => {
      switch (pattern.type) {
        case 'regular_weekly':
          insights.push({
            type: 'frequency',
            message: `Customer has a consistent weekly purchase pattern`,
            action: 'Set up automatic reorder reminder',
            priority: 'medium',
            data: pattern.data
          });
          break;
          
        case 'bulk_buyer':
          insights.push({
            type: 'volume',
            message: `Customer prefers bulk purchases - average ${pattern.data.averageQuantity} items`,
            action: 'Offer bulk discounts or family-size products',
            priority: 'high',
            data: pattern.data
          });
          break;
          
        case 'seasonal_summer':
          insights.push({
            type: 'seasonal',
            message: `${pattern.data.seasonalIncrease.toFixed(1)}% increase in summer consumption`,
            action: 'Increase inventory and marketing for summer months',
            priority: 'high',
            data: pattern.data
          });
          break;
          
        case 'weekend_shopper':
          insights.push({
            type: 'temporal',
            message: `Customer primarily shops on weekends (${pattern.data.weekendPercentage.toFixed(1)}%)`,
            action: 'Send promotions and reminders on Friday/Saturday',
            priority: 'medium',
            data: pattern.data
          });
          break;
      }
    });

    // Add prediction-based insights
    if (predictions.nextPurchaseDate) {
      const daysUntil = Math.ceil((new Date(predictions.nextPurchaseDate) - new Date()) / (24 * 60 * 60 * 1000));
      if (daysUntil <= 3) {
        insights.push({
          type: 'prediction',
          message: `Customer likely to purchase in ${daysUntil} days`,
          action: 'Send personalized product reminder',
          priority: 'high',
          data: { daysUntil, date: predictions.nextPurchaseDate }
        });
      }
    }

    return insights;
  }

  /**
   * Helper methods
   */
  
  calculatePopularityScore(productData) {
    const uniqueCustomers = productData.totalCustomers.size;
    const totalEvents = productData.consumptionEvents.length;
    const avgConsumption = productData.averageConsumptionRate;
    
    // Weighted score based on unique customers, total events, and consumption rate
    return (uniqueCustomers * 0.5) + (totalEvents * 0.3) + (avgConsumption * 0.2);
  }

  calculateConsistency(purchaseDates, expectedInterval) {
    if (purchaseDates.length < 3) return 0;
    
    const intervals = [];
    for (let i = 1; i < purchaseDates.length; i++) {
      intervals.push(purchaseDates[i] - purchaseDates[i - 1]);
    }
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const expectedMs = expectedInterval * 24 * 60 * 60 * 1000;
    
    // Calculate how close the average is to expected (1 = perfect, 0 = completely off)
    return Math.max(0, 1 - (Math.abs(avgInterval - expectedMs) / expectedMs));
  }

  predictNextPurchase(productData, intervalDays) {
    if (!productData.lastPurchase) return null;
    
    const lastPurchaseDate = new Date(productData.lastPurchase);
    const nextPurchaseDate = new Date(lastPurchaseDate.getTime() + (intervalDays * 24 * 60 * 60 * 1000));
    
    return nextPurchaseDate.toISOString();
  }

  calculateOverallConfidence(patterns) {
    if (patterns.length === 0) return 0;
    
    const totalConfidence = patterns.reduce((sum, pattern) => sum + pattern.confidence, 0);
    return totalConfidence / patterns.length;
  }

  /**
   * Get consumption analytics for a customer
   */
  getCustomerAnalytics(customerId) {
    const customerData = this.customerPatterns.get(customerId);
    if (!customerData) return null;

    const analytics = {
      customerId,
      summary: {
        totalConsumption: customerData.totalConsumption,
        totalSpent: customerData.totalSpent,
        averageOrderValue: customerData.totalSpent / customerData.consumptionHistory.length,
        activeProducts: customerData.products.size,
        favoriteCategories: this.getFavoriteCategories(customerData.categories)
      },
      patterns: customerData.patterns || [],
      timeAnalysis: this.analyzeTimePatterns(customerData.timePatterns),
      seasonalAnalysis: this.analyzeSeasonalPatterns(customerData.seasonalData),
      lastUpdate: customerData.lastAnalysis
    };

    return analytics;
  }

  getFavoriteCategories(categoriesMap) {
    return Array.from(categoriesMap.entries())
      .sort((a, b) => b[1].totalSpent - a[1].totalSpent)
      .slice(0, 5)
      .map(([category, data]) => ({
        category,
        totalSpent: data.totalSpent,
        purchaseCount: data.purchaseCount
      }));
  }

  analyzeTimePatterns(timePatternsMap) {
    const analysis = {
      peakDays: [],
      peakHours: [],
      weekendVsWeekday: { weekend: 0, weekday: 0 }
    };

    const timeData = Array.from(timePatternsMap.entries()).map(([key, data]) => {
      const [dayOfWeek, hour] = key.split('-').map(Number);
      return { dayOfWeek, hour, count: data.count, value: data.totalValue };
    });

    // Analyze by day of week
    const dayTotals = {};
    timeData.forEach(t => {
      dayTotals[t.dayOfWeek] = (dayTotals[t.dayOfWeek] || 0) + t.count;
      if (t.dayOfWeek === 0 || t.dayOfWeek === 6) {
        analysis.weekendVsWeekday.weekend += t.count;
      } else {
        analysis.weekendVsWeekday.weekday += t.count;
      }
    });

    analysis.peakDays = Object.entries(dayTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day, count]) => ({ day: parseInt(day), count }));

    // Analyze by hour
    const hourTotals = {};
    timeData.forEach(t => {
      hourTotals[t.hour] = (hourTotals[t.hour] || 0) + t.count;
    });

    analysis.peakHours = Object.entries(hourTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));

    return analysis;
  }

  analyzeSeasonalPatterns(seasonalDataMap) {
    const analysis = {
      peakMonths: [],
      seasonalTrends: {},
      yearOverYear: null
    };

    const monthlyData = Array.from(seasonalDataMap.entries())
      .map(([month, data]) => ({
        month,
        count: data.count,
        totalValue: data.totalValue,
        avgValue: data.totalValue / data.count
      }))
      .sort((a, b) => b.totalValue - a.totalValue);

    analysis.peakMonths = monthlyData.slice(0, 3);

    // Categorize by seasons
    analysis.seasonalTrends = {
      spring: monthlyData.filter(m => [3, 4, 5].includes(m.month)).reduce((sum, m) => sum + m.totalValue, 0),
      summer: monthlyData.filter(m => [6, 7, 8].includes(m.month)).reduce((sum, m) => sum + m.totalValue, 0),
      fall: monthlyData.filter(m => [9, 10, 11].includes(m.month)).reduce((sum, m) => sum + m.totalValue, 0),
      winter: monthlyData.filter(m => [12, 1, 2].includes(m.month)).reduce((sum, m) => sum + m.totalValue, 0)
    };

    return analysis;
  }

  /**
   * Bulk pattern analysis
   */
  analyzeAllPatterns() {
    const analysis = {
      totalCustomers: this.customerPatterns.size,
      totalProducts: this.productPatterns.size,
      patternSummary: {},
      topProducts: [],
      insights: []
    };

    // Analyze pattern distribution
    for (const customerData of this.customerPatterns.values()) {
      if (customerData.patterns) {
        customerData.patterns.forEach(pattern => {
          analysis.patternSummary[pattern.type] = 
            (analysis.patternSummary[pattern.type] || 0) + 1;
        });
      }
    }

    // Get top products by popularity
    analysis.topProducts = Array.from(this.productPatterns.values())
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, 10)
      .map(p => ({
        productId: p.productId,
        category: p.category,
        totalCustomers: p.totalCustomers.size,
        popularityScore: p.popularityScore.toFixed(2)
      }));

    return analysis;
  }

  /**
   * Subscribe to pattern updates
   */
  subscribe(listener) {
    this.patternListeners.add(listener);
    return () => this.patternListeners.delete(listener);
  }

  /**
   * Notify all listeners of pattern updates
   */
  notifyListeners(update) {
    this.patternListeners.forEach(listener => {
      try {
        listener(update);
      } catch (error) {
        console.error('Pattern listener error:', error);
      }
    });
  }

  /**
   * Clear all pattern data
   */
  clearAllData() {
    this.customerPatterns.clear();
    this.productPatterns.clear();
  }

  /**
   * Get pattern statistics
   */
  getStatistics() {
    return {
      totalCustomers: this.customerPatterns.size,
      totalProducts: this.productPatterns.size,
      totalPatterns: Array.from(this.customerPatterns.values())
        .reduce((sum, customer) => sum + (customer.patterns?.length || 0), 0),
      patternTypes: Object.keys(this.patternTypes)
    };
  }
}

// Create singleton instance
const consumptionPatternService = new ConsumptionPatternService();

export default consumptionPatternService;