import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TopNav from './components/TopNav';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import IngestionHistory from './pages/IngestionHistory';
import SavedJobs from './pages/SavedJobs';
import TourGuide from './components/TourGuide';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans">
        <TourGuide />
        <TopNav />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/history" element={<IngestionHistory />} />
          <Route path="/saved" element={<SavedJobs />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
