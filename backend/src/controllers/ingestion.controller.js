import IngestionRun from '../models/IngestionRun.js';
import IngestionEvent from '../models/IngestionEvent.js';
import { runIngestion, isIngestionRunning } from '../ingestion/ingestion.service.js';
import ArbeitnowAdapter from '../adapters/arbeitnow/arbeitnow.adapter.js';
import SandboxAdapter from '../adapters/sandbox/sandbox.adapter.js';
import RemoteokAdapter from '../adapters/remoteok/remoteok.adapter.js';
import logger from '../utils/logger.js';

/**
 * Ingestion Controller
 */
export const ingestionController = {
  /**
   * GET /api/ingestion/runs — Recent ingestion runs
   */
  async getRuns(req, res, next) {
    try {
      const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
      const runs = await IngestionRun.find({})
        .sort({ startedAt: -1 })
        .limit(limit)
        .lean();
      res.json({ data: runs });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/ingestion/events — Recent ingestion events
   */
  async getEvents(req, res, next) {
    try {
      const limit = Math.min(100, parseInt(req.query.limit, 10) || 50);
      const runId = req.query.runId || null;

      const filter = runId ? { runId } : {};
      const events = await IngestionEvent.find(filter)
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
      res.json({ data: events });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/ingestion/run — Trigger an ingestion run
   *
   * Protected against concurrent execution via mutex in ingestion.service.
   *
   * Query params:
   *   source: 'arbeitnow' (default) or 'sandbox'
   *   scenario: sandbox scenario name (default: 'normal')
   */
  async triggerRun(req, res, next) {
    try {
      if (isIngestionRunning()) {
        return res.status(409).json({
          error: { message: 'Ingestion already in progress. Please wait.' },
        });
      }

      const source = req.query.source || req.body?.source || 'arbeitnow';
      const scenario = req.query.scenario || req.body?.scenario || 'normal';

      let adapter;
      if (source === 'sandbox') {
        adapter = new SandboxAdapter(scenario);
      } else if (source === 'remoteok') {
        adapter = new RemoteokAdapter();
      } else {
        adapter = new ArbeitnowAdapter();
      }

      logger.info('Ingestion triggered via API', { source, scenario });

      // Run ingestion asynchronously — don't block the HTTP response
      const runPromise = runIngestion(adapter, { scenario });

      // Return immediately with acknowledgment
      // The dashboard will poll for updates
      res.status(202).json({
        message: 'Ingestion started',
        source,
        scenario: source === 'sandbox' ? scenario : undefined,
      });

      // Let it complete in the background
      runPromise.catch((err) => {
        logger.error('Background ingestion error', { error: err.message });
      });
    } catch (error) {
      next(error);
    }
  },
};
