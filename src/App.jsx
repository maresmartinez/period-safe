import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './stores/ToastContext.jsx';
import ToastContainer from './components/Toast.jsx';
import Header from './components/navigation/Header.jsx';
import BottomNav from './components/navigation/BottomNav.jsx';
import TabNav from './components/navigation/TabNav.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import PrivacyBanner from './components/PrivacyBanner.jsx';

const CalendarPage = lazy(() => import('./components/calendar/CalendarPage.jsx'));
const PeriodFormPage = lazy(() => import('./components/period-form/PeriodFormPage.jsx'));
const SettingsPage = lazy(() => import('./components/settings/SettingsPage.jsx'));
const ImportExportPage = lazy(() => import('./components/import-export/ImportExportPage.jsx'));
const NotFoundPage = lazy(() => import('./components/navigation/NotFoundPage.jsx'));

function App() {
  return (
    <ToastProvider>
      <ToastContainer />
      <PrivacyBanner />
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <Header />
        <TabNav />
        <main className="pb-20 md:pb-0 md:pt-4">
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<CalendarPage />} />
                <Route path="/log" element={<PeriodFormPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/export" element={<ImportExportPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        <BottomNav />
      </div>
    </ToastProvider>
  );
}

export default App;
