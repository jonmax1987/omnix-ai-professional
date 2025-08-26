"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CustomerSegmentationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerSegmentationService = void 0;
const common_1 = require("@nestjs/common");
const bedrock_service_1 = require("./bedrock.service");
const cache_service_1 = require("./cache.service");
const monitoring_service_1 = require("./monitoring.service");
const kinesis_streaming_service_1 = require("./kinesis-streaming.service");
const customer_segmentation_interface_1 = require("../interfaces/customer-segmentation.interface");
let CustomerSegmentationService = CustomerSegmentationService_1 = class CustomerSegmentationService {
    constructor() {
        this.logger = new common_1.Logger(CustomerSegmentationService_1.name);
        this.segments = new Map();
        this.customerAssignments = new Map();
        this.bedrock = new bedrock_service_1.BedrockAnalysisService();
        this.cache = new cache_service_1.CacheService();
        this.monitoring = new monitoring_service_1.MonitoringService();
        this.kinesisStreamingService = new kinesis_streaming_service_1.KinesisStreamingService();
        this.initializePredefinedSegments();
    }
    initializePredefinedSegments() {
        Object.values(customer_segmentation_interface_1.PREDEFINED_SEGMENTS).forEach(segment => {
            const fullSegment = {
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
    async segmentCustomers(request) {
        const startTime = Date.now();
        try {
            console.log('🔍 Starting customer segmentation analysis');
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
            let assignments = [];
            if (request.customerId) {
                const assignment = await this.segmentSingleCustomer(request.customerId, request.analysisDepth);
                assignments = [assignment];
            }
            else if (request.customerIds && request.customerIds.length > 0) {
                assignments = await this.segmentMultipleCustomers(request.customerIds, request.analysisDepth);
            }
            else {
                assignments = await this.segmentAllCustomers(request.analysisDepth);
            }
            const statistics = this.calculateSegmentationStatistics(assignments);
            await this.cacheSegmentationResults(assignments);
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
        }
        catch (error) {
            console.error('❌ Segmentation failed:', error);
            return {
                success: false,
                error: error.message,
                processingTime: Date.now() - startTime
            };
        }
    }
    async segmentSingleCustomer(customerId, analysisDepth) {
        console.log(`🎯 Segmenting customer ${customerId} with ${analysisDepth} analysis`);
        const purchases = await this.getCustomerPurchases(customerId);
        const features = this.extractCustomerFeatures(customerId, purchases);
        let aiSegment = null;
        let confidence = 0.8;
        if (analysisDepth === 'comprehensive' || analysisDepth === 'detailed') {
            const aiResult = await this.getAISegmentRecommendation(customerId, purchases, features);
            if (aiResult) {
                aiSegment = aiResult.segmentId;
                confidence = aiResult.confidence;
            }
        }
        const ruleBasedSegment = this.applyRuleBasedSegmentation(features);
        const finalSegmentId = aiSegment || ruleBasedSegment;
        const segment = this.segments.get(finalSegmentId);
        if (!segment) {
            throw new Error(`Segment ${finalSegmentId} not found`);
        }
        const previousAssignment = this.customerAssignments.get(customerId);
        const assignment = {
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
        this.customerAssignments.set(customerId, assignment);
        if (previousAssignment && previousAssignment.segmentId !== finalSegmentId) {
            this.publishSegmentUpdateEvent(assignment, previousAssignment.segmentId).catch(error => {
                this.logger.error('Failed to publish segment update event:', error);
            });
        }
        else if (!previousAssignment) {
            this.publishSegmentUpdateEvent(assignment, null).catch(error => {
                this.logger.error('Failed to publish segment assignment event:', error);
            });
        }
        this.updateSegmentStatistics(finalSegmentId, features);
        return assignment;
    }
    async segmentMultipleCustomers(customerIds, analysisDepth) {
        console.log(`🎯 Batch segmenting ${customerIds.length} customers`);
        if (customerIds.length > 50 && analysisDepth !== 'basic') {
            return this.clusterBasedSegmentation(customerIds);
        }
        const assignments = [];
        for (const customerId of customerIds) {
            const assignment = await this.segmentSingleCustomer(customerId, analysisDepth);
            assignments.push(assignment);
        }
        return assignments;
    }
    async clusterBasedSegmentation(customerIds) {
        console.log('🧮 Using K-means clustering for batch segmentation');
        const customerFeatures = new Map();
        const featureVectors = [];
        for (const customerId of customerIds) {
            const purchases = await this.getCustomerPurchases(customerId);
            const features = this.extractCustomerFeatures(customerId, purchases);
            customerFeatures.set(customerId, features);
            featureVectors.push(this.featuresToVector(features));
        }
        const clusteringResult = this.performKMeansClustering(featureVectors, customerIds);
        const assignments = [];
        for (const cluster of clusteringResult.clusters) {
            const segmentId = this.mapClusterToSegment(cluster, customerFeatures);
            const segment = this.segments.get(segmentId);
            for (const customerId of cluster.members) {
                const features = customerFeatures.get(customerId);
                assignments.push({
                    customerId,
                    segmentId,
                    segmentName: segment.segmentName,
                    assignedAt: new Date().toISOString(),
                    confidence: 0.75 + (0.25 * cluster.cohesion),
                    features
                });
            }
        }
        return assignments;
    }
    performKMeansClustering(featureVectors, customerIds) {
        const k = Math.min(5, Math.floor(customerIds.length / 10));
        const maxIterations = 100;
        const centroids = [];
        for (let i = 0; i < k; i++) {
            const randomIndex = Math.floor(Math.random() * featureVectors.length);
            centroids.push([...featureVectors[randomIndex]]);
        }
        const clusters = [];
        let iterations = 0;
        let hasConverged = false;
        while (!hasConverged && iterations < maxIterations) {
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
            hasConverged = true;
            clusters.forEach((cluster, index) => {
                if (cluster.size > 0) {
                    const newCentroid = this.calculateCentroid(cluster.members.map(id => featureVectors[customerIds.indexOf(id)]));
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
        clusters.forEach(cluster => {
            if (cluster.size > 0) {
                const memberVectors = cluster.members.map(id => featureVectors[customerIds.indexOf(id)]);
                cluster.variance = this.calculateVariance(memberVectors, cluster.centroid);
                cluster.cohesion = 1 / (1 + cluster.variance);
            }
        });
        const silhouetteScore = this.calculateSilhouetteScore(clusters, featureVectors, customerIds);
        return {
            clusters,
            silhouetteScore,
            daviesBouldinIndex: 0.5,
            optimalClusters: k
        };
    }
    extractCustomerFeatures(customerId, purchases) {
        const now = new Date();
        const totalSpent = purchases.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const totalPurchases = purchases.length;
        const averageOrderValue = totalPurchases > 0 ? totalSpent / totalPurchases : 0;
        let purchaseFrequency = 0;
        if (purchases.length >= 2) {
            const sortedPurchases = purchases.sort((a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());
            const firstPurchase = new Date(sortedPurchases[0].purchaseDate);
            const lastPurchase = new Date(sortedPurchases[sortedPurchases.length - 1].purchaseDate);
            const monthsSpan = Math.max(1, (lastPurchase.getTime() - firstPurchase.getTime()) / (1000 * 60 * 60 * 24 * 30));
            purchaseFrequency = totalPurchases / monthsSpan;
        }
        const lastPurchaseDate = purchases.length > 0
            ? Math.max(...purchases.map(p => new Date(p.purchaseDate).getTime()))
            : now.getTime();
        const daysSinceLastPurchase = Math.floor((now.getTime() - lastPurchaseDate) / (1000 * 60 * 60 * 24));
        const categoryCount = new Map();
        purchases.forEach(p => {
            categoryCount.set(p.category, (categoryCount.get(p.category) || 0) + 1);
        });
        const favoriteCategories = Array.from(categoryCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([category]) => category);
        let churnRisk = 'low';
        if (daysSinceLastPurchase > 180) {
            churnRisk = 'high';
        }
        else if (daysSinceLastPurchase > 90) {
            churnRisk = 'medium';
        }
        const engagementLevel = Math.min(100, Math.round((purchaseFrequency * 10) +
            (Math.max(0, 100 - daysSinceLastPurchase)) / 2 +
            (favoriteCategories.length * 5)));
        const purchaseDays = purchases.map(p => new Date(p.purchaseDate).getDay());
        const purchaseHours = purchases.map(p => new Date(p.purchaseDate).getHours());
        const dayFrequency = this.getMostFrequent(purchaseDays, 2);
        const hourFrequency = this.getMostFrequent(purchaseHours, 2);
        const preferredShoppingDays = dayFrequency.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]);
        const preferredShoppingTimes = hourFrequency.map(h => {
            if (h < 6)
                return 'Early Morning';
            if (h < 12)
                return 'Morning';
            if (h < 17)
                return 'Afternoon';
            if (h < 21)
                return 'Evening';
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
    applyRuleBasedSegmentation(features) {
        const { purchaseFrequency, lifetimeValue, daysSinceLastPurchase, totalPurchases, churnRisk } = features;
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
        return 'potential-loyalists';
    }
    async getAISegmentRecommendation(customerId, purchases, features) {
        try {
            const aiAnalysis = await this.bedrock.analyzeCustomer({
                customerId,
                purchases,
                analysisType: 'customer_profiling',
                maxRecommendations: 5
            });
            if (aiAnalysis.success && aiAnalysis.data) {
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
        }
        catch (error) {
            console.error('AI segmentation failed, using rule-based:', error);
        }
        return null;
    }
    getSegmentCharacteristics(segmentId) {
        const characteristics = {
            'champions': {
                primaryCategories: ['Premium', 'Organic', 'Gourmet'],
                brandAffinity: 'high',
                pricePreference: 'premium',
                shoppingPattern: 'frequent',
                loyaltyLevel: 'champion',
                seasonalTrends: true,
                bulkBuyingTendency: true,
                promotionSensitivity: 'low'
            },
            'loyal': {
                primaryCategories: ['Essentials', 'Family', 'Health'],
                brandAffinity: 'high',
                pricePreference: 'mid-range',
                shoppingPattern: 'regular',
                loyaltyLevel: 'loyal',
                seasonalTrends: false,
                bulkBuyingTendency: true,
                promotionSensitivity: 'medium'
            },
            'potential-loyalists': {
                primaryCategories: ['Variety', 'Trending', 'Seasonal'],
                brandAffinity: 'medium',
                pricePreference: 'mid-range',
                shoppingPattern: 'occasional',
                loyaltyLevel: 'returning',
                seasonalTrends: true,
                bulkBuyingTendency: false,
                promotionSensitivity: 'high'
            },
            'new': {
                primaryCategories: ['Popular', 'Essentials', 'Promotions'],
                brandAffinity: 'low',
                pricePreference: 'budget',
                shoppingPattern: 'rare',
                loyaltyLevel: 'new',
                seasonalTrends: false,
                bulkBuyingTendency: false,
                promotionSensitivity: 'high'
            },
            'at-risk': {
                primaryCategories: ['Essentials', 'Staples'],
                brandAffinity: 'medium',
                pricePreference: 'mid-range',
                shoppingPattern: 'occasional',
                loyaltyLevel: 'returning',
                seasonalTrends: false,
                bulkBuyingTendency: false,
                promotionSensitivity: 'high'
            }
        };
        return characteristics[segmentId] || characteristics['potential-loyalists'];
    }
    getSegmentRecommendationStrategy(segmentId) {
        const strategies = {
            'champions': {
                priority: 'retention',
                recommendationType: 'personalized',
                communicationFrequency: 'weekly',
                preferredChannels: ['email', 'push', 'in-app'],
                incentiveType: 'loyalty-points',
                contentTone: 'personalized'
            },
            'loyal': {
                priority: 'upsell',
                recommendationType: 'complementary',
                communicationFrequency: 'bi-weekly',
                preferredChannels: ['email', 'in-app'],
                incentiveType: 'bundle',
                contentTone: 'informative'
            },
            'potential-loyalists': {
                priority: 'cross-sell',
                recommendationType: 'discovery',
                communicationFrequency: 'weekly',
                preferredChannels: ['email', 'push'],
                incentiveType: 'discount',
                contentTone: 'promotional'
            },
            'new': {
                priority: 'acquisition',
                recommendationType: 'trending',
                communicationFrequency: 'weekly',
                preferredChannels: ['email', 'push'],
                incentiveType: 'discount',
                contentTone: 'promotional'
            },
            'at-risk': {
                priority: 'reactivation',
                recommendationType: 'replenishment',
                communicationFrequency: 'bi-weekly',
                preferredChannels: ['email', 'sms'],
                incentiveType: 'free-shipping',
                contentTone: 'urgent'
            }
        };
        return strategies[segmentId] || strategies['potential-loyalists'];
    }
    featuresToVector(features) {
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
    euclideanDistance(v1, v2) {
        return Math.sqrt(v1.reduce((sum, val, i) => sum + Math.pow(val - v2[i], 2), 0));
    }
    calculateCentroid(vectors) {
        if (vectors.length === 0)
            return [];
        const dimensions = vectors[0].length;
        const centroid = new Array(dimensions).fill(0);
        vectors.forEach(vector => {
            vector.forEach((val, i) => {
                centroid[i] += val;
            });
        });
        return centroid.map(val => val / vectors.length);
    }
    calculateVariance(vectors, centroid) {
        if (vectors.length === 0)
            return 0;
        const sumSquaredDistances = vectors.reduce((sum, vector) => {
            return sum + Math.pow(this.euclideanDistance(vector, centroid), 2);
        }, 0);
        return sumSquaredDistances / vectors.length;
    }
    calculateSilhouetteScore(clusters, featureVectors, customerIds) {
        let totalScore = 0;
        let count = 0;
        clusters.forEach(cluster => {
            if (cluster.size > 1) {
                const avgCohesion = 1 / (1 + cluster.variance);
                totalScore += avgCohesion;
                count++;
            }
        });
        return count > 0 ? (totalScore / count) * 2 - 1 : 0;
    }
    mapClusterToSegment(cluster, customerFeatures) {
        const clusterFeatures = cluster.members.map(id => customerFeatures.get(id));
        const avgLifetimeValue = clusterFeatures.reduce((sum, f) => sum + f.lifetimeValue, 0) / cluster.size;
        const avgFrequency = clusterFeatures.reduce((sum, f) => sum + f.purchaseFrequency, 0) / cluster.size;
        const avgDaysSincePurchase = clusterFeatures.reduce((sum, f) => sum + f.daysSinceLastPurchase, 0) / cluster.size;
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
    getMostFrequent(arr, count) {
        const frequency = new Map();
        arr.forEach(item => {
            frequency.set(item, (frequency.get(item) || 0) + 1);
        });
        return Array.from(frequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, count)
            .map(([item]) => item);
    }
    calculateSegmentationStatistics(assignments) {
        const segmentCounts = new Map();
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
            const segment = this.segments.get(segmentId);
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
    updateSegmentStatistics(segmentId, features) {
        const segment = this.segments.get(segmentId);
        if (!segment)
            return;
        segment.customerCount++;
        segment.averageOrderValue = (segment.averageOrderValue * (segment.customerCount - 1) + features.averageOrderValue) / segment.customerCount;
        segment.averagePurchaseFrequency = (segment.averagePurchaseFrequency * (segment.customerCount - 1) + features.purchaseFrequency) / segment.customerCount;
        segment.updatedAt = new Date().toISOString();
    }
    getMigrationReason(fromSegmentId, toSegmentId, features) {
        const reasons = [];
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
    async getCustomerPurchases(customerId) {
        const mockPurchases = [
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
    async getCachedSegmentation(customerId) {
        try {
            const cacheKey = `segmentation:${customerId}`;
            const cached = await this.cache.get(cacheKey);
            return cached ? JSON.parse(cached) : null;
        }
        catch (error) {
            console.error('Cache retrieval failed:', error);
            return null;
        }
    }
    async cacheSegmentationResults(assignments) {
        try {
            for (const assignment of assignments) {
                const cacheKey = `segmentation:${assignment.customerId}`;
                await this.cache.set(cacheKey, JSON.stringify(assignment), 3600);
            }
        }
        catch (error) {
            console.error('Cache storage failed:', error);
        }
    }
    async segmentAllCustomers(analysisDepth) {
        const mockCustomerIds = ['CUST001', 'CUST002', 'CUST003', 'CUST004', 'CUST005'];
        return this.segmentMultipleCustomers(mockCustomerIds, analysisDepth);
    }
    async getSegmentPerformance(segmentId) {
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
    async trackSegmentMigration(migration) {
        console.log(`📊 Customer ${migration.customerId} migrated from ${migration.fromSegment} to ${migration.toSegment}`);
        await this.monitoring.recordSegmentMigration({
            customerId: migration.customerId,
            fromSegment: migration.fromSegment,
            toSegment: migration.toSegment,
            reason: migration.reason
        });
    }
    async publishSegmentUpdateEvent(assignment, previousSegmentId) {
        try {
            const segmentUpdateEvent = {
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
        }
        catch (error) {
            this.logger.error('Failed to publish segment update event:', error);
            throw error;
        }
    }
    getSegmentReasonCodes(assignment, previousSegmentId) {
        const reasonCodes = [];
        const features = assignment.features;
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
        }
        else if (features.daysSinceLastPurchase > 90) {
            reasonCodes.push('inactive_period');
        }
        if (features.totalPurchases > 20) {
            reasonCodes.push('loyal_customer');
        }
        if (previousSegmentId && assignment.migrationReason) {
            reasonCodes.push(`migration_${assignment.migrationReason.toLowerCase().replace(/\s+/g, '_')}`);
        }
        if (reasonCodes.length === 0) {
            reasonCodes.push('standard_classification');
        }
        return reasonCodes;
    }
};
exports.CustomerSegmentationService = CustomerSegmentationService;
exports.CustomerSegmentationService = CustomerSegmentationService = CustomerSegmentationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CustomerSegmentationService);
//# sourceMappingURL=customer-segmentation.service.js.map