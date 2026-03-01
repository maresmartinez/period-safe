import type { Period, Prediction } from '../types.ts';
import type { PeriodPosition } from '../components/calendar/CalendarCell.tsx';

/** Advance a YYYY-MM-DD string by one day using pure arithmetic (no Date objects). */
function nextDay(dateStr: string): string {
  const y = +dateStr.slice(0, 4);
  const m = +dateStr.slice(5, 7);
  let d = +dateStr.slice(8, 10) + 1;
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const maxD = m === 2 ? (leap ? 29 : 28) : (m <= 7 ? (m % 2 === 0 ? 30 : 31) : (m % 2 === 0 ? 31 : 30));
  if (d > maxD) {
    d = 1;
    if (m + 1 > 12) return `${y + 1}-01-01`;
    return `${y}-${m + 1 < 10 ? '0' + (m + 1) : m + 1}-01`;
  }
  return `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
}

export interface PeriodDateMapEntry {
  period: Period;
  position: PeriodPosition;
}

/**
 * Builds a map from ISO date string → { period, position } for all logged periods.
 * position: 'start' | 'mid' | 'end' | 'single'
 */
export function buildPeriodDateMap(periods: Period[]): Map<string, PeriodDateMapEntry> {
  const map = new Map<string, PeriodDateMapEntry>();
  for (const period of periods) {
    const startStr = period.startDate;
    const endStr = period.endDate ?? period.startDate;
    let currentStr = startStr;

    while (currentStr <= endStr) {
      const isStart = currentStr === startStr;
      const isEnd = currentStr === endStr;
      let position: PeriodPosition;
      if (isStart && isEnd) position = 'single';
      else if (isStart) position = 'start';
      else if (isEnd) position = 'end';
      else position = 'mid';

      map.set(currentStr, { period, position });

      // Advance one day
      currentStr = nextDay(currentStr);
    }
  }
  return map;
}

/**
 * Builds a Set of ISO date strings for all predicted period days.
 * Marks every day in the predicted period range (predictedStartDate → predictedEndDate).
 */
export function buildPredictedDateSet(predictions: Prediction[]): Set<string> {
  const set = new Set<string>();
  for (const pred of predictions) {
    const startStr = pred.predictedStartDate;
    const endStr = pred.predictedEndDate ?? pred.predictedStartDate;
    if (!startStr) continue;

    let currentStr = startStr;
    while (currentStr <= endStr) {
      set.add(currentStr);
      currentStr = nextDay(currentStr);
    }
  }
  return set;
}
