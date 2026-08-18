import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';

export default function TourGuide() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('jobpulse_tour_v16');
    if (!hasSeenTour) {
      const timer = setTimeout(() => setRun(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Override scrollTo/scrollIntoView so Joyride can't move the page at all
  useEffect(() => {
    if (!run) return;

    // Scroll to top first
    window.scrollTo(0, 0);

    // Save originals
    const originalScrollTo = window.scrollTo.bind(window);
    const originalScrollBy = window.scrollBy.bind(window);
    const originalScrollIntoView = Element.prototype.scrollIntoView;

    // Replace with no-ops after a tiny delay (so our scrollTo(0,0) above completes)
    const lockTimer = setTimeout(() => {
      window.scrollTo = () => {};
      window.scrollBy = () => {};
      Element.prototype.scrollIntoView = function() {};

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }, 50);

    return () => {
      clearTimeout(lockTimer);
      window.scrollTo = originalScrollTo;
      window.scrollBy = originalScrollBy;
      Element.prototype.scrollIntoView = originalScrollIntoView;
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [run]);

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
      target: '.tour-control-panel',
      content: 'Use these controls to manually trigger ingestion runs from different sources.',
      placement: 'bottom',
    },
    {
      target: '.tour-arbeitnow-btn',
      content: 'Clicking this button pulls live data from the public Arbeitnow API. It will automatically fetch multiple pages and deduplicate the jobs.',
      placement: 'bottom',
    },
    {
      target: '.tour-sandbox-btn',
      content: 'To prove the system is resilient, I built a Sandbox! Clicking these buttons forces the pipeline to hit simulated API rate limits (429) or server crashes (503).',
      placement: 'bottom',
    },
    {
      target: '.tour-source-health',
      content: 'This tracks the health of all data sources in real-time. If you hit the Sandbox rate limit, you will see the failures go up. If it fails too many times, the Circuit Breaker trips!',
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
            Thanks for taking the tour! To see the pipeline in action, click the <strong>Run Arbeitnow</strong> button!
          </p>
        </div>
      ),
    },
  ];

  const handleCallback = (data) => {
    const { status } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      localStorage.setItem('jobpulse_tour_v16', 'true');
    }
  };

  return (
    <Joyride
      callback={handleCallback}
      continuous
      run={run}
      disableScrolling
      disableScrollParentFix
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
