export interface BatchJob {
  jobId: string;
  customerId: string;
  analysisTypes: Array<'consumption_prediction' | 'customer_profiling' | 'recommendation_generation'>;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'normal' | 'high';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  results?: { [analysisType: string]: any };
  error?: string;
  progress: number;
  estimatedCost: number;
}

export interface BatchRequest {
  customers: Array<{
    customerId: string;
    purchases: any[];
    priority?: 'low' | 'normal' | 'high';
  }>;
  analysisTypes: Array<'consumption_prediction' | 'customer_profiling' | 'recommendation_generation'>;
  options?: {
    maxConcurrent?: number;
    batchSize?: number;
    delayBetweenBatches?: number;
  };
}

export interface BatchStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  queuedJobs: number;
  processingJobs: number;
  averageProcessingTime: number;
  totalCost: number;
  successRate: number;
}

export interface BatchStatusResponse {
  batchId: string;
  stats: BatchStats;
  jobs: BatchJob[];
}

export interface QueueStats {
  approximateNumberOfMessages: number;
  approximateNumberOfMessagesNotVisible: number;
  approximateAgeOfOldestMessage: number;
}