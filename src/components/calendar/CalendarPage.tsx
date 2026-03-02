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
import PredictionInfoModal from './PredictionInfoModal.tsx';
import PredictionUncertaintyModal from './PredictionUncertaintyModal.tsx';
import LoadingSpinner from '../LoadingSpinner.tsx';
import { toISODateString, formatWeekRangeLabel, getWeekStart, formatYearLabel } from '../../utils/dateUtils.ts';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarPage() {
  const { periods, loading, error, deletePeriod } = usePeriodData();
  const navigate = useNavigate();
  const {
    predictions,
    cycleSummary,
    isPredictionUncertain,
    predictionStability,
  } = usePeriodPrediction(periods);
  const { view, anchorDate, setView, goToPrev, goToNext, goToToday, jumpToDate } =
    useCalendarViewState();

  const [jumpModalOpen, setJumpModalOpen] = useState(false);
  const [predictionInfoOpen, setPredictionInfoOpen] = useState(false);
  const [predictionUncertaintyOpen, setPredictionUncertaintyOpen] = useState(false);

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
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Predicted cycle & duration
              </p>
            </div>
            {isPredictionUncertain && (
              <button
                type="button"
                onClick={() => setPredictionInfoOpen(true)}
                className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-full text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                aria-label="Learn more about how these predictions are calculated"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-10.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM10 9a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 10 9Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <p className="text-2xl font-bold text-rose-500">
                {predictedCycleLength != null ? `${predictedCycleLength} days` : '—'}
              </p>
              {predictionStability === 'low' && predictedCycleLength != null && (
                <button
  type="button"
  onClick={() => setPredictionUncertaintyOpen(true)}
  className="inline-flex h-5 w-5 items-center justify-center text-amber-600 dark:border-amber-500/60 dark:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
  aria-label="Why these dates are more approximate"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-3.5 h-3.5"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M8.485 3.5a1.5 1.5 0 0 1 2.597 0l6.42 11.137A1.5 1.5 0 0 1 16.17 17.5H3.83a1.5 1.5 0 0 1-1.332-2.263L8.485 3.5ZM10 8a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 10 8Zm0 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
      clipRule="evenodd"
    />
  </svg>
</button>
              )}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {predictedDuration != null
                ? `Typical length: around ${predictedDuration} day${
                    predictedDuration === 1 ? '' : 's'
                  }.`
                : 'We’ll estimate this once there is a bit more history.'}
            </p>
          </div>
        </div>
      </div>

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

      {/* Calendar legend */}
      <div className="flex flex-wrap items-center gap-4 px-4 pt-3 pb-4 text-xs text-neutral-600 dark:text-neutral-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-rose-500" aria-hidden="true" />
          Logged period
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full bg-rose-100 border border-dashed border-rose-400"
            aria-hidden="true"
          />
          Predicted period
        </span>
      </div>

      <JumpToDateModal
        isOpen={jumpModalOpen}
        onClose={() => setJumpModalOpen(false)}
        anchorDate={anchorDate}
        onJump={jumpToDate}
      />

      <PredictionInfoModal
        isOpen={predictionInfoOpen}
        onClose={() => setPredictionInfoOpen(false)}
      />

      <PredictionUncertaintyModal
        isOpen={predictionUncertaintyOpen}
        onClose={() => setPredictionUncertaintyOpen(false)}
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
