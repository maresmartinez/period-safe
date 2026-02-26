/**
 * Pure cycle prediction utilities — no React dependencies.
 *
 * A "cycle" is the number of days from the startDate of one period
 * to the startDate of the next.
 *
 * Anomaly thresholds: < 21 days or > 35 days.
 */

/**
 * Adds the given number of days to an ISO date string and returns a new ISO date string.
 * @param {string} isoDate - YYYY-MM-DD
 * @param {number} days    - may be negative; fractional values are rounded
 * @returns {string} YYYY-MM-DD
 */
function addDaysToISO(isoDate, days) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const result = new Date(y, m - 1, d + Math.round(days));
  const yr = result.getFullYear();
  const mo = String(result.getMonth() + 1).padStart(2, '0');
  const da = String(result.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${da}`;
}

/**
 * Returns the number of calendar days between two ISO date strings.
 * @param {string} isoDateA - YYYY-MM-DD (earlier)
 * @param {string} isoDateB - YYYY-MM-DD (later)
 * @returns {number}
 */
function daysBetween(isoDateA, isoDateB) {
  const [y1, m1, d1] = isoDateA.split('-').map(Number);
  const [y2, m2, d2] = isoDateB.split('-').map(Number);
  const a = new Date(y1, m1 - 1, d1);
  const b = new Date(y2, m2 - 1, d2);
  return Math.round((b - a) / 86400000);
}

/**
 * Analyzes cycle lengths from a list of periods.
 *
 * Requires at least 2 periods (to form at least 1 cycle).
 * The `endDate` of each period is irrelevant — only `startDate` is used.
 *
 * @param {Array<{startDate: string}>} periods
 * @returns {{
 *   averageCycleLength: number,
 *   variance: number,          // population standard deviation of cycle lengths
 *   cycleLengths: number[],
 *   basedOnNCycles: number
 * } | null}
 */
export function analyzeCycles(periods) {
  if (!periods || periods.length < 2) return null;

  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));

  const cycleLengths = [];
  for (let i = 1; i < sorted.length; i++) {
    cycleLengths.push(daysBetween(sorted[i - 1].startDate, sorted[i].startDate));
  }

  const n = cycleLengths.length;
  const mean = cycleLengths.reduce((acc, l) => acc + l, 0) / n;
  // Population standard deviation
  const stdDev = Math.sqrt(cycleLengths.reduce((acc, l) => acc + (l - mean) ** 2, 0) / n);

  return {
    averageCycleLength: Math.round(mean * 100) / 100,
    variance: Math.round(stdDev * 100) / 100,
    cycleLengths,
    basedOnNCycles: n,
  };
}

/**
 * Checks whether any cycle lengths fall outside the normal 21–35 day range.
 *
 * @param {number[]} cycleLengths
 * @returns {{ flagged: boolean, reason: string | null }}
 */
export function checkCycleAnomalies(cycleLengths) {
  if (!cycleLengths || cycleLengths.length === 0) {
    return { flagged: false, reason: null };
  }

  const shortCycles = cycleLengths.filter((l) => l < 21);
  const longCycles = cycleLengths.filter((l) => l > 35);

  if (shortCycles.length === 0 && longCycles.length === 0) {
    return { flagged: false, reason: null };
  }

  const reasons = [];
  if (shortCycles.length > 0) {
    reasons.push(`cycles shorter than 21 days: ${shortCycles.join(', ')}`);
  }
  if (longCycles.length > 0) {
    reasons.push(`cycles longer than 35 days: ${longCycles.join(', ')}`);
  }
  return { flagged: true, reason: reasons.join('; ') };
}

/**
 * Generates predicted future period start dates based on historical cycle data.
 *
 * Returns an empty array if fewer than 2 periods are provided.
 *
 * Confidence formula: max(0, 1 - variance / averageCycleLength)
 * Prediction window:
 *   windowEarlyStart = predictedStartDate - floor(variance)
 *   windowLateStart  = predictedStartDate + ceil(variance)
 *
 * @param {Array<{startDate: string}>} periods
 * @param {number} count - number of future periods to predict (default 3)
 * @returns {Array<{
 *   id: string,
 *   predictedStartDate: string,
 *   windowEarlyStart: string,
 *   windowLateStart: string,
 *   confidence: number,
 *   basedOnLastNCycles: number,
 *   anomalyFlag: boolean,
 *   schemaVersion: 1
 * }>}
 */
export function predictNextPeriods(periods, count = 3) {
  if (!periods || periods.length < 2) return [];

  const summary = analyzeCycles(periods);
  if (!summary) return [];

  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const lastPeriod = sorted[sorted.length - 1];

  const { averageCycleLength, variance, basedOnNCycles, cycleLengths } = summary;
  const { flagged: anomalyFlag } = checkCycleAnomalies(cycleLengths);
  const confidence = Math.round(Math.max(0, 1 - variance / averageCycleLength) * 100) / 100;

  const ts = Date.now();
  const predictions = [];

  for (let i = 0; i < count; i++) {
    const daysAhead = Math.round(averageCycleLength) * (i + 1);
    const predictedStartDate = addDaysToISO(lastPeriod.startDate, daysAhead);
    const windowEarlyStart = addDaysToISO(predictedStartDate, -Math.floor(variance));
    const windowLateStart = addDaysToISO(predictedStartDate, Math.ceil(variance));

    predictions.push({
      id: `pred-${ts}-${i}`,
      predictedStartDate,
      windowEarlyStart,
      windowLateStart,
      confidence,
      basedOnLastNCycles: basedOnNCycles,
      anomalyFlag,
      schemaVersion: 1,
    });
  }

  return predictions;
}
