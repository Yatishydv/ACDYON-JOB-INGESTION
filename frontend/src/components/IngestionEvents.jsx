import InfoTooltip from './InfoTooltip';

const eventIcons = {
  INGESTION_STARTED: '🚀',
  FETCH_SUCCESS: '✅',
  FETCH_FAILED: '❌',
  RATE_LIMIT_DETECTED: '🚫',
  RETRY_SCHEDULED: '🔄',
  SCHEMA_VALIDATION_FAILED: '⚠️',
  EMPTY_RESPONSE_DETECTED: '📭',
  JOB_ACCEPTED: '✅',
  JOB_REJECTED: '❌',
  DUPLICATE_DETECTED: '🔁',
  SOURCE_DEGRADED: '⚠️',
  SOURCE_UNAVAILABLE: '🔴',
  FALLBACK_ACTIVATED: '🔀',
  CIRCUIT_OPEN: '🔓',
  CIRCUIT_HALF_OPEN: '🔶',
  CIRCUIT_CLOSED: '🟢',
  INGESTION_COMPLETED: '🏁',
};

const eventColors = {
  FETCH_SUCCESS: 'border-emerald-200 bg-emerald-50',
  JOB_ACCEPTED: 'border-emerald-200 bg-emerald-50',
  INGESTION_COMPLETED: 'border-emerald-200 bg-emerald-50',
  CIRCUIT_CLOSED: 'border-emerald-200 bg-emerald-50',
  FETCH_FAILED: 'border-red-200 bg-red-50',
  JOB_REJECTED: 'border-red-200 bg-red-50',
  SOURCE_UNAVAILABLE: 'border-red-200 bg-red-50',
  RATE_LIMIT_DETECTED: 'border-orange-200 bg-orange-50',
  SCHEMA_VALIDATION_FAILED: 'border-amber-200 bg-amber-50',
  EMPTY_RESPONSE_DETECTED: 'border-amber-200 bg-amber-50',
  SOURCE_DEGRADED: 'border-amber-200 bg-amber-50',
  FALLBACK_ACTIVATED: 'border-blue-200 bg-blue-50',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function IngestionEvents({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-500 shadow-sm h-full flex items-center justify-center min-h-0">
        No events currently streaming.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm h-full flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto pr-2 space-y-2.5 custom-scrollbar min-h-0">
        {events.map((event, i) => (
          <div
            key={event._id || i}
            className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${
              eventColors[event.type] || 'border-slate-100 bg-slate-50'
            }`}
          >
            <span className="text-base mt-0.5">{eventIcons[event.type] || '📌'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-slate-800 break-words mb-1 leading-snug">
                {event.message}
              </p>
              <div className="flex items-center justify-between text-[10px] font-medium text-slate-500">
                <span className="uppercase tracking-wider bg-white/50 px-1.5 py-0.5 rounded border border-slate-200/50">
                  {event.source}
                </span>
                <span>{timeAgo(event.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
