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
  isPredictionUncertain: boolean;
  predictionStability: 'low' | 'medium' | 'high';
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
    let variance = 0;
    let averageCycleLength = 0;
    if (cycleSummary) {
      const { flagged } = checkCycleAnomalies(cycleSummary.cycleLengths);
      anomalyDetected = flagged;
      variance = cycleSummary.variance;
      averageCycleLength = cycleSummary.averageCycleLength;
    }

    const primaryPrediction = predictions[0];
    const confidence = primaryPrediction ? primaryPrediction.confidence : 0;

    // Heuristics for uncertainty:
    // - very little data
    // - high variance relative to typical cycle length
    // - explicit anomaly detection
    // - low confidence from the predictor
    const veryLittleData = !hasEnoughData;
    const highVariance =
      averageCycleLength > 0 ? variance >= 7 || variance / averageCycleLength >= 0.25 : false;
    const lowConfidence = confidence > 0 ? confidence < 0.6 : true;

    const isPredictionUncertain = Boolean(
      veryLittleData || highVariance || anomalyDetected || lowConfidence
    );

    let predictionStability: 'low' | 'medium' | 'high';
    if (!predictions.length || veryLittleData || anomalyDetected || variance >= 10 || lowConfidence) {
      predictionStability = 'low';
    } else if (variance >= 4 || confidence < 0.8) {
      predictionStability = 'medium';
    } else {
      predictionStability = 'high';
    }

    return {
      predictions,
      cycleSummary,
      hasEnoughData,
      anomalyDetected,
      isPredictionUncertain,
      predictionStability,
    };
  }, [periods]);
}
