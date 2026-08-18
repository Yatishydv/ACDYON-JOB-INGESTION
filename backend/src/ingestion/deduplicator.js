import Job from '../models/Job.js';
import logger from '../utils/logger.js';

/**
 * Job Deduplicator
 *
 * Strategy:
 *   1. Primary: source + sourceJobId (compound unique index)
 *   2. Fallback: contentHash match (for cross-source dedup)
 *
 * For duplicates: updates lastSeenAt timestamp only.
 * Never creates a second record for the same job.
 */

/**
 * Deduplicate and store a batch of validated jobs.
 *
 * @param {object[]} jobs - Array of validated, normalized job objects
 * @returns {Promise<{ inserted: number, duplicates: number, errors: string[] }>}
 */
export async function deduplicateAndStore(jobs) {
  let inserted = 0;
  let duplicates = 0;
  const errors = [];

  // Process jobs concurrently to speed up database queries
  await Promise.all(jobs.map(async (job) => {
    try {
      // Try to find existing by source + sourceJobId
      const existing = await Job.findOne({
        source: job.source,
        sourceJobId: job.sourceJobId,
      });

      if (existing) {
        // Duplicate: update lastSeenAt only
        existing.lastSeenAt = new Date();
        await existing.save();
        duplicates++;
        return;
      }

      // Also check by contentHash (cross-source dedup)
      const hashMatch = await Job.findOne({ contentHash: job.contentHash });
      if (hashMatch) {
        hashMatch.lastSeenAt = new Date();
        await hashMatch.save();
        duplicates++;
        return;
      }

      // New job: insert
      await Job.create(job);
      inserted++;
    } catch (error) {
      // Handle race condition on unique index (concurrent inserts)
      if (error.code === 11000) {
        duplicates++;
      } else {
        errors.push(`Failed to store job "${job.title}": ${error.message}`);
        logger.error('Deduplication/storage error', {
          title: job.title,
          source: job.source,
          error: error.message,
        });
      }
    }
  }));

  logger.info('Deduplication complete', { inserted, duplicates, errors: errors.length });

  return { inserted, duplicates, errors };
}
