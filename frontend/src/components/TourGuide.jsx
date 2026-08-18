import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export default function TourGuide() {
  useEffect(() => {
    // Define the global start function so it can be called from anywhere (e.g. TopNav)
    window.startJobPulseTour = () => {
      const driverObj = driver({
        showProgress: true,
        allowClose: true,
        overlayColor: 'rgba(15, 23, 42, 0.85)',
        popoverClass: 'tour-theme',
        onDestroyStarted: () => {
          if (!driverObj.hasNextStep() || confirm("Are you sure you want to exit the tour?")) {
            localStorage.setItem('jobpulse_tour_v20', 'true');
            driverObj.destroy();
          }
        },
        steps: [
          {
            popover: {
              title: 'Welcome to JobPulse! 👋',
              description: 'I built this for the <strong>ACDYON Technologies</strong> assignment (Part 1).<br><br>This system demonstrates a highly resilient, fault-tolerant job data ingestion pipeline. It handles paginated fetching, rate-limiting, schema validation, and deduplication all in the background!',
            }
          },
          {
            element: '.tour-dashboard-title',
            popover: {
              title: 'Dashboard',
              description: 'This is your Dashboard — the command center. It gives you a real-time, birds-eye view of the entire background ingestion process.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '.tour-info-tooltip',
            popover: {
              title: 'Contextual Information',
              description: 'Throughout the dashboard, you will find these "i" buttons. Hover over them anytime to understand the underlying system architecture or metric definitions.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '.tour-control-panel',
            popover: {
              title: 'Ingestion Controls',
              description: 'Use these controls to manually trigger ingestion runs from different sources.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '.tour-arbeitnow-btn',
            popover: {
              title: 'Live Data',
              description: 'Clicking this button pulls live data from the public Arbeitnow API. It will automatically fetch multiple pages and deduplicate the jobs.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '.tour-sandbox-btn',
            popover: {
              title: 'Sandbox Simulation',
              description: 'To prove the system is resilient, I built a Sandbox! Clicking these buttons forces the pipeline to hit simulated API rate limits (429) or server crashes (503).',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '.tour-source-health',
            popover: {
              title: 'Source Health',
              description: 'This tracks the health of all data sources in real-time. If you hit the Sandbox rate limit, you will see the failures go up. If it fails too many times, the Circuit Breaker trips!',
              side: "top",
              align: 'start'
            }
          },
          {
            element: '.tour-telemetry',
            popover: {
              title: 'Live Telemetry',
              description: 'Watch the magic happen here! Every background event—fetching pages, validating schemas, rejecting bad data, and skipping duplicates—is streamed here live.',
              side: "left",
              align: 'start'
            }
          },
          {
            element: '.tour-filters',
            popover: {
              title: 'Filters',
              description: 'Use these filters to drill down into specific data sources or job roles across the dashboard.',
              side: "right",
              align: 'start'
            }
          },
          {
            element: '.tour-nav-alljobs',
            popover: {
              title: 'All Jobs',
              description: 'Once you fetch some data, click this tab to view all the successfully ingested and deduplicated jobs in a beautiful list format.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '.tour-nav-savedjobs',
            popover: {
              title: 'Saved Jobs',
              description: 'You can bookmark jobs that catch your eye. They will be saved locally and appear in this dedicated tab.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '.tour-github-link',
            popover: {
              title: 'Source Code',
              description: 'Want to see the code? The entire architecture, rate limiters, and circuit breakers are documented in my GitHub repository!',
              side: "left",
              align: 'start'
            }
          },
          {
            popover: {
              title: 'Ready to go! 🚀',
              description: 'Thanks for taking the tour! To see the pipeline in action, click the <strong>Run Arbeitnow</strong> button on your dashboard!',
            }
          }
        ]
      });
      
      driverObj.drive();
    };

    // Auto-run on first visit
    const hasSeenTour = localStorage.getItem('jobpulse_tour_v20');
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        window.startJobPulseTour();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  return null;
}
