import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/jobpulse',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  sandboxUrl: process.env.SANDBOX_URL || 'http://localhost:4000',

  // Source configuration
  arbeitnow: {
    baseUrl: process.env.ARBEITNOW_BASE_URL || 'https://www.arbeitnow.com/api/job-board-api',
    maxPages: parseInt(process.env.INGESTION_MAX_PAGES, 10) || 3,
  },

  // Ingestion settings
  ingestion: {
    requestDelayMs: parseInt(process.env.REQUEST_DELAY_MS, 10) || 1500,
    maxRetries: parseInt(process.env.MAX_RETRIES, 10) || 3,
    retryBaseDelayMs: 1000,
    retryMaxDelayMs: 30000,
    requestTimeoutMs: 15000,
  },

  // Circuit breaker settings
  circuitBreaker: {
    failureThreshold: 5,
    cooldownMs: 60000,
  },
};

export default config;
