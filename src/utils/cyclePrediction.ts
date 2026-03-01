/**
 * Pure cycle prediction utilities — no React dependencies.
 *
 * A "cycle" is the number of days from the startDate of one period
 * to the startDate of the next.
 *
 * Anomaly thresholds: < 21 days or > 35 days.
 */

import type { CycleSummary, AnomalyResult, Prediction } from '../types.ts';

export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_LENGTH = 5;

/**
 * Adds the given number of days to an ISO date string and returns a new ISO date string.
 */
function addDaysToISO(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const result = new Date(y, m - 1, d + Math.round(days));
  const yr = result.getFullYear();
  const mo = String(result.getMonth() + 1).padStart(2, '0');
  const da = String(result.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${da}`;
}

/**
 * Returns the number of calendar days between two ISO date strings.
 */
function daysBetween(isoDateA: string, isoDateB: string): number {
  const [y1, m1, d1] = isoDateA.split('-').map(Number);
  const [y2, m2, d2] = isoDateB.split('-').map(Number);
  const a = new Date(y1, m1 - 1, d1);
  const b = new Date(y2, m2 - 1, d2);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/**
 * Analyzes cycle lengths from a list of periods.
 *
 * Requires at least 2 periods (to form at least 1 cycle).
 * The `endDate` of each period is irrelevant — only `startDate` is used.
 */
export function analyzeCycles(periods: Array<{ startDate: string }>): CycleSummary | null {
  if (!periods || periods.length < 2) return null;

  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));

  const cycleLengths: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    cycleLengths.push(daysBetween(sorted[i - 1].startDate, sorted[i].startDate));
  }

  const n = cycleLengths.length;
  // Use a trimmed set of cycles for statistics to reduce the impact of single extreme outliers.
  let effectiveCycleLengths = cycleLengths;
  if (n >= 4) {
    const sortedCycles = [...cycleLengths].sort((a, b) => a - b);
    const trimmed = sortedCycles.slice(1, sortedCycles.length - 1);
    if (trimmed.length >= 2) {
      effectiveCycleLengths = trimmed;
    }
  }

  const effectiveN = effectiveCycleLengths.length;
  const mean = effectiveCycleLengths.reduce((acc, l) => acc + l, 0) / effectiveN;
  // Population standard deviation on the effective set
  const stdDev = Math.sqrt(
    effectiveCycleLengths.reduce((acc, l) => acc + (l - mean) ** 2, 0) / effectiveN
  );

  return {
    averageCycleLength: Math.round(mean * 100) / 100,
    variance: Math.round(stdDev * 100) / 100,
    cycleLengths,
  };
}

/**
 * Checks whether any cycle lengths fall outside the normal 21–35 day range.
 */
export function checkCycleAnomalies(cycleLengths: number[]): AnomalyResult {
  if (!cycleLengths || cycleLengths.length === 0) {
    return { flagged: false, reason: null };
  }

  const shortCycles = cycleLengths.filter((l) => l < 21);
  const longCycles = cycleLengths.filter((l) => l > 35);

  if (shortCycles.length === 0 && longCycles.length === 0) {
    return { flagged: false, reason: null };
  }

  const reasons: string[] = [];
  if (shortCycles.length > 0) {
    reasons.push(`cycles shorter than 21 days: ${shortCycles.join(', ')}`);
  }
  if (longCycles.length > 0) {
    reasons.push(`cycles longer than 35 days: ${longCycles.join(', ')}`);
  }
  return { flagged: true, reason: reasons.join('; ') };
}

/**
 * Computes the average period length (in days) from periods that have a non-null endDate.
 * Falls back to DEFAULT_PERIOD_LENGTH when no complete periods are available.
 */
function computeAvgPeriodLength(
  periods: Array<{ startDate: string; endDate?: string | null }>
): number {
  const complete = periods.filter((p) => p.endDate);
  if (complete.length === 0) return DEFAULT_PERIOD_LENGTH;
  const lengths = complete.map((p) => daysBetween(p.startDate, p.endDate!) + 1);
  return Math.round(lengths.reduce((acc, l) => acc + l, 0) / lengths.length);
}

/**
 * Generates predicted future period start and end dates based on historical cycle data.
 *
 * Returns an empty array if fewer than 2 periods are provided.
 */
export function predictNextPeriods(
  periods: Array<{ startDate: string; endDate?: string | null }>,
  count = 24
): Prediction[] {
  if (!periods || periods.length < 2) return [];

  const summary = analyzeCycles(periods);
  if (!summary) return [];

  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const lastPeriod = sorted[sorted.length - 1];

  const { averageCycleLength, variance } = summary;
  const confidence = Math.round(Math.max(0, 1 - variance / averageCycleLength) * 100) / 100;
  const periodLength = computeAvgPeriodLength(sorted);

  const ts = Date.now();
  const predictions: Prediction[] = [];

  for (let i = 0; i < count; i++) {
    const daysAhead = Math.round(averageCycleLength) * (i + 1);
    const predictedStartDate = addDaysToISO(lastPeriod.startDate, daysAhead);
    const predictedEndDate = addDaysToISO(predictedStartDate, periodLength - 1);

    predictions.push({
      id: `pred-${ts}-${i}`,
      predictedStartDate,
      predictedEndDate,
      confidence,
      schemaVersion: 1,
    });
  }

  return predictions;
}
