import mongoose from 'mongoose';

const SOURCE_STATUSES = ['HEALTHY', 'DEGRADED', 'RATE_LIMITED', 'UNAVAILABLE', 'FAILED'];

const sourceHealthSchema = new mongoose.Schema({
  source: { type: String, required: true, unique: true },
  status: { type: String, enum: SOURCE_STATUSES, default: 'HEALTHY' },
  lastAttemptAt: { type: Date, default: null },
  lastSuccessAt: { type: Date, default: null },
  consecutiveFailures: { type: Number, default: 0 },
  lastError: { type: String, default: null },
  lastStatusCode: { type: Number, default: null },
  averageLatencyMs: { type: Number, default: 0 },
  totalRequests: { type: Number, default: 0 },
  totalFailures: { type: Number, default: 0 },
});

const SourceHealth = mongoose.model('SourceHealth', sourceHealthSchema);

export { SOURCE_STATUSES };
export default SourceHealth;
