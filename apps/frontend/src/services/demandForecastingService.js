class DemandForecastingService {
  constructor() {
    this.forecastingModels = {
      seasonality: {
        id: 'seasonality',
        name: 'Seasonal Analysis',
        weight: 0.25,
        accuracy: 0.87,
        calculate: this.calculateSeasonalDemand.bind(this)
      },
      trend: {
        id: 'trend',
        name: 'Trend Analysis',
        weight: 0.22,
        accuracy: 0.84,
        calculate: this.calculateTrendDemand.bind(this)
      },
      behavioral: {
        id: 'behavioral',
        name: 'Customer Behavior',
        weight: 0.20,
        accuracy: 0.89,
        calculate: this.calculateBehavioralDemand.bind(this)
      },
      external: {
        id: 'external',
        name: 'External Factors',
        weight: 0.18,
        accuracy: 0.82,
        calculate: this.calculateExternalFactorsDemand.bind(this)
      },
      promotional: {
        id: 'promotional',
        name: 'Promotional Impact',
        weight: 0.15,
        accuracy: 0.91,
        calculate: this.calculatePromotionalDemand.bind(this)
      }
    };

    this.historicalData = new Map();
    this.forecastCache = new Map();
    this.performanceMetrics = {
      totalPredictions: 0,
      accuratePredicitions: 0,
      avgResponseTime: 0,
      modelPerformance: {}
    };

    this.initializeHistoricalData();
  }

  initializeHistoricalData() {
    const mockHistoricalData = {
      'item_1': {
        dailySales: [15, 18, 12, 25, 22, 19, 16, 14, 20, 23, 17, 21, 24, 16, 19],
        weeklyTrends: [0.95, 1.05, 1.15, 1.25, 1.10, 0.90, 0.85],
        monthlySeasonality: [1.0, 0.95, 1.1, 1.15, 1.2, 1.25, 1.3, 1.25, 1.15, 1.05, 0.95, 1.0],
        promotionalHistory: [
          { date: '2024-08-15', impact: 1.4, duration: 3 },
          { date: '2024-07-20', impact: 1.6, duration: 5 }
        ]
      },
      'item_2': {
        dailySales: [8, 12, 10, 15, 18, 14, 11, 9, 16, 13, 12, 17, 19, 11, 14],
        weeklyTrends: [1.1, 1.2, 1.0, 0.9, 0.85, 0.95, 1.0],
        monthlySeasonality: [1.0, 1.05, 0.95, 0.9, 0.95, 1.0, 1.1, 1.15, 1.05, 1.0, 0.95, 1.0],
        promotionalHistory: [
          { date: '2024-08-10', impact: 1.3, duration: 4 }
        ]
      },
      'item_3': {
        dailySales: [25, 30, 28, 35, 32, 29, 26, 24, 31, 33, 27, 36, 38, 25, 30],
        weeklyTrends: [0.9, 1.0, 1.1, 1.2, 1.15, 1.05, 0.95],
        monthlySeasonality: [1.0, 0.9, 1.05, 1.15, 1.25, 1.3, 1.2, 1.1, 1.0, 0.95, 0.9, 1.0],
        promotionalHistory: []
      }
    };

    Object.entries(mockHistoricalData).forEach(([itemId, data]) => {
      this.historicalData.set(itemId, data);
    });
  }

  async forecastDemand(itemId, forecastPeriod = 7, context = {}) {
    const startTime = performance.now();
    
    try {
      const cacheKey = `${itemId}_${forecastPeriod}_${JSON.stringify(context)}`;
      
      if (this.forecastCache.has(cacheKey)) {
        const cached = this.forecastCache.get(cacheKey);
        if (Date.now() - cached.timestamp < 300000) { // 5 minutes cache
          return cached.forecast;
        }
      }

      const historicalData = this.historicalData.get(itemId) || this.generateMockHistoricalData(itemId);
      
      const forecastContext = {
        itemId,
        forecastPeriod,
        currentDate: new Date(),
        weatherConditions: context.weather || 'normal',
        promotions: context.promotions || [],
        events: context.events || [],
        inventory: context.inventory || {},
        competitorActivity: context.competitorActivity || {},
        economicFactors: context.economicFactors || {},
        ...historicalData
      };

      // Run all forecasting models
      const modelForecasts = {};
      let totalWeight = 0;

      for (const [modelId, model] of Object.entries(this.forecastingModels)) {
        try {
          const forecast = model.calculate(forecastContext);
          modelForecasts[modelId] = {
            dailyForecast: forecast.dailyForecast,
            confidence: forecast.confidence,
            factors: forecast.factors,
            accuracy: model.accuracy,
            weight: model.weight
          };
          totalWeight += model.weight;
        } catch (error) {
          console.warn(`Model ${modelId} failed:`, error);
          modelForecasts[modelId] = {
            dailyForecast: Array(forecastPeriod).fill(0),
            confidence: 0,
            factors: {},
            accuracy: 0,
            weight: 0
          };
        }
      }

      // Calculate ensemble forecast
      const ensembleForecast = this.calculateEnsembleForecast(modelForecasts, forecastPeriod, totalWeight);
      
      // Calculate forecast metrics
      const forecastMetrics = this.calculateForecastMetrics(ensembleForecast, modelForecasts);
      
      const forecast = {
        itemId,
        forecastPeriod,
        dailyForecast: ensembleForecast.dailyForecast,
        totalDemand: ensembleForecast.totalDemand,
        peakDemand: Math.max(...ensembleForecast.dailyForecast),
        averageDailyDemand: ensembleForecast.totalDemand / forecastPeriod,
        confidence: ensembleForecast.confidence,
        accuracy: forecastMetrics.accuracy,
        volatility: forecastMetrics.volatility,
        trend: forecastMetrics.trend,
        seasonality: forecastMetrics.seasonality,
        modelContributions: this.calculateModelContributions(modelForecasts, totalWeight),
        keyFactors: this.identifyKeyFactors(modelForecasts),
        recommendations: this.generateRecommendations(ensembleForecast, forecastMetrics, context),
        generatedAt: new Date().toISOString(),
        responseTime: performance.now() - startTime
      };

      // Cache the forecast
      this.forecastCache.set(cacheKey, {
        forecast,
        timestamp: Date.now()
      });

      // Update performance metrics
      this.updatePerformanceMetrics(forecast);

      return forecast;

    } catch (error) {
      console.error('Demand forecasting failed:', error);
      return this.generateFallbackForecast(itemId, forecastPeriod);
    }
  }

  calculateSeasonalDemand(context) {
    const { dailySales, monthlySeasonality, weeklyTrends, forecastPeriod, currentDate } = context;
    const avgDailySales = dailySales.reduce((sum, sales) => sum + sales, 0) / dailySales.length;
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDay();
    
    const dailyForecast = [];
    for (let i = 0; i < forecastPeriod; i++) {
      const forecastDate = new Date(currentDate);
      forecastDate.setDate(forecastDate.getDate() + i);
      
      const monthIndex = forecastDate.getMonth();
      const dayIndex = forecastDate.getDay();
      
      const monthlyFactor = monthlySeasonality[monthIndex] || 1.0;
      const weeklyFactor = weeklyTrends[dayIndex] || 1.0;
      
      // Add seasonal variation
      const seasonalNoise = (Math.random() - 0.5) * 0.1;
      const forecastValue = avgDailySales * monthlyFactor * weeklyFactor * (1 + seasonalNoise);
      
      dailyForecast.push(Math.max(0, Math.round(forecastValue)));
    }

    return {
      dailyForecast,
      confidence: 0.85 + Math.random() * 0.10,
      factors: {
        monthlySeasonality: monthlySeasonality[currentMonth],
        weeklyTrend: weeklyTrends[currentDay],
        historicalAverage: avgDailySales
      }
    };
  }

  calculateTrendDemand(context) {
    const { dailySales, forecastPeriod } = context;
    
    // Calculate linear trend
    const n = dailySales.length;
    const sumX = n * (n - 1) / 2;
    const sumY = dailySales.reduce((sum, sales) => sum + sales, 0);
    const sumXY = dailySales.reduce((sum, sales, index) => sum + sales * index, 0);
    const sumX2 = (n - 1) * n * (2 * n - 1) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const dailyForecast = [];
    for (let i = 0; i < forecastPeriod; i++) {
      const trendValue = intercept + slope * (n + i);
      const trendNoise = (Math.random() - 0.5) * 0.15;
      const forecastValue = trendValue * (1 + trendNoise);
      
      dailyForecast.push(Math.max(0, Math.round(forecastValue)));
    }

    return {
      dailyForecast,
      confidence: 0.82 + Math.random() * 0.08,
      factors: {
        trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
        trendStrength: Math.abs(slope),
        r_squared: this.calculateRSquared(dailySales, slope, intercept)
      }
    };
  }

  calculateBehavioralDemand(context) {
    const { dailySales, forecastPeriod, events, inventory } = context;
    const avgDailySales = dailySales.reduce((sum, sales) => sum + sales, 0) / dailySales.length;
    
    // Customer behavior patterns
    const behaviorFactors = {
      stockoutAvoidance: inventory.currentStock < inventory.safetyStock ? 1.2 : 1.0,
      eventDriven: events.length > 0 ? 1.15 : 1.0,
      loyaltyBonus: Math.random() > 0.7 ? 1.05 : 1.0,
      bulkPurchase: Math.random() > 0.8 ? 1.3 : 1.0
    };
    
    const dailyForecast = [];
    for (let i = 0; i < forecastPeriod; i++) {
      let behaviorMultiplier = 1.0;
      
      // Apply behavior factors with decay over time
      Object.values(behaviorFactors).forEach(factor => {
        const decayFactor = Math.pow(0.95, i); // Behavior impact decays over time
        behaviorMultiplier *= (factor - 1) * decayFactor + 1;
      });
      
      const behaviorNoise = (Math.random() - 0.5) * 0.12;
      const forecastValue = avgDailySales * behaviorMultiplier * (1 + behaviorNoise);
      
      dailyForecast.push(Math.max(0, Math.round(forecastValue)));
    }

    return {
      dailyForecast,
      confidence: 0.88 + Math.random() * 0.07,
      factors: {
        behaviorFactors,
        customerLoyalty: Math.random() * 0.8 + 0.2,
        purchaseFrequency: avgDailySales / 7
      }
    };
  }

  calculateExternalFactorsDemand(context) {
    const { dailySales, forecastPeriod, weatherConditions, economicFactors, competitorActivity } = context;
    const avgDailySales = dailySales.reduce((sum, sales) => sum + sales, 0) / dailySales.length;
    
    // External factors impact
    const externalFactors = {
      weather: {
        sunny: 1.1,
        rainy: 0.95,
        stormy: 0.85,
        normal: 1.0
      }[weatherConditions] || 1.0,
      
      economic: economicFactors.inflationRate ? (1 - economicFactors.inflationRate / 100) : 1.0,
      competition: competitorActivity.promotions ? 0.9 : 1.0,
      seasonalEvents: Math.random() > 0.8 ? 1.2 : 1.0
    };
    
    const dailyForecast = [];
    for (let i = 0; i < forecastPeriod; i++) {
      let externalMultiplier = 1.0;
      
      // Apply external factors
      Object.values(externalFactors).forEach(factor => {
        externalMultiplier *= factor;
      });
      
      // Add some randomness for external volatility
      const externalNoise = (Math.random() - 0.5) * 0.18;
      const forecastValue = avgDailySales * externalMultiplier * (1 + externalNoise);
      
      dailyForecast.push(Math.max(0, Math.round(forecastValue)));
    }

    return {
      dailyForecast,
      confidence: 0.80 + Math.random() * 0.06,
      factors: {
        weatherImpact: externalFactors.weather,
        economicImpact: externalFactors.economic,
        competitionImpact: externalFactors.competition,
        marketVolatility: Math.random() * 0.3 + 0.1
      }
    };
  }

  calculatePromotionalDemand(context) {
    const { dailySales, forecastPeriod, promotions, promotionalHistory } = context;
    const avgDailySales = dailySales.reduce((sum, sales) => sum + sales, 0) / dailySales.length;
    
    // Calculate promotional impact based on history
    const avgPromotionalImpact = promotionalHistory.length > 0 
      ? promotionalHistory.reduce((sum, promo) => sum + promo.impact, 0) / promotionalHistory.length 
      : 1.2;
    
    const dailyForecast = [];
    for (let i = 0; i < forecastPeriod; i++) {
      let promotionalMultiplier = 1.0;
      
      // Check if there are active promotions for this forecast day
      promotions.forEach(promotion => {
        if (promotion.startDay <= i && i <= promotion.endDay) {
          promotionalMultiplier *= promotion.impact || avgPromotionalImpact;
        }
      });
      
      // Add promotional noise
      const promoNoise = (Math.random() - 0.5) * 0.1;
      const forecastValue = avgDailySales * promotionalMultiplier * (1 + promoNoise);
      
      dailyForecast.push(Math.max(0, Math.round(forecastValue)));
    }

    return {
      dailyForecast,
      confidence: 0.90 + Math.random() * 0.05,
      factors: {
        activePromotions: promotions.length,
        avgPromotionalImpact,
        promotionalHistory: promotionalHistory.length,
        expectedLift: (avgPromotionalImpact - 1) * 100
      }
    };
  }

  calculateEnsembleForecast(modelForecasts, forecastPeriod, totalWeight) {
    const ensembleDailyForecast = Array(forecastPeriod).fill(0);
    let ensembleConfidence = 0;
    
    // Weighted average of all model forecasts
    Object.values(modelForecasts).forEach(forecast => {
      const normalizedWeight = forecast.weight / totalWeight;
      
      forecast.dailyForecast.forEach((value, day) => {
        ensembleDailyForecast[day] += value * normalizedWeight;
      });
      
      ensembleConfidence += forecast.confidence * normalizedWeight;
    });
    
    // Round forecast values
    const dailyForecast = ensembleDailyForecast.map(value => Math.max(0, Math.round(value)));
    const totalDemand = dailyForecast.reduce((sum, demand) => sum + demand, 0);
    
    return {
      dailyForecast,
      totalDemand,
      confidence: Math.min(0.95, ensembleConfidence)
    };
  }

  calculateForecastMetrics(ensembleForecast, modelForecasts) {
    const { dailyForecast } = ensembleForecast;
    const mean = dailyForecast.reduce((sum, val) => sum + val, 0) / dailyForecast.length;
    
    // Calculate volatility (coefficient of variation)
    const variance = dailyForecast.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dailyForecast.length;
    const volatility = Math.sqrt(variance) / mean;
    
    // Calculate trend direction
    const firstHalf = dailyForecast.slice(0, Math.floor(dailyForecast.length / 2));
    const secondHalf = dailyForecast.slice(Math.floor(dailyForecast.length / 2));
    const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    const trend = (secondHalfAvg - firstHalfAvg) / firstHalfAvg;
    
    // Calculate seasonality strength (variation around trend)
    const seasonality = Math.abs(Math.max(...dailyForecast) - Math.min(...dailyForecast)) / mean;
    
    // Ensemble accuracy (weighted average of model accuracies)
    let totalWeight = 0;
    let weightedAccuracy = 0;
    Object.values(modelForecasts).forEach(forecast => {
      weightedAccuracy += forecast.accuracy * forecast.weight;
      totalWeight += forecast.weight;
    });
    const accuracy = totalWeight > 0 ? weightedAccuracy / totalWeight : 0.85;
    
    return {
      volatility: Math.min(1.0, volatility),
      trend,
      seasonality: Math.min(1.0, seasonality),
      accuracy
    };
  }

  calculateModelContributions(modelForecasts, totalWeight) {
    const contributions = {};
    
    Object.entries(modelForecasts).forEach(([modelId, forecast]) => {
      contributions[modelId] = totalWeight > 0 ? forecast.weight / totalWeight : 0;
    });
    
    return contributions;
  }

  identifyKeyFactors(modelForecasts) {
    const keyFactors = [];
    
    Object.entries(modelForecasts).forEach(([modelId, forecast]) => {
      if (forecast.confidence > 0.8 && forecast.weight > 0.15) {
        Object.entries(forecast.factors || {}).forEach(([factor, value]) => {
          if (typeof value === 'number' && Math.abs(value - 1.0) > 0.1) {
            keyFactors.push({
              model: modelId,
              factor,
              impact: value,
              confidence: forecast.confidence
            });
          }
        });
      }
    });
    
    return keyFactors.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }

  generateRecommendations(forecast, metrics, context) {
    const recommendations = [];
    
    // High demand recommendations
    if (forecast.peakDemand > forecast.averageDailyDemand * 1.5) {
      recommendations.push({
        type: 'inventory',
        priority: 'high',
        message: `Peak demand of ${forecast.peakDemand} expected. Consider increasing stock levels.`,
        action: 'increase_inventory'
      });
    }
    
    // Volatility recommendations
    if (metrics.volatility > 0.3) {
      recommendations.push({
        type: 'planning',
        priority: 'medium',
        message: 'High demand volatility detected. Consider flexible inventory management.',
        action: 'enable_dynamic_pricing'
      });
    }
    
    // Trend recommendations
    if (metrics.trend > 0.2) {
      recommendations.push({
        type: 'growth',
        priority: 'high',
        message: 'Strong positive demand trend. Consider promotional campaigns.',
        action: 'plan_promotions'
      });
    } else if (metrics.trend < -0.2) {
      recommendations.push({
        type: 'decline',
        priority: 'high',
        message: 'Declining demand trend. Review pricing and marketing strategies.',
        action: 'review_strategy'
      });
    }
    
    // Low confidence recommendations
    if (forecast.confidence < 0.7) {
      recommendations.push({
        type: 'data',
        priority: 'medium',
        message: 'Low forecast confidence. Consider gathering more historical data.',
        action: 'improve_data_quality'
      });
    }
    
    return recommendations;
  }

  calculateRSquared(data, slope, intercept) {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    let ssRes = 0;
    let ssTot = 0;
    
    data.forEach((actual, index) => {
      const predicted = intercept + slope * index;
      ssRes += Math.pow(actual - predicted, 2);
      ssTot += Math.pow(actual - mean, 2);
    });
    
    return 1 - (ssRes / ssTot);
  }

  generateMockHistoricalData(itemId) {
    const mockData = {
      dailySales: Array.from({ length: 15 }, () => Math.floor(Math.random() * 20) + 10),
      weeklyTrends: Array.from({ length: 7 }, () => Math.random() * 0.4 + 0.8),
      monthlySeasonality: Array.from({ length: 12 }, () => Math.random() * 0.3 + 0.85),
      promotionalHistory: []
    };
    
    this.historicalData.set(itemId, mockData);
    return mockData;
  }

  generateFallbackForecast(itemId, forecastPeriod) {
    const baseDemand = Math.floor(Math.random() * 15) + 10;
    return {
      itemId,
      forecastPeriod,
      dailyForecast: Array(forecastPeriod).fill(baseDemand),
      totalDemand: baseDemand * forecastPeriod,
      peakDemand: baseDemand,
      averageDailyDemand: baseDemand,
      confidence: 0.6,
      accuracy: 0.75,
      volatility: 0.15,
      trend: 0,
      seasonality: 0.1,
      modelContributions: {},
      keyFactors: [],
      recommendations: [{
        type: 'error',
        priority: 'low',
        message: 'Forecast generated with limited data. Results may be inaccurate.',
        action: 'gather_more_data'
      }],
      generatedAt: new Date().toISOString(),
      responseTime: 100
    };
  }

  updatePerformanceMetrics(forecast) {
    this.performanceMetrics.totalPredictions++;
    this.performanceMetrics.avgResponseTime = 
      (this.performanceMetrics.avgResponseTime * (this.performanceMetrics.totalPredictions - 1) + 
       forecast.responseTime) / this.performanceMetrics.totalPredictions;
    
    // Update model performance (simplified)
    Object.entries(forecast.modelContributions || {}).forEach(([modelId, contribution]) => {
      if (!this.performanceMetrics.modelPerformance[modelId]) {
        this.performanceMetrics.modelPerformance[modelId] = {
          usage: 0,
          avgContribution: 0
        };
      }
      
      const modelPerf = this.performanceMetrics.modelPerformance[modelId];
      modelPerf.usage++;
      modelPerf.avgContribution = 
        (modelPerf.avgContribution * (modelPerf.usage - 1) + contribution) / modelPerf.usage;
    });
  }

  async batchForecastDemand(itemIds, forecastPeriod = 7, context = {}) {
    const forecasts = await Promise.all(
      itemIds.map(itemId => this.forecastDemand(itemId, forecastPeriod, context))
    );
    
    return {
      forecasts,
      batchSummary: {
        totalItems: itemIds.length,
        avgConfidence: forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length,
        totalDemand: forecasts.reduce((sum, f) => sum + f.totalDemand, 0),
        highDemandItems: forecasts.filter(f => f.peakDemand > f.averageDailyDemand * 1.5).length,
        generatedAt: new Date().toISOString()
      }
    };
  }

  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      cacheHitRatio: this.forecastCache.size > 0 ? 
        Math.min(1.0, this.performanceMetrics.totalPredictions / this.forecastCache.size) : 0
    };
  }

  clearCache() {
    this.forecastCache.clear();
  }

  updateHistoricalData(itemId, newData) {
    const existingData = this.historicalData.get(itemId) || {};
    this.historicalData.set(itemId, { ...existingData, ...newData });
  }
}

export default new DemandForecastingService();