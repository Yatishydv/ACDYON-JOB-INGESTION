import SourceAdapter from '../SourceAdapter.js';
import config from '../../config/env.js';
import logger from '../../utils/logger.js';
import { generateContentHash } from '../../utils/hashing.js';

export default class RemoteokAdapter extends SourceAdapter {
  constructor() {
    super();
    this.baseUrl = 'https://remoteok.com/api';
  }

  getSourceName() {
    return 'remoteok';
  }

  async fetchJobs(options = {}) {
    logger.info('Fetching from RemoteOK API', { url: this.baseUrl });

    const response = await fetch(this.baseUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'JobPulse/1.0 (Resilient Job Ingestion System)', // Required to avoid instant blocks
      },
      signal: AbortSignal.timeout(config.ingestion.requestTimeoutMs),
    });

    if (!response.ok) {
      const error = new Error(`RemoteOK API returned ${response.status}`);
      error.statusCode = response.status;
      error.retryable = response.status === 429 || response.status >= 500;
      throw error;
    }

    const body = await response.json();
    
    // RemoteOK usually returns a legal notice/ad as the first element in the array
    const jobs = Array.isArray(body) ? body.filter(item => item.legal === undefined) : [];

    return {
      data: jobs,
      meta: {
        page: 1, // RemoteOK returns recent jobs in a single feed
        hasMore: false,
        total: jobs.length,
        schemaValid: true,
      },
    };
  }

  normalizeJob(rawJob) {
    if (!rawJob.id || !rawJob.position || !rawJob.company) {
      return { valid: false, errors: ['Missing required fields (id, position, company)'], job: null };
    }

    const title = rawJob.position;
    const company = rawJob.company;
    const location = rawJob.location || 'Remote';
    const url = rawJob.apply_url || rawJob.url;

    const job = {
      source: this.getSourceName(),
      sourceJobId: rawJob.id.toString(),
      title,
      company,
      location,
      description: rawJob.description || '',
      url,
      tags: rawJob.tags || [],
      publishedAt: new Date(rawJob.date || rawJob.epoch * 1000 || Date.now()),
      contentHash: generateContentHash({ title, company, location, url }),
    };

    return { valid: true, errors: [], job };
  }

  async getHealth() {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'User-Agent': 'JobPulse/1.0' },
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
