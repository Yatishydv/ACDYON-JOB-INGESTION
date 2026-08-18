import { generateContentHash } from '../../src/utils/hashing.js';

describe('Content Hashing for Deduplication', () => {
  test('generates consistent hash for same input', () => {
    const fields = { title: 'Frontend Dev', company: 'TechCorp', location: 'Berlin', url: 'https://example.com' };
    const hash1 = generateContentHash(fields);
    const hash2 = generateContentHash(fields);
    expect(hash1).toBe(hash2);
  });

  test('generates different hash for different title', () => {
    const hash1 = generateContentHash({ title: 'Frontend Dev', company: 'TC', location: 'Berlin', url: 'https://a.com' });
    const hash2 = generateContentHash({ title: 'Backend Dev', company: 'TC', location: 'Berlin', url: 'https://a.com' });
    expect(hash1).not.toBe(hash2);
  });

  test('is case insensitive', () => {
    const hash1 = generateContentHash({ title: 'Frontend Dev', company: 'TechCorp', location: 'Berlin', url: 'https://example.com' });
    const hash2 = generateContentHash({ title: 'FRONTEND DEV', company: 'TECHCORP', location: 'BERLIN', url: 'HTTPS://EXAMPLE.COM' });
    expect(hash1).toBe(hash2);
  });

  test('handles missing fields', () => {
    const hash = generateContentHash({ title: null, company: null, location: null, url: null });
    expect(hash).toBeDefined();
    expect(hash.length).toBe(64);
  });

  test('returns 64-char hex string (SHA-256)', () => {
    const hash = generateContentHash({ title: 'Test', company: 'C', location: 'L', url: 'U' });
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
