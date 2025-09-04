export interface CustomerSegment {
    segmentId: string;
    segmentName: string;
    description: string;
    criteria: SegmentCriteria;
    customerCount: number;
    averageOrderValue: number;
    averagePurchaseFrequency: number;
    characteristics: SegmentCharacteristics;
    recommendations: SegmentRecommendationStrategy;
    createdAt: string;
    updatedAt: string;
}
export interface SegmentCriteria {
    spendingRange?: {
        min: number;
        max: number;
    };
    purchaseFrequency?: {
        min?: number;
        max?: number;
    };
    categories?: string[];
    recency?: {
        lastPurchaseDaysAgo: number;
    };
    behavioralTraits?: string[];
    lifetimeValue?: {
        min?: number;
        max?: number;
    };
}
export interface SegmentCharacteristics {
    primaryCategories: string[];
    brandAffinity: 'low' | 'medium' | 'high';
    pricePreference: 'budget' | 'mid-range' | 'premium' | 'luxury';
    shoppingPattern: 'frequent' | 'regular' | 'occasional' | 'rare';
    loyaltyLevel: 'new' | 'returning' | 'loyal' | 'champion';
    seasonalTrends: boolean;
    bulkBuyingTendency: boolean;
    promotionSensitivity: 'low' | 'medium' | 'high';
}
export interface SegmentRecommendationStrategy {
    priority: 'retention' | 'upsell' | 'cross-sell' | 'acquisition' | 'reactivation';
    recommendationType: 'personalized' | 'trending' | 'complementary' | 'replenishment' | 'discovery';
    communicationFrequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
    preferredChannels: ('email' | 'push' | 'sms' | 'in-app')[];
    incentiveType: 'discount' | 'loyalty-points' | 'free-shipping' | 'bundle' | 'none';
    contentTone: 'promotional' | 'informative' | 'personalized' | 'urgent';
}
export interface CustomerSegmentAssignment {
    customerId: string;
    segmentId: string;
    segmentName: string;
    assignedAt: string;
    confidence: number;
    previousSegmentId?: string;
    migrationReason?: string;
    features: CustomerFeatures;
}
export interface CustomerFeatures {
    totalPurchases: number;
    totalSpent: number;
    averageOrderValue: number;
    purchaseFrequency: number;
    daysSinceLastPurchase: number;
    favoriteCategories: string[];
    lifetimeValue: number;
    churnRisk: 'low' | 'medium' | 'high';
    engagementLevel: number;
    preferredShoppingDays: string[];
    preferredShoppingTimes: string[];
}
export interface SegmentationRequest {
    customerId?: string;
    customerIds?: string[];
    analysisDepth: 'basic' | 'detailed' | 'comprehensive';
    includeRecommendations: boolean;
    forceRecalculation?: boolean;
}
export interface SegmentationResponse {
    success: boolean;
    segments?: CustomerSegment[];
    assignments?: CustomerSegmentAssignment[];
    statistics?: SegmentationStatistics;
    processingTime: number;
    error?: string;
}
export interface SegmentationStatistics {
    totalCustomers: number;
    segmentDistribution: {
        segmentId: string;
        segmentName: string;
        count: number;
        percentage: number;
    }[];
    averageConfidence: number;
    migrationCount: number;
    lastUpdated: string;
}
export interface ClusteringResult {
    clusters: Cluster[];
    silhouetteScore: number;
    daviesBouldinIndex: number;
    optimalClusters: number;
}
export interface Cluster {
    clusterId: number;
    centroid: number[];
    members: string[];
    size: number;
    variance: number;
    cohesion: number;
}
export interface SegmentMigration {
    customerId: string;
    fromSegment: string;
    toSegment: string;
    migrationDate: string;
    reason: string;
    impactScore: number;
}
export interface SegmentPerformanceMetrics {
    segmentId: string;
    conversionRate: number;
    averageRevenue: number;
    customerRetention: number;
    growthRate: number;
    churnRate: number;
    engagementScore: number;
    recommendationAcceptance: number;
}
export declare const PREDEFINED_SEGMENTS: {
    CHAMPIONS: {
        id: string;
        name: string;
        description: string;
        criteria: {
            purchaseFrequency: {
                min: number;
            };
            lifetimeValue: {
                min: number;
            };
            recency: {
                lastPurchaseDaysAgo: number;
            };
        };
    };
    LOYAL_CUSTOMERS: {
        id: string;
        name: string;
        description: string;
        criteria: {
            purchaseFrequency: {
                min: number;
                max: number;
            };
            lifetimeValue: {
                min: number;
                max: number;
            };
        };
    };
    POTENTIAL_LOYALISTS: {
        id: string;
        name: string;
        description: string;
        criteria: {
            purchaseFrequency: {
                min: number;
                max: number;
            };
            recency: {
                lastPurchaseDaysAgo: number;
            };
        };
    };
    NEW_CUSTOMERS: {
        id: string;
        name: string;
        description: string;
        criteria: {
            purchaseFrequency: {
                max: number;
            };
            recency: {
                lastPurchaseDaysAgo: number;
            };
        };
    };
    AT_RISK: {
        id: string;
        name: string;
        description: string;
        criteria: {
            lifetimeValue: {
                min: number;
            };
            recency: {
                lastPurchaseDaysAgo: number;
            };
        };
    };
    CANT_LOSE_THEM: {
        id: string;
        name: string;
        description: string;
        criteria: {
            lifetimeValue: {
                min: number;
            };
            recency: {
                lastPurchaseDaysAgo: number;
            };
        };
    };
    HIBERNATING: {
        id: string;
        name: string;
        description: string;
        criteria: {
            recency: {
                lastPurchaseDaysAgo: number;
            };
        };
    };
    LOST: {
        id: string;
        name: string;
        description: string;
        criteria: {
            recency: {
                lastPurchaseDaysAgo: number;
            };
        };
    };
};
