/**
 * OMNIX AI - Web Worker Manager
 * Manages Web Workers for performance-critical operations
 * Handles worker lifecycle, message passing, and error recovery
 */

class WebWorkerManager {
  constructor() {
    this.workers = new Map();
    this.messageQueue = new Map();
    this.messageId = 0;
  }

  /**
   * Create or get an existing worker
   */
  getWorker(workerName, workerPath) {
    if (!this.workers.has(workerName)) {
      try {
        const worker = new Worker(workerPath);
        
        worker.onmessage = (e) => {
          this.handleWorkerMessage(workerName, e);
        };
        
        worker.onerror = (error) => {
          this.handleWorkerError(workerName, error);
        };

        this.workers.set(workerName, {
          worker,
          isActive: true,
          createdAt: Date.now(),
          messageCount: 0
        });
        
        console.log(`Web Worker '${workerName}' created successfully`);
      } catch (error) {
        console.error(`Failed to create worker '${workerName}':`, error);
        throw error;
      }
    }

    const workerInfo = this.workers.get(workerName);
    return workerInfo?.worker;
  }

  /**
   * Send message to worker with promise-based response
   */
  async sendMessage(workerName, type, data, timeout = 10000) {
    const worker = this.workers.get(workerName)?.worker;
    
    if (!worker) {
      throw new Error(`Worker '${workerName}' not found`);
    }

    const messageId = ++this.messageId;
    const message = {
      type,
      data,
      id: messageId
    };

    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeoutId = setTimeout(() => {
        this.messageQueue.delete(messageId);
        reject(new Error(`Worker message timeout after ${timeout}ms`));
      }, timeout);

      // Store promise resolvers
      this.messageQueue.set(messageId, {
        resolve: (result) => {
          clearTimeout(timeoutId);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          reject(error);
        }
      });

      // Send message to worker
      worker.postMessage(message);
      
      // Update worker stats
      const workerInfo = this.workers.get(workerName);
      if (workerInfo) {
        workerInfo.messageCount++;
      }
    });
  }

  /**
   * Handle incoming messages from workers
   */
  handleWorkerMessage(workerName, event) {
    const { type, id, result, error } = event.data;
    const messageHandler = this.messageQueue.get(id);

    if (!messageHandler) {
      console.warn(`No handler found for message ID: ${id}`);
      return;
    }

    this.messageQueue.delete(id);

    if (type === 'SUCCESS') {
      messageHandler.resolve(result);
    } else if (type === 'ERROR') {
      messageHandler.reject(new Error(error.message));
    }
  }

  /**
   * Handle worker errors
   */
  handleWorkerError(workerName, error) {
    console.error(`Worker '${workerName}' error:`, error);
    
    // Reject all pending messages for this worker
    this.messageQueue.forEach((handler, messageId) => {
      handler.reject(new Error(`Worker '${workerName}' encountered an error`));
    });
    this.messageQueue.clear();

    // Mark worker as inactive
    const workerInfo = this.workers.get(workerName);
    if (workerInfo) {
      workerInfo.isActive = false;
    }
  }

  /**
   * Terminate a worker
   */
  terminateWorker(workerName) {
    const workerInfo = this.workers.get(workerName);
    
    if (workerInfo) {
      workerInfo.worker.terminate();
      this.workers.delete(workerName);
      console.log(`Worker '${workerName}' terminated`);
    }
  }

  /**
   * Terminate all workers
   */
  terminateAllWorkers() {
    this.workers.forEach((workerInfo, workerName) => {
      workerInfo.worker.terminate();
    });
    this.workers.clear();
    this.messageQueue.clear();
    console.log('All workers terminated');
  }

  /**
   * Get worker statistics
   */
  getWorkerStats(workerName) {
    const workerInfo = this.workers.get(workerName);
    
    if (!workerInfo) {
      return null;
    }

    return {
      isActive: workerInfo.isActive,
      createdAt: workerInfo.createdAt,
      messageCount: workerInfo.messageCount,
      uptime: Date.now() - workerInfo.createdAt,
      pendingMessages: Array.from(this.messageQueue.keys()).length
    };
  }

  /**
   * Get all workers statistics
   */
  getAllWorkerStats() {
    const stats = {};
    
    this.workers.forEach((workerInfo, workerName) => {
      stats[workerName] = this.getWorkerStats(workerName);
    });

    return stats;
  }

  /**
   * Check if worker is available
   */
  isWorkerAvailable(workerName) {
    const workerInfo = this.workers.get(workerName);
    return workerInfo?.isActive || false;
  }

  /**
   * Restart a worker
   */
  async restartWorker(workerName, workerPath) {
    this.terminateWorker(workerName);
    await new Promise(resolve => setTimeout(resolve, 100)); // Brief delay
    return this.getWorker(workerName, workerPath);
  }
}

