import React from 'react';

const COLORS = [
  'bg-[#FFEcd1]', // Peach
  'bg-[#d5f6e3]', // Mint green
  'bg-[#e9dcfc]', // Lavender
  'bg-[#d9f2fc]', // Light blue
  'bg-[#fce1f0]', // Pink
  'bg-[#f4f5f7]', // Light grey
];

export default function JobCard({ job, index }) {
  // Cycle through colors based on index
  const bgColor = COLORS[index % COLORS.length];

  // Formatting date
  const dateStr = new Date(job.publishedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const [isSaved, setIsSaved] = React.useState(() => {
    const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    return saved.includes(job._id);
  });

  const toggleSave = () => {
    const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    let newSaved;
    if (isSaved) {
      newSaved = saved.filter(id => id !== job._id);
    } else {
      newSaved = [...saved, job._id];
    }
    localStorage.setItem('savedJobs', JSON.stringify(newSaved));
    setIsSaved(!isSaved);
    window.dispatchEvent(new Event('savedJobsChanged'));
  };

  return (
    <div className={`rounded-3xl p-6 flex flex-col justify-between h-full transition-all duration-300 border border-white/80 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.15),inset_0_3px_2px_rgba(255,255,255,0.8),inset_0_-5px_10px_rgba(0,0,0,0.08)] hover:-translate-y-2 hover:shadow-[0_25px_40px_-5px_rgba(0,0,0,0.2),inset_0_3px_2px_rgba(255,255,255,0.9),inset_0_-5px_10px_rgba(0,0,0,0.08)] ${bgColor}`}>
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700">
            {dateStr}
          </div>
          <button 
            onClick={toggleSave}
            className={`w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors shadow-sm ${
              isSaved 
                ? 'bg-[#1a1b1e] text-white hover:bg-black' 
                : 'bg-white/60 text-slate-700 hover:bg-white'
            }`}
          >
            <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isSaved ? 1 : 2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        <div className="mb-2 text-sm font-semibold text-slate-600">
          {job.company}
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 leading-tight mb-4 line-clamp-2">
          {job.title}
        </h3>

        <div className="flex flex-wrap gap-2 mb-6">
          {job.remote && (
            <span className="px-3 py-1 bg-white/40 border border-white/50 rounded-full text-xs font-medium text-slate-700">
              Remote
            </span>
          )}
          {job.tags && job.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-3 py-1 bg-white/40 border border-white/50 rounded-full text-xs font-medium text-slate-700 truncate max-w-[120px]">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-end justify-between mt-4">
        <div>
          <div className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            {job.source}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-1 max-w-[150px] truncate" title={job.location}>
            {job.location || 'Location Not Specified'}
          </div>
        </div>
        <a 
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#1a1b1e] hover:bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
        >
          Details
        </a>
      </div>
    </div>
  );
}
