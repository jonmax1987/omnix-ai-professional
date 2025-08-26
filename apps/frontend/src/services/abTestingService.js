// A/B Testing Service for OMNIX AI
// Implementation of API-006: A/B testing service integration
import httpService, { ApiError } from './httpClient';

/**
 * @typedef {Object} ABTestConfig
 * @property {string} testId - Unique test identifier
 * @property {string} testName - Human readable test name
 * @property {string} modelA - First model configuration
 * @property {string} modelB - Second model configuration  
 * @property {number} trafficSplit - Traffic percentage for model A (0-100)
 * @property {string} analysisType - Type of analysis being tested
 * @property {string} status - Test status (pending, running, completed, paused)
 * @property {Date} startDate - Test start date
 * @property {Date} endDate - Test end date
 * @property {number} durationDays - Test duration in days
 */

/**
 * @typedef {Object} ABTestResult
 * @property {string} testId - Test identifier
 * @property {string} testName - Test name
 * @property {string} status - Current status
 * @property {Object} modelAResults - Results for model A
 * @property {Object} modelBResults - Results for model B
 * @property {number} sampleSize - Number of participants
 * @property {number} confidence - Statistical confidence level
 * @property {number} significance - Statistical significance
 * @property {string} winner - Winning model (A, B, or null)
 * @property {Object} metrics - Performance metrics
 */

/**
 * @typedef {Object} AvailableModel
 * @property {string} id - Model identifier
 * @property {string} name - Model display name
 * @property {string} type - Model type (haiku, sonnet, etc.)
 * @property {string} description - Model description
 * @property {Object} capabilities - Model capabilities
 */

/**
 * @typedef {Object} CreateABTestDto
 * @property {string} testName - Name of the test
 * @property {string} analysisType - Type of analysis to test
 * @property {string} modelA - Configuration for model A
 * @property {string} modelB - Configuration for model B
 * @property {number} trafficSplit - Traffic split percentage (0-100)
 * @property {number} durationDays - Test duration in days
 * @property {Object} targetingCriteria - Test targeting criteria
 * @property {string[]} metrics - Metrics to track
 */

/**
 * Enhanced A/B Testing Service
 * Features:
 * - Test creation and management
 * - Real-time test monitoring
 * - Statistical analysis and reporting
 * - Model performance comparison
 * - Quick test templates for common scenarios
 */
export class ABTestingService {
  constructor() {
    this.baseEndpoint = '/ab-tests';
    this.cache = new Map();
    this.cacheTimeout = 60000; // 1 minute cache
  }

  /**
   * Create a new A/B test
   * @param {CreateABTestDto} testConfig - Test configuration
   * @returns {Promise<{success: boolean, testId: string, message: string}>}
   */
  async createTest(testConfig) {
    try {
      const response = await httpService.post(this.baseEndpoint, testConfig);
      
      // Clear cache to ensure fresh data
      this.clearCache();
      
      return {
        success: true,
        testId: response.testId,
        message: response.message || 'A/B test created successfully',
        data: response
      };
    } catch (error) {
      throw new ApiError(
        `Failed to create A/B test: ${error.message}`,
        error.status || 500,
        'AB_TEST_CREATE_FAILED',
        error.data
      );
    }
  }

  /**
   * Create a quick test using predefined templates
   * @param {Object} quickTestConfig - Quick test configuration
   * @returns {Promise<{success: boolean, testId: string, config: CreateABTestDto}>}
   */
  async createQuickTest(quickTestConfig) {
    const {
      testName,
      analysisType,
      durationDays = 7,
      trafficSplit = 50
    } = quickTestConfig;

    try {
      const response = await httpService.post(`${this.baseEndpoint}/quick-test`, {
        testName,
        analysisType,
        durationDays,
        trafficSplit
      });
      
      // Clear cache
      this.clearCache();
      
      return {
        success: true,
        testId: response.testId,
        config: response.config,
        message: 'Quick A/B test created successfully'
      };
    } catch (error) {
      throw new ApiError(
        `Failed to create quick A/B test: ${error.message}`,
        error.status || 500,
        'QUICK_TEST_CREATE_FAILED',
        error.data
      );
    }
  }

