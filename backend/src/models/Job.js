import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    source: { type: String, required: true, index: true },
    sourceJobId: { type: String, required: true },
    title: { type: String, required: true },
    company: { type: String, default: null },
    location: { type: String, default: null },
    remote: { type: Boolean, default: false },
    description: { type: String, default: null },
    url: { type: String, required: true },
    tags: { type: [String], default: [] },
    publishedAt: { type: Date, default: null },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    contentHash: { type: String, required: true, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one job per source + sourceJobId
jobSchema.index({ source: 1, sourceJobId: 1 }, { unique: true });

// Index for browsing by date
jobSchema.index({ publishedAt: -1 });

const Job = mongoose.model('Job', jobSchema);

export default Job;
