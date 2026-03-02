import { useMemo } from 'react';
import { getCalendarDays, toISODateString } from '../../utils/dateUtils.ts';
import { buildPeriodDateMap, buildPredictedDateSet, buildOvulationDateSet, buildFertilityWindowDateSet } from '../../utils/calendarUtils.ts';
import type { Period, Prediction } from '../../types.ts';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface YearViewProps {
  year: number;
  periods?: Period[];
  predictions?: Prediction[];
  averageCycleLength?: number;
  onMonthClick: (month: number) => void;
}

export default function YearView({ year, periods = [], predictions = [], averageCycleLength = 28, onMonthClick }: YearViewProps) {
  const periodDateMap = useMemo(() => buildPeriodDateMap(periods), [periods]);
  const predictedDateSet = useMemo(() => buildPredictedDateSet(predictions), [predictions]);
  const ovulationDateSet = useMemo(
    () => buildOvulationDateSet(predictions, averageCycleLength),
    [predictions, averageCycleLength]
  );
  const fertilityWindowDateSet = useMemo(
    () => buildFertilityWindowDateSet(predictions, averageCycleLength),
    [predictions, averageCycleLength]
  );
  const today = useMemo(() => toISODateString(new Date()), []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {MONTH_NAMES.map((monthName, monthIndex) => {
        const days = getCalendarDays(year, monthIndex);

        return (
          <div key={monthName} className="flex flex-col">
            <button
              onClick={() => onMonthClick(monthIndex)}
              aria-label={`View ${monthName} ${year}`}
              className="min-h-[48px] text-sm font-semibold text-neutral-900 dark:text-neutral-100 text-left px-1 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
            >
              {monthName}
            </button>

            {/* Mini calendar grid — presentational only */}
            <div aria-hidden="true" className="px-1">
              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 mb-0.5">
                {DAY_LETTERS.map((letter, i) => (
                  <div
                    key={i}
                    className="text-center text-[9px] font-medium text-neutral-400 dark:text-neutral-500"
                  >
                    {letter}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-y-0.5">
                {days.map((day) => {
                  const dateStr = toISODateString(day);
                  const isCurrentMonth = day.getMonth() === monthIndex;
                  const hasPeriod = periodDateMap.has(dateStr);
                  const isPredicted = !hasPeriod && predictedDateSet.has(dateStr);
                  const isOvulation = !hasPeriod && ovulationDateSet.has(dateStr);
                  const isFertilityWindow = !hasPeriod && !isOvulation && fertilityWindowDateSet.has(dateStr);
                  const isToday = dateStr === today;

                  let cellClass =
                    'flex items-center justify-center w-5 h-5 mx-auto rounded-full text-[9px] ';

                  if (!isCurrentMonth) {
                    cellClass += 'text-neutral-200 dark:text-neutral-700';
                  } else if (hasPeriod) {
                    cellClass += 'bg-rose-500 text-white';
                  } else if (isPredicted) {
                    cellClass += 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300';
                  } else if (isOvulation) {
                    cellClass += 'bg-emerald-500 dark:bg-emerald-600 text-white';
                  } else if (isFertilityWindow) {
                    cellClass += 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300';
                  } else if (isToday) {
                    cellClass += 'ring-2 ring-rose-500 text-rose-600 dark:text-rose-400 font-bold';
                  } else {
                    cellClass += 'text-neutral-700 dark:text-neutral-400';
                  }

                  return (
                    <div key={dateStr} className={cellClass}>
                      {isCurrentMonth ? day.getDate() : ''}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
