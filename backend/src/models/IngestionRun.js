import mongoose from 'mongoose';

const ingestionRunSchema = new mongoose.Schema({
  runId: { type: String, required: true, unique: true },
  source: { type: String, required: true },
  startedAt: { type: Date, required: true },
  completedAt: { type: Date, default: null },
  status: {
    type: String,
    enum: ['RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED'],
    default: 'RUNNING',
  },
  fetched: { type: Number, default: 0 },
  accepted: { type: Number, default: 0 },
  rejected: { type: Number, default: 0 },
  duplicates: { type: Number, default: 0 },
  errors: { type: [String], default: [] },
  durationMs: { type: Number, default: 0 },
});

ingestionRunSchema.index({ startedAt: -1 });

const IngestionRun = mongoose.model('IngestionRun', ingestionRunSchema);

export default IngestionRun;
