import SourceAdapter from '../SourceAdapter.js';
import { mapArbeitnowJob } from './arbeitnow.mapper.js';
import { validateResponseSchema, validateJobSchema } from './arbeitnow.schema.js';
import config from '../../config/env.js';
import logger from '../../utils/logger.js';

/**
 * Arbeitnow Source Adapter
 *
 * Fetches real job listings from the Arbeitnow public API.
 * API endpoint: https://www.arbeitnow.com/api/job-board-api
 * Auth: None required (public API)
 * Pagination: ?page=N
 * Terms: "as is" basis, requires attribution link to Arbeitnow.com
 */
export default class ArbeitnowAdapter extends SourceAdapter {
  constructor() {
    super();
    this.baseUrl = config.arbeitnow.baseUrl;
    this.maxPages = config.arbeitnow.maxPages;
  }

  getSourceName() {
    return 'arbeitnow';
  }

  /**
   * Fetch jobs from Arbeitnow API with pagination.
   * @param {object} options - { page: number }
   * @returns {Promise<{ data: object[], meta: { page: number, hasMore: boolean, schemaValid: boolean } }>}
   */
  async fetchJobs(options = {}) {
    const page = options.page || 1;
    const url = `${this.baseUrl}?page=${page}`;

    logger.info('Fetching from Arbeitnow', { url, page });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'JobPulse/1.0 (Resilient Job Ingestion System)',
      },
      signal: AbortSignal.timeout(config.ingestion.requestTimeoutMs),
    });

    if (!response.ok) {
      const error = new Error(`Arbeitnow API returned ${response.status}`);
      error.statusCode = response.status;
      error.retryable = response.status === 429 || response.status >= 500;
      throw error;
    }

    const body = await response.json();

    // Validate response schema — detect structural changes
    const schemaResult = validateResponseSchema(body);
    if (!schemaResult.valid) {
      const error = new Error(`Schema validation failed: ${schemaResult.errors.join(', ')}`);
      error.schemaChange = true;
      error.retryable = false;
      throw error;
    }

    const jobs = body.data || [];
    const hasMore = jobs.length > 0 && page < this.maxPages;

    return {
      data: jobs,
      meta: {
        page,
        hasMore,
        total: jobs.length,
        schemaValid: true,
      },
    };
  }

  /**
   * Normalize a raw Arbeitnow job into internal format.
   * Validates individual job schema before mapping.
   */
  normalizeJob(rawJob) {
    const schemaResult = validateJobSchema(rawJob);
    if (!schemaResult.valid) {
      return { valid: false, errors: schemaResult.errors, job: null };
    }
    return { valid: true, errors: [], job: mapArbeitnowJob(rawJob) };
  }

  async getHealth() {
    try {
      const response = await fetch(`${this.baseUrl}?page=1`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      return {
        source: this.getSourceName(),
        reachable: response.ok,
        statusCode: response.status,
      };
    } catch (error) {
      return {
        source: this.getSourceName(),
        reachable: false,
        error: error.message,
      };
    }
  }
}
