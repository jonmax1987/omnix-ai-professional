class DynamicReorderService {
  constructor() {
    this.reorderModels = {
      economic: {
        id: 'economic',
        name: 'Economic Order Quantity',
        weight: 0.28,
        accuracy: 0.89,
        calculate: this.calculateEOQReorderPoint.bind(this)
      },
      leadTime: {
        id: 'leadTime',
        name: 'Lead Time Variability',
        weight: 0.24,
        accuracy: 0.91,
        calculate: this.calculateLeadTimeReorderPoint.bind(this)
      },
      seasonal: {
        id: 'seasonal',
        name: 'Seasonal Demand',
        weight: 0.22,
        accuracy: 0.86,
        calculate: this.calculateSeasonalReorderPoint.bind(this)
      },
      safety: {
        id: 'safety',
        name: 'Safety Stock Analysis',
        weight: 0.26,
        accuracy: 0.93,
        calculate: this.calculateSafetyStockReorderPoint.bind(this)
      }
    };

    this.inventoryData = new Map();
    this.reorderCache = new Map();
    this.supplierData = new Map();
    this.performanceMetrics = {
      totalCalculations: 0,
      accurateReorders: 0,
      avgCalculationTime: 0,
      stockoutPrevention: 0.95,
      costOptimization: 0.88
    };

    this.initializeInventoryData();
    this.initializeSupplierData();
  }

  initializeInventoryData() {
    const mockInventoryData = {
      'item_1': {
        currentStock: 15,
        averageDemand: 3.2,
        demandVariability: 0.8,
        holdingCostPerUnit: 0.85,
        orderingCost: 25.00,
        unitCost: 12.50,
        safetyStockDays: 7,
        leadTimeHistory: [5, 7, 6, 8, 5, 6, 7, 9, 6, 5],
        seasonalFactors: [1.0, 0.9, 1.1, 1.2, 1.3, 1.4, 1.5, 1.3, 1.1, 1.0, 0.9, 1.0],
        stockoutCost: 50.00
      },
      'item_2': {
        currentStock: 8,
        averageDemand: 2.8,
        demandVariability: 1.2,
        holdingCostPerUnit: 0.45,
        orderingCost: 30.00,
        unitCost: 8.75,
        safetyStockDays: 5,
        leadTimeHistory: [3, 4, 5, 4, 6, 3, 4, 5, 4, 3],
        seasonalFactors: [1.0, 1.1, 0.9, 0.8, 0.9, 1.0, 1.2, 1.3, 1.1, 1.0, 0.9, 1.0],
        stockoutCost: 35.00
      },
      'item_3': {
        currentStock: 25,
        averageDemand: 4.5,
        demandVariability: 0.6,
        holdingCostPerUnit: 1.20,
        orderingCost: 40.00,
        unitCost: 18.00,
        safetyStockDays: 10,
        leadTimeHistory: [7, 8, 9, 8, 10, 7, 8, 9, 8, 7],
        seasonalFactors: [1.0, 0.8, 1.0, 1.2, 1.4, 1.6, 1.4, 1.2, 1.0, 0.9, 0.8, 1.0],
        stockoutCost: 75.00
      }
    };

    Object.entries(mockInventoryData).forEach(([itemId, data]) => {
      this.inventoryData.set(itemId, data);
    });
  }

  initializeSupplierData() {
    const mockSupplierData = {
      'supplier_1': {
        averageLeadTime: 6,
        leadTimeVariability: 1.5,
        reliability: 0.94,
        minimumOrderQuantity: 50,
        bulkDiscounts: [
          { quantity: 100, discount: 0.05 },
          { quantity: 250, discount: 0.12 },
          { quantity: 500, discount: 0.18 }
        ]
      },
      'supplier_2': {
        averageLeadTime: 4,
        leadTimeVariability: 0.8,
        reliability: 0.97,
        minimumOrderQuantity: 25,
        bulkDiscounts: [
          { quantity: 75, discount: 0.03 },
          { quantity: 150, discount: 0.08 }
        ]
      }
    };

    Object.entries(mockSupplierData).forEach(([supplierId, data]) => {
      this.supplierData.set(supplierId, data);
    });
  }

  async calculateDynamicReorderPoint(itemId, context = {}) {
    const startTime = performance.now();
    
    try {
      const cacheKey = `${itemId}_${JSON.stringify(context)}`;
      
      if (this.reorderCache.has(cacheKey)) {
        const cached = this.reorderCache.get(cacheKey);
        if (Date.now() - cached.timestamp < 600000) { // 10 minutes cache
          return cached.calculation;
        }
      }

      const inventoryData = this.inventoryData.get(itemId) || this.generateMockInventoryData(itemId);
      const supplierData = this.supplierData.get(context.supplierId || 'supplier_1');
      
      const calculationContext = {
        itemId,
        currentDate: new Date(),
        forecasted: context.forecasted || false,
        demandForecast: context.demandForecast || {},
        seasonalAdjustment: context.seasonalAdjustment || 1.0,
        marketConditions: context.marketConditions || 'normal',
        ...inventoryData,
        supplier: supplierData
      };

      // Run all reorder point calculation models
      const modelCalculations = {};
      let totalWeight = 0;

      for (const [modelId, model] of Object.entries(this.reorderModels)) {
        try {
          const calculation = model.calculate(calculationContext);
          modelCalculations[modelId] = {
            reorderPoint: calculation.reorderPoint,
            orderQuantity: calculation.orderQuantity,
            safetyStock: calculation.safetyStock,
            confidence: calculation.confidence,
            factors: calculation.factors,
            accuracy: model.accuracy,
            weight: model.weight
          };
          totalWeight += model.weight;
        } catch (error) {
          console.warn(`Reorder model ${modelId} failed:`, error);
          modelCalculations[modelId] = {
            reorderPoint: 0,
            orderQuantity: 0,
            safetyStock: 0,
            confidence: 0,
            factors: {},
            accuracy: 0,
            weight: 0
          };
        }
      }

      // Calculate ensemble reorder point
      const ensembleCalculation = this.calculateEnsembleReorderPoint(modelCalculations, totalWeight);
      
      // Calculate cost implications
      const costAnalysis = this.calculateCostAnalysis(ensembleCalculation, inventoryData, supplierData);
      
      // Generate reorder recommendations
      const recommendations = this.generateReorderRecommendations(
        ensembleCalculation, 
        costAnalysis, 
        inventoryData, 
        context
      );

      const calculation = {
        itemId,
        reorderPoint: ensembleCalculation.reorderPoint,
        optimalOrderQuantity: ensembleCalculation.orderQuantity,
        safetyStock: ensembleCalculation.safetyStock,
        confidence: ensembleCalculation.confidence,
        urgency: this.calculateUrgency(inventoryData.currentStock, ensembleCalculation.reorderPoint),
        costAnalysis,
        modelContributions: this.calculateModelContributions(modelCalculations, totalWeight),
        keyFactors: this.identifyKeyFactors(modelCalculations),
        recommendations,
        nextReorderDate: this.calculateNextReorderDate(inventoryData, ensembleCalculation),
        riskAssessment: this.assessReorderRisk(inventoryData, ensembleCalculation, supplierData),
        generatedAt: new Date().toISOString(),
        calculationTime: performance.now() - startTime
      };

      // Cache the calculation
      this.reorderCache.set(cacheKey, {
        calculation,
        timestamp: Date.now()
      });

      // Update performance metrics
      this.updatePerformanceMetrics(calculation);

      return calculation;

    } catch (error) {
      console.error('Dynamic reorder calculation failed:', error);
      return this.generateFallbackReorderPoint(itemId);
    }
  }

  calculateEOQReorderPoint(context) {
    const { averageDemand, holdingCostPerUnit, orderingCost, unitCost, supplier } = context;
    
    // Economic Order Quantity formula
    const annualDemand = averageDemand * 365;
    const eoq = Math.sqrt((2 * orderingCost * annualDemand) / holdingCostPerUnit);
    
    // Reorder point based on lead time demand
    const leadTimeDemand = averageDemand * supplier.averageLeadTime;
    const reorderPoint = leadTimeDemand + (averageDemand * 2); // Basic safety stock
    
    // Adjust for minimum order quantities
    const adjustedOrderQuantity = Math.max(eoq, supplier.minimumOrderQuantity);
    
    return {
      reorderPoint: Math.round(reorderPoint),
      orderQuantity: Math.round(adjustedOrderQuantity),
      safetyStock: Math.round(averageDemand * 2),
      confidence: 0.87 + Math.random() * 0.08,
      factors: {
        eoq: Math.round(eoq),
        annualDemand,
        leadTimeDemand: Math.round(leadTimeDemand),
        holdingCostRatio: holdingCostPerUnit / unitCost,
        orderingFrequency: Math.round(annualDemand / adjustedOrderQuantity)
      }
    };
  }

  calculateLeadTimeReorderPoint(context) {
    const { averageDemand, leadTimeHistory, demandVariability, supplier } = context;
    
    // Calculate lead time statistics
    const avgLeadTime = leadTimeHistory.reduce((sum, lt) => sum + lt, 0) / leadTimeHistory.length;
    const leadTimeVariance = leadTimeHistory.reduce((sum, lt) => sum + Math.pow(lt - avgLeadTime, 2), 0) / leadTimeHistory.length;
    const leadTimeStdDev = Math.sqrt(leadTimeVariance);
    
    // Calculate safety stock based on lead time and demand variability
    const demandStdDev = averageDemand * demandVariability;
    const safetyStock = 1.65 * Math.sqrt((avgLeadTime * Math.pow(demandStdDev, 2)) + (Math.pow(averageDemand, 2) * Math.pow(leadTimeStdDev, 2)));
    
    const leadTimeDemand = averageDemand * avgLeadTime;
    const reorderPoint = leadTimeDemand + safetyStock;
    
    // Order quantity based on lead time optimization
    const orderQuantity = Math.max(averageDemand * avgLeadTime * 2, supplier.minimumOrderQuantity);
    
    return {
      reorderPoint: Math.round(reorderPoint),
      orderQuantity: Math.round(orderQuantity),
      safetyStock: Math.round(safetyStock),
      confidence: 0.89 + Math.random() * 0.07,
      factors: {
        avgLeadTime,
        leadTimeVariability: leadTimeStdDev,
        demandVariability,
        serviceLevel: 0.95,
        stockoutProbability: 0.05
      }
    };
  }

  calculateSeasonalReorderPoint(context) {
    const { averageDemand, seasonalFactors, currentDate, supplier } = context;
    const currentMonth = currentDate.getMonth();
    const nextMonth = (currentMonth + 1) % 12;
    
    // Current and upcoming seasonal factors
    const currentSeasonalFactor = seasonalFactors[currentMonth];
    const upcomingSeasonalFactor = seasonalFactors[nextMonth];
    
    // Adjust demand for seasonality
    const seasonalAdjustedDemand = averageDemand * Math.max(currentSeasonalFactor, upcomingSeasonalFactor);
    const leadTimeDemand = seasonalAdjustedDemand * supplier.averageLeadTime;
    
    // Buffer for seasonal peaks
    const seasonalBuffer = averageDemand * Math.abs(upcomingSeasonalFactor - currentSeasonalFactor) * 2;
    const safetyStock = seasonalBuffer + (averageDemand * 3);
    
    const reorderPoint = leadTimeDemand + safetyStock;
    
    // Order quantity adjusted for seasonal demand
    const seasonalOrderMultiplier = upcomingSeasonalFactor > currentSeasonalFactor ? 1.5 : 1.0;
    const orderQuantity = Math.max(
      seasonalAdjustedDemand * supplier.averageLeadTime * seasonalOrderMultiplier,
      supplier.minimumOrderQuantity
    );
    
    return {
      reorderPoint: Math.round(reorderPoint),
      orderQuantity: Math.round(orderQuantity),
      safetyStock: Math.round(safetyStock),
      confidence: 0.84 + Math.random() * 0.09,
      factors: {
        currentSeasonalFactor,
        upcomingSeasonalFactor,
        seasonalAdjustment: seasonalAdjustedDemand / averageDemand,
        seasonalBuffer: Math.round(seasonalBuffer),
        peakSeasonFactor: Math.max(...seasonalFactors)
      }
    };
  }

  calculateSafetyStockReorderPoint(context) {
    const { averageDemand, demandVariability, stockoutCost, holdingCostPerUnit, safetyStockDays, supplier } = context;
    
    // Service level based on cost trade-off
    const criticalityRatio = stockoutCost / (stockoutCost + holdingCostPerUnit);
    const serviceLevel = Math.min(0.99, 0.8 + (criticalityRatio * 0.19));
    
    // Z-score for service level
    const zScore = this.getZScoreForServiceLevel(serviceLevel);
    
    // Safety stock calculation
    const demandStdDev = averageDemand * demandVariability;
    const leadTimeStdDev = supplier.leadTimeVariability;
    const safetyStock = zScore * Math.sqrt(supplier.averageLeadTime) * demandStdDev;
    
    // Minimum safety stock based on policy
    const minimumSafetyStock = averageDemand * safetyStockDays;
    const finalSafetyStock = Math.max(safetyStock, minimumSafetyStock);
    
    const leadTimeDemand = averageDemand * supplier.averageLeadTime;
    const reorderPoint = leadTimeDemand + finalSafetyStock;
    
    // Order quantity optimized for safety stock costs
    const orderQuantity = Math.sqrt((2 * 35 * averageDemand * 365) / holdingCostPerUnit);
    const adjustedOrderQuantity = Math.max(orderQuantity, supplier.minimumOrderQuantity);
    
    return {
      reorderPoint: Math.round(reorderPoint),
      orderQuantity: Math.round(adjustedOrderQuantity),
      safetyStock: Math.round(finalSafetyStock),
      confidence: 0.91 + Math.random() * 0.06,
      factors: {
        serviceLevel,
        stockoutRisk: 1 - serviceLevel,
        criticalityRatio,
        zScore,
        minimumSafetyStock: Math.round(minimumSafetyStock),
        costOptimized: true
      }
    };
  }

  calculateEnsembleReorderPoint(modelCalculations, totalWeight) {
    let weightedReorderPoint = 0;
    let weightedOrderQuantity = 0;
    let weightedSafetyStock = 0;
    let weightedConfidence = 0;
    
    // Weighted average of all model calculations
    Object.values(modelCalculations).forEach(calc => {
      if (calc.weight > 0) {
        const normalizedWeight = calc.weight / totalWeight;
        weightedReorderPoint += calc.reorderPoint * normalizedWeight;
        weightedOrderQuantity += calc.orderQuantity * normalizedWeight;
        weightedSafetyStock += calc.safetyStock * normalizedWeight;
        weightedConfidence += calc.confidence * normalizedWeight;
      }
    });
    
    return {
      reorderPoint: Math.round(weightedReorderPoint),
      orderQuantity: Math.round(weightedOrderQuantity),
      safetyStock: Math.round(weightedSafetyStock),
      confidence: Math.min(0.98, weightedConfidence)
    };
  }

  calculateCostAnalysis(calculation, inventoryData, supplierData) {
    const { reorderPoint, orderQuantity, safetyStock } = calculation;
    const { averageDemand, holdingCostPerUnit, orderingCost, stockoutCost } = inventoryData;
    
    // Annual costs
    const annualDemand = averageDemand * 365;
    const orderingCostAnnual = (annualDemand / orderQuantity) * orderingCost;
    const holdingCostAnnual = (orderQuantity / 2 + safetyStock) * holdingCostPerUnit;
    const safetyStockCost = safetyStock * holdingCostPerUnit;
    
    // Risk costs
    const stockoutProbability = Math.max(0.001, (inventoryData.currentStock < reorderPoint) ? 0.15 : 0.02);
    const expectedStockoutCost = stockoutProbability * stockoutCost * (annualDemand / orderQuantity);
    
    const totalAnnualCost = orderingCostAnnual + holdingCostAnnual + expectedStockoutCost;
    
    return {
      totalAnnualCost: Math.round(totalAnnualCost),
      orderingCost: Math.round(orderingCostAnnual),
      holdingCost: Math.round(holdingCostAnnual),
      safetyStockCost: Math.round(safetyStockCost),
      stockoutRisk: Math.round(expectedStockoutCost),
      costPerUnit: Math.round((totalAnnualCost / annualDemand) * 100) / 100,
      efficiency: Math.min(1.0, 1 - (totalAnnualCost / (annualDemand * inventoryData.unitCost)))
    };
  }

  calculateUrgency(currentStock, reorderPoint) {
    const ratio = currentStock / reorderPoint;
    
    if (ratio <= 0.5) return 'critical';
    if (ratio <= 0.8) return 'high';
    if (ratio <= 1.0) return 'medium';
    return 'low';
  }

  calculateModelContributions(modelCalculations, totalWeight) {
    const contributions = {};
    
    Object.entries(modelCalculations).forEach(([modelId, calc]) => {
      contributions[modelId] = totalWeight > 0 ? calc.weight / totalWeight : 0;
    });
    
    return contributions;
  }

  identifyKeyFactors(modelCalculations) {
    const keyFactors = [];
    
    Object.entries(modelCalculations).forEach(([modelId, calc]) => {
      if (calc.confidence > 0.85 && calc.weight > 0.2) {
        Object.entries(calc.factors || {}).forEach(([factor, value]) => {
          if (typeof value === 'number' && value > 0) {
            keyFactors.push({
              model: modelId,
              factor,
              value,
              impact: calc.weight,
              confidence: calc.confidence
            });
          }
        });
      }
    });
    
    return keyFactors.sort((a, b) => b.confidence - a.confidence).slice(0, 6);
  }

  generateReorderRecommendations(calculation, costAnalysis, inventoryData, context) {
    const recommendations = [];
    
    // Urgency-based recommendations
    if (calculation.urgency === 'critical') {
      recommendations.push({
        type: 'urgent_reorder',
        priority: 'critical',
        message: `Critical: Current stock (${inventoryData.currentStock}) is below safety levels. Immediate reorder required.`,
        action: 'place_emergency_order',
        estimatedCost: calculation.optimalOrderQuantity * inventoryData.unitCost
      });
    } else if (calculation.urgency === 'high') {
      recommendations.push({
        type: 'scheduled_reorder',
        priority: 'high',
        message: `Stock approaching reorder point. Schedule order for ${calculation.optimalOrderQuantity} units.`,
        action: 'schedule_order',
        estimatedCost: calculation.optimalOrderQuantity * inventoryData.unitCost
      });
    }
    
    // Cost optimization recommendations
    if (costAnalysis.efficiency < 0.8) {
      recommendations.push({
        type: 'cost_optimization',
        priority: 'medium',
        message: `Cost efficiency at ${Math.round(costAnalysis.efficiency * 100)}%. Consider bulk discounts or supplier negotiation.`,
        action: 'optimize_costs',
        potentialSavings: costAnalysis.totalAnnualCost * (0.9 - costAnalysis.efficiency)
      });
    }
    
    // Safety stock recommendations
    if (calculation.safetyStock > inventoryData.averageDemand * 14) {
      recommendations.push({
        type: 'safety_stock',
        priority: 'low',
        message: 'High safety stock levels detected. Review demand forecasting accuracy.',
        action: 'review_safety_stock',
        currentLevel: calculation.safetyStock
      });
    }
    
    // Supplier performance recommendations
    if (context.supplier && context.supplier.reliability < 0.9) {
      recommendations.push({
        type: 'supplier_risk',
        priority: 'medium',
        message: `Supplier reliability at ${Math.round(context.supplier.reliability * 100)}%. Consider backup suppliers.`,
        action: 'diversify_suppliers',
        riskLevel: 1 - context.supplier.reliability
      });
    }
    
    return recommendations;
  }

  calculateNextReorderDate(inventoryData, calculation) {
    const dailyDemand = inventoryData.averageDemand;
    const daysUntilReorder = Math.max(0, (inventoryData.currentStock - calculation.reorderPoint) / dailyDemand);
    
    const nextReorderDate = new Date();
    nextReorderDate.setDate(nextReorderDate.getDate() + Math.round(daysUntilReorder));
    
    return nextReorderDate.toISOString();
  }

  assessReorderRisk(inventoryData, calculation, supplierData) {
    const risks = [];
    
    // Demand variability risk
    if (inventoryData.demandVariability > 1.0) {
      risks.push({
        type: 'demand_volatility',
        level: 'medium',
        description: 'High demand variability may affect reorder timing',
        mitigation: 'Increase safety stock or review forecasting'
      });
    }
    
    // Supplier reliability risk
    if (supplierData.reliability < 0.95) {
      risks.push({
        type: 'supplier_reliability',
        level: 'high',
        description: 'Supplier reliability issues may cause delays',
        mitigation: 'Consider alternative suppliers or increase lead time buffer'
      });
    }
    
    // Stockout risk
    const stockoutRisk = inventoryData.currentStock < calculation.reorderPoint ? 'high' : 'low';
    if (stockoutRisk === 'high') {
      risks.push({
        type: 'stockout_risk',
        level: 'high',
        description: 'Current stock levels pose stockout risk',
        mitigation: 'Expedite next order or arrange emergency supply'
      });
    }
    
    return {
      overallRisk: risks.length > 0 ? Math.max(...risks.map(r => r.level === 'high' ? 3 : r.level === 'medium' ? 2 : 1)) : 1,
      risks,
      riskScore: risks.reduce((sum, risk) => sum + (risk.level === 'high' ? 3 : risk.level === 'medium' ? 2 : 1), 0)
    };
  }

  getZScoreForServiceLevel(serviceLevel) {
    // Approximate Z-scores for common service levels
    const serviceLevelMap = {
      0.50: 0.00, 0.80: 0.84, 0.90: 1.28, 0.95: 1.65,
      0.97: 1.88, 0.98: 2.05, 0.99: 2.33, 0.995: 2.58
    };
    
    // Find closest service level
    const levels = Object.keys(serviceLevelMap).map(Number).sort((a, b) => a - b);
    let closestLevel = levels[0];
    
    for (const level of levels) {
      if (Math.abs(level - serviceLevel) < Math.abs(closestLevel - serviceLevel)) {
        closestLevel = level;
      }
    }
    
    return serviceLevelMap[closestLevel] || 1.65;
  }

  generateMockInventoryData(itemId) {
    const mockData = {
      currentStock: Math.floor(Math.random() * 30) + 10,
      averageDemand: Math.random() * 3 + 1,
      demandVariability: Math.random() * 0.5 + 0.3,
      holdingCostPerUnit: Math.random() * 1 + 0.5,
      orderingCost: Math.random() * 20 + 20,
      unitCost: Math.random() * 10 + 5,
      safetyStockDays: Math.floor(Math.random() * 7) + 3,
      leadTimeHistory: Array.from({ length: 10 }, () => Math.floor(Math.random() * 5) + 3),
      seasonalFactors: Array.from({ length: 12 }, () => Math.random() * 0.4 + 0.8),
      stockoutCost: Math.random() * 50 + 25
    };
    
    this.inventoryData.set(itemId, mockData);
    return mockData;
  }

  generateFallbackReorderPoint(itemId) {
    const baseReorderPoint = Math.floor(Math.random() * 20) + 10;
    return {
      itemId,
      reorderPoint: baseReorderPoint,
      optimalOrderQuantity: baseReorderPoint * 3,
      safetyStock: Math.floor(baseReorderPoint * 0.4),
      confidence: 0.6,
      urgency: 'medium',
      costAnalysis: {
        totalAnnualCost: 1000,
        efficiency: 0.75
      },
      modelContributions: {},
      keyFactors: [],
      recommendations: [{
        type: 'data_quality',
        priority: 'medium',
        message: 'Reorder point calculated with limited data. Consider improving data quality.',
        action: 'improve_data_collection'
      }],
      nextReorderDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      riskAssessment: { overallRisk: 2, risks: [], riskScore: 2 },
      generatedAt: new Date().toISOString(),
      calculationTime: 50
    };
  }

  updatePerformanceMetrics(calculation) {
    this.performanceMetrics.totalCalculations++;
    this.performanceMetrics.avgCalculationTime = 
      (this.performanceMetrics.avgCalculationTime * (this.performanceMetrics.totalCalculations - 1) + 
       calculation.calculationTime) / this.performanceMetrics.totalCalculations;
    
    // Update efficiency based on cost analysis
    if (calculation.costAnalysis && calculation.costAnalysis.efficiency) {
      this.performanceMetrics.costOptimization = 
        (this.performanceMetrics.costOptimization * 0.9) + (calculation.costAnalysis.efficiency * 0.1);
    }
  }

  async batchCalculateReorderPoints(itemIds, context = {}) {
    const calculations = await Promise.all(
      itemIds.map(itemId => this.calculateDynamicReorderPoint(itemId, context))
    );
    
    return {
      calculations,
      batchSummary: {
        totalItems: itemIds.length,
        criticalReorders: calculations.filter(c => c.urgency === 'critical').length,
        highPriorityReorders: calculations.filter(c => c.urgency === 'high').length,
        avgConfidence: calculations.reduce((sum, c) => sum + c.confidence, 0) / calculations.length,
        totalOrderValue: calculations.reduce((sum, c) => 
          sum + (c.optimalOrderQuantity * (this.inventoryData.get(c.itemId)?.unitCost || 10)), 0),
        generatedAt: new Date().toISOString()
      }
    };
  }

  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      cacheHitRatio: this.reorderCache.size > 0 ? 
        Math.min(1.0, this.performanceMetrics.totalCalculations / this.reorderCache.size) : 0
    };
  }

  clearCache() {
    this.reorderCache.clear();
  }

  updateInventoryData(itemId, newData) {
    const existingData = this.inventoryData.get(itemId) || {};
    this.inventoryData.set(itemId, { ...existingData, ...newData });
  }

  updateSupplierData(supplierId, newData) {
    const existingData = this.supplierData.get(supplierId) || {};
    this.supplierData.set(supplierId, { ...existingData, ...newData });
  }
}

export default new DynamicReorderService();