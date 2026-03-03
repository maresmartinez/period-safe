import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import usePeriodData from '../../hooks/usePeriodData.ts';
import usePeriodPrediction from '../../hooks/usePeriodPrediction.ts';
import useCalendarViewState from '../../hooks/useCalendarViewState.ts';
import useIntimacyData from '../../hooks/useIntimacyData.ts';
import CalendarGrid from './CalendarGrid.tsx';
import CalendarToolbar from './CalendarToolbar.tsx';
import WeekView from './WeekView.tsx';
import YearView from './YearView.tsx';
import JumpToDateModal from './JumpToDateModal.tsx';
import PredictionModal from './PredictionModal.tsx';
import LoadingSpinner from '../LoadingSpinner.tsx';
import { toISODateString, formatWeekRangeLabel, getWeekStart, formatYearLabel } from '../../utils/dateUtils.ts';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarPage() {
  const { periods, loading, error, deletePeriod } = usePeriodData();
  const { deleteIntimacy } = useIntimacyData();
  const navigate = useNavigate();
  const {
    predictions,
    cycleSummary
  } = usePeriodPrediction(periods);
  const { view, anchorDate, setView, goToPrev, goToNext, goToToday, jumpToDate } =
    useCalendarViewState();

  const [jumpModalOpen, setJumpModalOpen] = useState(false);
  const [predictionModalOpen, setPredictionModalOpen] = useState(false);

  // Derive toolbar label from view + anchorDate
  const toolbarLabel = useMemo(() => {
    if (view === 'year') return formatYearLabel(anchorDate.getFullYear());
    if (view === 'week') return formatWeekRangeLabel(getWeekStart(anchorDate));
    return `${MONTH_NAMES[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`;
  }, [view, anchorDate]);

  // Prediction summary values
  const predictedCycleLength = cycleSummary
    ? Math.round(cycleSummary.averageCycleLength)
    : null;

  const predictedDuration = predictions.length > 0
    ? (() => {
        const p = predictions[0];
        const a = new Date(p.predictedStartDate);
        const b = new Date(p.predictedEndDate);
        return Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
      })()
    : null;

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

      {/* Prediction summary card */}
      <div className="px-4 pb-3">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 mb-3">
            Cycle predictions
          </p>

          {predictedCycleLength != null ? (
            <>
              <div className="flex gap-3 mb-3">
                <div className="flex-1 rounded-lg bg-neutral-50 dark:bg-neutral-700/50 p-3">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                    Cycle length
                  </p>
                  <p className="text-xl font-bold text-rose-500">
                    {predictedCycleLength} days
                  </p>
                </div>
                <div className="flex-1 rounded-lg bg-neutral-50 dark:bg-neutral-700/50 p-3">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                    Period length
                  </p>
                  <p className="text-xl font-bold text-rose-500">
                    {predictedDuration != null ? `~${predictedDuration} days` : '\u2014'}
                  </p>
                </div>
              </div>
              <button
                  type="button"
                  onClick={() => setPredictionModalOpen(true)}
                  className="text-xs text-neutral-500 dark:text-neutral-400 hover:underline text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
                >
                  Learn more about predictions →
                </button>
            </>
          ) : (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-2">
              Log more periods to see predictions
            </p>
          )}
        </div>
      </div>

      {view === 'month' && (
        <CalendarGrid
          periods={periods}
          predictions={predictions}
          averageCycleLength={cycleSummary?.averageCycleLength ?? 28}
          currentMonth={currentMonth}
          currentYear={currentYear}
          onGoToPrevMonth={handleGoToPrevMonth}
          onGoToNextMonth={handleGoToNextMonth}
          onEditPeriod={(period) => navigate('/log', { state: { period } })}
          onDeletePeriod={deletePeriod}
          onEditIntimacy={(intimacy) => navigate('/log', { state: { intimacy } })}
          onDeleteIntimacy={deleteIntimacy}
        />
      )}

      {view === 'week' && (
        <WeekView
          anchorDate={anchorDate}
          periods={periods}
          predictions={predictions}
          averageCycleLength={cycleSummary?.averageCycleLength ?? 28}
          onEditPeriod={(period) => navigate('/log', { state: { period } })}
          onDeletePeriod={deletePeriod}
        />
      )}

      {view === 'year' && (
        <YearView
          year={currentYear}
          periods={periods}
          predictions={predictions}
          averageCycleLength={cycleSummary?.averageCycleLength ?? 28}
          onMonthClick={handleMonthClickFromYear}
        />
      )}

      {/* Calendar legend */}
      <div className="flex flex-wrap items-center gap-4 px-4 pt-3 pb-4 text-xs text-neutral-600 dark:text-neutral-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-rose-500" aria-hidden="true" />
          Logged period
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full bg-rose-100 dark:bg-rose-900/40 border border-dashed border-rose-300 dark:border-rose-600"
            aria-hidden="true"
          />
          Predicted period
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-purple-500" aria-hidden="true" />
          Predicted ovulation day
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full bg-purple-100 dark:bg-purple-900/40 border border-dashed border-purple-400 dark:border-purple-600"
            aria-hidden="true"
          />
          Predicted fertility window
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-amber-500 text-sm">★</span>
          Intimate day
        </span>
      </div>

      <JumpToDateModal
        isOpen={jumpModalOpen}
        onClose={() => setJumpModalOpen(false)}
        anchorDate={anchorDate}
        onJump={jumpToDate}
      />

      <PredictionModal
        isOpen={predictionModalOpen}
        onClose={() => setPredictionModalOpen(false)}
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
