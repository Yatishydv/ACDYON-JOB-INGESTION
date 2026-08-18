import { randomUUID } from 'crypto';
import { fetchFromAdapter } from './fetcher.js';
import RateLimiter from './rate-limiter.js';
import RetryManager from './retry-manager.js';
import { normalizeBatch } from './normalizer.js';
import { validateBatch } from './validator.js';
import { deduplicateAndStore } from './deduplicator.js';
import IngestionRun from '../models/IngestionRun.js';
import IngestionEvent from '../models/IngestionEvent.js';
import { updateSourceHealth, getOrCreateSourceHealth } from '../resilience/source-health.js';
import { checkCircuit, recordSuccess as cbSuccess, recordFailure as cbFailure } from '../resilience/circuit-breaker.js';
import { getFallbackAdapter } from '../resilience/fallback-manager.js';
import logger from '../utils/logger.js';

// Mutex to prevent concurrent ingestion runs
let isRunning = false;

/**
 * Core Ingestion Service — the orchestrator.
 *
 * Flow: Fetch → Normalize → Validate → Deduplicate → Store
 * With: Rate limiting, retry, circuit breaker, source health, fallback
 *
 * @param {SourceAdapter} primaryAdapter - Primary source adapter
 * @param {object} options - { scenario: string } for sandbox
 * @returns {Promise<object>} Ingestion run summary
 */
