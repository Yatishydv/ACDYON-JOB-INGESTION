import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import InfoTooltip from './InfoTooltip';

export default function ControlPanel({ onRunComplete, events = [] }) {
  const [ingesting, setIngesting] = useState({});
  const [showProgress, setShowProgress] = useState(false);

  const lastEventAtClick = useRef(null);
  const minTimeDone = useRef(true);
  const completionEventSeen = useRef(true);

  const checkAndClearLoading = () => {
    if (minTimeDone.current && completionEventSeen.current) {
      setIngesting({});
      setShowProgress(false);
      if (onRunComplete) onRunComplete();
    }
  };

  // Watch for completion events via WebSocket
  useEffect(() => {
    if (events.length > 0) {
      const latest = events[0];
      
      // Ignore stale events from before we clicked the button!
      if (latest._id !== lastEventAtClick.current) {
        if (['INGESTION_COMPLETED', 'FETCH_FAILED', 'SOURCE_UNAVAILABLE'].includes(latest.type)) {
          completionEventSeen.current = true;
          checkAndClearLoading();
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  const runIngestion = async (source) => {
    lastEventAtClick.current = events.length > 0 ? events[0]._id : null;
    minTimeDone.current = false;
    completionEventSeen.current = false;
    
    setIngesting(prev => ({ ...prev, [source]: true }));
    setShowProgress(true);
    
    // Enforce a minimum 1.2s spin so the UI doesn't flicker on fast connections
    setTimeout(() => {
      minTimeDone.current = true;
      checkAndClearLoading();
    }, 1200);

    try {
      await api.triggerIngestion(source);
    } catch (err) {
      console.error(err);
      minTimeDone.current = true;
      completionEventSeen.current = true;
      checkAndClearLoading();
    }
  };

  const simulateSandbox = async (type) => {
    lastEventAtClick.current = events.length > 0 ? events[0]._id : null;
    minTimeDone.current = false;
    completionEventSeen.current = false;

    setIngesting(prev => ({ ...prev, sandbox: true }));
    setShowProgress(true);
    
    setTimeout(() => {
      minTimeDone.current = true;
      checkAndClearLoading();
    }, 1200);

    try {
      await api.simulateSandbox(type);
    } catch (err) {
      console.error(err);
      minTimeDone.current = true;
      completionEventSeen.current = true;
      checkAndClearLoading();
    }
  };

  return (
    <div className="bg-slate-50/90 backdrop-blur-xl border border-white/80 rounded-[1.5rem] p-6 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15),inset_0_4px_3px_rgba(255,255,255,1),inset_0_-6px_12px_rgba(0,0,0,0.06)] mb-8 relative transition-all hover:z-50">
      
      {/* Cool Progress Loader Overlay */}
      {showProgress && (
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 z-50 rounded-t-[1.5rem] overflow-hidden">
          <div className="h-full bg-indigo-500 animate-pulse w-full origin-left" style={{ animation: 'progress 1.5s ease-in-out infinite' }}></div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          Ingestion Control
          <InfoTooltip text="Orchestrates the ingestion pipeline. Triggers the backend IngestionService, which manages API fetching, rate limit detection, and payload normalization using an Adapter pattern." />
        </h2>
      </div>
      
      <div className="flex flex-wrap gap-4">
        {/* Arbeitnow Button */}
        <button
          onClick={() => runIngestion('arbeitnow')}
          disabled={Object.values(ingesting).some(Boolean)}
          className="relative overflow-hidden flex items-center gap-3 bg-[#1a1b1e] hover:bg-black text-white px-6 py-3 rounded-full font-semibold transition-all disabled:opacity-50"
        >
          {ingesting['arbeitnow'] && (
            <div className="absolute inset-0 bg-indigo-500/20 animate-pulse"></div>
          )}
          <div className="relative z-10 flex items-center gap-3">
            {ingesting['arbeitnow'] ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            )}
            <span>{ingesting['arbeitnow'] ? 'Processing...' : 'Run Arbeitnow'}</span>
          </div>
        </button>

        {/* RemoteOK Button */}
        <button
          onClick={() => runIngestion('remoteok')}
          disabled={Object.values(ingesting).some(Boolean)}
          className="relative overflow-hidden flex items-center gap-3 bg-[#1a1b1e] hover:bg-black text-white px-6 py-3 rounded-full font-semibold transition-all disabled:opacity-50"
        >
          {ingesting['remoteok'] && (
            <div className="absolute inset-0 bg-cyan-500/20 animate-pulse"></div>
          )}
          <div className="relative z-10 flex items-center gap-3">
            {ingesting['remoteok'] ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            <span>{ingesting['remoteok'] ? 'Processing...' : 'Run RemoteOK'}</span>
          </div>
        </button>

        <div className="w-px bg-slate-200 mx-2 hidden sm:block"></div>

        {/* Sandbox Simulation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => simulateSandbox('normal')}
            disabled={Object.values(ingesting).some(Boolean)}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-emerald-400 text-slate-700 px-4 py-3 rounded-full font-semibold transition-all disabled:opacity-50"
            title="Simulate Normal"
          >
            {ingesting['sandbox'] ? (
              <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            )}
            <span className="hidden md:inline">Sandbox Normal</span>
          </button>
          
          <button
            onClick={() => simulateSandbox('ratelimit')}
            disabled={Object.values(ingesting).some(Boolean)}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-orange-400 text-slate-700 px-4 py-3 rounded-full font-semibold transition-all disabled:opacity-50"
            title="Simulate 429 Rate Limit"
          >
            {ingesting['sandbox'] ? (
               <div className="w-4 h-4 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
            ) : (
               <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            <span className="hidden md:inline">Sandbox 429</span>
          </button>
        </div>
      </div>
      
      {/* CSS Animation for progress bar */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          0% { transform: scaleX(0); transform-origin: left; }
          50% { transform: scaleX(1); transform-origin: left; }
          50.1% { transform: scaleX(1); transform-origin: right; }
          100% { transform: scaleX(0); transform-origin: right; }
        }
      `}} />
    </div>
  );
}
