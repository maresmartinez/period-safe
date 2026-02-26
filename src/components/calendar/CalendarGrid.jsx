import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import useCalendar from './useCalendar.js';
import CalendarCell from './CalendarCell.jsx';
import PeriodDetailModal from './PeriodDetailModal.jsx';
import { getCalendarDays, toISODateString } from '../../utils/dateUtils.js';

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Builds a map from ISO date string → { period, position } for all logged periods.
 * position: 'start' | 'mid' | 'end' | 'single'
 */
function buildPeriodDateMap(periods) {
  const map = new Map();
  for (const period of periods) {
    const startStr = period.startDate;
    const endStr = period.endDate ?? period.startDate;
    let currentStr = startStr;

    while (currentStr <= endStr) {
      const isStart = currentStr === startStr;
      const isEnd = currentStr === endStr;
      let position;
      if (isStart && isEnd) position = 'single';
      else if (isStart) position = 'start';
      else if (isEnd) position = 'end';
      else position = 'mid';

      map.set(currentStr, { period, position });

      // Advance one day
      const [y, m, d] = currentStr.split('-').map(Number);
      currentStr = toISODateString(new Date(y, m - 1, d + 1));
    }
  }
  return map;
}

/**
 * Builds a Set of ISO date strings for all predicted period days.
 * Currently marks only the predictedStartDate; spec 05 will enrich this.
 */
function buildPredictedDateSet(predictions) {
  const set = new Set();
  for (const pred of predictions) {
    if (pred.predictedStartDate) {
      set.add(pred.predictedStartDate);
    }
  }
  return set;
}

/**
 * Month-grid calendar showing logged period ranges and predicted periods.
 *
 * @param {Object}     props
 * @param {Array}      props.periods      - Logged Period objects
 * @param {Array}      props.predictions  - Prediction objects (may be empty)
 * @param {Function}   [props.onPeriodClick] - Called with the Period when a period cell is clicked
 * @param {number}     [props.initialMonth]  - For testing: override initial month (0-11)
 * @param {number}     [props.initialYear]   - For testing: override initial year
 */
