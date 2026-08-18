export default function StatusBadge({ status }) {
  const styles = {
    HEALTHY: 'bg-emerald-900/40 text-emerald-400 border-emerald-700/50',
    DEGRADED: 'bg-amber-900/40 text-amber-400 border-amber-700/50',
    RATE_LIMITED: 'bg-orange-900/40 text-orange-400 border-orange-700/50',
    UNAVAILABLE: 'bg-red-900/40 text-red-400 border-red-700/50',
    FAILED: 'bg-red-900/40 text-red-400 border-red-700/50',
    SUCCESS: 'bg-emerald-900/40 text-emerald-400 border-emerald-700/50',
    PARTIAL: 'bg-amber-900/40 text-amber-400 border-amber-700/50',
    RUNNING: 'bg-blue-900/40 text-blue-400 border-blue-700/50',
    CLOSED: 'bg-emerald-900/40 text-emerald-400 border-emerald-700/50',
    OPEN: 'bg-red-900/40 text-red-400 border-red-700/50',
    HALF_OPEN: 'bg-amber-900/40 text-amber-400 border-amber-700/50',
  };

  const dotColors = {
    HEALTHY: 'bg-emerald-400',
    DEGRADED: 'bg-amber-400',
    RATE_LIMITED: 'bg-orange-400',
    UNAVAILABLE: 'bg-red-400',
    FAILED: 'bg-red-400',
    SUCCESS: 'bg-emerald-400',
    PARTIAL: 'bg-amber-400',
    RUNNING: 'bg-blue-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
        styles[status] || 'bg-slate-700 text-slate-300 border-slate-600'
      }`}
    >
      {dotColors[status] && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status]} ${status === 'RUNNING' ? 'animate-pulse' : ''}`} />
      )}
      {status}
    </span>
  );
}
