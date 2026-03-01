import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import usePeriodData from '../../hooks/usePeriodData.ts';
import usePeriodPrediction from '../../hooks/usePeriodPrediction.ts';
import useCalendarViewState from '../../hooks/useCalendarViewState.ts';
import CalendarGrid from './CalendarGrid.tsx';
import CalendarToolbar from './CalendarToolbar.tsx';
import WeekView from './WeekView.tsx';
import YearView from './YearView.tsx';
import JumpToDateModal from './JumpToDateModal.tsx';
import LoadingSpinner from '../LoadingSpinner.tsx';
import { toISODateString, formatWeekRangeLabel, getWeekStart, formatYearLabel } from '../../utils/dateUtils.ts';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarPage() {
  const { periods, loading, error, deletePeriod } = usePeriodData();
  const navigate = useNavigate();
  const { predictions } = usePeriodPrediction(periods);
  const { view, anchorDate, setView, goToPrev, goToNext, goToToday, jumpToDate } = useCalendarViewState();

  const [jumpModalOpen, setJumpModalOpen] = useState(false);

  // Derive toolbar label from view + anchorDate
  const toolbarLabel = useMemo(() => {
    if (view === 'year') return formatYearLabel(anchorDate.getFullYear());
    if (view === 'week') return formatWeekRangeLabel(getWeekStart(anchorDate));
    return `${MONTH_NAMES[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`;
  }, [view, anchorDate]);

  // For CalendarGrid (month view)
  const currentMonth = anchorDate.getMonth();
  const currentYear = anchorDate.getFullYear();

  function handleMonthClickFromYear(month: number) {
    jumpToDate(toISODateString(new Date(currentYear, month, 1)));
    setView('month');
  }

  function handleGoToPrevMonth() {
    goToPrev();
  }

  function handleGoToNextMonth() {
    goToNext();
  }

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
        Failed to load periods: {(error as Error).message}
      </p>
    );
  }

  return (
    <div className="relative px-4 md:px-8 lg:px-16">
      <CalendarToolbar
        view={view}
        label={toolbarLabel}
        onSetView={setView}
        onPrev={goToPrev}
        onNext={goToNext}
        onToday={goToToday}
        onJumpToDate={() => setJumpModalOpen(true)}
      />

      {view === 'month' && (
        <CalendarGrid
          periods={periods}
          predictions={predictions}
          currentMonth={currentMonth}
          currentYear={currentYear}
          onGoToPrevMonth={handleGoToPrevMonth}
          onGoToNextMonth={handleGoToNextMonth}
          onEditPeriod={(period) => navigate('/log', { state: { period } })}
          onDeletePeriod={deletePeriod}
        />
      )}

      {view === 'week' && (
        <WeekView
          anchorDate={anchorDate}
          periods={periods}
          predictions={predictions}
          onEditPeriod={(period) => navigate('/log', { state: { period } })}
          onDeletePeriod={deletePeriod}
        />
      )}

      {view === 'year' && (
        <YearView
          year={currentYear}
          periods={periods}
          predictions={predictions}
          onMonthClick={handleMonthClickFromYear}
        />
      )}

      <JumpToDateModal
        isOpen={jumpModalOpen}
        onClose={() => setJumpModalOpen(false)}
        anchorDate={anchorDate}
        onJump={jumpToDate}
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
