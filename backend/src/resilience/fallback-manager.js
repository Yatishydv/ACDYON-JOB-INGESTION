import SandboxAdapter from '../adapters/sandbox/sandbox.adapter.js';
import logger from '../utils/logger.js';

/**
 * Fallback Manager
 *
 * Manages the ordered list of fallback adapters.
 * When the primary source is unhealthy, provides the next permitted source.
 *
 * Architecture:
 *   Primary (Arbeitnow) → Fallback (Sandbox)
 *
 * Both are permitted sources — no unauthorized scraping in fallback.
 */

/**
 * Get a fallback adapter when the given source is unavailable.
 *
 * @param {string} failedSource - The source that failed
 * @returns {SourceAdapter|null} A fallback adapter, or null if none available
 */
export function getFallbackAdapter(failedSource) {
  // For now, sandbox is the fallback for any external source
  if (failedSource === 'arbeitnow' || failedSource === 'remoteok') {
    logger.info('Activating fallback: sandbox', { failedSource });
    return new SandboxAdapter('normal');
  }

  // No fallback for sandbox itself
  logger.warn('No fallback available', { failedSource });
  return null;
}
