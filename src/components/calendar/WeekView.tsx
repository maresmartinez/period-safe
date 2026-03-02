import { useMemo, useState } from 'react';
import { getWeekDays, toISODateString, formatWeekRangeLabel, getWeekStart } from '../../utils/dateUtils.ts';
import { buildPeriodDateMap, buildPredictedDateSet, buildOvulationDateSet, buildFertilityWindowDateSet } from '../../utils/calendarUtils.ts';
import PeriodDetailModal from './PeriodDetailModal.tsx';
import type { Period, Prediction } from '../../types.ts';

const DAY_OF_WEEK_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface WeekViewProps {
  anchorDate: Date;
  periods?: Period[];
  predictions?: Prediction[];
  averageCycleLength?: number;
  onEditPeriod?: (period: Period) => void;
  onDeletePeriod?: (id: string) => void;
}

export default function WeekView({
  anchorDate,
  periods = [],
  predictions = [],
  averageCycleLength = 28,
  onEditPeriod,
  onDeletePeriod,
}: WeekViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);

  const weekDays = useMemo(() => getWeekDays(anchorDate), [anchorDate]);
  const weekStart = useMemo(() => getWeekStart(anchorDate), [anchorDate]);
  const weekLabel = useMemo(() => formatWeekRangeLabel(weekStart), [weekStart]);

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
    <div
      role="group"
      aria-label={`Week of ${weekLabel}`}
      className="w-full"
    >
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => {
          const dateStr = toISODateString(day);
          const isToday = dateStr === today;
          const periodInfo = periodDateMap.get(dateStr);
          const isPredicted = !periodInfo && predictedDateSet.has(dateStr);
          const isOvulation = !periodInfo && ovulationDateSet.has(dateStr);
          const isFertilityWindow = !periodInfo && !isOvulation && fertilityWindowDateSet.has(dateStr);
          const dayOfWeek = day.getDay();
          const dayLabel = `${DAY_OF_WEEK_SHORT[dayOfWeek]}, ${MONTH_NAMES[day.getMonth()]} ${day.getDate()}`;

          return (
            <div
              key={dateStr}
              className={`flex flex-col min-h-[120px] rounded-lg border p-2 ${
                isToday
                  ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-600'
                  : 'border-neutral-200 dark:border-neutral-700'
              }`}
            >
              {/* Day header */}
              <div className="text-center mb-2">
                <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {DAY_OF_WEEK_SHORT[dayOfWeek]}
                </div>
                <div
                  className={`text-sm font-semibold inline-flex items-center justify-center w-7 h-7 rounded-full mx-auto ${
                    isToday
                      ? 'bg-rose-500 text-white'
                      : 'text-neutral-900 dark:text-neutral-100'
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>

              {/* Period indicator */}
              {periodInfo && (
                <button
                  onClick={() => setSelectedPeriod(periodInfo.period)}
                  aria-label={`${dayLabel}, has period — view details`}
                  className="w-full mt-1 rounded bg-rose-500 dark:bg-rose-600 text-white text-xs px-1 py-1 text-left font-medium hover:bg-rose-600 dark:hover:bg-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1 transition-colors min-h-[32px]"
                >
                  Period
                  {periodInfo.period.symptoms?.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      {periodInfo.period.symptoms.slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="inline-block bg-rose-400/40 text-white rounded px-1 text-[10px] capitalize"
                        >
                          {s}
                        </span>
                      ))}
                      {periodInfo.period.symptoms.length > 2 && (
                        <span className="text-[10px] text-rose-100">
                          +{periodInfo.period.symptoms.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              )}

              {/* Predicted indicator */}
              {isPredicted && (
                <div
                  aria-label={`${dayLabel}, predicted period`}
                  className="w-full mt-1 rounded border border-dashed border-rose-300 dark:border-rose-600 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300 text-xs px-1 py-1 min-h-[32px]"
                >
                  Predicted
                </div>
              )}

              {/* Ovulation indicator */}
              {isOvulation && (
                <div
                  aria-label={`${dayLabel}, predicted ovulation`}
                  className="w-full mt-1 rounded bg-purple-500 dark:bg-purple-600 text-white text-xs px-1 py-1 min-h-[32px] font-medium"
                >
                  Ovulation
                </div>
              )}

              {/* Fertility window indicator */}
              {isFertilityWindow && (
                <div
                  aria-label={`${dayLabel}, fertility window`}
                  className="w-full mt-1 rounded border border-dashed border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs px-1 py-1 min-h-[32px]"
                >
                  Fertile
                </div>
              )}
            </div>
          );
        })}
      </div>

      <PeriodDetailModal
        period={selectedPeriod}
        onClose={() => setSelectedPeriod(null)}
        onEdit={(p) => { setSelectedPeriod(null); onEditPeriod?.(p); }}
        onDelete={(id) => { onDeletePeriod?.(id); setSelectedPeriod(null); }}
      />
    </div>
  );
}
