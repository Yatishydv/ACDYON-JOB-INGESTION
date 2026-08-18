import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function TopNav() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ totalJobs: 0, lastRun: null });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch global stats for the nav bar
    const fetchStats = async () => {
      try {
        const [jobsRes, runsRes] = await Promise.all([
          api.getJobs(1, 1),
          api.getIngestionRuns(1)
        ]);
        setStats({
          totalJobs: jobsRes.pagination?.total || 0,
          lastRun: runsRes.data?.[0]?.startedAt || null
        });
      } catch (err) {
        console.error("Failed to fetch nav stats", err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/jobs?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate(`/jobs`);
    }
  };

  const linkClass = ({ isActive }) =>
    `px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
      isActive
        ? 'border-white text-white'
        : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
    }`;

  return (
    <div id="top-nav" className="w-full font-sans sticky top-0 z-50">
      {/* Top Row - Primary Nav */}
      <div className="bg-[#1a1b1e] text-white border-b border-slate-800">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between h-16">
          
          {/* Logo & Links */}
          <div className="flex items-center gap-10">
            <div className="tour-dashboard-title flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-[#1a1b1e] rounded-sm"></div>
              </div>
              <span className="text-xl font-bold tracking-tight">JobPulse</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6 h-full">
              <NavLink to="/" className={linkClass}>Dashboard</NavLink>
              <NavLink to="/jobs" className={({isActive}) => `tour-nav-alljobs ${linkClass({isActive})}`}>All Jobs</NavLink>
              <NavLink to="/saved" className={({isActive}) => `tour-nav-savedjobs ${linkClass({isActive})}`}>Saved Jobs</NavLink>
              <NavLink to="/history" className={linkClass}>Ingestion History</NavLink>
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <a 
              href="https://github.com/Yatishydv/ACDYON-JOB-INGESTION" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="tour-github-link hidden md:flex items-center gap-2 hover:text-white transition-colors border-r border-slate-700 pr-6"
              title="Project Repository"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="font-medium">Repository</span>
            </a>
            <a 
              href="https://github.com/Yatishydv/ACDYON-JOB-INGESTION" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="tour-github-link text-slate-400 hover:text-white transition-colors"
              title="GitHub Repository"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Row - Filter Bar */}
      <div className="bg-[#222327] border-b border-slate-800 text-slate-300">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center gap-4 text-sm overflow-x-auto no-scrollbar">
          
          <form onSubmit={handleSearch} className="flex items-center gap-3 bg-[#1a1b1e] rounded-full px-4 py-2 border border-slate-700/50 min-w-[300px]">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search job titles globally..." 
              className="bg-transparent border-none outline-none text-white placeholder-slate-500 w-full focus:ring-0"
            />
            <button type="submit" className="hidden">Search</button>
          </form>

          <div className="h-6 w-px bg-slate-700 mx-2 hidden sm:block"></div>

          {/* Dynamic Stats instead of fake dropdowns */}
          <div className="flex items-center gap-6 whitespace-nowrap text-slate-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              <span>Total Ingested: <strong className="text-white">{stats.totalJobs}</strong> jobs</span>
            </div>
            
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Last Run: <strong className="text-white">{stats.lastRun ? new Date(stats.lastRun).toLocaleTimeString() : 'Never'}</strong></span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