// Create singleton instance
const workerManager = new WebWorkerManager();

/**
 * Behavior Analytics Worker Wrapper
 */
export class BehaviorAnalyticsWorker {
  constructor() {
    this.workerName = 'behaviorAnalytics';
    this.workerPath = '/src/workers/behaviorAnalyticsWorker.js';
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      workerManager.getWorker(this.workerName, this.workerPath);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize BehaviorAnalyticsWorker:', error);
      throw error;
    }
  }

  async processBehavior(behavior, allBehaviors = []) {
    await this.initialize();
    
    return workerManager.sendMessage(this.workerName, 'PROCESS_BEHAVIOR', {
      behavior,
      allBehaviors
    });
  }

  async batchProcessBehaviors(behaviors) {
    await this.initialize();
    
    return workerManager.sendMessage(this.workerName, 'BATCH_PROCESS', {
      behaviors
    });
  }

  async processInsights(behaviors) {
    await this.initialize();
    
    return workerManager.sendMessage(this.workerName, 'PROCESS_INSIGHTS', {
      behaviors
    });
  }

  getStats() {
    return workerManager.getWorkerStats(this.workerName);
  }

  isAvailable() {
    return workerManager.isWorkerAvailable(this.workerName);
  }

  terminate() {
    workerManager.terminateWorker(this.workerName);
    this.initialized = false;
  }

  async restart() {
    const worker = await workerManager.restartWorker(this.workerName, this.workerPath);
    this.initialized = true;
    return worker;
  }
}

/**
 * Performance-optimized request idle callback
 */
export function optimizedRequestIdleCallback(callback, options = {}) {
  if (typeof requestIdleCallback !== 'undefined') {
    return requestIdleCallback(callback, { timeout: 50, ...options });
  } else {
    // Fallback for browsers without requestIdleCallback
    return setTimeout(() => {
      const start = performance.now();
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (performance.now() - start))
      });
    }, 0);
  }
}

/**
 * Debounced function executor for performance
 */
export function createDebouncer(func, delay = 300) {
  let timeoutId = null;
  
  return function debounced(...args) {
    clearTimeout(timeoutId);
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await func.apply(this, args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
}

/**
 * Batch processor for efficient data handling
 */
export class BatchProcessor {
  constructor(processFn, batchSize = 10, delay = 100) {
    this.processFn = processFn;
    this.batchSize = batchSize;
    this.delay = delay;
    this.queue = [];
    this.processing = false;
  }

  add(item) {
    this.queue.push(item);
    this.scheduleProcessing();
  }

  addBatch(items) {
    this.queue.push(...items);
    this.scheduleProcessing();
  }

  scheduleProcessing() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    optimizedRequestIdleCallback(() => {
      this.processBatch();
    });
  }

  async processBatch() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      while (this.queue.length > 0) {
        const batch = this.queue.splice(0, this.batchSize);
        await this.processFn(batch);
        
        // Yield control to prevent blocking
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    } catch (error) {
      console.error('Batch processing error:', error);
    } finally {
      this.processing = false;
    }
  }

  clear() {
    this.queue = [];
  }

  getQueueSize() {
    return this.queue.length;
  }
}

export default workerManager;