import { ToastProvider } from './stores/ToastContext.jsx';
import ToastContainer from './components/Toast.jsx';
import CalendarGrid from './components/calendar/CalendarGrid.jsx';
import usePeriodData from './hooks/usePeriodData.js';
import usePeriodPrediction from './hooks/usePeriodPrediction.js';

function AppContent() {
  const { periods, loading, error } = usePeriodData();
  const { predictions } = usePeriodPrediction(periods);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-4 py-3">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          PeriodSafe
        </h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400 mb-4">
            Failed to load periods: {error.message}
          </p>
        )}
        {loading ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-8">
            Loading…
          </p>
        ) : (
          <CalendarGrid periods={periods} predictions={predictions} />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
      <ToastContainer />
    </ToastProvider>
  );
}

export default App;
