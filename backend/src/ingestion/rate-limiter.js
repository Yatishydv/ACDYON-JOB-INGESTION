import config from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * Token-Bucket Rate Limiter
 *
 * Enforces a minimum delay between requests to avoid hammering sources.
 * This is responsible ingestion, not anti-bot bypass.
 */
class RateLimiter {
  constructor(delayMs = config.ingestion.requestDelayMs) {
    this.initialDelayMs = delayMs;
    this.delayMs = delayMs;
    this.lastRequestTime = 0;
  }

  /**
   * Wait until the rate limit allows the next request.
   * @returns {Promise<void>}
   */
  async waitForSlot() {
    const now = Date.now();
    const timeSinceLast = now - this.lastRequestTime;
    
    if (this.lastRequestTime > 0 && timeSinceLast < this.delayMs) {
      const waitTime = this.delayMs - timeSinceLast;
      logger.debug('Rate limiter: waiting', { waitMs: waitTime });
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Increase delay (e.g., after rate-limit detection).
   * @param {number} multiplier
   */
  backoff(multiplier = 2) {
    this.delayMs = Math.min(this.delayMs * multiplier, 60000);
    logger.warn('Rate limiter: backoff applied', { newDelayMs: this.delayMs });
  }

  /**
   * Reset delay to default.
   */
  reset() {
    this.delayMs = this.initialDelayMs;
  }

  getDelayMs() {
    return this.delayMs;
  }
}

export default RateLimiter;
