import { describe, it, expect } from 'vitest';
import { analyzeCycles, predictNextPeriods, checkCycleAnomalies } from './cyclePrediction.js';

/**
 * Creates a minimal Period object for testing.
 * Only startDate matters for cycle calculations.
 */
function makePeriod(startDate, id) {
  return {
    id: id ?? `period-${startDate}`,
    startDate,
    endDate: null,
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
    expect(result.cycleLengths).toEqual([28]);
    expect(result.averageCycleLength).toBe(28);
    expect(result.variance).toBe(0); // std dev of a single value is 0
    expect(result.basedOnNCycles).toBe(1);
  });

  it('computes correct average for two identical cycles', () => {
    const periods = [
      makePeriod('2024-01-01'),
      makePeriod('2024-01-29'), // +28
      makePeriod('2024-02-26'), // +28
    ];
    const result = analyzeCycles(periods);
    expect(result.averageCycleLength).toBe(28);
    expect(result.cycleLengths).toEqual([28, 28]);
    expect(result.variance).toBe(0);
    expect(result.basedOnNCycles).toBe(2);
  });

  it('computes correct average and variance for varying cycles', () => {
    // cycles: 28, 30 → mean = 29, population std dev = 1
    const periods = [
      makePeriod('2024-01-01'),
      makePeriod('2024-01-29'), // +28
      makePeriod('2024-02-28'), // +30
    ];
    const result = analyzeCycles(periods);
    expect(result.averageCycleLength).toBe(29);
    expect(result.cycleLengths).toEqual([28, 30]);
    expect(result.variance).toBe(1); // sqrt(((28-29)² + (30-29)²) / 2) = 1
    expect(result.basedOnNCycles).toBe(2);
  });

  it('sorts periods by startDate before computing', () => {
    // Periods provided in reverse order
    const periods = [makePeriod('2024-01-29'), makePeriod('2024-01-01')];
    const result = analyzeCycles(periods);
    expect(result.cycleLengths).toEqual([28]);
    expect(result.averageCycleLength).toBe(28);
  });

  it('endDate on a period does not affect cycle length calculation', () => {
    const p1 = { ...makePeriod('2024-01-01'), endDate: '2024-01-05' };
    const p2 = { ...makePeriod('2024-01-29'), endDate: null };
    const result = analyzeCycles([p1, p2]);
    expect(result.cycleLengths).toEqual([28]);
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

  it('returns 3 predictions by default for 2+ periods', () => {
    const periods = [
      makePeriod('2024-01-01'),
      makePeriod('2024-01-29'), // 28-day cycle
    ];
    const result = predictNextPeriods(periods);
    expect(result).toHaveLength(3);
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

  it('anomalyFlag is false for normal cycle lengths (21–35 days)', () => {
    const periods = [
      makePeriod('2024-01-01'),
      makePeriod('2024-01-29'), // 28
      makePeriod('2024-02-26'), // 28
    ];
    const [pred] = predictNextPeriods(periods, 1);
    expect(pred.anomalyFlag).toBe(false);
  });

  it('anomalyFlag is true when a cycle is shorter than 21 days', () => {
    const periods = [
      makePeriod('2024-01-01'),
      makePeriod('2024-01-15'), // 14 — too short
      makePeriod('2024-02-12'), // 28
    ];
    const predictions = predictNextPeriods(periods);
    expect(predictions[0].anomalyFlag).toBe(true);
  });

  it('anomalyFlag is true when a cycle is longer than 35 days', () => {
    const periods = [
      makePeriod('2024-01-01'),
      makePeriod('2024-02-10'), // 40 — too long
      makePeriod('2024-03-09'), // 28
    ];
    const predictions = predictNextPeriods(periods);
    expect(predictions[0].anomalyFlag).toBe(true);
  });

  it('all predictions share the same anomalyFlag and confidence', () => {
    const periods = [
      makePeriod('2024-01-01'),
      makePeriod('2024-01-29'),
      makePeriod('2024-02-26'),
    ];
    const predictions = predictNextPeriods(periods, 3);
    const flags = predictions.map((p) => p.anomalyFlag);
    const confs = predictions.map((p) => p.confidence);
    expect(new Set(flags).size).toBe(1);
    expect(new Set(confs).size).toBe(1);
  });

  it('each prediction has the required schema shape', () => {
    const periods = [makePeriod('2024-01-01'), makePeriod('2024-01-29')];
    const [pred] = predictNextPeriods(periods, 1);
    expect(pred).toHaveProperty('id');
    expect(pred).toHaveProperty('predictedStartDate');
    expect(pred).toHaveProperty('windowEarlyStart');
    expect(pred).toHaveProperty('windowLateStart');
    expect(pred).toHaveProperty('confidence');
    expect(pred).toHaveProperty('basedOnLastNCycles');
    expect(pred).toHaveProperty('anomalyFlag');
    expect(pred.schemaVersion).toBe(1);
    expect(pred.id).toMatch(/^pred-\d+-0$/);
  });

  it('windowEarlyStart <= predictedStartDate <= windowLateStart', () => {
    const periods = [
      makePeriod('2024-01-01'),
      makePeriod('2024-01-29'), // 28
      makePeriod('2024-02-28'), // 30 — introduces variance
    ];
    const [pred] = predictNextPeriods(periods, 1);
    expect(pred.windowEarlyStart <= pred.predictedStartDate).toBe(true);
    expect(pred.predictedStartDate <= pred.windowLateStart).toBe(true);
  });

  it('window collapses to a single date when variance is 0', () => {
    const periods = [
      makePeriod('2024-01-01'),
      makePeriod('2024-01-29'), // 28 — single identical cycle, variance = 0
    ];
    const [pred] = predictNextPeriods(periods, 1);
    expect(pred.windowEarlyStart).toBe(pred.predictedStartDate);
    expect(pred.windowLateStart).toBe(pred.predictedStartDate);
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
});
