export interface PurchaseEvent {
  customerId: string;
  productId: string;
  productCategory: string;
  productName: string;
  quantity: number;
  price: number;
  totalAmount: number;
  timestamp: string;
  location?: string;
  paymentMethod?: string;
  deviceType?: 'web' | 'mobile' | 'pos';
  metadata?: Record<string, any>;
}

export interface CustomerSegmentUpdateEvent {
  customerId: string;
  previousSegment: string | null;
  newSegment: string;
  segmentationScore: number;
  reasonCodes: string[];
  timestamp: string;
  confidence: number;
  modelVersion: string;
}

export interface ConsumptionPredictionEvent {
  customerId: string;
  productId: string;
  predictedConsumptionDate: string;
  confidence: number;
  predictionType: 'pattern-based' | 'ai-enhanced' | 'seasonal';
  factors: string[];
  timestamp: string;
  alertTriggered: boolean;
}

export interface StreamingAnalyticsConfig {
  kinesisStreamName: string;
  region: string;
  shardCount: number;
  retentionPeriodHours: number;
  enableCompression: boolean;
  batchSize: number;
  maxLatency: number;
}

export interface RealtimeInsight {
  customerId: string;
  insightType: 'segment_migration' | 'consumption_prediction' | 'behavior_anomaly' | 'recommendation_update';
  insight: string;
  actionRequired: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  data: Record<string, any>;
}

export interface StreamProcessingResult {
  processedEvents: number;
  errors: number;
  insights: RealtimeInsight[];
  processingTimeMs: number;
  timestamp: string;
}

export interface KinesisStreamMetrics {
  incomingRecords: number;
  outgoingRecords: number;
  iteratorAgeMs: number;
  writeProvisionedThroughputExceeded: number;
  readProvisionedThroughputExceeded: number;
  successfulRecordCount: number;
  failedRecordCount: number;
}