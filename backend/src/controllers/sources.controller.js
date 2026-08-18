import { getAllSourceHealth, getSourceHealthByName } from '../resilience/source-health.js';
import { getCircuitState } from '../resilience/circuit-breaker.js';

/**
 * Sources Controller
 */
export const sourcesController = {
  /**
   * GET /api/sources — List all configured sources with health
   */
  async getSources(req, res, next) {
    try {
      const healthRecords = await getAllSourceHealth();

      // Configured sources with their health
      const sources = [
        {
          name: 'arbeitnow',
          displayName: 'Arbeitnow',
          type: 'Public API',
          url: 'https://www.arbeitnow.com',
          description: 'European job board with public API',
          health: healthRecords.find((h) => h.source === 'arbeitnow') || { status: 'HEALTHY' },
          circuitBreaker: getCircuitState('arbeitnow'),
        },
        {
          name: 'remoteok',
          displayName: 'RemoteOK',
          type: 'Public API',
          url: 'https://remoteok.com',
          description: 'Global remote job board',
          health: healthRecords.find((h) => h.source === 'remoteok') || { status: 'HEALTHY' },
          circuitBreaker: getCircuitState('remoteok'),
        },
        {
          name: 'sandbox',
          displayName: 'Sandbox',
          type: 'Controlled',
          url: null,
          description: 'Local sandbox for failure simulation',
          health: healthRecords.find((h) => h.source === 'sandbox') || { status: 'HEALTHY' },
          circuitBreaker: getCircuitState('sandbox'),
        },
      ];

      res.json({ data: sources });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/sources/:source/health — Health for a specific source
   */
  async getHealth(req, res, next) {
    try {
      const { source } = req.params;
      const health = await getSourceHealthByName(source);
      const circuit = getCircuitState(source);

      res.json({
        data: {
          ...health.toObject(),
          circuitBreaker: circuit,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
