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

      // Run ingestion
      const runPromise = runIngestion(adapter, { scenario });

      if (process.env.VERCEL) {
        // In serverless environments, background execution halts after response is sent.
        // We MUST await it, otherwise it only resumes during subsequent polling requests!
        await runPromise;
        res.status(200).json({
          message: 'Ingestion completed',
          source,
          scenario: source === 'sandbox' ? scenario : undefined,
        });
      } else {
        // In standard Node.js, return immediately and let it run in the background
        res.status(202).json({
          message: 'Ingestion started',
          source,
          scenario: source === 'sandbox' ? scenario : undefined,
        });

        runPromise.catch((err) => {
          logger.error('Background ingestion error', { error: err.message });
        });
      }
    } catch (error) {
      next(error);
    }
  },
};
