import { describe, it, expect } from 'vitest';
import { analyzeCycles, predictNextPeriods, checkCycleAnomalies, DEFAULT_PERIOD_LENGTH } from './cyclePrediction.ts';
import type { Period } from '../types.ts';

/**
 * Creates a minimal Period object for testing.
 * Only startDate matters for cycle calculations; endDate is used for period-length calculations.
 */
function makePeriod(startDate: string, endDate?: string, id?: string): Period {
  return {
    id: id ?? `period-${startDate}`,
    startDate,
    endDate: endDate ?? null,
    flow: null,
    symptoms: [],
    mood: null,
    notes: null,
    schemaVersion: 1,
  };
}

// ---------------------------------------------------------------------------
// analyzeCycles
// ---------------------------------------------------------------------------
describe('analyzeCycles', () => {
  it('returns null for empty array', () => {
    expect(analyzeCycles([])).toBeNull();
  });

  it('returns null for a single period', () => {
    expect(analyzeCycles([makePeriod('2024-01-01')])).toBeNull();
  });

  it('computes correct values for 1 cycle (2 periods, 28-day gap)', () => {
    const periods = [makePeriod('2024-01-01'), makePeriod('2024-01-29')];
    const result = analyzeCycles(periods);
    expect(result).not.toBeNull();
    expect(result!.cycleLengths).toEqual([28]);
    expect(result!.averageCycleLength).toBe(28);
    expect(result!.variance).toBe(0); // std dev of a single value is 0
  });

  it('computes correct average for two identical cycles', () => {
    const periods = [
      makePeriod('2024-01-01'),
      makePeriod('2024-01-29'), // +28
      makePeriod('2024-02-26'), // +28
    ];
    const result = analyzeCycles(periods);
    expect(result!.averageCycleLength).toBe(28);
    expect(result!.cycleLengths).toEqual([28, 28]);
    expect(result!.variance).toBe(0);
  });

  it('computes correct average and variance for varying cycles', () => {
    // cycles: 28, 30 → mean = 29, population std dev = 1
    const periods = [
      makePeriod('2024-01-01'),
      makePeriod('2024-01-29'), // +28
      makePeriod('2024-02-28'), // +30
    ];
    const result = analyzeCycles(periods);
    expect(result!.averageCycleLength).toBe(29);
    expect(result!.cycleLengths).toEqual([28, 30]);
    expect(result!.variance).toBe(1); // sqrt(((28-29)² + (30-29)²) / 2) = 1
  });

  it('sorts periods by startDate before computing', () => {
    // Periods provided in reverse order
    const periods = [makePeriod('2024-01-29'), makePeriod('2024-01-01')];
    const result = analyzeCycles(periods);
    expect(result!.cycleLengths).toEqual([28]);
    expect(result!.averageCycleLength).toBe(28);
  });

  it('endDate on a period does not affect cycle length calculation', () => {
    const p1 = { ...makePeriod('2024-01-01'), endDate: '2024-01-05' };
    const p2 = { ...makePeriod('2024-01-29'), endDate: null };
    const result = analyzeCycles([p1, p2]);
    expect(result!.cycleLengths).toEqual([28]);
  });
});

