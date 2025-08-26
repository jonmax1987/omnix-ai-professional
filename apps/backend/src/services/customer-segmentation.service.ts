import { Injectable, Logger } from '@nestjs/common';
import { BedrockAnalysisService } from './bedrock.service';
import { CacheService } from './cache.service';
import { MonitoringService } from './monitoring.service';
import { KinesisStreamingService } from './kinesis-streaming.service';
import { CustomerSegmentUpdateEvent } from '../interfaces/streaming-analytics.interface';
import {
  CustomerSegment,
  CustomerSegmentAssignment,
  CustomerFeatures,
  SegmentationRequest,
  SegmentationResponse,
  SegmentationStatistics,
  ClusteringResult,
  Cluster,
  SegmentMigration,
  SegmentPerformanceMetrics,
  PREDEFINED_SEGMENTS,
  SegmentRecommendationStrategy
} from '../interfaces/customer-segmentation.interface';
import { Purchase } from '../interfaces/ai-analysis.interface';

@Injectable()
export class CustomerSegmentationService {
  private readonly logger = new Logger(CustomerSegmentationService.name);
  private readonly bedrock: BedrockAnalysisService;
  private readonly cache: CacheService;
  private readonly monitoring: MonitoringService;
  private readonly kinesisStreamingService: KinesisStreamingService;
  private segments: Map<string, CustomerSegment> = new Map();
  private customerAssignments: Map<string, CustomerSegmentAssignment> = new Map();

  constructor() {
    this.bedrock = new BedrockAnalysisService();
    this.cache = new CacheService();
    this.monitoring = new MonitoringService();
    this.kinesisStreamingService = new KinesisStreamingService();
    this.initializePredefinedSegments();
  }

