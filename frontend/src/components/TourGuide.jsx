import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';

export default function TourGuide() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('jobpulse_tour_v11');
    if (!hasSeenTour) {
      const timer = setTimeout(() => setRun(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps = [
    {
      target: 'body',
      placement: 'center',
      content: (
        <div className="text-left">
          <h2 className="text-xl font-bold mb-2 text-indigo-400">Welcome to JobPulse! 👋</h2>
          <p className="mb-2">
            I built this for the <strong>ACDYON Technologies</strong> assignment (Part 1).
          </p>
          <p>
            This system demonstrates a highly resilient, fault-tolerant job data ingestion pipeline. It handles paginated fetching, rate-limiting, schema validation, and deduplication all in the background!
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '.tour-dashboard-title',
      content: 'This is your Dashboard — the command center. It gives you a real-time, birds-eye view of the entire background ingestion process.',
      placement: 'bottom',
    },
    {
      target: 'body',
      placement: 'center',
      content: (
        <div className="text-left">
          <h2 className="text-lg font-bold mb-2 text-cyan-400">⚡ Ingestion Control Panel</h2>
          <p className="mb-2">
            Right below the navigation bar, you will see the <strong>Ingestion Control</strong> panel with action buttons:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Run Arbeitnow</strong> — Pulls live data from the public Arbeitnow API</li>
            <li><strong>Run RemoteOK</strong> — Fetches jobs from RemoteOK</li>
          </ul>
          <p className="mt-2 text-sm text-slate-400">
            The pipeline automatically handles paginated fetching and deduplication!
          </p>
        </div>
      ),
    },
    {
      target: 'body',
      placement: 'center',
      content: (
        <div className="text-left">
          <h2 className="text-lg font-bold mb-2 text-orange-400">🧪 Sandbox Simulation</h2>
          <p className="mb-2">
            Next to the Run buttons, you will find <strong>Sandbox</strong> controls:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Sandbox Normal</strong> — Simulates a healthy API response</li>
            <li><strong>Sandbox 429</strong> — Forces a rate-limit error (HTTP 429)</li>
          </ul>
          <p className="mt-2 text-sm text-slate-400">
            This proves the system is resilient! Watch the Circuit Breaker trip when failures pile up.
          </p>
        </div>
      ),
    },
    {
      target: '.tour-source-health',
      content: 'Source Health tracks all data sources in real-time. If you hit the Sandbox rate limit, failures go up. Too many failures? The Circuit Breaker trips!',
      placement: 'bottom',
    },
    {
      target: '.tour-telemetry',
      content: 'Watch the magic happen here! Every background event—fetching pages, validating schemas, rejecting bad data, and skipping duplicates—is streamed here live.',
      placement: 'left',
    },
    {
      target: '.tour-filters',
      content: 'Use these filters to drill down into specific data sources or job roles across the dashboard.',
      placement: 'right',
    },
    {
      target: '.tour-nav-alljobs',
      content: 'Once you fetch some data, click this tab to view all the successfully ingested and deduplicated jobs in a beautiful list format.',
      placement: 'bottom',
    },
    {
      target: '.tour-nav-savedjobs',
      content: 'You can bookmark jobs that catch your eye. They will be saved locally and appear in this dedicated tab.',
      placement: 'bottom',
    },
    {
      target: 'body',
      placement: 'center',
      content: (
        <div className="text-left">
          <h2 className="text-lg font-bold mb-2 text-violet-400">📜 Ingestion History</h2>
          <p>
            The <strong>Ingestion History</strong> tab in the navigation shows a detailed log of every ingestion run — including timestamps, pages fetched, duplicates skipped, and validation errors.
          </p>
        </div>
      ),
    },
    {
      target: '.tour-github-link',
      content: 'Want to see the code? The entire architecture, rate limiters, and circuit breakers are documented in my GitHub repository!',
      placement: 'left',
    },
    {
      target: 'body',
      placement: 'center',
      content: (
        <div className="text-left">
          <h2 className="text-xl font-bold mb-2 text-green-400">Ready to go! 🚀</h2>
          <p>
            Thanks for taking the tour! To see the pipeline in action, click the <strong>Run Arbeitnow</strong> button on the control panel!
          </p>
        </div>
      ),
    },
  ];

  const handleCallback = (data) => {
    const { status } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      localStorage.setItem('jobpulse_tour_v11', 'true');
    }
  };

  return (
    <Joyride
      callback={handleCallback}
      continuous
      run={run}
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#6366f1',
          backgroundColor: '#1e293b',
          textColor: '#f8fafc',
          arrowColor: '#1e293b',
        },
        tooltipContainer: { textAlign: 'left' },
        buttonNext: { backgroundColor: '#6366f1' },
        buttonBack: { color: '#94a3b8' },
      }}
    />
  );
}
