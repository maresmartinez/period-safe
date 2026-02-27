import { useMemo } from 'react';
import {
  analyzeCycles,
  predictNextPeriods,
  checkCycleAnomalies,
} from '../utils/cyclePrediction.ts';
import type { Period, Prediction, CycleSummary } from '../types.ts';

export interface UsePeriodPredictionReturn {
  predictions: Prediction[];
  cycleSummary: CycleSummary | null;
  hasEnoughData: boolean;
  anomalyDetected: boolean;
}

/**
 * Computes cycle predictions from a list of logged periods.
 *
 * Pure computation — no async, no side effects. Uses useMemo to avoid
 * recalculating on every render unless `periods` changes.
 */
export default function usePeriodPrediction(periods: Period[]): UsePeriodPredictionReturn {
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
