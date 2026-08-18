import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import JobCard from '../components/JobCard';
import AppSidebar from '../components/AppSidebar';

export default function Jobs() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const source = searchParams.get('source') || '';
  const roles = searchParams.get('roles') || '';
  
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  // Reset page when search, source, or roles change
  useEffect(() => {
    setPage(1);
  }, [q, source, roles]);

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        const res = await api.getJobs(page, 24, q, source, roles);
        setJobs(res.data || []);
        setPagination(res.pagination || null);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [page, q, source, roles]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {error && (
        <div className="mb-6 px-4 py-3 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar */}
        <AppSidebar />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          
          {/* Main Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h1 className="text-[2rem] font-bold text-slate-900 leading-none">
                {q ? `Search results for "${q}"` : 'All Jobs'}
              </h1>
              {pagination && (
                <div className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm font-semibold text-slate-600 shadow-sm">
                  {pagination.total}
                </div>
              )}
            </div>
          </div>

          {/* Grid View */}
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span className="ml-4 text-slate-500 font-medium text-lg">Loading jobs...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No jobs found</h3>
              <p className="text-slate-500">Try adjusting your search or run an ingestion.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {jobs.map((job, index) => (
                  <JobCard key={job._id} job={job} index={index} />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-full hover:bg-slate-200 disabled:opacity-50 disabled:hover:bg-transparent text-slate-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="px-4 py-2 bg-white rounded-full text-sm font-semibold text-slate-700 shadow-sm border border-slate-200">
                    Page {page} of {pagination.totalPages}
                  </div>
                  <button 
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="p-2 rounded-full hover:bg-slate-200 disabled:opacity-50 disabled:hover:bg-transparent text-slate-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