  /**
   * Get all A/B tests with optional filtering
   * @param {Object} params - Query parameters
   * @returns {Promise<{success: boolean, data: ABTestConfig[], totalTests: number, activeTests: number}>}
   */
  async listAllTests(params = {}) {
    const cacheKey = `tests_${JSON.stringify(params)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await httpService.get(this.baseEndpoint, params);
      
      const result = {
        success: true,
        data: response.data || [],
        totalTests: response.totalTests || 0,
        activeTests: response.activeTests || 0,
        pagination: response.pagination
      };
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      throw new ApiError(
        `Failed to fetch A/B tests: ${error.message}`,
        error.status || 500,
        'AB_TESTS_FETCH_FAILED',
        error.data
      );
    }
  }

  /**
   * Get specific A/B test configuration
   * @param {string} testId - Test identifier
   * @returns {Promise<ABTestConfig>}
   */
  async getTest(testId) {
    if (!testId) {
      throw new ApiError('Test ID is required', 400, 'INVALID_TEST_ID');
    }

    const cacheKey = `test_${testId}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await httpService.get(`${this.baseEndpoint}/${testId}`);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });
      
      return response;
    } catch (error) {
      throw new ApiError(
        `Failed to fetch A/B test ${testId}: ${error.message}`,
        error.status || 500,
        'AB_TEST_FETCH_FAILED',
        error.data
      );
    }
  }

  /**
   * Get A/B test results with statistical analysis
   * @param {string} testId - Test identifier
   * @param {Object} options - Options for results
   * @returns {Promise<{success: boolean, data: ABTestResult, summary: Object}>}
   */
  async getTestResults(testId, options = {}) {
    if (!testId) {
      throw new ApiError('Test ID is required', 400, 'INVALID_TEST_ID');
    }

    const { includeRawData = false } = options;
    const cacheKey = `results_${testId}_${includeRawData}`;
    
    // Check cache first (shorter cache for results)
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 30000) { // 30 second cache for results
        return cached.data;
      }
    }

    try {
      const response = await httpService.get(
        `${this.baseEndpoint}/${testId}/results`,
        { includeRawData }
      );
      
      const result = {
        success: true,
        data: response.data,
        summary: response.summary,
        timestamp: Date.now()
      };
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      throw new ApiError(
        `Failed to fetch A/B test results for ${testId}: ${error.message}`,
        error.status || 500,
        'AB_TEST_RESULTS_FAILED',
        error.data
      );
    }
  }

  /**
   * Get A/B test status
   * @param {string} testId - Test identifier
   * @returns {Promise<{testId: string, testName: string, status: string, progress: number}>}
   */
  async getTestStatus(testId) {
    if (!testId) {
      throw new ApiError('Test ID is required', 400, 'INVALID_TEST_ID');
    }

    try {
      const response = await httpService.get(`${this.baseEndpoint}/${testId}/status`);
      return {
        testId: response.testId,
        testName: response.testName,
        status: response.status,
        progress: response.progress || 0,
        startDate: response.startDate,
        endDate: response.endDate,
        participantCount: response.participantCount || 0
      };
    } catch (error) {
      throw new ApiError(
        `Failed to fetch A/B test status for ${testId}: ${error.message}`,
        error.status || 500,
        'AB_TEST_STATUS_FAILED',
        error.data
      );
    }
  }

  /**
   * Start/activate an A/B test
   * @param {string} testId - Test identifier
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async activateTest(testId) {
    if (!testId) {
      throw new ApiError('Test ID is required', 400, 'INVALID_TEST_ID');
    }

    try {
      const response = await httpService.put(`${this.baseEndpoint}/${testId}/activate`);
      
      // Clear cache
      this.clearCache();
      
      return {
        success: true,
        message: response.message || 'A/B test activated successfully'
      };
    } catch (error) {
      throw new ApiError(
        `Failed to activate A/B test ${testId}: ${error.message}`,
        error.status || 500,
        'AB_TEST_ACTIVATE_FAILED',
        error.data
      );
    }
  }

  /**
   * Pause/deactivate an A/B test
   * @param {string} testId - Test identifier
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async deactivateTest(testId) {
    if (!testId) {
      throw new ApiError('Test ID is required', 400, 'INVALID_TEST_ID');
    }

    try {
      const response = await httpService.put(`${this.baseEndpoint}/${testId}/deactivate`);
      
      // Clear cache
      this.clearCache();
      
      return {
        success: true,
        message: response.message || 'A/B test deactivated successfully'
      };
    } catch (error) {
      throw new ApiError(
        `Failed to deactivate A/B test ${testId}: ${error.message}`,
        error.status || 500,
        'AB_TEST_DEACTIVATE_FAILED',
        error.data
      );
    }
  }

  /**
   * Delete an A/B test
   * @param {string} testId - Test identifier
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async deleteTest(testId) {
    if (!testId) {
      throw new ApiError('Test ID is required', 400, 'INVALID_TEST_ID');
    }

    try {
      const response = await httpService.delete(`${this.baseEndpoint}/${testId}`);
      
      // Clear cache
      this.clearCache();
      
      return {
        success: true,
        message: response.message || 'A/B test deleted successfully'
      };
    } catch (error) {
      throw new ApiError(
        `Failed to delete A/B test ${testId}: ${error.message}`,
        error.status || 500,
        'AB_TEST_DELETE_FAILED',
        error.data
      );
    }
  }

  /**
   * Get available models for A/B testing
   * @returns {Promise<{success: boolean, data: AvailableModel[]}>}
   */
  async getAvailableModels() {
    const cacheKey = 'available_models';
    
    // Check cache first (longer cache for models)
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) { // 5 minute cache for models
        return cached.data;
      }
    }

    try {
      const response = await httpService.get(`${this.baseEndpoint}/models/available`);
      
      const result = {
        success: true,
        data: response.data || []
      };
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      throw new ApiError(
        `Failed to fetch available models: ${error.message}`,
        error.status || 500,
        'MODELS_FETCH_FAILED',
        error.data
      );
    }
  }

  /**
   * Get A/B test analytics and insights
   * @param {string} testId - Test identifier
   * @returns {Promise<Object>}
   */
  async getTestAnalytics(testId) {
    if (!testId) {
      throw new ApiError('Test ID is required', 400, 'INVALID_TEST_ID');
    }

    try {
      const response = await httpService.get(`${this.baseEndpoint}/${testId}/analytics`);
      return {
        success: true,
        data: response.data,
        insights: response.insights,
        recommendations: response.recommendations
      };
    } catch (error) {
      throw new ApiError(
        `Failed to fetch A/B test analytics for ${testId}: ${error.message}`,
        error.status || 500,
        'AB_TEST_ANALYTICS_FAILED',
        error.data
      );
    }
  }

  /**
   * Export A/B test results
   * @param {string} testId - Test identifier
   * @param {string} format - Export format (csv, json, pdf)
   * @returns {Promise<Blob>}
   */
  async exportTestResults(testId, format = 'csv') {
    if (!testId) {
      throw new ApiError('Test ID is required', 400, 'INVALID_TEST_ID');
    }

    try {
      const response = await httpService.download(
        `${this.baseEndpoint}/${testId}/export?format=${format}`,
        `ab-test-${testId}-results.${format}`
      );
      
      return response;
    } catch (error) {
      throw new ApiError(
        `Failed to export A/B test results for ${testId}: ${error.message}`,
        error.status || 500,
        'AB_TEST_EXPORT_FAILED',
        error.data
      );
    }
  }

  /**
   * Clear service cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object}
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Validate test configuration
   * @param {CreateABTestDto} testConfig - Test configuration to validate
   * @returns {Object} Validation result
   */
  validateTestConfig(testConfig) {
    const errors = [];
    const warnings = [];

    // Required fields
    if (!testConfig.testName || testConfig.testName.trim().length === 0) {
      errors.push('Test name is required');
    }

    if (!testConfig.analysisType) {
      errors.push('Analysis type is required');
    }

    if (!testConfig.modelA || !testConfig.modelB) {
      errors.push('Both model A and model B must be specified');
    }

    // Traffic split validation
    if (testConfig.trafficSplit < 10 || testConfig.trafficSplit > 90) {
      warnings.push('Traffic split should be between 10% and 90% for meaningful results');
    }

    // Duration validation
    if (testConfig.durationDays < 1) {
      errors.push('Test duration must be at least 1 day');
    } else if (testConfig.durationDays < 7) {
      warnings.push('Tests shorter than 7 days may not have enough data for statistical significance');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Export singleton instance
export const abTestingService = new ABTestingService();

// Export class for custom instances
export default ABTestingService;