// ---------------------------------------------------------------------------
// predictNextPeriods
// ---------------------------------------------------------------------------
describe('predictNextPeriods', () => {
  it('returns empty array for 0 periods', () => {
    expect(predictNextPeriods([])).toEqual([]);
  });

  it('returns empty array for 1 period', () => {
    expect(predictNextPeriods([makePeriod('2024-01-01')])).toEqual([]);
  });

  it('returns 24 predictions by default for 2+ periods', () => {
    const periods = [
      makePeriod('2024-01-01'),
      makePeriod('2024-01-29'), // 28-day cycle
    ];
    const result = predictNextPeriods(periods);
    expect(result).toHaveLength(24);
  });

  it('returns the requested count of predictions', () => {
    const periods = [makePeriod('2024-01-01'), makePeriod('2024-01-29')];
    expect(predictNextPeriods(periods, 1)).toHaveLength(1);
    expect(predictNextPeriods(periods, 5)).toHaveLength(5);
  });

  it('advances predicted dates by average cycle length each step', () => {
    // Two equal 28-day cycles → average = 28, variance = 0
    const periods = [
      makePeriod('2024-01-01'),
      makePeriod('2024-01-29'), // +28
      makePeriod('2024-02-26'), // +28  (last period)
    ];
    const predictions = predictNextPeriods(periods);
    // Last period: 2024-02-26
    expect(predictions[0].predictedStartDate).toBe('2024-03-25'); // +28
    expect(predictions[1].predictedStartDate).toBe('2024-04-22'); // +56
    expect(predictions[2].predictedStartDate).toBe('2024-05-20'); // +84
  });

  it('confidence is 1.0 when all cycle lengths are identical', () => {
    const periods = [
      makePeriod('2024-01-01'),
      makePeriod('2024-01-29'), // 28
      makePeriod('2024-02-26'), // 28
    ];
    const [pred] = predictNextPeriods(periods, 1);
    expect(pred.confidence).toBe(1);
  });

  it('confidence is less than 1.0 when cycles vary', () => {
    const periods = [
      makePeriod('2024-01-01'),
      makePeriod('2024-01-29'), // 28
      makePeriod('2024-02-28'), // 30
    ];
    const [pred] = predictNextPeriods(periods, 1);
    expect(pred.confidence).toBeLessThan(1);
    expect(pred.confidence).toBeGreaterThanOrEqual(0);
  });

  it('confidence is >= 0 (never negative)', () => {
    // Extremely variable cycles that could yield negative without the max(0,...) clamp
    const periods = [
      makePeriod('2024-01-01'),
      makePeriod('2024-01-15'), // 14 — very short
      makePeriod('2024-02-25'), // 41 — very long
    ];
    const [pred] = predictNextPeriods(periods, 1);
    expect(pred.confidence).toBeGreaterThanOrEqual(0);
  });

  it('all predictions share the same confidence', () => {
    const periods = [
      makePeriod('2024-01-01'),
      makePeriod('2024-01-29'),
      makePeriod('2024-02-26'),
    ];
    const predictions = predictNextPeriods(periods, 3);
    const confs = predictions.map((p) => p.confidence);
    expect(new Set(confs).size).toBe(1);
  });

  it('each prediction has the required schema shape', () => {
    const periods = [makePeriod('2024-01-01'), makePeriod('2024-01-29')];
    const [pred] = predictNextPeriods(periods, 1);
    expect(pred).toHaveProperty('id');
    expect(pred).toHaveProperty('predictedStartDate');
    expect(pred).toHaveProperty('predictedEndDate');
    expect(pred).toHaveProperty('confidence');
    expect(pred.schemaVersion).toBe(1);
    expect(pred.id).toMatch(/^pred-\d+-0$/);
  });

  it('predictedEndDate is (DEFAULT_PERIOD_LENGTH - 1) days after predictedStartDate when no endDates exist', () => {
    const periods = [makePeriod('2024-01-01'), makePeriod('2024-01-29')];
    const [pred] = predictNextPeriods(periods, 1);
    // predictedStartDate = 2024-02-26 (2024-01-29 + 28 days)
    // predictedEndDate = 2024-02-26 + 4 = 2024-03-01 (Feb 2024 has 29 days, 26+4=30→Mar 1)
    expect(DEFAULT_PERIOD_LENGTH).toBe(5); // guard: test assumes 5-day default
    expect(pred.predictedStartDate).toBe('2024-02-26');
    expect(pred.predictedEndDate).toBe('2024-03-01');
  });

  it('predictedEndDate reflects historical period length when periods have endDates', () => {
    // Each period is 7 days long
    const p1 = makePeriod('2024-01-01', '2024-01-07'); // 7 days
    const p2 = makePeriod('2024-01-29', '2024-02-04'); // 7 days
    const [pred] = predictNextPeriods([p1, p2], 1);
    // avg period length = 7 → predictedEndDate = predictedStartDate + 6 days
    // predictedStartDate = 2024-02-26, predictedEndDate = 2024-03-03
    expect(pred.predictedStartDate).toBe('2024-02-26');
    expect(pred.predictedEndDate).toBe('2024-03-03');
  });

  it('produces low confidence for highly irregular cycles like 12, 26, 40 days', () => {
    const periods = [
      makePeriod('2024-01-01'),
      makePeriod('2024-01-13'), // 12
      makePeriod('2024-02-08'), // 26
      makePeriod('2024-03-19'), // 40
    ];
    const [pred] = predictNextPeriods(periods, 1);
    expect(pred.confidence).toBeLessThan(0.6);
  });

  it('single long outlier cycle does not significantly skew average when there is strong history', () => {
    // 10 cycles of 28 days, then one 120-day gap
    const periods: Period[] = [];
    let current = '2024-01-01';
    periods.push(makePeriod(current));
    for (let i = 0; i < 10; i++) {
      const start = new Date(current + 'T00:00:00');
      start.setDate(start.getDate() + 28);
      const iso = start.toISOString().slice(0, 10);
      periods.push(makePeriod(iso));
      current = iso;
    }
    // Add one long gap of 120 days
    const last = new Date(current + 'T00:00:00');
    last.setDate(last.getDate() + 120);
    const longIso = last.toISOString().slice(0, 10);
    periods.push(makePeriod(longIso));

    const summary = analyzeCycles(periods)!;
    expect(summary.cycleLengths).toContain(120);
    // Effective average should stay close to the typical 28-day pattern.
    expect(summary.averageCycleLength).toBeGreaterThanOrEqual(27);
    expect(summary.averageCycleLength).toBeLessThanOrEqual(29);
  });
});

