import config from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * Circuit Breaker
 *
 * Prevents the system from repeatedly hitting a source that is currently failing.
 *
 * States:
 *   CLOSED    → Normal operation, requests pass through
 *   OPEN      → Requests blocked, cooldown active
 *   HALF_OPEN → Testing with a single request after cooldown
 *
 * Transitions:
 *   CLOSED → OPEN: after failureThreshold consecutive failures
 *   OPEN → HALF_OPEN: after cooldownMs
 *   HALF_OPEN → CLOSED: on success
 *   HALF_OPEN → OPEN: on failure
 */

// In-memory circuit state per source
const circuits = new Map();

function getCircuit(source) {
  if (!circuits.has(source)) {
    circuits.set(source, {
      state: 'CLOSED',
      failures: 0,
      lastFailureAt: null,
      lastStateChange: Date.now(),
    });
  }
  return circuits.get(source);
}

/**
 * Check if the circuit allows a request.
 * @param {string} source
 * @returns {Promise<string>} Current state: 'CLOSED', 'OPEN', or 'HALF_OPEN'
 */
export async function checkCircuit(source) {
  const circuit = getCircuit(source);

  if (circuit.state === 'OPEN') {
    const elapsed = Date.now() - circuit.lastStateChange;

    if (elapsed >= config.circuitBreaker.cooldownMs) {
      // Cooldown expired — transition to HALF_OPEN
      circuit.state = 'HALF_OPEN';
      circuit.lastStateChange = Date.now();
      logger.info('Circuit breaker: HALF_OPEN', { source });
      return 'HALF_OPEN';
    }

    return 'OPEN';
  }

  return circuit.state;
}

/**
 * Record a successful request — close the circuit.
 * @param {string} source
 */
export async function recordSuccess(source) {
  const circuit = getCircuit(source);
  circuit.failures = 0;
  circuit.state = 'CLOSED';
  circuit.lastStateChange = Date.now();
}

/**
 * Record a failed request — potentially open the circuit.
 * @param {string} source
 * @param {Error} error
 */
export async function recordFailure(source, error) {
  const circuit = getCircuit(source);
  circuit.failures++;
  circuit.lastFailureAt = Date.now();

  if (circuit.state === 'HALF_OPEN') {
    // Test request failed — reopen
    circuit.state = 'OPEN';
    circuit.lastStateChange = Date.now();
    logger.warn('Circuit breaker: OPEN (half-open test failed)', { source });
    return;
  }

  if (circuit.failures >= config.circuitBreaker.failureThreshold) {
    circuit.state = 'OPEN';
    circuit.lastStateChange = Date.now();
    logger.warn('Circuit breaker: OPEN', { source, failures: circuit.failures });
  }
}

/**
 * Get circuit state for display.
 * @param {string} source
 * @returns {object}
 */
export function getCircuitState(source) {
  const circuit = getCircuit(source);
  return { ...circuit };
}

/**
 * Reset circuit (for testing/admin).
 */
export function resetCircuit(source) {
  circuits.delete(source);
}