  private initializePredefinedSegments(): void {
    Object.values(PREDEFINED_SEGMENTS).forEach(segment => {
      const fullSegment: CustomerSegment = {
        segmentId: segment.id,
        segmentName: segment.name,
        description: segment.description,
        criteria: segment.criteria,
        customerCount: 0,
        averageOrderValue: 0,
        averagePurchaseFrequency: 0,
        characteristics: this.getSegmentCharacteristics(segment.id),
        recommendations: this.getSegmentRecommendationStrategy(segment.id),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.segments.set(segment.id, fullSegment);
    });
    console.log(`🎯 Initialized ${this.segments.size} predefined customer segments`);
  }

  async segmentCustomers(request: SegmentationRequest): Promise<SegmentationResponse> {
    const startTime = Date.now();
    
    try {
      console.log('🔍 Starting customer segmentation analysis');
      
      // Check cache if not forcing recalculation
      if (!request.forceRecalculation && request.customerId) {
        const cached = await this.getCachedSegmentation(request.customerId);
        if (cached) {
          console.log(`📦 Using cached segmentation for customer ${request.customerId}`);
          return {
            success: true,
            assignments: [cached],
            processingTime: Date.now() - startTime
          };
        }
      }

      let assignments: CustomerSegmentAssignment[] = [];

      if (request.customerId) {
        // Single customer segmentation
        const assignment = await this.segmentSingleCustomer(request.customerId, request.analysisDepth);
        assignments = [assignment];
      } else if (request.customerIds && request.customerIds.length > 0) {
        // Batch customer segmentation
        assignments = await this.segmentMultipleCustomers(request.customerIds, request.analysisDepth);
      } else {
        // Segment all customers (would need to fetch from database)
        assignments = await this.segmentAllCustomers(request.analysisDepth);
      }

      // Update statistics
      const statistics = this.calculateSegmentationStatistics(assignments);

      // Cache results
      await this.cacheSegmentationResults(assignments);

      // Record metrics
      await this.monitoring.recordSegmentationMetrics({
        customersSegmented: assignments.length,
        processingTime: Date.now() - startTime,
        averageConfidence: statistics.averageConfidence
      });

      console.log(`✅ Segmentation completed for ${assignments.length} customers`);

      return {
        success: true,
        segments: Array.from(this.segments.values()),
        assignments,
        statistics,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      console.error('❌ Segmentation failed:', error);
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime
      };
    }
  }

  private async segmentSingleCustomer(
    customerId: string, 
    analysisDepth: 'basic' | 'detailed' | 'comprehensive'
  ): Promise<CustomerSegmentAssignment> {
    console.log(`🎯 Segmenting customer ${customerId} with ${analysisDepth} analysis`);
    
    // Get customer purchase history (would come from database)
    const purchases = await this.getCustomerPurchases(customerId);
    
    // Extract features from purchase history
    const features = this.extractCustomerFeatures(customerId, purchases);
    
    // Use AI for comprehensive analysis
    let aiSegment: string | null = null;
    let confidence = 0.8;
    
    if (analysisDepth === 'comprehensive' || analysisDepth === 'detailed') {
      const aiResult = await this.getAISegmentRecommendation(customerId, purchases, features);
      if (aiResult) {
        aiSegment = aiResult.segmentId;
        confidence = aiResult.confidence;
      }
    }
    
    // Use rule-based segmentation as fallback or for basic analysis
    const ruleBasedSegment = this.applyRuleBasedSegmentation(features);
    
    // Determine final segment
    const finalSegmentId = aiSegment || ruleBasedSegment;
    const segment = this.segments.get(finalSegmentId);
    
    if (!segment) {
      throw new Error(`Segment ${finalSegmentId} not found`);
    }

    // Check for segment migration
    const previousAssignment = this.customerAssignments.get(customerId);
    
    const assignment: CustomerSegmentAssignment = {
      customerId,
      segmentId: finalSegmentId,
      segmentName: segment.segmentName,
      assignedAt: new Date().toISOString(),
      confidence,
      features,
      previousSegmentId: previousAssignment?.segmentId,
      migrationReason: previousAssignment && previousAssignment.segmentId !== finalSegmentId 
        ? this.getMigrationReason(previousAssignment.segmentId, finalSegmentId, features)
        : undefined
    };

    // Update internal state
    this.customerAssignments.set(customerId, assignment);
    
    // Publish segment update event to Kinesis for real-time analytics
    if (previousAssignment && previousAssignment.segmentId !== finalSegmentId) {
      this.publishSegmentUpdateEvent(assignment, previousAssignment.segmentId).catch(error => {
        this.logger.error('Failed to publish segment update event:', error);
      });
    } else if (!previousAssignment) {
      // New customer assignment
      this.publishSegmentUpdateEvent(assignment, null).catch(error => {
        this.logger.error('Failed to publish segment assignment event:', error);
      });
    }
    
    // Update segment statistics
    this.updateSegmentStatistics(finalSegmentId, features);
    
    return assignment;
  }

  private async segmentMultipleCustomers(
    customerIds: string[], 
    analysisDepth: 'basic' | 'detailed' | 'comprehensive'
  ): Promise<CustomerSegmentAssignment[]> {
    console.log(`🎯 Batch segmenting ${customerIds.length} customers`);
    
    // Use clustering for large batches
    if (customerIds.length > 50 && analysisDepth !== 'basic') {
      return this.clusterBasedSegmentation(customerIds);
    }
    
    // Process individually for smaller batches
    const assignments: CustomerSegmentAssignment[] = [];
    for (const customerId of customerIds) {
      const assignment = await this.segmentSingleCustomer(customerId, analysisDepth);
      assignments.push(assignment);
    }
    
    return assignments;
  }

  private async clusterBasedSegmentation(customerIds: string[]): Promise<CustomerSegmentAssignment[]> {
    console.log('🧮 Using K-means clustering for batch segmentation');
    
    // Extract features for all customers
    const customerFeatures: Map<string, CustomerFeatures> = new Map();
    const featureVectors: number[][] = [];
    
    for (const customerId of customerIds) {
      const purchases = await this.getCustomerPurchases(customerId);
      const features = this.extractCustomerFeatures(customerId, purchases);
      customerFeatures.set(customerId, features);
      featureVectors.push(this.featuresToVector(features));
    }
    
    // Perform K-means clustering
    const clusteringResult = this.performKMeansClustering(featureVectors, customerIds);
    
    // Map clusters to segments
    const assignments: CustomerSegmentAssignment[] = [];
    for (const cluster of clusteringResult.clusters) {
      const segmentId = this.mapClusterToSegment(cluster, customerFeatures);
      const segment = this.segments.get(segmentId)!;
      
      for (const customerId of cluster.members) {
        const features = customerFeatures.get(customerId)!;
        assignments.push({
          customerId,
          segmentId,
          segmentName: segment.segmentName,
          assignedAt: new Date().toISOString(),
          confidence: 0.75 + (0.25 * cluster.cohesion), // Confidence based on cluster cohesion
          features
        });
      }
    }
    
    return assignments;
  }

  private performKMeansClustering(featureVectors: number[][], customerIds: string[]): ClusteringResult {
    // Simplified K-means implementation
    const k = Math.min(5, Math.floor(customerIds.length / 10)); // Dynamic K based on customer count
    const maxIterations = 100;
    
    // Initialize centroids randomly
    const centroids: number[][] = [];
    for (let i = 0; i < k; i++) {
      const randomIndex = Math.floor(Math.random() * featureVectors.length);
      centroids.push([...featureVectors[randomIndex]]);
    }
    
    const clusters: Cluster[] = [];
    let iterations = 0;
    let hasConverged = false;
    
    while (!hasConverged && iterations < maxIterations) {
      // Clear previous clusters
      clusters.length = 0;
      for (let i = 0; i < k; i++) {
        clusters.push({
          clusterId: i,
          centroid: centroids[i],
          members: [],
          size: 0,
          variance: 0,
          cohesion: 0
        });
      }
      
      // Assign points to nearest centroid
      featureVectors.forEach((vector, index) => {
        let minDistance = Infinity;
        let closestCluster = 0;
        
        centroids.forEach((centroid, clusterIndex) => {
          const distance = this.euclideanDistance(vector, centroid);
          if (distance < minDistance) {
            minDistance = distance;
            closestCluster = clusterIndex;
          }
        });
        
        clusters[closestCluster].members.push(customerIds[index]);
        clusters[closestCluster].size++;
      });
      
      // Update centroids
      hasConverged = true;
      clusters.forEach((cluster, index) => {
        if (cluster.size > 0) {
          const newCentroid = this.calculateCentroid(
            cluster.members.map(id => featureVectors[customerIds.indexOf(id)])
          );
          
          // Check convergence
          const centroidShift = this.euclideanDistance(centroids[index], newCentroid);
          if (centroidShift > 0.01) {
            hasConverged = false;
          }
          
          centroids[index] = newCentroid;
          cluster.centroid = newCentroid;
        }
      });
      
      iterations++;
    }
    
    // Calculate cluster quality metrics
    clusters.forEach(cluster => {
      if (cluster.size > 0) {
        const memberVectors = cluster.members.map(id => featureVectors[customerIds.indexOf(id)]);
        cluster.variance = this.calculateVariance(memberVectors, cluster.centroid);
        cluster.cohesion = 1 / (1 + cluster.variance); // Higher cohesion for lower variance
      }
    });
    
    const silhouetteScore = this.calculateSilhouetteScore(clusters, featureVectors, customerIds);
    
    return {
      clusters,
      silhouetteScore,
      daviesBouldinIndex: 0.5, // Simplified metric
      optimalClusters: k
    };
  }

  private extractCustomerFeatures(customerId: string, purchases: Purchase[]): CustomerFeatures {
    const now = new Date();
    const totalSpent = purchases.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const totalPurchases = purchases.length;
    const averageOrderValue = totalPurchases > 0 ? totalSpent / totalPurchases : 0;
    
    // Calculate purchase frequency (purchases per month)
    let purchaseFrequency = 0;
    if (purchases.length >= 2) {
      const sortedPurchases = purchases.sort((a, b) => 
        new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()
      );
      const firstPurchase = new Date(sortedPurchases[0].purchaseDate);
      const lastPurchase = new Date(sortedPurchases[sortedPurchases.length - 1].purchaseDate);
      const monthsSpan = Math.max(1, (lastPurchase.getTime() - firstPurchase.getTime()) / (1000 * 60 * 60 * 24 * 30));
      purchaseFrequency = totalPurchases / monthsSpan;
    }
    
    // Days since last purchase
    const lastPurchaseDate = purchases.length > 0 
      ? Math.max(...purchases.map(p => new Date(p.purchaseDate).getTime()))
      : now.getTime();
    const daysSinceLastPurchase = Math.floor((now.getTime() - lastPurchaseDate) / (1000 * 60 * 60 * 24));
    
    // Favorite categories
    const categoryCount = new Map<string, number>();
    purchases.forEach(p => {
      categoryCount.set(p.category, (categoryCount.get(p.category) || 0) + 1);
    });
    const favoriteCategories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
    
    // Calculate churn risk
    let churnRisk: 'low' | 'medium' | 'high' = 'low';
    if (daysSinceLastPurchase > 180) {
      churnRisk = 'high';
    } else if (daysSinceLastPurchase > 90) {
      churnRisk = 'medium';
    }
    
    // Calculate engagement level (0-100)
    const engagementLevel = Math.min(100, Math.round(
      (purchaseFrequency * 10) + 
      (Math.max(0, 100 - daysSinceLastPurchase)) / 2 +
      (favoriteCategories.length * 5)
    ));
    
    // Analyze shopping patterns
    const purchaseDays = purchases.map(p => new Date(p.purchaseDate).getDay());
    const purchaseHours = purchases.map(p => new Date(p.purchaseDate).getHours());
    
    const dayFrequency = this.getMostFrequent(purchaseDays, 2);
    const hourFrequency = this.getMostFrequent(purchaseHours, 2);
    
    const preferredShoppingDays = dayFrequency.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]);
    const preferredShoppingTimes = hourFrequency.map(h => {
      if (h < 6) return 'Early Morning';
      if (h < 12) return 'Morning';
      if (h < 17) return 'Afternoon';
      if (h < 21) return 'Evening';
      return 'Night';
    });
    
