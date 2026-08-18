import mongoose from 'mongoose';
import { updateSourceHealth, getOrCreateSourceHealth } from '../../src/resilience/source-health.js';
import SourceHealth from '../../src/models/SourceHealth.js';

describe('Integration: Source Health State Machine', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobpulse_test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await SourceHealth.deleteMany({});
  });

  test('transitions to DEGRADED after 2 failures', async () => {
    const source = 'test-source';
    
    await updateSourceHealth(source, { success: false, statusCode: 500 });
    let health = await getOrCreateSourceHealth(source);
    expect(health.status).toBe('HEALTHY'); // 1 failure

    await updateSourceHealth(source, { success: false, statusCode: 500 });
    health = await getOrCreateSourceHealth(source);
    expect(health.status).toBe('DEGRADED'); // 2 failures
  });

  test('transitions to UNAVAILABLE after 5 failures', async () => {
    const source = 'test-source-2';
    
    for (let i = 0; i < 5; i++) {
      await updateSourceHealth(source, { success: false, statusCode: 500 });
    }
    
    const health = await getOrCreateSourceHealth(source);
    expect(health.status).toBe('UNAVAILABLE');
  });

  test('recovers to HEALTHY on success', async () => {
    const source = 'test-source-3';
    
    for (let i = 0; i < 5; i++) {
      await updateSourceHealth(source, { success: false, statusCode: 500 });
    }
    
    let health = await getOrCreateSourceHealth(source);
    expect(health.status).toBe('UNAVAILABLE');

    await updateSourceHealth(source, { success: true });
    health = await getOrCreateSourceHealth(source);
    expect(health.status).toBe('HEALTHY');
    expect(health.consecutiveFailures).toBe(0);
  });
});
