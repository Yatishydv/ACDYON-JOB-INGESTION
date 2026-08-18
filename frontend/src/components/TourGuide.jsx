import React, { useState, useEffect } from 'react';
import { Joyride, STATUS, EVENTS } from 'react-joyride';

export default function TourGuide() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the tour
    const hasSeenTour = localStorage.getItem('jobpulse_tour_completed_v6');
    if (!hasSeenTour) {
      // Small delay to let the UI render completely
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
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
      content: 'This Dashboard is your command center. It gives you a real-time, birds-eye view of the entire background ingestion process.',
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
      placement: 'top',
    },
    {
      target: '.tour-telemetry',
      content: 'Watch the magic happen here! Every background event—fetching pages, validating schemas, rejecting bad data, and skipping duplicates—is streamed here live.',
      placement: 'left',
    },
    {
      target: '.tour-filters',
      content: 'You can use these filters to drill down into specific data sources or job roles across the dashboard.',
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
            Thanks for taking the tour! To see the pipeline in action, click the <strong>Processing... (Arbeitnow)</strong> button!
          </p>
        </div>
      ),
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { status, type, step } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('jobpulse_tour_completed_v6', 'true');
    }

    // Force scroll correction if the element is hidden behind the 128px sticky nav
    if (type === EVENTS.TOOLTIP) {
      setTimeout(() => {
        if (step.target !== 'body') {
          const targetEl = document.querySelector(step.target);
          if (targetEl) {
            // Instead of calculating rects, we just forcefully scroll the element into the center of the viewport
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 50); // slight delay to let Joyride finish its own scrolling
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      run={run}
      scrollToFirstStep={false}
      disableScrolling={true}
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#6366f1', // Indigo 500
          backgroundColor: '#1e293b', // Slate 800
          textColor: '#f8fafc', // Slate 50
          arrowColor: '#1e293b',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          backgroundColor: '#6366f1',
        },
        buttonBack: {
          color: '#94a3b8',
        },
      }}
    />
  );
}
