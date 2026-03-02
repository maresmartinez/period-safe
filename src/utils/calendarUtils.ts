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

/** Shift a YYYY-MM-DD string by n days (negative = subtract) using local time (avoids UTC offset bugs). */
function shiftDays(dateStr: string, n: number): string {
  const y = +dateStr.slice(0, 4);
  const m = +dateStr.slice(5, 7);
  const d = +dateStr.slice(8, 10);
  const date = new Date(y, m - 1, d + n);
  const yr = date.getFullYear();
  const mo = date.getMonth() + 1;
  const dy = date.getDate();
  return `${yr}-${mo < 10 ? '0' + mo : mo}-${dy < 10 ? '0' + dy : dy}`;
}

/**
 * Builds a Set of ISO date strings for predicted ovulation days.
 * Ovulation ≈ 14 days before each predicted period start (luteal phase method).
 * Returns an empty set if averageCycleLength < 14 (biologically meaningless).
 */
export function buildOvulationDateSet(
  predictions: Prediction[],
  averageCycleLength: number
): Set<string> {
  const set = new Set<string>();
  if (averageCycleLength < 14) return set;
  for (const pred of predictions) {
    if (!pred.predictedStartDate) continue;
    set.add(shiftDays(pred.predictedStartDate, -14));
  }
  return set;
}

/**
 * Builds a Set of ISO date strings for the fertile window.
 * Covers 5 days before ovulation through 1 day after ovulation (6 days total).
 * Ovulation day itself is NOT included — it belongs to buildOvulationDateSet.
 * Returns an empty set if averageCycleLength < 14.
 */
export function buildFertilityWindowDateSet(
  predictions: Prediction[],
  averageCycleLength: number
): Set<string> {
  const set = new Set<string>();
  if (averageCycleLength < 14) return set;
  for (const pred of predictions) {
    if (!pred.predictedStartDate) continue;
    const ovulationDate = shiftDays(pred.predictedStartDate, -14);
    // 5 days before ovulation
    for (let i = 1; i <= 5; i++) {
      set.add(shiftDays(ovulationDate, -i));
    }
    // 1 day after ovulation
    set.add(shiftDays(ovulationDate, 1));
  }
  return set;
}
