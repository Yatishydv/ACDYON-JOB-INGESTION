/**
 * Normalize a URL for consistent comparison and deduplication.
 * Strips trailing slashes, normalizes protocol, lowercases hostname.
 *
 * @param {string} rawUrl
 * @returns {string} normalized URL
 */
export function normalizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';

  let url = rawUrl.trim();

  // Ensure protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    const parsed = new URL(url);
    // Lowercase hostname, keep path case, strip trailing slash
    parsed.hostname = parsed.hostname.toLowerCase();
    let normalized = parsed.toString();
    if (normalized.endsWith('/') && parsed.pathname === '/') {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    // If URL parsing fails, return trimmed original
    return url;
  }
}

/**
 * Strip HTML tags from a string (for description cleanup).
 * @param {string} html
 * @returns {string} plain text
 */
export function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x26;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}
