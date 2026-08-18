import mongoose from 'mongoose';
import config from './env.js';
import logger from '../utils/logger.js';

/**
 * Connect to MongoDB with error handling and reconnect logic.
 * Does not crash silently — logs connection state and errors.
 */
export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  
  try {
    await mongoose.connect(config.mongodbUri);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed', { error: error.message });
    // Don't exit process in serverless environment
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { error: err.message });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });
}

/**
 * Check if the database is currently connected.
 * @returns {{ connected: boolean, state: string }}
 */
export function getDatabaseHealth() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = states[mongoose.connection.readyState] || 'unknown';
  return {
    connected: mongoose.connection.readyState === 1,
    state,
  };
}
