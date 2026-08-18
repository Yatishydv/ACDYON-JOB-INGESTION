import express from 'express';
import cors from 'cors';
import config from './config/env.js';
import { connectDatabase } from './config/database.js';
import { requestLogger } from './middleware/request-logger.js';
import { errorHandler } from './middleware/error-handler.js';
import healthRoutes from './routes/health.routes.js';
import jobsRoutes from './routes/jobs.routes.js';
import ingestionRoutes from './routes/ingestion.routes.js';
import sourcesRoutes from './routes/sources.routes.js';
import logger from './utils/logger.js';

const app = express();

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/ingestion', ingestionRoutes);
app.use('/api/sources', sourcesRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function start() {
  await connectDatabase();

  app.listen(config.port, () => {
    logger.info(`JobPulse backend running on port ${config.port}`);
    logger.info(`Frontend URL: ${config.frontendUrl}`);
  });
}

// Only start the server if not running in a Vercel serverless environment
if (!process.env.VERCEL) {
  start().catch((error) => {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  });
}

export default app;
