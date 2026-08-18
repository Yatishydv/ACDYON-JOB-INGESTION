const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error?.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // Jobs
  getJobs: (page = 1, limit = 20, q = '', source = '', roles = '') => {
    let url = `/jobs?page=${page}&limit=${limit}`;
    if (q) url += `&q=${encodeURIComponent(q)}`;
    if (source) url += `&source=${encodeURIComponent(source)}`;
    if (roles) url += `&roles=${encodeURIComponent(roles)}`;
    return request(url);
  },
  getJobById: (id) => request(`/jobs/${id}`),

  // Ingestion
  getIngestionRuns: (limit = 20) => request(`/ingestion/runs?limit=${limit}`),
  getIngestionEvents: (limit = 50) => request(`/ingestion/events?limit=${limit}`),
  triggerIngestion: (source = 'arbeitnow', scenario = 'normal') =>
    request(`/ingestion/run?source=${source}&scenario=${scenario}`, { method: 'POST' }),

  // Sources
  getSources: () => request('/sources'),
  getSourceHealth: (source) => request(`/sources/${source}/health`),
};
