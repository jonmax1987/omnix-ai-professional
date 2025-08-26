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
var RealtimeAnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const customer_segmentation_service_1 = require("./customer-segmentation.service");
const enhanced_bedrock_service_1 = require("./enhanced-bedrock.service");
const cache_service_1 = require("./cache.service");
const websocket_service_1 = require("../websocket/websocket.service");
let RealtimeAnalyticsService = RealtimeAnalyticsService_1 = class RealtimeAnalyticsService {
    constructor(customerSegmentationService, enhancedBedrockService, cacheService, websocketService) {
        this.customerSegmentationService = customerSegmentationService;
        this.enhancedBedrockService = enhancedBedrockService;
        this.cacheService = cacheService;
        this.websocketService = websocketService;
        this.logger = new common_1.Logger(RealtimeAnalyticsService_1.name);
        this.processingBuffer = new Map();
        this.bufferFlushInterval = 5000;
        this.maxBufferSize = 50;
        setInterval(() => this.flushProcessingBuffers(), this.bufferFlushInterval);
    }
    async processPurchaseEvent(event) {
        const insights = [];
        const startTime = Date.now();
        try {
            this.addToBuffer(event.customerId, event);
            const consumptionInsight = await this.generateConsumptionInsight(event);
            if (consumptionInsight)
                insights.push(consumptionInsight);
            const behaviorInsight = await this.detectBehaviorAnomaly(event);
            if (behaviorInsight)
                insights.push(behaviorInsight);
            const segmentInsight = await this.checkSegmentReassignment(event);
            if (segmentInsight)
                insights.push(segmentInsight);
            for (const insight of insights.filter(i => i.priority === 'high' || i.priority === 'critical')) {
                await this.sendRealtimeNotification(insight);
            }
            this.logger.debug(`Processed purchase event for customer ${event.customerId} in ${Date.now() - startTime}ms`);
            return insights;
        }
        catch (error) {
            this.logger.error(`Failed to process purchase event: ${error.message}`);
            return insights;
        }
    }
    async processSegmentUpdateEvent(event) {
        const insights = [];
        try {
            const insight = {
                customerId: event.customerId,
                insightType: 'segment_migration',
                insight: `Customer migrated from ${event.previousSegment || 'unknown'} to ${event.newSegment} (confidence: ${Math.round(event.confidence * 100)}%)`,
                actionRequired: this.isHighValueSegmentChange(event.previousSegment, event.newSegment),
                priority: this.getSegmentChangePriority(event.previousSegment, event.newSegment),
                timestamp: new Date().toISOString(),
                data: {
                    previousSegment: event.previousSegment,
                    newSegment: event.newSegment,
                    confidence: event.confidence,
                    reasonCodes: event.reasonCodes,
                    modelVersion: event.modelVersion
                }
            };
            insights.push(insight);
            await this.updateSegmentBasedRecommendations(event.customerId, event.newSegment);
            if (insight.priority === 'high' || insight.priority === 'critical') {
                await this.sendRealtimeNotification(insight);
            }
            return insights;
        }
        catch (error) {
            this.logger.error(`Failed to process segment update event: ${error.message}`);
            return insights;
        }
    }
    async processConsumptionPredictionEvent(event) {
        const insights = [];
        try {
            if (event.alertTriggered && event.confidence > 0.7) {
                const insight = {
                    customerId: event.customerId,
                    insightType: 'consumption_prediction',
                    insight: `High confidence prediction: Customer likely to purchase ${event.productId} on ${event.predictedConsumptionDate}`,
                    actionRequired: true,
                    priority: event.confidence > 0.9 ? 'high' : 'medium',
                    timestamp: new Date().toISOString(),
                    data: {
                        productId: event.productId,
                        predictedDate: event.predictedConsumptionDate,
                        confidence: event.confidence,
                        predictionType: event.predictionType,
                        factors: event.factors
                    }
                };
                insights.push(insight);
                await this.cacheService.set(`prediction:${event.customerId}:${event.productId}`, JSON.stringify(event), 60 * 60 * 24);
                if (insight.priority === 'high') {
                    await this.sendRealtimeNotification(insight);
                }
            }
            return insights;
        }
        catch (error) {
            this.logger.error(`Failed to process consumption prediction event: ${error.message}`);
            return insights;
        }
    }
    async generateConsumptionInsight(event) {
        try {
            const cacheKey = `frequency:${event.customerId}:${event.productId}`;
            const historicalFrequencyStr = await this.cacheService.get(cacheKey);
            if (historicalFrequencyStr) {
                const historicalFrequency = JSON.parse(historicalFrequencyStr);
                const daysSinceLast = this.calculateDaysSinceLastPurchase(event);
                const expectedFrequency = historicalFrequency.averageDaysBetweenPurchases;
                if (daysSinceLast < expectedFrequency * 0.7) {
                    return {
                        customerId: event.customerId,
                        insightType: 'behavior_anomaly',
                        insight: `Customer purchased ${event.productName} ${Math.round((expectedFrequency - daysSinceLast) / expectedFrequency * 100)}% earlier than usual pattern`,
                        actionRequired: true,
                        priority: 'medium',
                        timestamp: new Date().toISOString(),
                        data: {
                            productId: event.productId,
                            expectedFrequency,
                            actualDays: daysSinceLast,
                            deviation: expectedFrequency - daysSinceLast
                        }
                    };
                }
            }
            return null;
        }
        catch (error) {
            this.logger.error(`Failed to generate consumption insight: ${error.message}`);
            return null;
        }
    }
    async detectBehaviorAnomaly(event) {
        try {
            const recentSpendingStr = await this.cacheService.get(`spending:${event.customerId}:recent`);
            if (recentSpendingStr) {
                const recentSpending = JSON.parse(recentSpendingStr);
                const averageSpending = recentSpending.averageAmount;
                const spendingDeviation = Math.abs(event.totalAmount - averageSpending) / averageSpending;
                if (spendingDeviation > 0.5) {
                    return {
                        customerId: event.customerId,
                        insightType: 'behavior_anomaly',
                        insight: `Unusual spending detected: ${spendingDeviation > 0 ? 'Significantly higher' : 'Lower'} than average (${Math.round(spendingDeviation * 100)}% deviation)`,
                        actionRequired: spendingDeviation > 1.0,
                        priority: spendingDeviation > 1.0 ? 'high' : 'medium',
                        timestamp: new Date().toISOString(),
                        data: {
                            currentAmount: event.totalAmount,
                            averageAmount: averageSpending,
                            deviation: spendingDeviation,
                            productCategory: event.productCategory
                        }
                    };
                }
            }
            return null;
        }
        catch (error) {
            this.logger.error(`Failed to detect behavior anomaly: ${error.message}`);
            return null;
        }
    }
    async checkSegmentReassignment(event) {
        try {
            const currentSegmentStr = await this.cacheService.get(`segment:${event.customerId}`);
            if (!currentSegmentStr)
                return null;
            const currentSegment = JSON.parse(currentSegmentStr);
            const triggers = [];
            if (event.totalAmount > 100) {
                triggers.push('high_value_purchase');
            }
            if (triggers.length > 0) {
                return {
                    customerId: event.customerId,
                    insightType: 'recommendation_update',
                    insight: `Purchase triggers detected for potential segment reassignment: ${triggers.join(', ')}`,
                    actionRequired: true,
                    priority: 'low',
                    timestamp: new Date().toISOString(),
                    data: {
                        currentSegment: currentSegment.segment,
                        triggers,
                        purchaseAmount: event.totalAmount,
                        productCategory: event.productCategory
                    }
                };
            }
            return null;
        }
        catch (error) {
            this.logger.error(`Failed to check segment reassignment: ${error.message}`);
            return null;
        }
    }
    async updateSegmentBasedRecommendations(customerId, newSegment) {
        try {
            await this.cacheService.set(`segment:${customerId}`, JSON.stringify({ segment: newSegment, updatedAt: new Date().toISOString() }), 60 * 60 * 24 * 7);
            this.logger.debug(`Updated recommendations cache for customer ${customerId} with new segment ${newSegment}`);
        }
        catch (error) {
            this.logger.error(`Failed to update segment-based recommendations: ${error.message}`);
        }
    }
    async sendRealtimeNotification(insight) {
        try {
            await this.websocketService.sendToUser(insight.customerId, {
                channel: 'insights',
                type: 'insight',
                payload: insight,
                timestamp: new Date().toISOString()
            });
            this.logger.debug(`Sent real-time notification for customer ${insight.customerId}`);
        }
        catch (error) {
            this.logger.error(`Failed to send real-time notification: ${error.message}`);
        }
    }
    addToBuffer(customerId, event) {
        if (!this.processingBuffer.has(customerId)) {
            this.processingBuffer.set(customerId, []);
        }
        const customerBuffer = this.processingBuffer.get(customerId);
        customerBuffer.push(event);
        if (customerBuffer.length >= this.maxBufferSize) {
            this.flushCustomerBuffer(customerId);
        }
    }
    async flushProcessingBuffers() {
        for (const customerId of this.processingBuffer.keys()) {
            await this.flushCustomerBuffer(customerId);
        }
    }
    async flushCustomerBuffer(customerId) {
        const buffer = this.processingBuffer.get(customerId);
        if (!buffer || buffer.length === 0)
            return;
        try {
            await this.processBatchInsights(customerId, buffer);
            this.processingBuffer.set(customerId, []);
            this.logger.debug(`Flushed buffer for customer ${customerId} with ${buffer.length} events`);
        }
        catch (error) {
            this.logger.error(`Failed to flush buffer for customer ${customerId}: ${error.message}`);
        }
    }
    async processBatchInsights(customerId, events) {
        try {
            const purchaseEvents = events.filter(e => e.eventType === 'purchase' || e.totalAmount);
            if (purchaseEvents.length >= 3) {
                this.logger.debug(`Processing batch insights for customer ${customerId} with ${purchaseEvents.length} events`);
                await this.cacheService.set(`batch_insights:${customerId}`, JSON.stringify({
                    eventCount: purchaseEvents.length,
                    processedAt: new Date().toISOString()
                }), 60 * 60 * 2);
            }
        }
        catch (error) {
            this.logger.error(`Failed to process batch insights: ${error.message}`);
        }
    }
    calculateDaysSinceLastPurchase(event) {
        return 7;
    }
    isHighValueSegmentChange(previousSegment, newSegment) {
        const highValueSegments = ['Champions', 'Loyal Customers', 'Potential Loyalists'];
        const atRiskSegments = ['At Risk', 'Cannot Lose Them', 'Hibernating'];
        return ((highValueSegments.includes(newSegment) && !highValueSegments.includes(previousSegment || '')) ||
            (atRiskSegments.includes(newSegment) && highValueSegments.includes(previousSegment || '')) ||
            (highValueSegments.includes(previousSegment || '') && atRiskSegments.includes(newSegment)));
    }
    getSegmentChangePriority(previousSegment, newSegment) {
        if (this.isHighValueSegmentChange(previousSegment, newSegment)) {
            if (previousSegment && ['Champions', 'Loyal Customers'].includes(previousSegment) &&
                ['At Risk', 'Cannot Lose Them'].includes(newSegment)) {
                return 'critical';
            }
            return 'high';
        }
        return 'medium';
    }
};
exports.RealtimeAnalyticsService = RealtimeAnalyticsService;
exports.RealtimeAnalyticsService = RealtimeAnalyticsService = RealtimeAnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [customer_segmentation_service_1.CustomerSegmentationService,
        enhanced_bedrock_service_1.EnhancedBedrockService,
        cache_service_1.CacheService,
        websocket_service_1.WebSocketService])
], RealtimeAnalyticsService);
//# sourceMappingURL=realtime-analytics.service.js.map