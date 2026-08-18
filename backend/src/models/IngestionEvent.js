import mongoose from 'mongoose';

const EVENT_TYPES = [
  'INGESTION_STARTED',
  'FETCH_SUCCESS',
  'FETCH_FAILED',
  'RATE_LIMIT_DETECTED',
  'RETRY_SCHEDULED',
  'SCHEMA_VALIDATION_FAILED',
  'EMPTY_RESPONSE_DETECTED',
  'JOB_ACCEPTED',
  'JOB_REJECTED',
  'DUPLICATE_DETECTED',
  'SOURCE_DEGRADED',
  'SOURCE_UNAVAILABLE',
  'FALLBACK_ACTIVATED',
  'CIRCUIT_OPEN',
  'CIRCUIT_HALF_OPEN',
  'CIRCUIT_CLOSED',
  'INGESTION_COMPLETED',
];

const ingestionEventSchema = new mongoose.Schema({
  runId: { type: String, default: null },
  source: { type: String, required: true },
  type: { type: String, enum: EVENT_TYPES, required: true },
  message: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now },
});

ingestionEventSchema.index({ timestamp: -1 });
ingestionEventSchema.index({ runId: 1 });

const IngestionEvent = mongoose.model('IngestionEvent', ingestionEventSchema);

export { EVENT_TYPES };
export default IngestionEvent;