export async function runIngestion(primaryAdapter, options = {}) {
  if (isRunning) {
    throw new Error('Ingestion already in progress. Please wait for the current run to complete.');
  }

  isRunning = true;
  const runId = randomUUID();
  const startedAt = new Date();
  let adapter = primaryAdapter;
  const source = adapter.getSourceName();

  // Create ingestion run record
  const run = await IngestionRun.create({
    runId,
    source,
    startedAt,
    status: 'RUNNING',
  });

  await emitEvent(runId, source, 'INGESTION_STARTED', 'Ingestion run started');

  const rateLimiter = new RateLimiter();
  const retryManager = new RetryManager();

  let totalFetched = 0;
  let totalAccepted = 0;
  let totalRejected = 0;
  let totalDuplicates = 0;
  const allErrors = [];

  try {
    // Check circuit breaker
    const circuitState = await checkCircuit(source);
    if (circuitState === 'OPEN') {
      logger.warn('Circuit breaker is OPEN, trying fallback', { source });
      await emitEvent(runId, source, 'CIRCUIT_OPEN', 'Circuit breaker open — primary source blocked');

      // Try fallback
      const fallback = getFallbackAdapter(source);
      if (fallback) {
        adapter = fallback;
        await emitEvent(runId, fallback.getSourceName(), 'FALLBACK_ACTIVATED', `Switched to fallback: ${fallback.getSourceName()}`);
      } else {
        throw new Error('Circuit open and no fallback available');
      }
    }

    // Paginated fetch loop
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      // Rate limiting
      await rateLimiter.waitForSlot();

      // Fetch with retry
      let fetchResult;
      try {
        fetchResult = await retryManager.executeWithRetry(
          () => fetchFromAdapter(adapter, { ...options, page }),
          `fetch-page-${page}`
        );
      } catch (fetchError) {
        // Retry exhausted
        await cbFailure(adapter.getSourceName(), fetchError);
        await updateSourceHealth(adapter.getSourceName(), {
          success: false,
          statusCode: fetchError.statusCode,
          error: fetchError.message,
          latencyMs: 0,
        });

        if (fetchError.statusCode === 429) {
          await emitEvent(runId, adapter.getSourceName(), 'RATE_LIMIT_DETECTED', 'Rate limit detected after retries');
          rateLimiter.backoff();
        } else if (fetchError.schemaChange) {
          await emitEvent(runId, adapter.getSourceName(), 'SCHEMA_VALIDATION_FAILED', fetchError.message);
        } else {
          await emitEvent(runId, adapter.getSourceName(), 'FETCH_FAILED', fetchError.message);
        }

        allErrors.push(fetchError.message);

        // Try fallback on exhausted retries or non-retryable errors
        if (adapter === primaryAdapter) {
          const fallback = getFallbackAdapter(adapter.getSourceName());
          if (fallback) {
            adapter = fallback;
            await emitEvent(runId, fallback.getSourceName(), 'FALLBACK_ACTIVATED', `Switched to fallback after fetch failure`);
            continue;
          }
        }
        break;
      }

      // Success path

      // Success path
      await cbSuccess(adapter.getSourceName());
      await emitEvent(runId, adapter.getSourceName(), 'FETCH_SUCCESS', `Fetched ${fetchResult.data.length} records from page ${page}`);

      const rawJobs = fetchResult.data;
      totalFetched += rawJobs.length;

      // Detect anomalous empty response
      if (rawJobs.length === 0 && page === 1) {
        await emitEvent(runId, adapter.getSourceName(), 'EMPTY_RESPONSE_DETECTED', 'Source returned zero records on first page — possible anomaly');
        await updateSourceHealth(adapter.getSourceName(), {
          success: true,
          emptyResponse: true,
          latencyMs: fetchResult.meta.latencyMs,
        });
        break;
      }

      // Normalize
      const { normalized, failed: normFailed } = normalizeBatch(adapter, rawJobs);
      totalRejected += normFailed.length;

      for (const fail of normFailed) {
        await emitEvent(runId, adapter.getSourceName(), 'JOB_REJECTED', `Normalization failed: ${fail.errors.join(', ')}`, { raw: fail.raw });
      }

      // Validate
      const { valid, rejected } = validateBatch(normalized);
      totalRejected += rejected.length;

      for (const rej of rejected) {
        await emitEvent(runId, adapter.getSourceName(), 'JOB_REJECTED', `Validation failed: ${rej.errors.join(', ')}`);
      }

      // Deduplicate and store
      const storeResult = await deduplicateAndStore(valid);
      totalAccepted += storeResult.inserted;
      totalDuplicates += storeResult.duplicates;
      allErrors.push(...storeResult.errors);

      if (storeResult.inserted > 0) {
        await emitEvent(runId, adapter.getSourceName(), 'JOB_ACCEPTED', `${storeResult.inserted} new jobs stored`);
      }
      if (storeResult.duplicates > 0) {
        await emitEvent(runId, adapter.getSourceName(), 'DUPLICATE_DETECTED', `${storeResult.duplicates} duplicates detected`);
      }

      // Update source health on success
      await updateSourceHealth(adapter.getSourceName(), {
        success: true,
        latencyMs: fetchResult.meta.latencyMs,
      });

      // Check pagination
      hasMore = fetchResult.meta.hasMore;
      page++;
    }

    // Determine final status
    const completedAt = new Date();
    const durationMs = completedAt - startedAt;
    let status = 'SUCCESS';

    if (totalFetched === 0 && allErrors.length > 0) {
      status = 'FAILED';
    } else if (allErrors.length > 0) {
      status = 'PARTIAL';
    }

    // Update run record
    run.completedAt = completedAt;
    run.status = status;
    run.fetched = totalFetched;
    run.accepted = totalAccepted;
    run.rejected = totalRejected;
    run.duplicates = totalDuplicates;
    run.errors = allErrors;
    run.durationMs = durationMs;
    run.source = adapter.getSourceName();
    await run.save();

    await emitEvent(runId, adapter.getSourceName(), 'INGESTION_COMPLETED',
      `Ingestion ${status}: ${totalFetched} fetched, ${totalAccepted} accepted, ${totalDuplicates} duplicates, ${totalRejected} rejected`
    );

    logger.info('Ingestion run completed', {
      runId,
      status,
      fetched: totalFetched,
      accepted: totalAccepted,
      duplicates: totalDuplicates,
      rejected: totalRejected,
      durationMs,
    });

    return run.toObject();
  } catch (error) {
    // Fatal error
    const completedAt = new Date();
    run.completedAt = completedAt;
    run.status = 'FAILED';
    run.errors = [...allErrors, error.message];
    run.durationMs = completedAt - startedAt;
    run.fetched = totalFetched;
    run.accepted = totalAccepted;
    run.rejected = totalRejected;
    run.duplicates = totalDuplicates;
    await run.save();

    await emitEvent(runId, source, 'INGESTION_COMPLETED', `Ingestion FAILED: ${error.message}`);
    logger.error('Ingestion run failed', { runId, error: error.message });

    return run.toObject();
  } finally {
    isRunning = false;
  }
}

async function emitEvent(runId, source, type, message, metadata = {}) {
  try {
    await IngestionEvent.create({ runId, source, type, message, metadata });
  } catch (error) {
    logger.error('Failed to emit event', { type, error: error.message });
  }
}

export function isIngestionRunning() {
  return isRunning;
}
