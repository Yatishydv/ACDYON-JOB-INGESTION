import { mapArbeitnowJob } from '../../src/adapters/arbeitnow/arbeitnow.mapper.js';
import { normalizeUrl, stripHtml } from '../../src/utils/url-normalizer.js';

describe('Arbeitnow Mapper', () => {
  const sampleRawJob = {
    slug: 'test-frontend-dev',
    company_name: 'TechCorp GmbH',
    title: 'Frontend Developer',
    description: '<p>Build amazing <b>web apps</b>.</p>',
    remote: true,
    url: 'https://www.arbeitnow.com/jobs/test-frontend-dev',
    tags: ['React', 'TypeScript'],
    job_types: ['Full-time'],
    location: 'Berlin',
    created_at: 1692300000,
  };

  test('maps slug to sourceJobId', () => {
    const result = mapArbeitnowJob(sampleRawJob);
    expect(result.sourceJobId).toBe('test-frontend-dev');
  });

  test('maps company_name to company', () => {
    const result = mapArbeitnowJob(sampleRawJob);
    expect(result.company).toBe('TechCorp GmbH');
  });

  test('sets source as arbeitnow', () => {
    const result = mapArbeitnowJob(sampleRawJob);
    expect(result.source).toBe('arbeitnow');
  });

  test('strips HTML from description', () => {
    const result = mapArbeitnowJob(sampleRawJob);
    expect(result.description).not.toContain('<p>');
    expect(result.description).not.toContain('<b>');
    expect(result.description).toContain('Build amazing');
    expect(result.description).toContain('web apps');
  });

  test('converts epoch to Date', () => {
    const result = mapArbeitnowJob(sampleRawJob);
    expect(result.publishedAt).toBeInstanceOf(Date);
    expect(result.publishedAt.getTime()).toBe(1692300000 * 1000);
  });

  test('preserves tags as array', () => {
    const result = mapArbeitnowJob(sampleRawJob);
    expect(result.tags).toEqual(['React', 'TypeScript']);
  });

  test('generates contentHash', () => {
    const result = mapArbeitnowJob(sampleRawJob);
    expect(result.contentHash).toBeDefined();
    expect(result.contentHash.length).toBe(64); // SHA-256 hex
  });

  test('handles missing optional fields', () => {
    const minimal = { slug: 'min', title: 'Test', url: 'https://example.com' };
    const result = mapArbeitnowJob(minimal);
    expect(result.company).toBeNull();
    expect(result.location).toBeNull();
    expect(result.remote).toBe(false);
    expect(result.tags).toEqual([]);
  });
});

describe('URL Normalizer', () => {
  test('strips trailing slash from root', () => {
    expect(normalizeUrl('https://example.com/')).toBe('https://example.com');
  });

  test('adds https if missing', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
  });

  test('lowercases hostname', () => {
    expect(normalizeUrl('https://EXAMPLE.COM/Path')).toBe('https://example.com/Path');
  });

  test('returns empty string for invalid input', () => {
    expect(normalizeUrl(null)).toBe('');
    expect(normalizeUrl('')).toBe('');
  });
});

describe('HTML Stripper', () => {
  test('removes HTML tags', () => {
    expect(stripHtml('<p>Hello <b>world</b></p>')).toBe('Hello world');
  });

  test('decodes HTML entities', () => {
    expect(stripHtml('AT&amp;T')).toBe('AT&T');
  });

  test('handles empty input', () => {
    expect(stripHtml('')).toBe('');
    expect(stripHtml(null)).toBe('');
  });
});
