import React from 'react';

export function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse h-full min-h-[200px] flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
      </div>
      <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2 mb-6"></div>
      <div className="mt-auto flex flex-wrap gap-2">
        <div className="h-6 bg-slate-200 rounded-full w-20"></div>
        <div className="h-6 bg-slate-200 rounded-full w-24"></div>
      </div>
    </div>
  );
}

export function SourceHealthSkeleton() {
  return (
    <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm animate-pulse flex flex-col h-full min-h-[160px]">
      <div className="flex justify-between items-start mb-6">
        <div className="h-6 bg-slate-200 rounded w-1/2"></div>
        <div className="h-5 w-5 bg-slate-200 rounded-full"></div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        </div>
        <div>
          <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        </div>
      </div>
      <div className="mt-auto h-6 bg-slate-200 rounded-full w-1/4"></div>
    </div>
  );
}

export function HistoryCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm animate-pulse mb-6 flex flex-col md:flex-row gap-6 items-center">
      <div className="flex-1 w-full">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="flex gap-4">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        </div>
      </div>
      <div className="flex gap-4 w-full md:w-auto">
        <div className="h-16 w-24 bg-slate-200 rounded-2xl"></div>
        <div className="h-16 w-24 bg-slate-200 rounded-2xl"></div>
      </div>
    </div>
  );
}
