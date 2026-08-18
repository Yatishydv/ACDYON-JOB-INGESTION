import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import JobCard from '../components/JobCard';
import { JobCardSkeleton } from '../components/SkeletonLoader';

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to load jobs from IDs in localStorage
  const fetchSavedJobs = async () => {
    try {
      const savedIds = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      if (savedIds.length === 0) {
        setSavedJobs([]);
        setLoading(false);
        return;
      }

      const jobPromises = savedIds.map(id => api.getJobById(id).catch(() => null));
      const jobs = await Promise.all(jobPromises);
      
      // Filter out nulls (in case a job was deleted) and extract the 'data' field
      setSavedJobs(jobs.filter(j => j && j.data).map(j => j.data));
    } catch (err) {
      console.error("Failed to load saved jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();

    // Listen for local storage changes across tabs
    const handleStorageChange = (e) => {
      if (e.key === 'savedJobs') {
        fetchSavedJobs();
      }
    };
    
    // We also listen for a custom event from JobCard if we toggle it on this page itself
    const handleLocalChange = () => fetchSavedJobs();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('savedJobsChanged', handleLocalChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('savedJobsChanged', handleLocalChange);
    };
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Saved Jobs</h1>
        <p className="text-slate-500 mt-2">Jobs you've bookmarked for later.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <JobCardSkeleton key={i} />)}
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <h3 className="text-lg font-bold text-slate-700">No saved jobs yet</h3>
          <p className="text-slate-500 mt-1">Click the bookmark icon on any job to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {savedJobs.map((job, index) => (
            <JobCard key={job._id} job={job} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