    return {
      totalPurchases,
      totalSpent,
      averageOrderValue,
      purchaseFrequency,
      daysSinceLastPurchase,
      favoriteCategories,
      lifetimeValue: totalSpent,
      churnRisk,
      engagementLevel,
      preferredShoppingDays,
      preferredShoppingTimes
    };
  }

  private applyRuleBasedSegmentation(features: CustomerFeatures): string {
    const { 
      purchaseFrequency, 
      lifetimeValue, 
      daysSinceLastPurchase,
      totalPurchases,
      churnRisk
    } = features;
    
    // Apply rules in priority order
    if (daysSinceLastPurchase > 365) {
      return 'lost';
    }
    
    if (daysSinceLastPurchase > 180) {
      return 'hibernating';
    }
    
    if (lifetimeValue >= 800 && daysSinceLastPurchase > 120) {
      return 'cant-lose';
    }
    
    if (lifetimeValue >= 300 && daysSinceLastPurchase > 90) {
      return 'at-risk';
    }
    
    if (purchaseFrequency >= 4 && lifetimeValue >= 1000 && daysSinceLastPurchase <= 30) {
      return 'champions';
    }
    
    if (purchaseFrequency >= 2 && lifetimeValue >= 500) {
      return 'loyal';
    }
    
    if (totalPurchases <= 2 && daysSinceLastPurchase <= 30) {
      return 'new';
    }
    
    if (purchaseFrequency >= 1 && daysSinceLastPurchase <= 60) {
      return 'potential-loyalists';
    }
    
    // Default segment
    return 'potential-loyalists';
  }

  private async getAISegmentRecommendation(
    customerId: string, 
    purchases: Purchase[], 
    features: CustomerFeatures
  ): Promise<{ segmentId: string; confidence: number } | null> {
    try {
      const aiAnalysis = await this.bedrock.analyzeCustomer({
        customerId,
        purchases,
        analysisType: 'customer_profiling',
        maxRecommendations: 5
      });
      
      if (aiAnalysis.success && aiAnalysis.data) {
        // Map AI insights to segment
        const profile = aiAnalysis.data.customerProfile;
        
        if (profile.spendingPatterns.shoppingFrequency === 'daily' || 
            profile.spendingPatterns.shoppingFrequency === 'weekly') {
          if (profile.spendingPatterns.averageOrderValue > 50) {
            return { segmentId: 'champions', confidence: aiAnalysis.data.confidence };
          }
          return { segmentId: 'loyal', confidence: aiAnalysis.data.confidence };
        }
        
        if (profile.behavioralInsights.plannedShopper && profile.behavioralInsights.brandLoyal) {
          return { segmentId: 'loyal', confidence: aiAnalysis.data.confidence };
        }
        
        if (features.daysSinceLastPurchase > 90) {
          return { segmentId: 'at-risk', confidence: aiAnalysis.data.confidence };
        }
        
        return { segmentId: 'potential-loyalists', confidence: aiAnalysis.data.confidence };
      }
    } catch (error) {
      console.error('AI segmentation failed, using rule-based:', error);
    }
    
    return null;
  }

  private getSegmentCharacteristics(segmentId: string): any {
    const characteristics = {
      'champions': {
        primaryCategories: ['Premium', 'Organic', 'Gourmet'],
        brandAffinity: 'high' as const,
        pricePreference: 'premium' as const,
        shoppingPattern: 'frequent' as const,
        loyaltyLevel: 'champion' as const,
        seasonalTrends: true,
        bulkBuyingTendency: true,
        promotionSensitivity: 'low' as const
      },
      'loyal': {
        primaryCategories: ['Essentials', 'Family', 'Health'],
        brandAffinity: 'high' as const,
        pricePreference: 'mid-range' as const,
        shoppingPattern: 'regular' as const,
        loyaltyLevel: 'loyal' as const,
        seasonalTrends: false,
        bulkBuyingTendency: true,
        promotionSensitivity: 'medium' as const
      },
      'potential-loyalists': {
        primaryCategories: ['Variety', 'Trending', 'Seasonal'],
        brandAffinity: 'medium' as const,
        pricePreference: 'mid-range' as const,
        shoppingPattern: 'occasional' as const,
        loyaltyLevel: 'returning' as const,
        seasonalTrends: true,
        bulkBuyingTendency: false,
        promotionSensitivity: 'high' as const
      },
      'new': {
        primaryCategories: ['Popular', 'Essentials', 'Promotions'],
        brandAffinity: 'low' as const,
        pricePreference: 'budget' as const,
        shoppingPattern: 'rare' as const,
        loyaltyLevel: 'new' as const,
        seasonalTrends: false,
        bulkBuyingTendency: false,
        promotionSensitivity: 'high' as const
      },
      'at-risk': {
        primaryCategories: ['Essentials', 'Staples'],
        brandAffinity: 'medium' as const,
        pricePreference: 'mid-range' as const,
        shoppingPattern: 'occasional' as const,
        loyaltyLevel: 'returning' as const,
        seasonalTrends: false,
        bulkBuyingTendency: false,
        promotionSensitivity: 'high' as const
      }
    };
    
    return characteristics[segmentId] || characteristics['potential-loyalists'];
  }

  private getSegmentRecommendationStrategy(segmentId: string): SegmentRecommendationStrategy {
    const strategies = {
      'champions': {
        priority: 'retention' as const,
        recommendationType: 'personalized' as const,
        communicationFrequency: 'weekly' as const,
        preferredChannels: ['email', 'push', 'in-app'] as const,
        incentiveType: 'loyalty-points' as const,
        contentTone: 'personalized' as const
      },
      'loyal': {
        priority: 'upsell' as const,
        recommendationType: 'complementary' as const,
        communicationFrequency: 'bi-weekly' as const,
        preferredChannels: ['email', 'in-app'] as const,
        incentiveType: 'bundle' as const,
        contentTone: 'informative' as const
      },
      'potential-loyalists': {
        priority: 'cross-sell' as const,
        recommendationType: 'discovery' as const,
        communicationFrequency: 'weekly' as const,
        preferredChannels: ['email', 'push'] as const,
        incentiveType: 'discount' as const,
        contentTone: 'promotional' as const
      },
      'new': {
        priority: 'acquisition' as const,
        recommendationType: 'trending' as const,
        communicationFrequency: 'weekly' as const,
        preferredChannels: ['email', 'push'] as const,
        incentiveType: 'discount' as const,
        contentTone: 'promotional' as const
      },
      'at-risk': {
        priority: 'reactivation' as const,
        recommendationType: 'replenishment' as const,
        communicationFrequency: 'bi-weekly' as const,
        preferredChannels: ['email', 'sms'] as const,
        incentiveType: 'free-shipping' as const,
        contentTone: 'urgent' as const
      }
    };
    
    return strategies[segmentId] || strategies['potential-loyalists'];
  }

  private featuresToVector(features: CustomerFeatures): number[] {
    return [
      features.totalPurchases,
      features.totalSpent,
      features.averageOrderValue,
      features.purchaseFrequency,
      features.daysSinceLastPurchase,
      features.lifetimeValue,
      features.engagementLevel,
      features.churnRisk === 'high' ? 2 : features.churnRisk === 'medium' ? 1 : 0
    ];
  }

  private euclideanDistance(v1: number[], v2: number[]): number {
    return Math.sqrt(
      v1.reduce((sum, val, i) => sum + Math.pow(val - v2[i], 2), 0)
    );
  }

  private calculateCentroid(vectors: number[][]): number[] {
    if (vectors.length === 0) return [];
    
    const dimensions = vectors[0].length;
    const centroid = new Array(dimensions).fill(0);
    
    vectors.forEach(vector => {
      vector.forEach((val, i) => {
        centroid[i] += val;
      });
    });
    
    return centroid.map(val => val / vectors.length);
  }

  private calculateVariance(vectors: number[][], centroid: number[]): number {
    if (vectors.length === 0) return 0;
    
    const sumSquaredDistances = vectors.reduce((sum, vector) => {
      return sum + Math.pow(this.euclideanDistance(vector, centroid), 2);
    }, 0);
    
    return sumSquaredDistances / vectors.length;
  }

  private calculateSilhouetteScore(
    clusters: Cluster[], 
    featureVectors: number[][], 
    customerIds: string[]
  ): number {
    // Simplified silhouette score calculation
    // In production, would implement full algorithm
    let totalScore = 0;
    let count = 0;
    
    clusters.forEach(cluster => {
      if (cluster.size > 1) {
        const avgCohesion = 1 / (1 + cluster.variance);
        totalScore += avgCohesion;
        count++;
      }
    });
    
    return count > 0 ? (totalScore / count) * 2 - 1 : 0; // Scale to [-1, 1]
  }

  private mapClusterToSegment(
    cluster: Cluster, 
    customerFeatures: Map<string, CustomerFeatures>
  ): string {
    // Analyze cluster characteristics to determine best matching segment
    const clusterFeatures = cluster.members.map(id => customerFeatures.get(id)!);
    
    const avgLifetimeValue = clusterFeatures.reduce((sum, f) => sum + f.lifetimeValue, 0) / cluster.size;
    const avgFrequency = clusterFeatures.reduce((sum, f) => sum + f.purchaseFrequency, 0) / cluster.size;
    const avgDaysSincePurchase = clusterFeatures.reduce((sum, f) => sum + f.daysSinceLastPurchase, 0) / cluster.size;
    
    // Map to predefined segments based on cluster characteristics
    if (avgFrequency >= 4 && avgLifetimeValue >= 1000) {
      return 'champions';
    }
    if (avgFrequency >= 2 && avgLifetimeValue >= 500) {
      return 'loyal';
    }
    if (avgDaysSincePurchase > 180) {
      return 'hibernating';
    }
    if (avgDaysSincePurchase > 90 && avgLifetimeValue >= 300) {
      return 'at-risk';
    }
    if (avgFrequency <= 1 && avgDaysSincePurchase <= 30) {
      return 'new';
    }
    
    return 'potential-loyalists';
  }

  private getMostFrequent<T>(arr: T[], count: number): T[] {
    const frequency = new Map<T, number>();
    arr.forEach(item => {
      frequency.set(item, (frequency.get(item) || 0) + 1);
    });
    
    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([item]) => item);
  }

  private calculateSegmentationStatistics(assignments: CustomerSegmentAssignment[]): SegmentationStatistics {
    const segmentCounts = new Map<string, number>();
    let totalConfidence = 0;
    let migrationCount = 0;
    
    assignments.forEach(assignment => {
      segmentCounts.set(assignment.segmentId, (segmentCounts.get(assignment.segmentId) || 0) + 1);
      totalConfidence += assignment.confidence;
      if (assignment.previousSegmentId && assignment.previousSegmentId !== assignment.segmentId) {
        migrationCount++;
      }
    });
    
    const segmentDistribution = Array.from(segmentCounts.entries()).map(([segmentId, count]) => {
      const segment = this.segments.get(segmentId)!;
      return {
        segmentId,
        segmentName: segment.segmentName,
        count,
        percentage: (count / assignments.length) * 100
      };
    });
    
    return {
      totalCustomers: assignments.length,
      segmentDistribution,
      averageConfidence: totalConfidence / assignments.length,
      migrationCount,
      lastUpdated: new Date().toISOString()
    };
  }

  private updateSegmentStatistics(segmentId: string, features: CustomerFeatures): void {
    const segment = this.segments.get(segmentId);
    if (!segment) return;
    
    // Update running averages (simplified - in production would use proper averaging)
    segment.customerCount++;
    segment.averageOrderValue = (segment.averageOrderValue * (segment.customerCount - 1) + features.averageOrderValue) / segment.customerCount;
    segment.averagePurchaseFrequency = (segment.averagePurchaseFrequency * (segment.customerCount - 1) + features.purchaseFrequency) / segment.customerCount;
    segment.updatedAt = new Date().toISOString();
  }

  private getMigrationReason(fromSegmentId: string, toSegmentId: string, features: CustomerFeatures): string {
    const reasons: string[] = [];
    
    if (features.daysSinceLastPurchase > 90) {
      reasons.push('Extended period without purchase');
    }
    
    if (fromSegmentId === 'champions' && toSegmentId === 'at-risk') {
      reasons.push('Champion customer showing signs of churn');
    }
    
    if (fromSegmentId === 'new' && toSegmentId === 'loyal') {
      reasons.push('New customer successfully converted to loyal');
    }
    
    if (features.purchaseFrequency < 1) {
      reasons.push('Decreased purchase frequency');
    }
    
    if (features.churnRisk === 'high') {
      reasons.push('High churn risk detected');
    }
    
    return reasons.length > 0 ? reasons.join('; ') : 'Behavioral pattern change detected';
  }

  private async getCustomerPurchases(customerId: string): Promise<Purchase[]> {
    // This would fetch from DynamoDB in production
    // For now, return mock data
    const mockPurchases: Purchase[] = [
      {
        id: `${customerId}_PURCHASE_001`,
        customerId,
        productId: 'PROD001',
        productName: 'Organic Milk',
        category: 'Dairy',
        quantity: 2,
        price: 4.99,
        purchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `${customerId}_PURCHASE_002`,
        customerId,
        productId: 'PROD002',
        productName: 'Whole Wheat Bread',
        category: 'Bakery',
        quantity: 1,
        price: 3.49,
        purchaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `${customerId}_PURCHASE_003`,
        customerId,
        productId: 'PROD001',
        productName: 'Organic Milk',
        category: 'Dairy',
        quantity: 2,
        price: 4.99,
        purchaseDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    return mockPurchases;
  }

  private async getCachedSegmentation(customerId: string): Promise<CustomerSegmentAssignment | null> {
    try {
      const cacheKey = `segmentation:${customerId}`;
      const cached = await this.cache.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache retrieval failed:', error);
      return null;
    }
  }

  private async cacheSegmentationResults(assignments: CustomerSegmentAssignment[]): Promise<void> {
    try {
      for (const assignment of assignments) {
        const cacheKey = `segmentation:${assignment.customerId}`;
        await this.cache.set(cacheKey, JSON.stringify(assignment), 3600); // 1 hour TTL
      }
    } catch (error) {
      console.error('Cache storage failed:', error);
    }
  }

  private async segmentAllCustomers(analysisDepth: 'basic' | 'detailed' | 'comprehensive'): Promise<CustomerSegmentAssignment[]> {
    // This would fetch all customer IDs from the database
    // For demonstration, using mock customer IDs
    const mockCustomerIds = ['CUST001', 'CUST002', 'CUST003', 'CUST004', 'CUST005'];
    return this.segmentMultipleCustomers(mockCustomerIds, analysisDepth);
  }

  async getSegmentPerformance(segmentId: string): Promise<SegmentPerformanceMetrics> {
    // This would calculate real metrics from analytics data
    return {
      segmentId,
      conversionRate: 0.15 + Math.random() * 0.2,
      averageRevenue: 50 + Math.random() * 100,
      customerRetention: 0.7 + Math.random() * 0.2,
      growthRate: -0.1 + Math.random() * 0.3,
      churnRate: 0.05 + Math.random() * 0.1,
      engagementScore: 60 + Math.random() * 30,
      recommendationAcceptance: 0.2 + Math.random() * 0.3
    };
  }

  async trackSegmentMigration(migration: SegmentMigration): Promise<void> {
    // Store migration in database for analysis
    console.log(`📊 Customer ${migration.customerId} migrated from ${migration.fromSegment} to ${migration.toSegment}`);
    
    await this.monitoring.recordSegmentMigration({
      customerId: migration.customerId,
      fromSegment: migration.fromSegment,
      toSegment: migration.toSegment,
      reason: migration.reason
    });
  }

  private async publishSegmentUpdateEvent(
    assignment: CustomerSegmentAssignment,
    previousSegmentId: string | null
  ): Promise<void> {
    try {
      const segmentUpdateEvent: CustomerSegmentUpdateEvent = {
        customerId: assignment.customerId,
        previousSegment: previousSegmentId,
        newSegment: assignment.segmentName,
        segmentationScore: assignment.confidence,
        reasonCodes: this.getSegmentReasonCodes(assignment, previousSegmentId),
        timestamp: assignment.assignedAt,
        confidence: assignment.confidence,
        modelVersion: 'v1.0'
      };

      await this.kinesisStreamingService.publishSegmentUpdateEvent(segmentUpdateEvent);
      
      this.logger.log(`Published segment update event for customer ${assignment.customerId}: ${previousSegmentId || 'new'} → ${assignment.segmentName}`);
    } catch (error) {
      this.logger.error('Failed to publish segment update event:', error);
      throw error;
    }
  }

  private getSegmentReasonCodes(
    assignment: CustomerSegmentAssignment,
    previousSegmentId: string | null
  ): string[] {
    const reasonCodes: string[] = [];
    const features = assignment.features;

    // Analyze key factors that influenced segmentation
    if (features.totalSpent > 1000) {
      reasonCodes.push('high_value_customer');
    }
    
    if (features.purchaseFrequency > 10) {
      reasonCodes.push('frequent_purchaser');
    }
    
    if (features.averageOrderValue > 100) {
      reasonCodes.push('high_order_value');
    }
    
    if (features.daysSinceLastPurchase < 7) {
      reasonCodes.push('recent_activity');
    } else if (features.daysSinceLastPurchase > 90) {
      reasonCodes.push('inactive_period');
    }
    
    if (features.totalPurchases > 20) {
      reasonCodes.push('loyal_customer');
    }

    // Migration-specific reasons
    if (previousSegmentId && assignment.migrationReason) {
      reasonCodes.push(`migration_${assignment.migrationReason.toLowerCase().replace(/\s+/g, '_')}`);
    }

    // Default reason if none found
    if (reasonCodes.length === 0) {
      reasonCodes.push('standard_classification');
    }

    return reasonCodes;
  }
}