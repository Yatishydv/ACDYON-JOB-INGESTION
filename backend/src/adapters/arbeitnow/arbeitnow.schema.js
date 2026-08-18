/**
 * Validation schema for Arbeitnow API responses.
 * Detects schema changes by verifying expected fields exist.
 */

/**
 * Validate that the API response has the expected top-level structure.
 * @param {object} response - Parsed JSON response
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateResponseSchema(response) {
  const errors = [];

  if (!response || typeof response !== 'object') {
    errors.push('Response is not an object');
    return { valid: false, errors };
  }

  if (!Array.isArray(response.data)) {
    errors.push('Response.data is not an array — possible schema change');
    return { valid: false, errors };
  }

  return { valid: true, errors };
}

/**
 * Validate that a single job record has the expected Arbeitnow fields.
 * This catches schema changes at the record level.
 *
 * @param {object} rawJob - Raw job object from Arbeitnow
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateJobSchema(rawJob) {
  const errors = [];
  const expectedFields = ['slug', 'title', 'url'];

  for (const field of expectedFields) {
    if (rawJob[field] === undefined || rawJob[field] === null) {
      errors.push(`Missing expected field: ${field}`);
    }
  }

  if (typeof rawJob.title !== 'string' || rawJob.title.trim() === '') {
    errors.push('Field "title" is empty or not a string');
  }

  return { valid: errors.length === 0, errors };
}
