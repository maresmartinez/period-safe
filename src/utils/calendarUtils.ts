import { toISODateString } from './dateUtils.ts';
import type { Period, Prediction } from '../types.ts';
import type { PeriodPosition } from '../components/calendar/CalendarCell.tsx';

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
      const [y, m, d] = currentStr.split('-').map(Number);
      currentStr = toISODateString(new Date(y, m - 1, d + 1));
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
      const [y, m, d] = currentStr.split('-').map(Number);
      currentStr = toISODateString(new Date(y, m - 1, d + 1));
    }
  }
  return set;
}
