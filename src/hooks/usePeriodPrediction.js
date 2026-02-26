import { useMemo } from 'react';
import {
  analyzeCycles,
  predictNextPeriods,
  checkCycleAnomalies,
} from '../utils/cyclePrediction.js';

/**
 * Computes cycle predictions from a list of logged periods.
 *
 * Pure computation — no async, no side effects. Uses useMemo to avoid
 * recalculating on every render unless `periods` changes.
 *
 * @param {Array<{startDate: string}>} periods - from usePeriodData
 * @returns {{
 *   predictions: Prediction[],       // empty array if insufficient data
 *   cycleSummary: CycleSummary|null, // null if < 2 periods
 *   hasEnoughData: boolean,          // true if >= 2 complete cycles (3+ periods)
 *   anomalyDetected: boolean,        // true if any cycle is outside 21–35 days
 * }}
 */
export default function usePeriodPrediction(periods) {
  return useMemo(() => {
    const cycleSummary = analyzeCycles(periods);
    const predictions = predictNextPeriods(periods);
    const hasEnoughData = Boolean(periods && periods.length >= 3);

    let anomalyDetected = false;
    if (cycleSummary) {
      const { flagged } = checkCycleAnomalies(cycleSummary.cycleLengths);
      anomalyDetected = flagged;
    }

    return { predictions, cycleSummary, hasEnoughData, anomalyDetected };
  }, [periods]);
}
