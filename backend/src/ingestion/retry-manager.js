import config from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * Retry Manager with Exponential Backoff
 *
 * Classifies errors as retryable vs non-retryable.
 * Implements exponential backoff with jitter to avoid thundering herd.
 *
 * Retryable: 429 (rate limit), 5xx (server errors), network timeouts
 * Non-retryable: 4xx (client errors), schema changes, auth failures
 */
class RetryManager {
  constructor() {
    this.maxRetries = config.ingestion.maxRetries;
    this.baseDelayMs = config.ingestion.retryBaseDelayMs;
    this.maxDelayMs = config.ingestion.retryMaxDelayMs;
  }

  /**
   * Execute an async function with retry logic.
   * @param {Function} fn - Async function to execute
   * @param {string} context - Description for logging
   * @returns {Promise<any>}
   */
  async executeWithRetry(fn, context = 'operation') {
    let lastError = null;

    for (let attempt = 1; attempt <= this.maxRetries + 1; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (!this.isRetryable(error)) {
          logger.warn('Non-retryable error', {
            context,
            attempt,
            message: error.message,
            statusCode: error.statusCode,
          });
          throw error;
        }

        if (attempt > this.maxRetries) {
          logger.error('Max retries exceeded', {
            context,
            attempts: attempt,
            message: error.message,
          });
          throw error;
        }

        const delay = this.calculateDelay(attempt);
        logger.warn('Retrying after failure', {
          context,
          attempt,
          maxRetries: this.maxRetries,
          delayMs: delay,
          message: error.message,
          statusCode: error.statusCode,
        });

        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Determine if an error is retryable.
   */
  isRetryable(error) {
    // Explicit flag from adapter
    if (error.retryable === true) return true;
    if (error.retryable === false) return false;

    // Schema changes are not retryable
    if (error.schemaChange) return false;

    // Status code based classification
    const code = error.statusCode;
    if (code === 429) return true; // Rate limit
    if (code >= 500) return true; // Server error
    if (code >= 400 && code < 500) return false; // Client error

    // Network errors are retryable
    if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      return true;
    }
    if (error.name === 'AbortError' || error.type === 'aborted') return true;

    return false;
  }

  /**
   * Calculate exponential backoff delay with jitter.
   * @param {number} attempt - Current attempt number (1-based)
   * @returns {number} delay in milliseconds
   */
  calculateDelay(attempt) {
    const exponential = this.baseDelayMs * Math.pow(2, attempt - 1);
    const jitter = Math.random() * this.baseDelayMs;
    return Math.min(exponential + jitter, this.maxDelayMs);
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default RetryManager;
