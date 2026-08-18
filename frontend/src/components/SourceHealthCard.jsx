import React from 'react';
import InfoTooltip from './InfoTooltip';

function formatDate(dateStr) {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function SourceHealthCard({ source }) {
  if (!source) return null;

  const health = source.health || {};
  const circuit = source.circuitBreaker || {};

  return (
    <div className="bg-slate-50/90 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.15),inset_0_3px_2px_rgba(255,255,255,1),inset_0_-4px_8px_rgba(0,0,0,0.06)] flex flex-col relative transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_40px_-10px_rgba(0,0,0,0.2),inset_0_3px_2px_rgba(255,255,255,1),inset_0_-4px_8px_rgba(0,0,0,0.06)]">
      
      {/* Top accent line based on health status */}
      <div className={`absolute top-0 left-0 w-full h-[3px] rounded-t-2xl ${health.status === 'HEALTHY' ? 'bg-emerald-400' : health.status === 'RATE_LIMITED' ? 'bg-orange-400' : 'bg-red-400'}`}></div>

      {/* Info Tooltip on absolute top right */}
      <div className="absolute top-5 right-5">
        <InfoTooltip text="Monitors API endpoints using a Circuit Breaker pattern. Tracks consecutive failures, applies exponential backoff during rate limits, and measures average latency." />
      </div>

      <div className="mb-4 shrink-0">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-extrabold text-slate-800 leading-tight">
            {source.displayName}
          </h3>
        </div>
        
        <div className="text-[12px] font-medium text-slate-500 mb-5 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          <span className="truncate">{source.url ? source.url.replace('https://', '') : 'Local simulation'}</span>
        </div>

        {/* Metrics Grid */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-slate-50/70 rounded-xl p-3 border border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Failures</div>
            <div className="text-base font-extrabold text-slate-800">{health.consecutiveFailures || 0}</div>
          </div>
          <div className="flex-1 bg-slate-50/70 rounded-xl p-3 border border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Latency</div>
            <div className="text-base font-extrabold text-slate-800">{health.averageLatencyMs ? `${health.averageLatencyMs}ms` : '—'}</div>
          </div>
        </div>

        {/* Status Badge moved below the grid */}
        <div className="flex">
          <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${health.status === 'HEALTHY' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : health.status === 'RATE_LIMITED' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            {health.status || 'HEALTHY'}
          </div>
        </div>

        {circuit.state && circuit.state !== 'CLOSED' && (
          <div className="mb-3 px-3 py-2 bg-orange-50/80 border border-orange-200/80 rounded-lg">
            <p className="text-xs font-bold text-orange-800 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Circuit: {circuit.state}
            </p>
          </div>
        )}
      </div>

      <div className="mt-auto shrink-0 flex flex-col">
        {health.lastError && (
          <div className="mb-4 px-3 py-2.5 bg-red-50/80 border border-red-200/80 rounded-lg">
            <p className="text-[11px] font-medium text-red-700 break-words whitespace-normal line-clamp-3 leading-snug" title={health.lastError}>
              {health.lastError}
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100/80">
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Last Success</div>
            <div className="text-[11px] font-semibold text-slate-600">{formatDate(health.lastSuccessAt)}</div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Last Attempt</div>
            <div className="text-[11px] font-semibold text-slate-600">{formatDate(health.lastAttemptAt)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
