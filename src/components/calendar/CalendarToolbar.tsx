import type { CalendarView } from '../../types.ts';

interface CalendarToolbarProps {
  view: CalendarView;
  label: string;
  onSetView: (v: CalendarView) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onJumpToDate: () => void;
}

const VIEW_LABELS: Record<CalendarView, string> = {
  week: 'Week',
  month: 'Month',
  year: 'Year',
};

const NAV_ARIA_LABELS: Record<CalendarView, { prev: string; next: string }> = {
  week: { prev: 'Previous week', next: 'Next week' },
  month: { prev: 'Previous month', next: 'Next month' },
  year: { prev: 'Previous year', next: 'Next year' },
};

export default function CalendarToolbar({
  view,
  label,
  onSetView,
  onPrev,
  onNext,
  onToday,
  onJumpToDate,
}: CalendarToolbarProps) {
  const navLabels = NAV_ARIA_LABELS[view];

  return (
    <div className="mb-4">
      {/* Mobile: row 1 — nav arrows + label + today + jump */}
      <div className="flex items-center justify-between gap-2 md:hidden">
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            aria-label={navLabels.prev}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h2
            aria-live="polite"
            aria-atomic="true"
            className="text-base font-semibold text-neutral-900 dark:text-neutral-100 min-w-[120px] text-center"
          >
            {label}
          </h2>

          <button
            onClick={onNext}
            aria-label={navLabels.next}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onToday}
            className="min-h-[48px] px-3 text-sm font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
          >
            Today
          </button>
          <button
            onClick={onJumpToDate}
            aria-label="Jump to date"
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile: row 2 — view switcher */}
      <div
        role="group"
        aria-label="Calendar view"
        className="flex mt-2 md:hidden rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700"
      >
        {(['week', 'month', 'year'] as CalendarView[]).map((v) => (
          <button
            key={v}
            onClick={() => onSetView(v)}
            aria-pressed={view === v}
            className={`flex-1 min-h-[48px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-500 ${
              view === v
                ? 'bg-rose-500 text-white'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>

      {/* Desktop: single row */}
      <div className="hidden md:flex items-center justify-between gap-4">
        {/* View switcher */}
        <div
          role="group"
          aria-label="Calendar view"
          className="flex rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700"
        >
          {(['week', 'month', 'year'] as CalendarView[]).map((v) => (
            <button
              key={v}
              onClick={() => onSetView(v)}
              aria-pressed={view === v}
              className={`min-h-[48px] px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-500 ${
                view === v
                  ? 'bg-rose-500 text-white'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>

        {/* Nav arrows + label */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            aria-label={navLabels.prev}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h2
            aria-live="polite"
            aria-atomic="true"
            className="text-base font-semibold text-neutral-900 dark:text-neutral-100 min-w-[160px] text-center"
          >
            {label}
          </h2>

          <button
            onClick={onNext}
            aria-label={navLabels.next}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Today + Jump */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToday}
            className="min-h-[48px] px-4 text-sm font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
          >
            Today
          </button>
          <button
            onClick={onJumpToDate}
            className="min-h-[48px] px-4 text-sm font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
          >
            Jump to Date
          </button>
        </div>
      </div>
    </div>
  );
}
