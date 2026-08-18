import RateLimiter from '../../src/ingestion/rate-limiter.js';

describe('Rate Limiter', () => {
  test('first request passes immediately', async () => {
    const limiter = new RateLimiter(100);
    const start = Date.now();
    await limiter.waitForSlot();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(50);
  });

  test('second request is delayed', async () => {
    const limiter = new RateLimiter(100);
    await limiter.waitForSlot();

    const start = Date.now();
    await limiter.waitForSlot();
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(50); // some tolerance
  });

  test('backoff doubles the delay', () => {
    const limiter = new RateLimiter(100);
    expect(limiter.getDelayMs()).toBe(100);

    limiter.backoff();
    expect(limiter.getDelayMs()).toBe(200);

    limiter.backoff();
    expect(limiter.getDelayMs()).toBe(400);
  });

  test('backoff caps at 60000ms', () => {
    const limiter = new RateLimiter(50000);
    limiter.backoff();
    expect(limiter.getDelayMs()).toBe(60000);
  });

  test('reset returns to configured delay', () => {
    const limiter = new RateLimiter(100);
    limiter.backoff();
    limiter.backoff();
    expect(limiter.getDelayMs()).toBe(400);

    limiter.reset();
    expect(limiter.getDelayMs()).toBe(100);
  });
});
