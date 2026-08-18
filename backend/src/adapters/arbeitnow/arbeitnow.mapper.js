import { normalizeUrl, stripHtml } from '../../utils/url-normalizer.js';
import { generateContentHash } from '../../utils/hashing.js';

/**
 * Map Arbeitnow-specific fields to the internal Job model.
 *
 * Arbeitnow fields:     Internal fields:
 *   slug           →     sourceJobId
 *   company_name   →     company
 *   title          →     title
 *   description    →     description (HTML stripped)
 *   remote         →     remote
 *   url            →     url (normalized)
 *   tags           →     tags
 *   job_types      →     metadata.jobTypes
 *   location       →     location
 *   created_at     →     publishedAt (epoch → Date)
 *
 * @param {object} rawJob - Raw Arbeitnow job object
 * @returns {object} Normalized job matching internal schema
 */
export function mapArbeitnowJob(rawJob) {
  const title = (rawJob.title || '').trim();
  const company = (rawJob.company_name || '').trim() || null;
  const location = (rawJob.location || '').trim() || null;
  const url = normalizeUrl(rawJob.url || '');

  return {
    source: 'arbeitnow',
    sourceJobId: rawJob.slug || '',
    title,
    company,
    location,
    remote: rawJob.remote === true,
    description: stripHtml(rawJob.description || ''),
    url,
    tags: Array.isArray(rawJob.tags) ? rawJob.tags : [],
    publishedAt: rawJob.created_at ? new Date(rawJob.created_at * 1000) : null,
    contentHash: generateContentHash({ title, company, location, url }),
    metadata: {
      jobTypes: Array.isArray(rawJob.job_types) ? rawJob.job_types : [],
    },
  };
}
