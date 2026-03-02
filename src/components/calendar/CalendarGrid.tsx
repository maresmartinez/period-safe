import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import CalendarCell from './CalendarCell.tsx';
import PeriodDetailModal from './PeriodDetailModal.tsx';
import { getCalendarDays, toISODateString } from '../../utils/dateUtils.ts';
import { buildPeriodDateMap, buildPredictedDateSet } from '../../utils/calendarUtils.ts';
import type { Period, Prediction } from '../../types.ts';

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface CalendarGridProps {
  periods?: Period[];
  predictions?: Prediction[];
  onPeriodClick?: (period: Period) => void;
  onEditPeriod?: (period: Period) => void;
  onDeletePeriod?: (id: string) => void;
  currentMonth: number;
  currentYear: number;
  onGoToPrevMonth: () => void;
  onGoToNextMonth: () => void;
}

export default function CalendarGrid({
  periods = [],
  predictions = [],
  onPeriodClick,
  onEditPeriod,
  onDeletePeriod,
  currentMonth,
  currentYear,
  onGoToPrevMonth,
  onGoToNextMonth,
}: CalendarGridProps) {
  const today = useMemo(() => toISODateString(new Date()), []);

  const [focusedDate, setFocusedDate] = useState(() => new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);

  const gridRef = useRef<HTMLTableElement>(null);
  // Track whether navigation was triggered by keyboard (to preserve focusedDate)
  const keyboardNavRef = useRef(false);

  const calendarDays = useMemo(
    () => getCalendarDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const visiblePeriods = useMemo(
    () => {
      const windowStart = toISODateString(calendarDays[0]);
      const windowEnd = toISODateString(calendarDays[calendarDays.length - 1]);
      return periods.filter(p => {
        const end = p.endDate ?? p.startDate;
        return p.startDate <= windowEnd && end >= windowStart;
      });
    },
    [periods, calendarDays]
  );

  const periodDateMap = useMemo(() => buildPeriodDateMap(visiblePeriods), [visiblePeriods]);
  const predictedDateSet = useMemo(() => buildPredictedDateSet(predictions), [predictions]);

  const monthYearLabel = `${MONTH_NAMES[currentMonth]} ${currentYear}`;

  // When the displayed month changes via nav buttons (not keyboard), reset focus to 1st
  useEffect(() => {
    if (keyboardNavRef.current) {
      keyboardNavRef.current = false;
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFocusedDate(new Date(currentYear, currentMonth, 1));
  }, [currentMonth, currentYear]);

  // When focusedDate changes, focus the corresponding DOM cell (only if grid is active)
  useEffect(() => {
    if (!gridRef.current) return;
    const dateStr = toISODateString(focusedDate);
    const cell = gridRef.current.querySelector<HTMLElement>(`[data-date="${dateStr}"]`);
    if (cell && gridRef.current.contains(document.activeElement)) {
      cell.focus();
    }
  }, [focusedDate]);

  const handleCellClick = useCallback(
    (date: Date) => {
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
    (e: React.KeyboardEvent<HTMLTableElement>) => {
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
          onGoToPrevMonth();
        } else {
          onGoToNextMonth();
        }
      }

      setFocusedDate(newDate);
    },
    [focusedDate, currentMonth, currentYear, periodDateMap, onPeriodClick, onGoToPrevMonth, onGoToNextMonth]
  );

  // Group days into weeks (rows of 7)
  const weeks = useMemo(() => {
    const rows: Date[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      rows.push(calendarDays.slice(i, i + 7));
    }
    return rows;
  }, [calendarDays]);

  const focusedDateStr = toISODateString(focusedDate);

  return (
    <div className="w-full">
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
                scope="col"
                aria-label={DAY_NAMES[i]}
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
        onEdit={(p) => { setSelectedPeriod(null); onEditPeriod?.(p); }}
        onDelete={(id) => { onDeletePeriod?.(id); setSelectedPeriod(null); }}
      />
    </div>
  );
}
