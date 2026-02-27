import { Link, useNavigate } from 'react-router-dom';
import usePeriodData from '../../hooks/usePeriodData.js';
import usePeriodPrediction from '../../hooks/usePeriodPrediction.js';
import CalendarGrid from './CalendarGrid.jsx';
import LoadingSpinner from '../LoadingSpinner.jsx';

export default function CalendarPage() {
  const { periods, loading, error, deletePeriod } = usePeriodData();
  const navigate = useNavigate();
  const { predictions } = usePeriodPrediction(periods);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400 px-4 py-8 text-center">
        Failed to load periods: {error.message}
      </p>
    );
  }

  return (
    <div className="relative">
      <CalendarGrid
        periods={periods}
        predictions={predictions}
        onEditPeriod={(period) => navigate('/log', { state: { period } })}
        onDeletePeriod={deletePeriod}
      />

      {/* FAB — mobile only, links to Log Period */}
      <Link
        to="/log"
        aria-label="Log new period"
        className="fixed bottom-20 right-4 md:hidden z-30 flex items-center justify-center w-14 h-14 rounded-full bg-rose-500 text-white shadow-lg hover:bg-rose-600 active:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-7 h-7"
          aria-hidden="true"
        >
          <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
        </svg>
      </Link>
    </div>
  );
}