export default function CalendarGrid({
  periods = [],
  predictions = [],
  onPeriodClick,
  initialMonth,
  initialYear,
}) {
  const { currentMonth, currentYear, goToPrevMonth, goToNextMonth } = useCalendar(
    initialMonth,
    initialYear
  );

  const today = useMemo(() => toISODateString(new Date()), []);

  const [focusedDate, setFocusedDate] = useState(() => new Date());
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  const gridRef = useRef(null);
  // Track whether navigation was triggered by keyboard (to preserve focusedDate)
  const keyboardNavRef = useRef(false);

  const calendarDays = useMemo(
    () => getCalendarDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const periodDateMap = useMemo(() => buildPeriodDateMap(periods), [periods]);
  const predictedDateSet = useMemo(() => buildPredictedDateSet(predictions), [predictions]);

  const monthYearLabel = `${MONTH_NAMES[currentMonth]} ${currentYear}`;

  // When the displayed month changes via nav buttons (not keyboard), reset focus to 1st
  useEffect(() => {
    if (keyboardNavRef.current) {
      keyboardNavRef.current = false;
      return;
    }
    setFocusedDate(new Date(currentYear, currentMonth, 1));
  }, [currentMonth, currentYear]); // eslint-disable-line react-hooks/exhaustive-deps

  // When focusedDate changes, focus the corresponding DOM cell (only if grid is active)
  useEffect(() => {
    if (!gridRef.current) return;
    const dateStr = toISODateString(focusedDate);
    const cell = gridRef.current.querySelector(`[data-date="${dateStr}"]`);
    if (cell && gridRef.current.contains(document.activeElement)) {
      cell.focus();
    }
  }, [focusedDate]);

  const handleNavPrevMonth = useCallback(() => {
    goToPrevMonth();
  }, [goToPrevMonth]);

  const handleNavNextMonth = useCallback(() => {
    goToNextMonth();
  }, [goToNextMonth]);

  const handleCellClick = useCallback(
    (date) => {
      setFocusedDate(date);
      const dateStr = toISODateString(date);
      const periodInfo = periodDateMap.get(dateStr);
      if (periodInfo) {
        setSelectedPeriod(periodInfo.period);
        onPeriodClick?.(periodInfo.period);
      }
    },
    [periodDateMap, onPeriodClick]
  );

  const handleKeyDown = useCallback(
    (e) => {
      let newDate = new Date(focusedDate);
      let shouldNavigateMonth = false;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          newDate.setDate(newDate.getDate() - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newDate.setDate(newDate.getDate() + 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          newDate.setDate(newDate.getDate() - 7);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newDate.setDate(newDate.getDate() + 7);
          break;
        case 'Home':
          e.preventDefault();
          newDate.setDate(newDate.getDate() - newDate.getDay()); // Start of week (Sunday)
          break;
        case 'End':
          e.preventDefault();
          newDate.setDate(newDate.getDate() + (6 - newDate.getDay())); // End of week (Saturday)
          break;
        case 'PageUp': {
          e.preventDefault();
          const pmMonth = newDate.getMonth() === 0 ? 11 : newDate.getMonth() - 1;
          const pmYear = newDate.getMonth() === 0 ? newDate.getFullYear() - 1 : newDate.getFullYear();
          const pmLastDay = new Date(pmYear, pmMonth + 1, 0).getDate();
          newDate = new Date(pmYear, pmMonth, Math.min(newDate.getDate(), pmLastDay));
          break;
        }
        case 'PageDown': {
          e.preventDefault();
          const nmMonth = newDate.getMonth() === 11 ? 0 : newDate.getMonth() + 1;
          const nmYear = newDate.getMonth() === 11 ? newDate.getFullYear() + 1 : newDate.getFullYear();
          const nmLastDay = new Date(nmYear, nmMonth + 1, 0).getDate();
          newDate = new Date(nmYear, nmMonth, Math.min(newDate.getDate(), nmLastDay));
          break;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          const dateStr = toISODateString(focusedDate);
          const periodInfo = periodDateMap.get(dateStr);
          if (periodInfo) {
            setSelectedPeriod(periodInfo.period);
            onPeriodClick?.(periodInfo.period);
          }
          return;
        }
        default:
          return;
      }

      // Check if we've moved to a different month
      const newMonth = newDate.getMonth();
      const newYear = newDate.getFullYear();
      if (newMonth !== currentMonth || newYear !== currentYear) {
        shouldNavigateMonth = true;
      }

      if (shouldNavigateMonth) {
        keyboardNavRef.current = true; // Prevent the useEffect from resetting focusedDate
        if (newYear < currentYear || (newYear === currentYear && newMonth < currentMonth)) {
          goToPrevMonth();
        } else {
          goToNextMonth();
        }
      }

      setFocusedDate(newDate);
    },
    [focusedDate, currentMonth, currentYear, periodDateMap, onPeriodClick, goToPrevMonth, goToNextMonth]
  );

  // Group days into weeks (rows of 7)
  const weeks = useMemo(() => {
    const rows = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      rows.push(calendarDays.slice(i, i + 7));
    }
    return rows;
  }, [calendarDays]);

  const focusedDateStr = toISODateString(focusedDate);

  return (
    <div className="w-full">
      {/* Month navigation header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={handleNavPrevMonth}
          aria-label="Previous month"
          className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2
          aria-live="polite"
          aria-atomic="true"
          className="text-base font-semibold text-neutral-900 dark:text-neutral-100"
        >
          {monthYearLabel}
        </h2>

        <button
          onClick={handleNavNextMonth}
          aria-label="Next month"
          className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <table
        ref={gridRef}
        role="grid"
        aria-label={`Period calendar, ${monthYearLabel}`}
        onKeyDown={handleKeyDown}
        className="w-full border-collapse table-fixed"
      >
        <thead>
          <tr role="row">
            {DAY_HEADERS.map((abbr, i) => (
              <th
                key={abbr}
                role="columnheader"
                abbr={DAY_NAMES[i]}
                scope="col"
                className="text-center text-xs font-medium text-neutral-400 dark:text-neutral-500 pb-2 w-[14.285%]"
              >
                {abbr}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex} role="row">
              {week.map((date) => {
                const dateStr = toISODateString(date);
                const isCurrentMonth = date.getMonth() === currentMonth;
                const isToday = dateStr === today;
                const periodInfo = periodDateMap.get(dateStr);
                const isPredicted = !periodInfo && predictedDateSet.has(dateStr);
                const isFocused = dateStr === focusedDateStr;

                // Build accessible label
                const dayName = DAY_NAMES[date.getDay()];
                const monthName = MONTH_NAMES[date.getMonth()];
                let ariaLabel = `${dayName}, ${monthName} ${date.getDate()}, ${date.getFullYear()}`;
                if (periodInfo) ariaLabel += ', has period';
                else if (isPredicted) ariaLabel += ', predicted period';

                return (
                  <CalendarCell
                    key={dateStr}
                    date={date}
                    dateStr={dateStr}
                    isCurrentMonth={isCurrentMonth}
                    isToday={isToday}
                    periodState={periodInfo?.position ?? null}
                    isPredicted={isPredicted}
                    isFocused={isFocused}
                    ariaLabel={ariaLabel}
                    onClick={() => handleCellClick(date)}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <PeriodDetailModal
        period={selectedPeriod}
        onClose={() => setSelectedPeriod(null)}
      />
    </div>
  );
}
