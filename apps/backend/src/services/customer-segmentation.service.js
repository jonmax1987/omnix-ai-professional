"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerSegmentationService = void 0;
const common_1 = require("@nestjs/common");
const bedrock_service_1 = require("./bedrock.service");
const cache_service_1 = require("./cache.service");
const monitoring_service_1 = require("./monitoring.service");
const kinesis_streaming_service_1 = require("./kinesis-streaming.service");
const customer_segmentation_interface_1 = require("../interfaces/customer-segmentation.interface");
let CustomerSegmentationService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CustomerSegmentationService = _classThis = class {
        constructor() {
            this.logger = new common_1.Logger(CustomerSegmentationService.name);
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
                let assignments = [];
                if (request.customerId) {
                    // Single customer segmentation
                    const assignment = await this.segmentSingleCustomer(request.customerId, request.analysisDepth);
                    assignments = [assignment];
                }
                else if (request.customerIds && request.customerIds.length > 0) {
                    // Batch customer segmentation
                    assignments = await this.segmentMultipleCustomers(request.customerIds, request.analysisDepth);
                }
                else {
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
            // Get customer purchase history (would come from database)
            const purchases = await this.getCustomerPurchases(customerId);
            // Extract features from purchase history
            const features = this.extractCustomerFeatures(customerId, purchases);
            // Use AI for comprehensive analysis
            let aiSegment = null;
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
            // Update internal state
            this.customerAssignments.set(customerId, assignment);
            // Publish segment update event to Kinesis for real-time analytics
            if (previousAssignment && previousAssignment.segmentId !== finalSegmentId) {
                this.publishSegmentUpdateEvent(assignment, previousAssignment.segmentId).catch(error => {
                    this.logger.error('Failed to publish segment update event:', error);
                });
            }
            else if (!previousAssignment) {
                // New customer assignment
                this.publishSegmentUpdateEvent(assignment, null).catch(error => {
                    this.logger.error('Failed to publish segment assignment event:', error);
                });
            }
            // Update segment statistics
            this.updateSegmentStatistics(finalSegmentId, features);
            return assignment;
        }
        async segmentMultipleCustomers(customerIds, analysisDepth) {
            console.log(`🎯 Batch segmenting ${customerIds.length} customers`);
            // Use clustering for large batches
            if (customerIds.length > 50 && analysisDepth !== 'basic') {
                return this.clusterBasedSegmentation(customerIds);
            }
            // Process individually for smaller batches
            const assignments = [];
            for (const customerId of customerIds) {
                const assignment = await this.segmentSingleCustomer(customerId, analysisDepth);
                assignments.push(assignment);
            }
            return assignments;
        }
        async clusterBasedSegmentation(customerIds) {
            console.log('🧮 Using K-means clustering for batch segmentation');
            // Extract features for all customers
            const customerFeatures = new Map();
            const featureVectors = [];
            for (const customerId of customerIds) {
                const purchases = await this.getCustomerPurchases(customerId);
                const features = this.extractCustomerFeatures(customerId, purchases);
                customerFeatures.set(customerId, features);
                featureVectors.push(this.featuresToVector(features));
            }
            // Perform K-means clustering
            const clusteringResult = this.performKMeansClustering(featureVectors, customerIds);
            // Map clusters to segments
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
                        confidence: 0.75 + (0.25 * cluster.cohesion), // Confidence based on cluster cohesion
                        features
                    });
                }
            }
            return assignments;
        }
        performKMeansClustering(featureVectors, customerIds) {
            // Simplified K-means implementation
            const k = Math.min(5, Math.floor(customerIds.length / 10)); // Dynamic K based on customer count
            const maxIterations = 100;
            // Initialize centroids randomly
            const centroids = [];
            for (let i = 0; i < k; i++) {
                const randomIndex = Math.floor(Math.random() * featureVectors.length);
                centroids.push([...featureVectors[randomIndex]]);
            }
            const clusters = [];
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
                        const newCentroid = this.calculateCentroid(cluster.members.map(id => featureVectors[customerIds.indexOf(id)]));
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
        extractCustomerFeatures(customerId, purchases) {
            const now = new Date();
            const totalSpent = purchases.reduce((sum, p) => sum + (p.price * p.quantity), 0);
            const totalPurchases = purchases.length;
            const averageOrderValue = totalPurchases > 0 ? totalSpent / totalPurchases : 0;
            // Calculate purchase frequency (purchases per month)
            let purchaseFrequency = 0;
            if (purchases.length >= 2) {
                const sortedPurchases = purchases.sort((a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());
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
            const categoryCount = new Map();
            purchases.forEach(p => {
                categoryCount.set(p.category, (categoryCount.get(p.category) || 0) + 1);
            });
            const favoriteCategories = Array.from(categoryCount.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([category]) => category);
            // Calculate churn risk
            let churnRisk = 'low';
            if (daysSinceLastPurchase > 180) {
                churnRisk = 'high';
            }
            else if (daysSinceLastPurchase > 90) {
                churnRisk = 'medium';
            }
            // Calculate engagement level (0-100)
            const engagementLevel = Math.min(100, Math.round((purchaseFrequency * 10) +
                (Math.max(0, 100 - daysSinceLastPurchase)) / 2 +
                (favoriteCategories.length * 5)));
            // Analyze shopping patterns
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
        async getAISegmentRecommendation(customerId, purchases, features) {
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
        mapClusterToSegment(cluster, customerFeatures) {
            // Analyze cluster characteristics to determine best matching segment
            const clusterFeatures = cluster.members.map(id => customerFeatures.get(id));
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
            // Update running averages (simplified - in production would use proper averaging)
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
            // This would fetch from DynamoDB in production
            // For now, return mock data
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
                    await this.cache.set(cacheKey, JSON.stringify(assignment), 3600); // 1 hour TTL
                }
            }
            catch (error) {
                console.error('Cache storage failed:', error);
            }
        }
        async segmentAllCustomers(analysisDepth) {
            // This would fetch all customer IDs from the database
            // For demonstration, using mock customer IDs
            const mockCustomerIds = ['CUST001', 'CUST002', 'CUST003', 'CUST004', 'CUST005'];
            return this.segmentMultipleCustomers(mockCustomerIds, analysisDepth);
        }
        async getSegmentPerformance(segmentId) {
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
        async trackSegmentMigration(migration) {
            // Store migration in database for analysis
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
            }
            else if (features.daysSinceLastPurchase > 90) {
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
    };
    __setFunctionName(_classThis, "CustomerSegmentationService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CustomerSegmentationService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CustomerSegmentationService = _classThis;
})();
exports.CustomerSegmentationService = CustomerSegmentationService;
