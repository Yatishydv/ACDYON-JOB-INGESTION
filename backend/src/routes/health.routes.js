import { Router } from 'express';
import { getDatabaseHealth } from '../config/database.js';

const router = Router();

/**
 * GET /api/health — Application health check
 */
router.get('/', (req, res) => {
  const db = getDatabaseHealth();
  res.json({
    status: db.connected ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: db,
    uptime: process.uptime(),
  });
});

export default router;
