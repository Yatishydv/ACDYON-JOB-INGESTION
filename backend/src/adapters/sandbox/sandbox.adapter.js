import SourceAdapter from '../SourceAdapter.js';
import { normalizeUrl, stripHtml } from '../../utils/url-normalizer.js';
import { generateContentHash } from '../../utils/hashing.js';
import config from '../../config/env.js';
import logger from '../../utils/logger.js';

/**
 * Sandbox Source Adapter
 *
 * Points to a controlled sandbox server for demonstrating failure scenarios.
 * Each sandbox endpoint simulates a specific failure mode:
 *   /sandbox/normal       → 200 with realistic job data
 *   /sandbox/empty        → 200 with empty data
 *   /sandbox/rate-limit   → 429
 *   /sandbox/server-error → 500/503
 *   /sandbox/malformed    → invalid JSON
 *   /sandbox/schema-change→ 200 with renamed fields
 */
export default class SandboxAdapter extends SourceAdapter {
  constructor(scenario = 'normal') {
    super();
    this.baseUrl = config.sandboxUrl;
    this.scenario = scenario;
  }

  getSourceName() {
    return 'sandbox';
  }

  /**
   * Fetch from the sandbox server using the configured scenario.
   */
  async fetchJobs(options = {}) {
    const scenario = options.scenario || this.scenario;
    const url = `${this.baseUrl}/sandbox/${scenario}`;

    logger.info('Fetching from Sandbox', { url, scenario });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'JobPulse/1.0 (Sandbox Mode)',
      },
      signal: AbortSignal.timeout(config.ingestion.requestTimeoutMs),
    });

    if (!response.ok) {
      const error = new Error(`Sandbox returned ${response.status}`);
      error.statusCode = response.status;
      error.retryable = response.status === 429 || response.status >= 500;
      throw error;
    }

    const body = await response.json();

    if (!body || !Array.isArray(body.data)) {
      const error = new Error('Sandbox response schema invalid');
      error.schemaChange = true;
      error.retryable = false;
      throw error;
    }

    return {
      data: body.data,
      meta: {
        page: 1,
        hasMore: false,
        total: body.data.length,
        schemaValid: true,
      },
    };
  }

  /**
   * Normalize sandbox jobs using the same internal model.
   */
  normalizeJob(rawJob) {
    const title = (rawJob.title || '').trim();
    const company = (rawJob.company_name || rawJob.company || '').trim() || null;
    const location = (rawJob.location || '').trim() || null;
    const url = normalizeUrl(rawJob.url || '');

    if (!title || !url) {
      return {
        valid: false,
        errors: [!title ? 'Missing title' : 'Missing url'],
        job: null,
      };
    }

    return {
      valid: true,
      errors: [],
      job: {
        source: 'sandbox',
        sourceJobId: rawJob.slug || rawJob.id || `sandbox-${Date.now()}`,
        title,
        company,
        location,
        remote: rawJob.remote === true,
        description: stripHtml(rawJob.description || ''),
        url,
        tags: Array.isArray(rawJob.tags) ? rawJob.tags : [],
        publishedAt: rawJob.created_at ? new Date(rawJob.created_at * 1000) : new Date(),
        contentHash: generateContentHash({ title, company, location, url }),
        metadata: {},
      },
    };
  }
}
