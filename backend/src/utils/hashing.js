import { createHash } from 'crypto';

/**
 * Generate a deterministic SHA-256 content hash from stable job fields.
 * Used for cross-source deduplication when no reliable source ID exists.
 *
 * @param {{ title: string, company: string, location: string, url: string }} fields
 * @returns {string} hex digest
 */
export function generateContentHash({ title, company, location, url }) {
  const normalized = [
    (title || '').toLowerCase().trim(),
    (company || '').toLowerCase().trim(),
    (location || '').toLowerCase().trim(),
    (url || '').toLowerCase().trim(),
  ].join('|');

  return createHash('sha256').update(normalized).digest('hex');
}
