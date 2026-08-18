import { useState, useEffect } from 'react';
import { api } from '../services/api';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDuration(ms) {
  if (!ms) return '—';
  return `${(ms / 1000).toFixed(1)}s`;
}

function getStatusColor(status) {
  if (status === 'SUCCESS') return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
  if (status === 'FAILED') return 'bg-red-500/10 text-red-600 border-red-200';
  if (status === 'RUNNING') return 'bg-blue-500/10 text-blue-600 border-blue-200';
  return 'bg-slate-500/10 text-slate-600 border-slate-200';
}

function getStatusIcon(status) {
  if (status === 'SUCCESS') return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
  if (status === 'FAILED') return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
  if (status === 'RUNNING') return (
    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
  );
  return null;
}

export default function IngestionHistory() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRuns() {
      try {
        const res = await api.getIngestionRuns(50);
        setRuns(res.data || []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRuns();
    const interval = setInterval(fetchRuns, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12 font-sans">
      <div className="mb-12 flex flex-col items-center text-center">
        <h1 className="text-[2.5rem] font-bold text-slate-900 tracking-tight leading-none mb-4">Ingestion Logs</h1>
        <p className="text-lg font-medium text-slate-500 max-w-lg">
          A complete timeline of all automated data synchronizations across your external sources.
        </p>
      </div>

      {error && (
        <div className="mb-8 px-6 py-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium shadow-sm">
          {error}
        </div>
      )}

      {loading && runs.length === 0 ? (
        <div className="flex justify-center py-32">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : runs.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No History Recorded</h3>
          <p className="text-slate-500">Run an ingestion pipeline from the dashboard to populate logs.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {runs.map((run) => (
            <div 
              key={run.runId} 
              className="bg-white border border-slate-200 rounded-3xl p-6 transition-all hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 group relative overflow-hidden"
            >
              {/* Left Color Accent Line based on status */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${run.status === 'SUCCESS' ? 'bg-emerald-500' : run.status === 'FAILED' ? 'bg-red-500' : 'bg-blue-500'}`} />
              
              <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                
                {/* Meta block */}
                <div className="flex items-center gap-6 min-w-[280px]">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-2xl border shadow-sm shrink-0 ${getStatusColor(run.status)}`}>
                    {getStatusIcon(run.status)}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 capitalize leading-tight mb-1">
                      {run.source}
                    </h4>
                    <div className="text-sm font-medium text-slate-500">
                      {formatDate(run.startedAt)}
                    </div>
                  </div>
                </div>

                {/* Metrics block */}
                <div className="grid grid-cols-4 gap-4 flex-1 w-full bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Fetched</span>
                    <span className="text-lg font-bold text-slate-900">{run.fetched}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Accepted</span>
                    <span className="text-lg font-bold text-emerald-600">{run.accepted}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">Duplicates</span>
                    <span className="text-lg font-bold text-amber-500">{run.duplicates}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-1">Rejected</span>
                    <span className="text-lg font-bold text-red-500">{run.rejected}</span>
                  </div>
                </div>

                {/* Duration block */}
                <div className="flex items-center justify-end min-w-[100px]">
                  <div className="text-sm font-bold text-slate-400 group-hover:text-slate-600 transition-colors bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    {formatDuration(run.durationMs)}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