// ---------------------------------------------------------------------------
// checkCycleAnomalies
// ---------------------------------------------------------------------------
describe('checkCycleAnomalies', () => {
  it('returns not flagged for empty array', () => {
    expect(checkCycleAnomalies([])).toEqual({ flagged: false, reason: null });
  });

  it('returns not flagged for normal cycles within 21–35 days', () => {
    expect(checkCycleAnomalies([21, 28, 35])).toEqual({ flagged: false, reason: null });
  });

  it('does not flag boundary value 21 (inclusive lower bound)', () => {
    expect(checkCycleAnomalies([21]).flagged).toBe(false);
  });

  it('does not flag boundary value 35 (inclusive upper bound)', () => {
    expect(checkCycleAnomalies([35]).flagged).toBe(false);
  });

  it('flags a cycle of 20 days (shorter than 21)', () => {
    const result = checkCycleAnomalies([20]);
    expect(result.flagged).toBe(true);
    expect(result.reason).toBeTruthy();
  });

  it('flags a cycle of 36 days (longer than 35)', () => {
    const result = checkCycleAnomalies([36]);
    expect(result.flagged).toBe(true);
    expect(result.reason).toBeTruthy();
  });

  it('flags when one short cycle is mixed with normal cycles', () => {
    expect(checkCycleAnomalies([20, 28, 30]).flagged).toBe(true);
  });

  it('flags when one long cycle is mixed with normal cycles', () => {
    expect(checkCycleAnomalies([28, 36, 28]).flagged).toBe(true);
  });

  it('includes reason text describing the anomaly', () => {
    const short = checkCycleAnomalies([15]);
    expect(short.reason).toMatch(/shorter than 21/);

    const long = checkCycleAnomalies([40]);
    expect(long.reason).toMatch(/longer than 35/);
  });

  it('flags an irregular sequence like 12, 26, 40 days', () => {
    const result = checkCycleAnomalies([12, 26, 40]);
    expect(result.flagged).toBe(true);
  });
});
