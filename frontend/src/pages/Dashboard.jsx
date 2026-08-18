import { useState, useEffect } from 'react';
import { api } from '../services/api';
import SourceHealthCard from '../components/SourceHealthCard';
import AppSidebar from '../components/AppSidebar';
import JobCard from '../components/JobCard';
import ControlPanel from '../components/ControlPanel';
import IngestionEvents from '../components/IngestionEvents';
import InfoTooltip from '../components/InfoTooltip';

export default function Dashboard() {
  const [sources, setSources] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [sourcesRes, jobsRes, eventsRes] = await Promise.all([
        api.getSources(),
        api.getJobs(1, 4), // Fetch top 4 jobs
        api.getIngestionEvents(10) // Fetch top 10 recent events
      ]);
      setSources(sourcesRes.data || []);
      setRecentJobs(jobsRes.data || []);
      setEvents(eventsRes.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Poll more frequently for that "pro" live feel
    return () => clearInterval(interval);
  }, []);

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
          
          {/* Top Row: Ingestion Controls */}
          <div className="mb-12 relative z-20">
            <ControlPanel events={events} onRunComplete={fetchData} />
          </div>

          {/* Middle Row: Source Health & Telemetry */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12 relative z-10">
            
            {/* Source Health (Left, 2 columns) */}
            <div className="tour-source-health xl:col-span-2 relative hover:z-50">
              <h2 className="text-[2rem] font-bold text-slate-900 leading-none mb-6 flex items-center">
                Source Health
                <InfoTooltip text="Real-time monitoring of all external job API sources. The system continually tracks latency and error rates to prevent cascading failures." />
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                {loading && sources.length === 0 ? (
                  <div className="col-span-full py-12 flex justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  sources.map(source => (
                    <SourceHealthCard key={source.name} source={source} />
                  ))
                )}
              </div>
            </div>

            {/* Pipeline Telemetry (Right, 1 column) */}
            <div className="tour-telemetry xl:col-span-1 flex flex-col min-h-0 relative hover:z-50">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <h2 className="text-2xl font-bold text-slate-900 leading-none flex items-center">
                  Pipeline Telemetry
                  <InfoTooltip text="Live feed of all ingestion events, validations, and circuit breaker trips across all sources." />
                </h2>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Active
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="absolute inset-0">
                  <IngestionEvents events={events} />
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Row: Recent Jobs */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[2rem] font-bold text-slate-900 leading-none">
                Recently Ingested
              </h2>
              <a href="/jobs" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                View All →
              </a>
            </div>

            {loading && recentJobs.length === 0 ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm h-[300px] flex flex-col items-center justify-center">
                <h3 className="text-lg font-bold text-slate-800 mb-2">No jobs available</h3>
                <p className="text-slate-500">Run an ingestion above to retrieve the latest listings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-fr">
                {recentJobs.map((job, index) => (
                  <JobCard key={job._id} job={job} index={index} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
