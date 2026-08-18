/**
 * Base Source Adapter Interface
 *
 * Every source adapter must implement these methods.
 * This ensures the ingestion pipeline is decoupled from source-specific logic.
 *
 * The pipeline only interacts with adapters through this interface:
 *   fetchJobs()     → get raw source data
 *   normalizeJob()  → convert source data to internal model
 *   getSourceName() → identify the source
 *   getHealth()     → report source-specific health
 */
export default class SourceAdapter {
  /**
   * Fetch raw job data from the source.
   * @param {object} options - Source-specific fetch options (page, filters, etc.)
   * @returns {Promise<{ data: object[], meta: object }>}
   */
  async fetchJobs(options = {}) {
    throw new Error('fetchJobs() must be implemented by source adapter');
  }

  /**
   * Normalize a single raw job record into the internal Job model format.
   * @param {object} rawJob - Source-specific job object
   * @returns {object} Normalized job object matching internal schema
   */
  normalizeJob(rawJob) {
    throw new Error('normalizeJob() must be implemented by source adapter');
  }

  /**
   * Get the unique identifier for this source.
   * @returns {string}
   */
  getSourceName() {
    throw new Error('getSourceName() must be implemented by source adapter');
  }

  /**
   * Get source-specific health information.
   * @returns {Promise<object>}
   */
  async getHealth() {
    return { source: this.getSourceName(), reachable: true };
  }
}
