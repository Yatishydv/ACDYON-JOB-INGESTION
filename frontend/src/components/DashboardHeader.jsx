import { useState } from 'react';

export default function DashboardHeader() {
  const [clickCount, setClickCount] = useState(0);
  const [easterEgg, setEasterEgg] = useState(false);

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 7) {
      setEasterEgg(true);
      setTimeout(() => {
        setEasterEgg(false);
        setClickCount(0);
      }, 3000);
    }
  };

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1
            onClick={handleLogoClick}
            className="text-3xl font-bold text-white cursor-default select-none"
            style={{ letterSpacing: '-0.02em' }}
          >
            <span className="text-indigo-400">Job</span>
            <span>Pulse</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Resilient Job Data Ingestion
          </p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <span>Job data source: </span>
          <a
            href="https://www.arbeitnow.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            Arbeitnow
          </a>
        </div>
      </div>

      {easterEgg && (
        <div className="mt-3 px-4 py-2 bg-amber-900/30 border border-amber-600/30 rounded-lg text-amber-300 text-sm text-center animate-pulse">
          Source detected something suspicious 👀
        </div>
      )}
    </header>
  );
}
