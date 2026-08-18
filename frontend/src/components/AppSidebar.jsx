import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AppSidebar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentSources = searchParams.get('source') ? searchParams.get('source').split(',') : [];
  const currentRoles = searchParams.get('roles') ? searchParams.get('roles').split(',') : [];

  const [isSourceOpen, setIsSourceOpen] = React.useState(true);
  const [isRolesOpen, setIsRolesOpen] = React.useState(false);
  const [showDocs, setShowDocs] = React.useState(false);

  const handleToggle = (paramName, value) => {
    const params = new URLSearchParams(searchParams);
    const currentValues = params.get(paramName) ? params.get(paramName).split(',') : [];
    
    if (currentValues.includes(value)) {
      const newValues = currentValues.filter(v => v !== value);
      if (newValues.length > 0) {
        params.set(paramName, newValues.join(','));
      } else {
        params.delete(paramName);
      }
    } else {
      currentValues.push(value);
      params.set(paramName, currentValues.join(','));
    }
    
    // Always navigate to /jobs so the filter applies even if we are on the dashboard
    navigate(`/jobs?${params.toString()}`);
  };

  const CheckboxIcon = ({ checked }) => (
    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-[#1a1b1e] border-[#1a1b1e] text-white' : 'border-slate-300 text-transparent bg-white group-hover:border-slate-400'}`}>
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );

  return (
    <>
      <div className="w-64 flex-shrink-0 flex flex-col gap-8 hidden lg:flex sticky top-40 self-start">
        {/* Promotional Card */}
        <div className="bg-[#1a1b1e] text-white rounded-[2rem] p-6 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,0 Q50,100 100,0" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M0,50 Q50,0 100,50" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold leading-snug mb-6 relative z-10">
            JobPulse<br/>Control Center
          </h3>
          <button onClick={() => setShowDocs(true)} className="relative z-10 w-full bg-[#7cd4fd] hover:bg-[#5bbce9] text-slate-900 font-semibold py-3 px-4 rounded-xl transition-colors text-sm">
            View Documentation
          </button>
        </div>

        {/* Interactive Filters */}
        <div className="px-2">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-slate-900">Filters</h4>
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>

          <div className="mb-8 border-b border-slate-200 pb-6">
            <button 
              onClick={() => setIsSourceOpen(!isSourceOpen)} 
              className="w-full flex items-center justify-between text-sm font-semibold text-slate-500 mb-4 hover:text-slate-800 transition-colors"
            >
              Data Source
              <svg className={`w-4 h-4 transform transition-transform duration-200 ${isSourceOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className={`flex flex-col gap-3 overflow-hidden transition-all duration-300 ${isSourceOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
              <label className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); handleToggle('source', 'arbeitnow'); }}>
                <CheckboxIcon checked={currentSources.includes('arbeitnow')} />
                <span className={`text-sm font-medium ${currentSources.includes('arbeitnow') ? 'text-slate-900' : 'text-slate-600'} group-hover:text-slate-900 transition-colors`}>Arbeitnow</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); handleToggle('source', 'remoteok'); }}>
                <CheckboxIcon checked={currentSources.includes('remoteok')} />
                <span className={`text-sm font-medium ${currentSources.includes('remoteok') ? 'text-slate-900' : 'text-slate-600'} group-hover:text-slate-900 transition-colors`}>RemoteOK</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); handleToggle('source', 'sandbox'); }}>
                <CheckboxIcon checked={currentSources.includes('sandbox')} />
                <span className={`text-sm font-medium ${currentSources.includes('sandbox') ? 'text-slate-900' : 'text-slate-600'} group-hover:text-slate-900 transition-colors`}>Sandbox</span>
              </label>
            </div>
          </div>

          <div>
            <button 
              onClick={() => setIsRolesOpen(!isRolesOpen)} 
              className="w-full flex items-center justify-between text-sm font-semibold text-slate-500 mb-4 hover:text-slate-800 transition-colors"
            >
              Job Roles
              <svg className={`w-4 h-4 transform transition-transform duration-200 ${isRolesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className={`flex flex-col gap-3 overflow-hidden transition-all duration-300 ${isRolesOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
              <label className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); handleToggle('roles', 'engineer'); }}>
                <CheckboxIcon checked={currentRoles.includes('engineer')} />
                <span className={`text-sm font-medium ${currentRoles.includes('engineer') ? 'text-slate-900' : 'text-slate-600'} group-hover:text-slate-900 transition-colors`}>Engineering</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); handleToggle('roles', 'designer'); }}>
                <CheckboxIcon checked={currentRoles.includes('designer')} />
                <span className={`text-sm font-medium ${currentRoles.includes('designer') ? 'text-slate-900' : 'text-slate-600'} group-hover:text-slate-900 transition-colors`}>Design</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); handleToggle('roles', 'product'); }}>
                <CheckboxIcon checked={currentRoles.includes('product')} />
                <span className={`text-sm font-medium ${currentRoles.includes('product') ? 'text-slate-900' : 'text-slate-600'} group-hover:text-slate-900 transition-colors`}>Product</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); handleToggle('roles', 'marketing'); }}>
                <CheckboxIcon checked={currentRoles.includes('marketing')} />
                <span className={`text-sm font-medium ${currentRoles.includes('marketing') ? 'text-slate-900' : 'text-slate-600'} group-hover:text-slate-900 transition-colors`}>Marketing</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Modal */}
      {showDocs && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#1a1b1e] w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative border border-slate-700 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowDocs(false)} 
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-2 rounded-full"
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white leading-tight">JobPulse Documentation</h2>
                <p className="text-slate-400 text-sm">System Architecture & Capabilities</p>
              </div>
            </div>

            <div className="text-slate-300 space-y-6 text-sm leading-relaxed max-h-[50vh] overflow-y-auto no-scrollbar pr-2">
               <section>
                 <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Problem Statement
                 </h3>
                 <p className="pl-3.5 border-l border-slate-700">Build a system that demonstrates how job listings can be obtained from an online job platform or source that may actively discourage or restrict automated access. The main challenge is: "How can job listing data be obtained repeatedly and reliably from a source that may detect automated access, while respecting the source's restrictions and maintaining a resilient ingestion architecture?"</p>
               </section>
               
               <section>
                 <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Working Mechanism
                 </h3>
                 <p className="pl-3.5 border-l border-slate-700">JobPulse utilizes a modular adapter pattern for resilient data ingestion. It safely fetches data from permitted sources (like Arbeitnow, RemoteOK, or a local Sandbox), applies exponential backoff and rate-limiting to avoid detection triggers, normalizes the data, and securely stores it for consumption.</p>
               </section>
               
               <section>
                 <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div> My Motive
                 </h3>
                 <p className="pl-3.5 border-l border-slate-700">To build a highly resilient pipeline that refuses to silently fail when source structures change or rate limits are hit. The motive is to demonstrate disciplined engineering by recognizing when to stop (e.g. not bypassing authentication) while still maximizing reliability for permitted data extraction.</p>
               </section>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-800">
              <button 
                onClick={() => setShowDocs(false)} 
                className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold py-3.5 px-4 rounded-xl transition-colors shadow-lg shadow-white/5"
              >
                Close Documentation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
