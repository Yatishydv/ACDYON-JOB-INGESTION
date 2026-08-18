import logger from '../utils/logger.js';

/**
 * Global error handler middleware.
 * Catches unhandled errors and returns structured JSON responses.
 * Never silently swallows errors.
 */
export function errorHandler(err, req, res, _next) {
  logger.error('Unhandled error', {
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal server error',
      status: statusCode,
    },
  });
}
