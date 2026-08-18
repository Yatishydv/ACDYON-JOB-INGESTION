import logger from '../utils/logger.js';

/**
 * Job Validator
 *
 * Validates normalized job records before they enter storage.
 * Invalid data never silently enters the database.
 *
 * Rules:
 *   - title must exist and be non-empty string
 *   - url must exist and be non-empty string
 *   - source must exist
 *   - sourceJobId must exist
 *   - publishedAt, if present, must be a valid date
 */

/**
 * Validate a normalized job record.
 * @param {object} job - Normalized job object
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateJob(job) {
  const errors = [];

  if (!job) {
    return { valid: false, errors: ['Job object is null or undefined'] };
  }

  // Required fields
  if (!job.title || typeof job.title !== 'string' || job.title.trim() === '') {
    errors.push('Missing or empty title');
  }

  if (!job.url || typeof job.url !== 'string' || job.url.trim() === '') {
    errors.push('Missing or empty url');
  }

  if (!job.source || typeof job.source !== 'string') {
    errors.push('Missing source identifier');
  }

  if (!job.sourceJobId || typeof job.sourceJobId !== 'string') {
    errors.push('Missing sourceJobId');
  }

  if (!job.contentHash || typeof job.contentHash !== 'string') {
    errors.push('Missing contentHash');
  }

  // URL format check
  if (job.url && typeof job.url === 'string') {
    try {
      new URL(job.url);
    } catch {
      errors.push(`Invalid URL format: ${job.url}`);
    }
  }

  // Date validation
  if (job.publishedAt !== null && job.publishedAt !== undefined) {
    const date = new Date(job.publishedAt);
    if (isNaN(date.getTime())) {
      errors.push('Invalid publishedAt date');
    }
  }

  const valid = errors.length === 0;

  if (!valid) {
    logger.debug('Job validation failed', {
      title: job.title,
      source: job.source,
      errors,
    });
  }

  return { valid, errors };
}

/**
 * Validate a batch of jobs, separating valid from invalid.
 * @param {object[]} jobs - Array of normalized job objects
 * @returns {{ valid: object[], rejected: { job: object, errors: string[] }[] }}
 */
export function validateBatch(jobs) {
  const valid = [];
  const rejected = [];

  for (const job of jobs) {
    const result = validateJob(job);
    if (result.valid) {
      valid.push(job);
    } else {
      rejected.push({ job, errors: result.errors });
    }
  }

  return { valid, rejected };
}
