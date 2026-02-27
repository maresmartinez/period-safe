import { memo } from 'react';

export type PeriodPosition = 'start' | 'mid' | 'end' | 'single';

interface CalendarCellProps {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  periodState: PeriodPosition | null;
  isPredicted: boolean;
  isFocused: boolean;
  ariaLabel: string;
  onClick: () => void;
}

function CalendarCell({
  date,
  dateStr,
  isCurrentMonth,
  isToday,
  periodState,
  isPredicted,
  isFocused,
  ariaLabel,
  onClick,
}: CalendarCellProps) {
  const isLoggedPeriod = periodState !== null;
  const isInteractive = isLoggedPeriod;

  // Connecting bar classes for period range (start/mid/end)
  let barClass: string | null = null;
  if (periodState === 'start') {
    barClass = 'absolute top-1/2 -translate-y-1/2 left-1/2 right-0 h-8 bg-rose-500 dark:bg-rose-600';
  } else if (periodState === 'mid') {
    barClass = 'absolute top-1/2 -translate-y-1/2 left-0 right-0 h-8 bg-rose-500 dark:bg-rose-600';
  } else if (periodState === 'end') {
    barClass = 'absolute top-1/2 -translate-y-1/2 left-0 right-1/2 h-8 bg-rose-500 dark:bg-rose-600';
  }

  // Number circle classes
  let circleClass = 'relative z-10 w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors';

  if (isLoggedPeriod) {
    circleClass += ' bg-rose-500 dark:bg-rose-600 text-white';
    if (isInteractive) {
      circleClass += ' hover:bg-rose-600 dark:hover:bg-rose-500';
    }
  } else if (isPredicted) {
    circleClass += ' bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-dashed border-rose-300 dark:border-rose-600';
  } else if (isToday) {
    circleClass += ' text-rose-600 dark:text-rose-400 font-bold';
  } else if (isCurrentMonth) {
    circleClass += ' text-neutral-900 dark:text-neutral-100';
  } else {
    circleClass += ' text-neutral-300 dark:text-neutral-600';
  }

  if (isFocused) {
    circleClass += ' ring-2 ring-rose-500 ring-offset-1 dark:ring-offset-neutral-900';
  }

  const tdClass =
    'relative p-0 ' +
    (isInteractive ? 'cursor-pointer' : 'cursor-default');

  return (
    <td
      role="gridcell"
      data-date={dateStr}
      aria-label={ariaLabel}
      aria-selected={isFocused}
      tabIndex={isFocused ? 0 : -1}
      className={tdClass}
      onClick={onClick}
    >
      {/* Background bar connecting adjacent period cells */}
      {barClass && <div className={barClass} aria-hidden="true" />}

      {/* Day number */}
      <div className="relative z-10 flex items-center justify-center min-h-[44px]">
        <div className={circleClass}>
          {date.getDate()}
        </div>
        {/* Today dot indicator (when not a period day) */}
        {isToday && !isLoggedPeriod && !isPredicted && (
          <span
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-rose-500"
            aria-hidden="true"
          />
        )}
      </div>
    </td>
  );
}

export default memo(CalendarCell);
