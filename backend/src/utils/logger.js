/**
 * Structured logger with levels and timestamps.
 * Keeps logs understandable and grep-friendly.
 */
const logger = {
  info(message, data = {}) {
    console.log(JSON.stringify({ level: 'INFO', timestamp: new Date().toISOString(), message, ...data }));
  },

  warn(message, data = {}) {
    console.warn(JSON.stringify({ level: 'WARN', timestamp: new Date().toISOString(), message, ...data }));
  },

  error(message, data = {}) {
    console.error(JSON.stringify({ level: 'ERROR', timestamp: new Date().toISOString(), message, ...data }));
  },

  debug(message, data = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify({ level: 'DEBUG', timestamp: new Date().toISOString(), message, ...data }));
    }
  },
};

export default logger;
