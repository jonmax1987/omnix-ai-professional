// Batch Processing Service
// Implementation of API-008: Batch processing service
import httpService from './httpClient';
import { ApiError } from './httpClient';

/**
 * Batch Processing Service
 * Comprehensive service for handling large-scale customer analysis and bulk operations
 * Following the FRONTEND_INTEGRATION_GUIDE.md specification
 */
class BatchProcessingService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes for batch data
    this.pollingIntervals = new Map();
    this.jobStatusCallbacks = new Map();
  }

  /**
   * Submit batch customer analysis
   * @param {Object} batchRequest - Batch analysis request
   * @param {Array} batchRequest.customerIds - Array of customer IDs to analyze
   * @param {Array} batchRequest.analysisTypes - Types of analysis to perform
   * @param {Object} batchRequest.options - Additional options
   * @returns {Promise<Object>} Batch job response
   */
  async submitBatchAnalysis(batchRequest) {
    const {
      customerIds = [],
      analysisTypes = ['consumption_prediction', 'customer_profiling', 'segmentation'],
      options = {},
      priority = 'normal',
      estimateOnly = false
    } = batchRequest;

    // Validate request
    this.validateBatchRequest({ customerIds, analysisTypes });

    try {
      const response = await httpService.post('/v1/customers/batch-analysis', {
        customerIds,
        analysisTypes,
        options: {
          includePredictions: true,
          includeRecommendations: true,
          includeSegmentation: true,
          analysisDepth: 'comprehensive',
          ...options
        },
        priority,
        estimateOnly,
        requestId: this.generateRequestId(),
        submittedAt: new Date().toISOString()
      });

      // Enhanced response with additional tracking
      const enhancedResponse = {
        ...response,
        trackingInfo: {
          submittedAt: Date.now(),
          estimatedCompletion: this.estimateCompletionTime(response),
          progressStages: this.getProgressStages(analysisTypes),
          pollingInterval: this.getPollingInterval(response.jobCount)
        },
        summary: {
          totalCustomers: customerIds.length,
          totalJobs: response.jobCount,
          estimatedDuration: this.formatDuration(response.estimatedDurationMs),
          estimatedCost: response.estimatedCost
        }
      };

      // Start polling for status updates if not estimate only
      if (!estimateOnly) {
        this.startStatusPolling(response.batchId, enhancedResponse.trackingInfo.pollingInterval);
      }

      return enhancedResponse;
    } catch (error) {
      throw this.handleBatchProcessingError('Batch analysis submission failed', error);
    }
  }

  /**
   * Get batch analysis status
   * @param {string} batchId - Batch ID
   * @param {boolean} includeDetails - Whether to include detailed progress
   * @returns {Promise<Object>} Batch status response
   */
  async getBatchStatus(batchId, includeDetails = true) {
    if (!batchId) {
      throw new ApiError('Batch ID is required', 400, 'INVALID_BATCH_ID');
    }

    try {
      const response = await httpService.get(`/v1/customers/batch-analysis/${batchId}`, {
        includeDetails,
        includeMetrics: true,
        includeResults: response => response.status === 'completed'
      });

      // Enhance status with calculated metrics
      const enhancedStatus = {
        ...response,
        progress: {
          ...response.progress,
          percentage: this.calculateProgressPercentage(response.progress),
          remainingTime: this.estimateRemainingTime(response),
          throughput: this.calculateThroughput(response.progress),
          eta: this.calculateETA(response)
        },
        insights: this.generateBatchInsights(response),
        nextCheck: this.getNextCheckTime(response.status)
      };

      // Update cache with latest status
      this.setCachedData(`batch_status_${batchId}`, enhancedStatus);

      return enhancedStatus;
    } catch (error) {
      throw this.handleBatchProcessingError('Batch status fetch failed', error);
    }
  }

  /**
   * Get queue statistics
   * @param {Object} params - Query parameters
   * @param {boolean} params.includeHistory - Include historical queue data
   * @param {string} params.timeRange - Time range for statistics
   * @returns {Promise<Object>} Queue statistics
   */
  async getQueueStatistics(params = {}) {
    const {
      includeHistory = true,
      timeRange = '24h',
      includeMetrics = true,
      includeTrends = true
    } = params;

    const cacheKey = `queue_stats_${timeRange}`;
    
    if (this.getCachedData(cacheKey)) {
      return this.getCachedData(cacheKey);
    }

    try {
      const response = await httpService.get('/v1/customers/batch-analysis/queue/stats', {
        includeHistory,
        timeRange,
        includeMetrics,
        includeTrends
      });

      const enhancedStats = {
        ...response,
        insights: this.generateQueueInsights(response),
        recommendations: this.generateQueueRecommendations(response),
        predictions: {
          expectedWaitTime: this.predictWaitTime(response),
          optimalSubmissionTime: this.getOptimalSubmissionTime(response),
          capacityUtilization: this.calculateCapacityUtilization(response)
        },
        lastUpdated: Date.now()
      };

      this.setCachedData(cacheKey, enhancedStats);
      return enhancedStats;
    } catch (error) {
      throw this.handleBatchProcessingError('Queue statistics fetch failed', error);
    }
  }

  /**
   * Cancel batch job
   * @param {string} batchId - Batch ID to cancel
   * @param {string} reason - Reason for cancellation
   * @returns {Promise<Object>} Cancellation response
   */
  async cancelBatchJob(batchId, reason = 'User requested') {
    if (!batchId) {
      throw new ApiError('Batch ID is required', 400, 'INVALID_BATCH_ID');
    }

    try {
      const response = await httpService.delete(`/v1/customers/batch-analysis/${batchId}`, {
        data: { reason, cancelledAt: new Date().toISOString() }
      });

      // Stop polling for this batch
      this.stopStatusPolling(batchId);

      // Clear cache
      this.clearCache(batchId);

      return {
        ...response,
        summary: {
          batchId,
          cancelledAt: Date.now(),
          reason,
          refundAmount: response.refundAmount || 0
        }
      };
    } catch (error) {
      throw this.handleBatchProcessingError('Batch job cancellation failed', error);
    }
  }

  /**
   * Get batch results
   * @param {string} batchId - Batch ID
   * @param {Object} params - Result parameters
   * @returns {Promise<Object>} Batch results
   */
  async getBatchResults(batchId, params = {}) {
    const {
      format = 'json',
      includeRawData = false,
      includeMetadata = true,
      pageSize = 100,
      page = 1,
      filters = {}
    } = params;

    if (!batchId) {
      throw new ApiError('Batch ID is required', 400, 'INVALID_BATCH_ID');
    }

    try {
      const response = await httpService.get(`/v1/customers/batch-analysis/${batchId}/results`, {
        format,
        includeRawData,
        includeMetadata,
        pageSize,
        page,
        filters
      });

      const enhancedResults = {
        ...response,
        analytics: {
          totalResults: response.results?.length || 0,
          successRate: this.calculateSuccessRate(response.results),
          averageConfidence: this.calculateAverageConfidence(response.results),
          processingTime: response.metadata?.processingTimeMs,
          costBreakdown: response.metadata?.costBreakdown
        },
        insights: this.generateResultsInsights(response),
        export: {
          formats: ['json', 'csv', 'xlsx'],
          downloadUrl: response.downloadUrl,
          expiresAt: response.expiresAt
        }
      };

      return enhancedResults;
    } catch (error) {
      throw this.handleBatchProcessingError('Batch results fetch failed', error);
    }
  }

  /**
   * Export batch results
   * @param {string} batchId - Batch ID
   * @param {Object} exportOptions - Export options
   * @returns {Promise<Object>} Export response
   */
  async exportBatchResults(batchId, exportOptions = {}) {
    const {
      format = 'csv',
      includeMetadata = true,
      includeAnalytics = true,
      filename = null,
      compressionLevel = 'medium'
    } = exportOptions;

    try {
      const response = await httpService.post(`/v1/customers/batch-analysis/${batchId}/export`, {
        format,
        includeMetadata,
        includeAnalytics,
        filename: filename || `batch_results_${batchId}_${Date.now()}.${format}`,
        compressionLevel,
        requestedAt: new Date().toISOString()
      });

      return {
        ...response,
        tracking: {
          exportId: response.exportId,
          estimatedSize: response.estimatedSize,
          estimatedCompletion: response.estimatedCompletion,
          downloadUrl: response.downloadUrl,
          expiresAt: response.expiresAt
        }
      };
    } catch (error) {
      throw this.handleBatchProcessingError('Batch export failed', error);
    }
  }

  /**
   * Get batch history for current user/organization
   * @param {Object} params - History parameters
   * @returns {Promise<Object>} Batch history
   */
  async getBatchHistory(params = {}) {
    const {
      limit = 20,
      offset = 0,
      status = null,
      timeRange = '30d',
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = params;

    try {
      const response = await httpService.get('/v1/customers/batch-analysis/history', {
        limit,
        offset,
        status,
        timeRange,
        sortBy,
        sortOrder,
        includeMetrics: true
      });

      return {
        ...response,
        summary: {
          total: response.total,
          completed: response.batches?.filter(b => b.status === 'completed').length || 0,
          failed: response.batches?.filter(b => b.status === 'failed').length || 0,
          inProgress: response.batches?.filter(b => ['running', 'queued'].includes(b.status)).length || 0
        },
        insights: this.generateHistoryInsights(response)
      };
    } catch (error) {
      throw this.handleBatchProcessingError('Batch history fetch failed', error);
    }
  }

  /**
   * Create template for repeated batch operations
   * @param {Object} template - Batch template
   * @returns {Promise<Object>} Template creation response
   */
  async createBatchTemplate(template) {
    const {
      name,
      description,
      analysisTypes,
      options = {},
      defaultPriority = 'normal',
      tags = []
    } = template;

    try {
      const response = await httpService.post('/v1/customers/batch-analysis/templates', {
        name,
        description,
        analysisTypes,
        options,
        defaultPriority,
        tags,
        createdAt: new Date().toISOString()
      });

      return response;
    } catch (error) {
      throw this.handleBatchProcessingError('Batch template creation failed', error);
    }
  }

  /**
   * Submit batch using template
   * @param {string} templateId - Template ID
   * @param {Array} customerIds - Customer IDs to analyze
   * @param {Object} overrides - Template overrides
   * @returns {Promise<Object>} Batch submission response
   */
  async submitBatchFromTemplate(templateId, customerIds, overrides = {}) {
    try {
      const response = await httpService.post(`/v1/customers/batch-analysis/templates/${templateId}/submit`, {
        customerIds,
        overrides,
        requestId: this.generateRequestId(),
        submittedAt: new Date().toISOString()
      });

      // Start status polling
      this.startStatusPolling(response.batchId, this.getPollingInterval(response.jobCount));

      return response;
    } catch (error) {
      throw this.handleBatchProcessingError('Template batch submission failed', error);
    }
  }

  // Status monitoring and polling methods

  /**
   * Start polling for batch status updates
   * @param {string} batchId - Batch ID to monitor
   * @param {number} intervalMs - Polling interval in milliseconds
   */
  startStatusPolling(batchId, intervalMs = 30000) {
    // Clear any existing polling for this batch
    this.stopStatusPolling(batchId);

    const poll = async () => {
      try {
        const status = await this.getBatchStatus(batchId, false);
        
        // Trigger callbacks if any
        const callbacks = this.jobStatusCallbacks.get(batchId) || [];
        callbacks.forEach(callback => {
          try {
            callback(status);
          } catch (error) {
            console.error('Status callback error:', error);
          }
        });

        // Stop polling if job is completed or failed
        if (['completed', 'failed', 'cancelled'].includes(status.status)) {
          this.stopStatusPolling(batchId);
        }
      } catch (error) {
        console.error(`Batch status polling error for ${batchId}:`, error);
        // Continue polling unless it's a permanent error
        if (error.status === 404) {
          this.stopStatusPolling(batchId);
        }
      }
    };

    const intervalId = setInterval(poll, intervalMs);
    this.pollingIntervals.set(batchId, intervalId);

    // Initial poll
    poll();
  }

  /**
   * Stop polling for batch status updates
   * @param {string} batchId - Batch ID
   */
  stopStatusPolling(batchId) {
    const intervalId = this.pollingIntervals.get(batchId);
    if (intervalId) {
      clearInterval(intervalId);
      this.pollingIntervals.delete(batchId);
    }
  }

  /**
   * Add callback for batch status updates
   * @param {string} batchId - Batch ID
   * @param {Function} callback - Callback function
   */
  onStatusUpdate(batchId, callback) {
    if (!this.jobStatusCallbacks.has(batchId)) {
      this.jobStatusCallbacks.set(batchId, []);
    }
    this.jobStatusCallbacks.get(batchId).push(callback);
  }

  /**
   * Remove status update callback
   * @param {string} batchId - Batch ID
   * @param {Function} callback - Callback function to remove
   */
  removeStatusCallback(batchId, callback) {
    const callbacks = this.jobStatusCallbacks.get(batchId);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        this.jobStatusCallbacks.delete(batchId);
      }
    }
  }

  // Utility and helper methods

  /**
   * Validate batch request
   * @param {Object} request - Batch request to validate
   */
  validateBatchRequest(request) {
    const { customerIds, analysisTypes } = request;

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      throw new ApiError('Customer IDs array is required and must not be empty', 400, 'INVALID_CUSTOMER_IDS');
    }

    if (customerIds.length > 10000) {
      throw new ApiError('Maximum 10,000 customers per batch', 400, 'BATCH_SIZE_LIMIT');
    }

    if (!analysisTypes || !Array.isArray(analysisTypes) || analysisTypes.length === 0) {
      throw new ApiError('Analysis types array is required and must not be empty', 400, 'INVALID_ANALYSIS_TYPES');
    }

    const validAnalysisTypes = [
      'consumption_prediction',
      'customer_profiling',
      'segmentation',
      'churn_prediction',
      'recommendation_generation'
    ];

    const invalidTypes = analysisTypes.filter(type => !validAnalysisTypes.includes(type));
    if (invalidTypes.length > 0) {
      throw new ApiError(
        `Invalid analysis types: ${invalidTypes.join(', ')}`,
        400,
        'INVALID_ANALYSIS_TYPES',
        { validTypes: validAnalysisTypes }
      );
    }
  }

  /**
   * Generate unique request ID
   * @returns {string} Unique request ID
   */
  generateRequestId() {
    return `batch_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Estimate completion time
   * @param {Object} response - Batch submission response
   * @returns {number} Estimated completion timestamp
   */
  estimateCompletionTime(response) {
    const estimatedMs = response.estimatedDurationMs || 300000; // Default 5 minutes
    return Date.now() + estimatedMs;
  }

  /**
   * Get progress stages
   * @param {Array} analysisTypes - Types of analysis
   * @returns {Array} Progress stages
   */
  getProgressStages(analysisTypes) {
    const baseStages = ['queued', 'initializing', 'processing', 'finalizing', 'completed'];
    const analysisStages = analysisTypes.map(type => `processing_${type}`);
    
    return [
      'queued',
      'initializing',
      ...analysisStages,
      'aggregating',
      'finalizing',
      'completed'
    ];
  }

  /**
   * Get polling interval based on job count
   * @param {number} jobCount - Number of jobs in batch
   * @returns {number} Polling interval in milliseconds
   */
  getPollingInterval(jobCount) {
    if (jobCount < 100) return 15000; // 15 seconds
    if (jobCount < 1000) return 30000; // 30 seconds
    if (jobCount < 5000) return 60000; // 1 minute
    return 120000; // 2 minutes
  }

  /**
   * Format duration in human-readable format
   * @param {number} durationMs - Duration in milliseconds
   * @returns {string} Formatted duration
   */
  formatDuration(durationMs) {
    if (!durationMs) return 'Unknown';
    
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Calculate progress percentage
   * @param {Object} progress - Progress object
   * @returns {number} Progress percentage
   */
  calculateProgressPercentage(progress) {
    if (!progress) return 0;
    
    const { completed = 0, total = 0, failed = 0 } = progress;
    if (total === 0) return 0;
    
    return Math.round(((completed + failed) / total) * 100);
  }

  /**
   * Handle batch processing specific errors
   * @param {string} message - Error message
   * @param {Error} originalError - Original error
   * @returns {ApiError} Formatted error
   */
  handleBatchProcessingError(message, originalError) {
    if (originalError instanceof ApiError) {
      return new ApiError(
        `${message}: ${originalError.message}`,
        originalError.status,
        originalError.code,
        originalError.data
      );
    }
    
    return new ApiError(
      message,
      500,
      'BATCH_PROCESSING_ERROR',
      { originalError: originalError.message }
    );
  }

  /**
   * Cache management methods
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
    
    // Clean old cache entries
    if (this.cache.size > 100) {
      const oldEntries = Array.from(this.cache.entries())
        .filter(([_, value]) => Date.now() - value.timestamp > this.cacheTimeout);
      oldEntries.forEach(([key]) => this.cache.delete(key));
    }
  }

  clearCache(pattern = null) {
    if (pattern) {
      const keys = Array.from(this.cache.keys()).filter(key => key.includes(pattern));
      keys.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  /**
   * Cleanup method to stop all polling and clear resources
   */
  cleanup() {
    // Stop all polling
    this.pollingIntervals.forEach(intervalId => clearInterval(intervalId));
    this.pollingIntervals.clear();
    
    // Clear callbacks
    this.jobStatusCallbacks.clear();
    
    // Clear cache
    this.cache.clear();
  }

  // Placeholder methods for comprehensive functionality
  estimateRemainingTime(response) { return 'Unknown'; }
  calculateThroughput(progress) { return 0; }
  calculateETA(response) { return null; }
  generateBatchInsights(response) { return []; }
  getNextCheckTime(status) { return Date.now() + 30000; }
  generateQueueInsights(response) { return []; }
  generateQueueRecommendations(response) { return []; }
  predictWaitTime(response) { return 'Unknown'; }
  getOptimalSubmissionTime(response) { return new Date().toISOString(); }
  calculateCapacityUtilization(response) { return 0; }
  calculateSuccessRate(results) { return 100; }
  calculateAverageConfidence(results) { return 0.85; }
  generateResultsInsights(response) { return []; }
  generateHistoryInsights(response) { return []; }
}

// Export singleton instance
const batchProcessingService = new BatchProcessingService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    batchProcessingService.cleanup();
  });
}

export default batchProcessingService;
export { BatchProcessingService };