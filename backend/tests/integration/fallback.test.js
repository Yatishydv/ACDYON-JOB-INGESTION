import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import { runIngestion } from '../../src/ingestion/ingestion.service.js';
import ArbeitnowAdapter from '../../src/adapters/arbeitnow/arbeitnow.adapter.js';
import IngestionRun from '../../src/models/IngestionRun.js';
import IngestionEvent from '../../src/models/IngestionEvent.js';
import SourceHealth from '../../src/models/SourceHealth.js';
import { resetCircuit } from '../../src/resilience/circuit-breaker.js';
import { updateSourceHealth } from '../../src/resilience/source-health.js';

import config from '../../src/config/env.js';

describe('Integration: Fallback and Circuit Breaker', () => {
  beforeAll(async () => {
    config.ingestion.retryBaseDelayMs = 10;
    config.ingestion.retryMaxDelayMs = 20;
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobpulse_test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await IngestionRun.deleteMany({});
    await IngestionEvent.deleteMany({});
    await SourceHealth.deleteMany({});
    resetCircuit('arbeitnow');
  });

  test('primary failure falls back to sandbox', async () => {
    const primaryAdapter = new ArbeitnowAdapter();
    
    // Force circuit breaker close to opening
    for (let i = 0; i < 4; i++) {
      await updateSourceHealth('arbeitnow', { success: false, statusCode: 503 });
    }

    // Force circuit breaker open by simulating repeated failures
    const mockFetch = jest.fn().mockRejectedValue(Object.assign(new Error('Network Error'), { retryable: true, statusCode: 503 }));
    primaryAdapter.fetchJobs = mockFetch;

    const run = await runIngestion(primaryAdapter, {});

    // It should have failed the primary and fallen back, but since we didn't mock the fallback's fetch, 
    // it will try to hit the actual sandbox server or fail if it's not running.
    // For this test, we just want to see if the fallback was activated in events.
    const events = await IngestionEvent.find({ runId: run.runId });
    console.log("ALL EVENTS:", events.map(e => ({ type: e.type, source: e.source, msg: e.message })));
    
    const fallbackEvent = events.find(e => e.type === 'FALLBACK_ACTIVATED');
    expect(fallbackEvent).toBeDefined();
    expect(fallbackEvent.source).toEqual('sandbox');
  }, 15000);
});
