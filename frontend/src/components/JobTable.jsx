function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString();
}

export default function JobTable({ jobs, pagination, onPageChange }) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-8 text-center">
        <p className="text-slate-400 text-lg">No jobs available yet.</p>
        <p className="text-slate-500 text-sm mt-1">Run an ingestion to retrieve the latest listings.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-900/50 text-slate-400 uppercase text-xs tracking-wider">
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-center">Remote</th>
              <th className="px-4 py-3 text-left">Published</th>
              <th className="px-4 py-3 text-center">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {jobs.map((job) => (
              <tr key={job._id} className="hover:bg-slate-700/20 transition-colors">
                <td className="px-4 py-3">
                  <span className="text-slate-200 font-medium">{job.title}</span>
                  {job.tags && job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {job.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-xs px-1.5 py-0.5 bg-indigo-900/30 text-indigo-300 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-300">{job.company || '—'}</td>
                <td className="px-4 py-3 text-slate-300">{job.location || '—'}</td>
                <td className="px-4 py-3 text-center">
                  {job.remote ? (
                    <span className="text-xs px-2 py-0.5 bg-emerald-900/30 text-emerald-400 rounded-full">Remote</span>
                  ) : (
                    <span className="text-xs text-slate-500">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-400">{formatDate(job.publishedAt)}</td>
                <td className="px-4 py-3 text-center">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 text-xs"
                  >
                    View ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50">
          <span className="text-xs text-slate-400">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 text-xs rounded bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 text-xs rounded bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
