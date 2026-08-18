import logger from '../utils/logger.js';

/**
 * HTTP Fetcher
 *
 * Thin wrapper around the adapter's fetchJobs method.
 * Records timing for latency tracking and provides consistent error handling.
 */
export async function fetchFromAdapter(adapter, options = {}) {
  const source = adapter.getSourceName();
  const startTime = Date.now();

  try {
    const result = await adapter.fetchJobs(options);
    const latencyMs = Date.now() - startTime;

    logger.info('Fetch completed', {
      source,
      latencyMs,
      recordCount: result.data.length,
      page: result.meta.page,
    });

    return {
      success: true,
      data: result.data,
      meta: { ...result.meta, latencyMs },
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;

    logger.warn('Fetch failed', {
      source,
      latencyMs,
      statusCode: error.statusCode || null,
      message: error.message,
      retryable: error.retryable || false,
    });

    const err = new Error(error.message);
    err.statusCode = error.statusCode || null;
    err.retryable = error.retryable || false;
    err.schemaChange = error.schemaChange || false;
    err.latencyMs = latencyMs;
    throw err;
  }
}
