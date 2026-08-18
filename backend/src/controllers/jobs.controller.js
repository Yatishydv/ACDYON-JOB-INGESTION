import Job from '../models/Job.js';
import logger from '../utils/logger.js';

/**
 * Jobs Controller
 */
export const jobsController = {
  /**
   * GET /api/jobs — Paginated job listing
   */
  async getJobs(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
      const skip = (page - 1) * limit;

      const filter = {};
      const andConditions = [];

      if (req.query.q) {
        andConditions.push({ title: { $regex: req.query.q, $options: 'i' } });
      }

      if (req.query.source) {
        const sources = req.query.source.split(',').map(s => s.trim());
        andConditions.push({ source: { $in: sources } });
      }

      if (req.query.roles) {
        const roles = req.query.roles.split(',').map(r => r.trim());
        const roleRegex = new RegExp(`(${roles.join('|')})`, 'i');
        andConditions.push({
          $or: [
            { title: { $regex: roleRegex } },
            { tags: { $regex: roleRegex } }
          ]
        });
      }

      if (andConditions.length > 0) {
        filter.$and = andConditions;
      }

      const [jobs, total] = await Promise.all([
        Job.find(filter)
          .sort({ publishedAt: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('-description')
          .lean(),
        Job.countDocuments(filter),
      ]);

      res.json({
        data: jobs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/jobs/:id — Single job detail
   */
  async getJobById(req, res, next) {
    try {
      const job = await Job.findById(req.params.id).lean();

      if (!job) {
        return res.status(404).json({ error: { message: 'Job not found' } });
      }

      res.json({ data: job });
    } catch (error) {
      next(error);
    }
  },
};
