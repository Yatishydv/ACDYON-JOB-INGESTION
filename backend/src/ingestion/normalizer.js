import logger from '../utils/logger.js';

/**
 * Job Normalizer
 *
 * Converts raw source jobs through the adapter's normalizeJob method,
 * separating successfully normalized jobs from failures.
 *
 * The adapter handles source-specific field mapping.
 * This module orchestrates the batch normalization process.
 */

/**
 * Normalize a batch of raw jobs using the source adapter.
 * @param {SourceAdapter} adapter - The source adapter
 * @param {object[]} rawJobs - Array of raw job objects from the source
 * @returns {{ normalized: object[], failed: { raw: object, errors: string[] }[] }}
 */
export function normalizeBatch(adapter, rawJobs) {
  const normalized = [];
  const failed = [];

  for (const rawJob of rawJobs) {
    try {
      const result = adapter.normalizeJob(rawJob);

      if (result.valid && result.job) {
        // Add timing metadata
        result.job.firstSeenAt = new Date();
        result.job.lastSeenAt = new Date();
        normalized.push(result.job);
      } else {
        failed.push({
          raw: { title: rawJob.title, slug: rawJob.slug },
          errors: result.errors,
        });
      }
    } catch (error) {
      failed.push({
        raw: { title: rawJob.title, slug: rawJob.slug },
        errors: [error.message],
      });
    }
  }

  if (failed.length > 0) {
    logger.warn('Some jobs failed normalization', {
      source: adapter.getSourceName(),
      failedCount: failed.length,
    });
  }

  return { normalized, failed };
}
