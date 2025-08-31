import { Controller, Get, Post, Query, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { EnhancedBedrockService } from '../services/enhanced-bedrock.service';
import { RealtimeAnalyticsService } from '../services/realtime-analytics.service';
import { CustomerSegmentationService } from '../services/customer-segmentation.service';
import { RecommendationsService } from '../recommendations/recommendations.service';

@ApiTags('AI Insights')
@Controller('ai/insights')
export class AIInsightsController {
  constructor(
    private readonly enhancedBedrockService: EnhancedBedrockService,
    private readonly realtimeAnalyticsService: RealtimeAnalyticsService,
    private readonly customerSegmentationService: CustomerSegmentationService,
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check for AI insights service' })
  @ApiResponse({ status: 200, description: 'AI insights service is healthy' })
  async healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'ai-insights',
      endpoints: [
        '/realtime',
        '/segmentation',
        '/consumption-predictions',
        '/churn-risk',
        '/personalization',
        '/pricing-optimization',
        '/feedback',
        '/model-performance',
        '/demand-forecasting',
        '/ab-test-recommendations',
        '/business-intelligence'
      ]
    };
  }

  @Get('realtime')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get real-time AI insights' })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'priority', required: false, enum: ['all', 'high', 'medium', 'low'] })
  @ApiQuery({ name: 'types', required: false, type: String, description: 'Comma-separated list of insight types' })
  @ApiQuery({ name: 'timeRange', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Returns real-time AI insights' })
  async getRealtimeInsights(
    @Query('customerId') customerId?: string,
    @Query('limit') limit?: string,
    @Query('priority') priority?: string,
    @Query('types') types?: string,
    @Query('timeRange') timeRange?: string,
    @CurrentUser() user?: any,
  ) {
    try {
      // Use the current user's ID if no customerId provided and user is a customer
      const targetCustomerId = customerId || (user?.role === 'customer' ? user.id : null);

      // Generate mock insights for now - in production, this would use real AI services
      const insights = await this.generateMockInsights(targetCustomerId, {
        limit: limit ? parseInt(limit) : 10,
        priority: priority || 'all',
        types: types ? types.split(',') : ['savings', 'behavior', 'health', 'efficiency'],
        timeRange: timeRange || '24h',
      });

      return {
        success: true,
        insights,
        metadata: {
          total: insights.length,
          customerId: targetCustomerId,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        insights: [],
      };
    }
  }

  @Get('segmentation')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get customer segmentation insights' })
  @ApiResponse({ status: 200, description: 'Returns customer segmentation insights' })
  async getSegmentationInsights(@Query('customerId') customerId?: string) {
    try {
      // For now, return mock segmentation data since the exact method needs to be implemented
      const segmentationData = {
        segments: [
          { id: 'loyal_customer', name: 'Loyal Customer', confidence: 0.89 }
        ],
        insights: [
          { type: 'segmentation', message: 'Customer shows high loyalty patterns', confidence: 0.89 }
        ]
      };
      
      return {
        success: true,
        segments: segmentationData?.segments || [],
        insights: segmentationData?.insights || [],
        metadata: {
          customerId,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        segments: [],
        insights: [],
      };
    }
  }

  @Get('consumption-predictions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get consumption pattern predictions' })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiQuery({ name: 'timeHorizon', required: false, type: String })
  @ApiQuery({ name: 'includeConfidence', required: false, type: Boolean })
  @ApiQuery({ name: 'includeFactors', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Returns consumption predictions' })
  async getConsumptionPredictions(
    @Query('customerId') customerId?: string,
    @Query('productId') productId?: string,
    @Query('timeHorizon') timeHorizon?: string,
    @Query('includeConfidence') includeConfidence?: string,
    @Query('includeFactors') includeFactors?: string,
    @CurrentUser() user?: any,
  ) {
    try {
      const targetCustomerId = customerId || (user?.role === 'customer' ? user.id : null);
      
      // Generate mock predictions for now
      const predictions = await this.generateMockConsumptionPredictions(targetCustomerId, {
        productId,
        timeHorizon: timeHorizon || '30d',
        includeConfidence: includeConfidence === 'true',
        includeFactors: includeFactors === 'true',
      });

      return {
        success: true,
        predictions,
        metadata: {
          customerId: targetCustomerId,
          productId,
          timeHorizon: timeHorizon || '30d',
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        predictions: [],
      };
    }
  }

  @Get('churn-risk')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get churn risk analysis' })
  @ApiResponse({ status: 200, description: 'Returns churn risk analysis' })
  async getChurnRiskAnalysis(
    @Query('customerId') customerId?: string,
    @Query('includeFactors') includeFactors?: string,
    @Query('includeInterventions') includeInterventions?: string,
    @Query('riskThreshold') riskThreshold?: string,
    @CurrentUser() user?: any,
  ) {
    try {
      const targetCustomerId = customerId || (user?.role === 'customer' ? user.id : null);
      
      const riskAnalysis = await this.generateMockChurnAnalysis(targetCustomerId, {
        includeFactors: includeFactors === 'true',
        includeInterventions: includeInterventions === 'true',
        riskThreshold: riskThreshold ? parseFloat(riskThreshold) : 0.7,
      });

      return {
        success: true,
        riskAnalysis,
        metadata: {
          customerId: targetCustomerId,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        riskAnalysis: [],
      };
    }
  }

  @Post('personalization')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get personalized recommendations' })
  @ApiResponse({ status: 200, description: 'Returns personalized recommendations' })
  async getPersonalizationRecommendations(
    @Body() body: {
      customerId: string;
      context?: any;
      options?: any;
    },
    @CurrentUser() user?: any,
  ) {
    try {
      const targetCustomerId = body.customerId || (user?.role === 'customer' ? user.id : null);
      
      if (!targetCustomerId) {
        throw new Error('Customer ID is required');
      }

      // Use existing recommendations service
      const recommendations = await this.recommendationsService.getCustomerRecommendations(
        targetCustomerId,
        'homepage',
        body.options?.maxRecommendations || 8,
      );

      // Enhance with AI insights
      const enhancedRecommendations = await this.enhanceRecommendationsWithAI(
        recommendations,
        targetCustomerId,
        body.context,
      );

      return {
        success: true,
        recommendations: enhancedRecommendations,
        metadata: {
          customerId: targetCustomerId,
          context: body.context,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        recommendations: [],
      };
    }
  }

  @Get('pricing-optimization')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get pricing optimization recommendations' })
  @ApiResponse({ status: 200, description: 'Returns pricing optimization recommendations' })
  async getPricingOptimization(
    @Query('productId') productId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('timeRange') timeRange?: string,
    @Query('includeCompetitorAnalysis') includeCompetitorAnalysis?: string,
    @Query('includeMarginImpact') includeMarginImpact?: string,
  ) {
    try {
      const optimizations = await this.generateMockPricingOptimizations({
        productId,
        categoryId,
        timeRange: timeRange || '30d',
        includeCompetitorAnalysis: includeCompetitorAnalysis === 'true',
        includeMarginImpact: includeMarginImpact === 'true',
      });

      return {
        success: true,
        optimizations,
        metadata: {
          productId,
          categoryId,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        optimizations: [],
      };
    }
  }

  @Post('feedback')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit AI feedback for model improvement' })
  @ApiResponse({ status: 200, description: 'Feedback submitted successfully' })
  async submitFeedback(
    @Body() feedback: {
      predictionId: string;
      actualOutcome: any;
      userFeedback: any;
      context?: any;
    },
    @CurrentUser() user?: any,
  ) {
    try {
      // In production, this would feed back into the AI models
      const result = {
        success: true,
        feedbackId: `feedback_${Date.now()}`,
        predictionId: feedback.predictionId,
        submittedAt: new Date().toISOString(),
        userId: user?.id,
      };

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('model-performance')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get AI model performance metrics' })
  @ApiResponse({ status: 200, description: 'Returns model performance metrics' })
  async getModelPerformance(
    @Query('modelType') modelType?: string,
    @Query('timeRange') timeRange?: string,
    @Query('includeAccuracyTrends') includeAccuracyTrends?: string,
    @Query('includeConfidenceDistribution') includeConfidenceDistribution?: string,
  ) {
    try {
      const performance = {
        models: {
          consumption_prediction: {
            accuracy: 0.94,
            precision: 0.91,
            recall: 0.89,
            f1Score: 0.90,
            lastTraining: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
          churn_prediction: {
            accuracy: 0.87,
            precision: 0.85,
            recall: 0.83,
            f1Score: 0.84,
            lastTraining: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          },
          recommendation_engine: {
            accuracy: 0.92,
            clickThroughRate: 0.15,
            conversionRate: 0.08,
            lastTraining: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          },
        },
        trends: includeAccuracyTrends === 'true' ? [] : undefined,
        confidenceDistribution: includeConfidenceDistribution === 'true' ? {} : undefined,
      };

      return {
        success: true,
        performance,
        metadata: {
          modelType: modelType || 'all',
          timeRange: timeRange || '7d',
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        performance: {},
      };
    }
  }

  @Get('demand-forecasting')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get inventory demand forecasting' })
  @ApiResponse({ status: 200, description: 'Returns demand forecasting data' })
  async getDemandForecasting(
    @Query('productId') productId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('forecastPeriod') forecastPeriod?: string,
    @Query('includeSeasonality') includeSeasonality?: string,
    @Query('includeExternalFactors') includeExternalFactors?: string,
    @Query('confidenceLevel') confidenceLevel?: string,
  ) {
    try {
      const forecasts = await this.generateMockDemandForecasting({
        productId,
        categoryId,
        forecastPeriod: forecastPeriod ? parseInt(forecastPeriod) : 60,
        includeSeasonality: includeSeasonality === 'true',
        includeExternalFactors: includeExternalFactors === 'true',
        confidenceLevel: confidenceLevel ? parseFloat(confidenceLevel) : 0.95,
      });

      return {
        success: true,
        forecasts,
        metadata: {
          productId,
          categoryId,
          forecastPeriod: forecastPeriod ? parseInt(forecastPeriod) : 60,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        forecasts: [],
      };
    }
  }

  @Get('ab-test-recommendations')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get A/B test recommendations' })
  @ApiResponse({ status: 200, description: 'Returns A/B test recommendations' })
  async getABTestRecommendations(
    @Query('feature') feature?: string,
    @Query('targetMetric') targetMetric?: string,
    @Query('includeDesignSuggestions') includeDesignSuggestions?: string,
    @Query('includeStatisticalPower') includeStatisticalPower?: string,
  ) {
    try {
      const recommendations = await this.generateMockABTestRecommendations({
        feature,
        targetMetric: targetMetric || 'revenue',
        includeDesignSuggestions: includeDesignSuggestions === 'true',
        includeStatisticalPower: includeStatisticalPower === 'true',
      });

      return {
        success: true,
        recommendations,
        metadata: {
          feature,
          targetMetric: targetMetric || 'revenue',
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        recommendations: [],
      };
    }
  }

  @Get('business-intelligence')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get business intelligence summary' })
  @ApiResponse({ status: 200, description: 'Returns business intelligence summary' })
  async getBusinessIntelligenceSummary(
    @Query('timeRange') timeRange?: string,
    @Query('includeKeyInsights') includeKeyInsights?: string,
    @Query('includeActionItems') includeActionItems?: string,
    @Query('includePerformanceMetrics') includePerformanceMetrics?: string,
    @Query('includePredictions') includePredictions?: string,
  ) {
    try {
      const summary = await this.generateMockBusinessIntelligence({
        timeRange: timeRange || '24h',
        includeKeyInsights: includeKeyInsights === 'true',
        includeActionItems: includeActionItems === 'true',
        includePerformanceMetrics: includePerformanceMetrics === 'true',
        includePredictions: includePredictions === 'true',
      });

      return {
        success: true,
        summary: summary.summary,
        insights: summary.insights,
        metadata: {
          timeRange: timeRange || '24h',
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        summary: {},
        insights: [],
      };
    }
  }

  // Private helper methods for generating mock data
  private async generateMockInsights(customerId: string, options: any) {
    const insightTypes = options.types || ['savings', 'behavior', 'health', 'efficiency'];
    const insights = [];

    if (insightTypes.includes('savings')) {
      insights.push({
        id: `insight_savings_${Date.now()}`,
        type: 'savings',
        value: '$127',
        insight: 'AI recommendations saved $127 this month',
        confidence: 0.94,
        timestamp: new Date().toISOString(),
        dailySavings: '12.50',
        totalSavings: '$127',
      });
    }

    if (insightTypes.includes('behavior')) {
      insights.push({
        id: `insight_behavior_${Date.now()}`,
        type: 'behavior',
        purchaseCount: 23,
        insight: 'Customer shows increased engagement with organic products',
        confidence: 0.89,
        timestamp: new Date().toISOString(),
        orderCount: '8',
      });
    }

    if (insightTypes.includes('health')) {
      insights.push({
        id: `insight_health_${Date.now()}`,
        type: 'health',
        healthScore: 8.5,
        insight: 'Health score improved by 15% this month',
        trend: 'up',
        confidence: 0.91,
        timestamp: new Date().toISOString(),
      });
    }

    if (insightTypes.includes('efficiency')) {
      insights.push({
        id: `insight_efficiency_${Date.now()}`,
        type: 'efficiency',
        timeSaved: '4.5h',
        insight: 'Smart recommendations reduced shopping time',
        confidence: 0.87,
        timestamp: new Date().toISOString(),
      });
    }

    return insights.slice(0, options.limit);
  }

  private async generateMockConsumptionPredictions(customerId: string, options: any) {
    return [
      {
        productId: 'prod_001',
        productName: 'Organic Bananas',
        predictedConsumptionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: 0.92,
        reason: 'Based on 7-day consumption cycle',
        emoji: '🍌',
        price: 3.99,
        personalizedScore: 0.95,
      },
      {
        productId: 'prod_002',
        productName: 'Almond Milk',
        predictedConsumptionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: 0.88,
        reason: 'Usually purchased every 10 days',
        emoji: '🥛',
        price: 4.49,
        personalizedScore: 0.87,
      },
    ];
  }

  private async generateMockChurnAnalysis(customerId: string, options: any) {
    return [
      {
        customerId,
        riskScore: 0.25,
        riskLevel: 'low',
        factors: options.includeFactors ? ['regular_purchases', 'high_satisfaction'] : undefined,
        interventions: options.includeInterventions ? ['none_required'] : undefined,
        timestamp: new Date().toISOString(),
      },
    ];
  }

  private async generateMockPricingOptimizations(options: any) {
    return [
      {
        productId: options.productId || 'prod_001',
        currentPrice: 3.99,
        recommendedPrice: 4.29,
        expectedRevenueLift: 0.12,
        confidence: 0.89,
        reasoning: 'Market analysis suggests 7% price increase with minimal demand impact',
      },
    ];
  }

  private async enhanceRecommendationsWithAI(recommendations: any, customerId: string, context: any) {
    // Enhance existing recommendations with AI insights
    if (Array.isArray(recommendations)) {
      return recommendations.map((rec, index) => ({
        ...rec,
        productId: rec.id || `rec_${index}`,
        productName: rec.name || rec.title || `Product ${index + 1}`,
        confidence: 0.85 + (Math.random() * 0.15), // Random confidence between 0.85-1.0
        reason: `Based on your purchase history and preferences`,
        personalizedScore: 0.80 + (Math.random() * 0.20), // Random score between 0.80-1.0
        emoji: ['🥛', '🍌', '🥬', '🍞', '🥣', '🫒'][index % 6],
        price: 2.99 + (Math.random() * 8), // Random price between $2.99-$10.99
      }));
    }

    return [];
  }

  private async generateMockDemandForecasting(options: any) {
    return [
      {
        productId: options.productId || 'prod_001',
        productName: 'Organic Bananas',
        currentDemand: 150,
        forecastedDemand: [
          { period: 'Week 1', demand: 165, confidence: 0.92 },
          { period: 'Week 2', demand: 158, confidence: 0.89 },
          { period: 'Week 3', demand: 172, confidence: 0.85 },
          { period: 'Week 4', demand: 180, confidence: 0.81 },
        ],
        seasonalFactors: options.includeSeasonality ? {
          spring: 1.1,
          summer: 1.3,
          autumn: 1.0,
          winter: 0.8,
        } : undefined,
        externalFactors: options.includeExternalFactors ? [
          'weather_conditions',
          'local_events',
          'economic_indicators',
        ] : undefined,
      },
    ];
  }

  private async generateMockABTestRecommendations(options: any) {
    return [
      {
        testId: `ab_test_${Date.now()}`,
        feature: options.feature || 'product_recommendations',
        hypothesis: 'Personalized AI recommendations will increase conversion rate',
        suggestedVariants: [
          {
            name: 'Control',
            description: 'Current recommendation algorithm',
            expectedMetric: { conversionRate: 0.08 },
          },
          {
            name: 'AI Enhanced',
            description: 'AWS Bedrock powered personalized recommendations',
            expectedMetric: { conversionRate: 0.12 },
          },
        ],
        statisticalPower: options.includeStatisticalPower ? 0.80 : undefined,
        designSuggestions: options.includeDesignSuggestions ? [
          'Use 50/50 traffic split',
          'Run test for minimum 2 weeks',
          'Track both primary and secondary metrics',
        ] : undefined,
        estimatedDuration: '14 days',
        confidence: 0.87,
      },
    ];
  }

  private async generateMockBusinessIntelligence(options: any) {
    return {
      summary: {
        keyMetrics: {
          totalRevenue: 45620,
          customerGrowth: 12.5,
          conversionRate: 8.3,
          averageOrderValue: 67.89,
        },
        trends: {
          revenue: 'up',
          customers: 'up',
          conversion: 'stable',
          orderValue: 'up',
        },
      },
      insights: options.includeKeyInsights ? [
        {
          type: 'revenue',
          message: 'Revenue increased 15% compared to last month',
          impact: 'high',
          confidence: 0.94,
        },
        {
          type: 'customer_behavior',
          message: 'Organic products showing 25% higher engagement',
          impact: 'medium',
          confidence: 0.87,
        },
        {
          type: 'inventory',
          message: 'Fresh produce category performing above forecast',
          impact: 'medium',
          confidence: 0.91,
        },
      ] : [],
    };
  }
}