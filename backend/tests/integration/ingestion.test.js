import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import { runIngestion } from '../../src/ingestion/ingestion.service.js';
import SandboxAdapter from '../../src/adapters/sandbox/sandbox.adapter.js';
import Job from '../../src/models/Job.js';
import IngestionRun from '../../src/models/IngestionRun.js';
import IngestionEvent from '../../src/models/IngestionEvent.js';
import { resetCircuit } from '../../src/resilience/circuit-breaker.js';

describe('Integration: Ingestion Pipeline', () => {
  beforeAll(async () => {
    // Use an in-memory MongoDB or a specific test database if possible, 
    // but for this example we'll assume the environment is set up for testing.
    // In a real scenario, you'd use something like mongodb-memory-server.
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobpulse_test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await Job.deleteMany({});
    await IngestionRun.deleteMany({});
    await IngestionEvent.deleteMany({});
    resetCircuit('sandbox');
  });

  // Skip the actual network call to the sandbox server by mocking the adapter's fetch method
  test('successful ingestion run stores jobs and logs events', async () => {
    const adapter = new SandboxAdapter('normal');
    
    // Mock the fetchJobs method to avoid actual HTTP calls during unit testing
    adapter.fetchJobs = jest.fn().mockResolvedValue({
      data: [
        {
          slug: 'int-test-1',
          title: 'Integration Test Job 1',
          url: 'https://example.com/1',
        },
        {
          slug: 'int-test-2',
          title: 'Integration Test Job 2',
          url: 'https://example.com/2',
        }
      ],
      meta: { page: 1, hasMore: false, schemaValid: true }
    });

    const run = await runIngestion(adapter, { scenario: 'normal' });

    expect(run.status).toBe('SUCCESS');
    expect(run.fetched).toBe(2);
    expect(run.accepted).toBe(2);

    const jobs = await Job.find({ source: 'sandbox' });
    expect(jobs).toHaveLength(2);
    
    const events = await IngestionEvent.find({ runId: run.runId });
    expect(events.length).toBeGreaterThan(0);
    expect(events.some(e => e.type === 'FETCH_SUCCESS')).toBe(true);
    expect(events.some(e => e.type === 'JOB_ACCEPTED')).toBe(true);
    expect(events.some(e => e.type === 'INGESTION_COMPLETED')).toBe(true);
  });
  
  test('handles schema change gracefully', async () => {
    const adapter = new SandboxAdapter('schema-change');
    
    adapter.fetchJobs = jest.fn().mockRejectedValue(Object.assign(new Error('Schema validation failed'), { schemaChange: true, retryable: false }));

    const run = await runIngestion(adapter, { scenario: 'schema-change' });

    expect(run.status).toBe('FAILED');
    expect(run.fetched).toBe(0);
    
    const events = await IngestionEvent.find({ runId: run.runId });
    expect(events.some(e => e.type === 'SCHEMA_VALIDATION_FAILED')).toBe(true);
  });
});
