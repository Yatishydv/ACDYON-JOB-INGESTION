import { validateJob, validateBatch } from '../../src/ingestion/validator.js';

describe('Job Validator', () => {
  const validJob = {
    source: 'arbeitnow',
    sourceJobId: 'test-slug-001',
    title: 'Frontend Developer',
    company: 'TechCorp',
    location: 'Berlin',
    url: 'https://example.com/jobs/frontend',
    contentHash: 'abc123def456',
    remote: false,
    tags: ['React'],
    publishedAt: new Date(),
  };

  test('accepts valid job', () => {
    const result = validateJob(validJob);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('rejects job with missing title', () => {
    const job = { ...validJob, title: '' };
    const result = validateJob(job);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing or empty title');
  });

  test('rejects job with missing url', () => {
    const job = { ...validJob, url: '' };
    const result = validateJob(job);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing or empty url');
  });

  test('rejects job with invalid URL format', () => {
    const job = { ...validJob, url: 'not a url at all' };
    const result = validateJob(job);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Invalid URL'))).toBe(true);
  });

  test('rejects null job', () => {
    const result = validateJob(null);
    expect(result.valid).toBe(false);
  });

  test('rejects job with missing source', () => {
    const job = { ...validJob, source: '' };
    const result = validateJob(job);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing source identifier');
  });

  test('rejects job with missing contentHash', () => {
    const job = { ...validJob, contentHash: '' };
    const result = validateJob(job);
    expect(result.valid).toBe(false);
  });

  test('accepts job with null publishedAt', () => {
    const job = { ...validJob, publishedAt: null };
    const result = validateJob(job);
    expect(result.valid).toBe(true);
  });

  test('rejects job with invalid publishedAt date', () => {
    const job = { ...validJob, publishedAt: 'not-a-date' };
    const result = validateJob(job);
    expect(result.valid).toBe(false);
  });
});

describe('Batch Validator', () => {
  test('separates valid and rejected jobs', () => {
    const jobs = [
      { source: 'test', sourceJobId: '1', title: 'Good Job', url: 'https://example.com', contentHash: 'abc' },
      { source: 'test', sourceJobId: '2', title: '', url: 'https://example.com', contentHash: 'def' },
      { source: 'test', sourceJobId: '3', title: 'Another Good', url: 'https://example.com', contentHash: 'ghi' },
    ];

    const result = validateBatch(jobs);
    expect(result.valid).toHaveLength(2);
    expect(result.rejected).toHaveLength(1);
  });
});
