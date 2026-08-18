import RetryManager from '../../src/ingestion/retry-manager.js';

describe('Retry Manager', () => {
  let retryManager;

  beforeEach(() => {
    retryManager = new RetryManager();
    // Speed up tests
    retryManager.baseDelayMs = 10;
    retryManager.maxDelayMs = 100;
    retryManager.maxRetries = 2;
  });

  test('succeeds on first attempt without retrying', async () => {
    let attempts = 0;
    const result = await retryManager.executeWithRetry(async () => {
      attempts++;
      return 'success';
    }, 'test-success');

    expect(result).toBe('success');
    expect(attempts).toBe(1);
  });

  test('retries retryable errors', async () => {
    let attempts = 0;
    const result = await retryManager.executeWithRetry(async () => {
      attempts++;
      if (attempts < 3) {
        const error = new Error('Server error');
        error.statusCode = 500;
        error.retryable = true;
        throw error;
      }
      return 'recovered';
    }, 'test-retry');

    expect(result).toBe('recovered');
    expect(attempts).toBe(3);
  });

  test('does not retry non-retryable errors', async () => {
    let attempts = 0;

    await expect(
      retryManager.executeWithRetry(async () => {
        attempts++;
        const error = new Error('Schema changed');
        error.schemaChange = true;
        error.retryable = false;
        throw error;
      }, 'test-no-retry')
    ).rejects.toThrow('Schema changed');

    expect(attempts).toBe(1);
  });

  test('throws after max retries', async () => {
    let attempts = 0;

    await expect(
      retryManager.executeWithRetry(async () => {
        attempts++;
        const error = new Error('Still failing');
        error.retryable = true;
        throw error;
      }, 'test-max-retries')
    ).rejects.toThrow('Still failing');

    expect(attempts).toBe(3); // 1 initial + 2 retries
  });

  test('classifies 429 as retryable', () => {
    const error = new Error('Rate limit');
    error.statusCode = 429;
    expect(retryManager.isRetryable(error)).toBe(true);
  });

  test('classifies 5xx as retryable', () => {
    const error = new Error('Server error');
    error.statusCode = 503;
    expect(retryManager.isRetryable(error)).toBe(true);
  });

  test('classifies 4xx as non-retryable', () => {
    const error = new Error('Not found');
    error.statusCode = 404;
    expect(retryManager.isRetryable(error)).toBe(false);
  });

  test('classifies network errors as retryable', () => {
    const error = new Error('Connection reset');
    error.code = 'ECONNRESET';
    expect(retryManager.isRetryable(error)).toBe(true);
  });

  test('calculates exponential delay with jitter', () => {
    const delay1 = retryManager.calculateDelay(1);
    const delay2 = retryManager.calculateDelay(2);
    const delay3 = retryManager.calculateDelay(3);

    expect(delay1).toBeGreaterThanOrEqual(retryManager.baseDelayMs);
    expect(delay3).toBeGreaterThanOrEqual(delay1);
    expect(delay3).toBeLessThanOrEqual(retryManager.maxDelayMs);
  });
});
