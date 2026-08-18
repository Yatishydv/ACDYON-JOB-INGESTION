export default function IngestionSummary({ run }) {
  if (!run) {
    return (
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 text-center text-slate-400">
        No ingestion runs yet. Trigger one to get started.
      </div>
    );
  }

  const stats = [
    { label: 'Fetched', value: run.fetched, color: 'text-blue-400' },
    { label: 'Accepted', value: run.accepted, color: 'text-emerald-400' },
    { label: 'Duplicates', value: run.duplicates, color: 'text-amber-400' },
    { label: 'Rejected', value: run.rejected, color: 'text-red-400' },
  ];

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
      <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
        Last Ingestion Summary
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
      {run.durationMs > 0 && (
        <p className="text-xs text-slate-500 mt-3 text-center">
          Completed in {(run.durationMs / 1000).toFixed(1)}s • Source: {run.source}
        </p>
      )}
    </div>
  );
}
