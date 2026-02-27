import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './stores/ToastContext.tsx';
import ToastContainer from './components/Toast.tsx';
import Header from './components/navigation/Header.tsx';
import BottomNav from './components/navigation/BottomNav.tsx';
import TabNav from './components/navigation/TabNav.tsx';
import LoadingSpinner from './components/LoadingSpinner.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import PrivacyBanner from './components/PrivacyBanner.tsx';

const CalendarPage = lazy(() => import('./components/calendar/CalendarPage.tsx'));
const PeriodFormPage = lazy(() => import('./components/period-form/PeriodFormPage.tsx'));
const SettingsPage = lazy(() => import('./components/settings/SettingsPage.tsx'));
const ImportExportPage = lazy(() => import('./components/import-export/ImportExportPage.tsx'));
const NotFoundPage = lazy(() => import('./components/navigation/NotFoundPage.tsx'));

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
