import SourceHealth from '../models/SourceHealth.js';
import IngestionEvent from '../models/IngestionEvent.js';
import logger from '../utils/logger.js';

/**
 * Source Health Tracker
 *
 * State Machine:
 *   HEALTHY → DEGRADED (after 2 consecutive failures)
 *   DEGRADED → UNAVAILABLE (after 5 consecutive failures)
 *   UNAVAILABLE → HEALTHY (on successful request)
 *   Any → RATE_LIMITED (on 429 detection)
 *   RATE_LIMITED → HEALTHY (on successful request)
 */

const DEGRADED_THRESHOLD = 2;
const UNAVAILABLE_THRESHOLD = 5;

/**
 * Get or create a source health record.
 * @param {string} source
 * @returns {Promise<SourceHealth>}
 */
export async function getOrCreateSourceHealth(source) {
  let health = await SourceHealth.findOne({ source });
  if (!health) {
    health = await SourceHealth.create({ source, status: 'HEALTHY' });
  }
  return health;
}

/**
 * Update source health after a request attempt.
 *
 * @param {string} source
 * @param {object} result - { success, statusCode, error, latencyMs, emptyResponse }
 */
export async function updateSourceHealth(source, result) {
  const health = await getOrCreateSourceHealth(source);

  health.lastAttemptAt = new Date();
  health.totalRequests = (health.totalRequests || 0) + 1;

  if (result.success) {
    // Success: reset failure count and recover health
    health.consecutiveFailures = 0;
    health.lastSuccessAt = new Date();
    health.lastError = null;

    if (result.emptyResponse) {
      // Success but empty — might be degraded
      health.status = health.consecutiveFailures > 0 ? 'DEGRADED' : health.status;
    } else {
      health.status = 'HEALTHY';
    }

    // Update rolling average latency
    if (result.latencyMs) {
      health.averageLatencyMs = health.averageLatencyMs
        ? Math.round((health.averageLatencyMs + result.latencyMs) / 2)
        : result.latencyMs;
    }
  } else {
    // Failure
    health.consecutiveFailures += 1;
    health.totalFailures = (health.totalFailures || 0) + 1;
    health.lastError = result.error || 'Unknown error';
    health.lastStatusCode = result.statusCode || null;

    if (result.statusCode === 429) {
      health.status = 'RATE_LIMITED';
    } else if (health.consecutiveFailures >= UNAVAILABLE_THRESHOLD) {
      health.status = 'UNAVAILABLE';
    } else if (health.consecutiveFailures >= DEGRADED_THRESHOLD) {
      health.status = 'DEGRADED';
    }
  }

  await health.save();

  // Emit state change events
  if (health.status === 'DEGRADED') {
    logger.warn('Source degraded', { source, consecutiveFailures: health.consecutiveFailures });
  } else if (health.status === 'UNAVAILABLE') {
    logger.error('Source unavailable', { source, consecutiveFailures: health.consecutiveFailures });
  }

  return health;
}

/**
 * Get all source health records.
 */
export async function getAllSourceHealth() {
  return SourceHealth.find({}).lean();
}

/**
 * Get health for a specific source.
 */
export async function getSourceHealthByName(source) {
  return getOrCreateSourceHealth(source);
}
