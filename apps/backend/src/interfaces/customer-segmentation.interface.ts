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
    min?: number; // purchases per month
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
  purchaseFrequency: number; // purchases per month
  daysSinceLastPurchase: number;
  favoriteCategories: string[];
  lifetimeValue: number;
  churnRisk: 'low' | 'medium' | 'high';
  engagementLevel: number; // 0-100
  preferredShoppingDays: string[];
  preferredShoppingTimes: string[];
}

export interface SegmentationRequest {
  customerId?: string; // If provided, segment single customer
  customerIds?: string[]; // If provided, segment multiple customers
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
  silhouetteScore: number; // Measure of cluster quality (-1 to 1)
  daviesBouldinIndex: number; // Lower is better
  optimalClusters: number;
}

export interface Cluster {
  clusterId: number;
  centroid: number[];
  members: string[]; // customer IDs
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

export const PREDEFINED_SEGMENTS = {
  CHAMPIONS: {
    id: 'champions',
    name: 'Champions',
    description: 'Best customers who buy frequently and spend the most',
    criteria: {
      purchaseFrequency: { min: 4 },
      lifetimeValue: { min: 1000 },
      recency: { lastPurchaseDaysAgo: 30 }
    }
  },
  LOYAL_CUSTOMERS: {
    id: 'loyal',
    name: 'Loyal Customers',
    description: 'Regular customers with good spending habits',
    criteria: {
      purchaseFrequency: { min: 2, max: 4 },
      lifetimeValue: { min: 500, max: 1000 }
    }
  },
  POTENTIAL_LOYALISTS: {
    id: 'potential-loyalists',
    name: 'Potential Loyalists',
    description: 'Recent customers with potential for growth',
    criteria: {
      purchaseFrequency: { min: 1, max: 2 },
      recency: { lastPurchaseDaysAgo: 60 }
    }
  },
  NEW_CUSTOMERS: {
    id: 'new',
    name: 'New Customers',
    description: 'Recently acquired customers',
    criteria: {
      purchaseFrequency: { max: 1 },
      recency: { lastPurchaseDaysAgo: 30 }
    }
  },
  AT_RISK: {
    id: 'at-risk',
    name: 'At Risk',
    description: 'Previously good customers who haven\'t purchased recently',
    criteria: {
      lifetimeValue: { min: 300 },
      recency: { lastPurchaseDaysAgo: 90 }
    }
  },
  CANT_LOSE_THEM: {
    id: 'cant-lose',
    name: 'Can\'t Lose Them',
    description: 'High-value customers at risk of churning',
    criteria: {
      lifetimeValue: { min: 800 },
      recency: { lastPurchaseDaysAgo: 120 }
    }
  },
  HIBERNATING: {
    id: 'hibernating',
    name: 'Hibernating',
    description: 'Low engagement customers who haven\'t purchased in a while',
    criteria: {
      recency: { lastPurchaseDaysAgo: 180 }
    }
  },
  LOST: {
    id: 'lost',
    name: 'Lost',
    description: 'Customers who haven\'t engaged in a very long time',
    criteria: {
      recency: { lastPurchaseDaysAgo: 365 }
    }
  }
};