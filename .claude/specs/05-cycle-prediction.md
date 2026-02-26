# Spec 05 — Cycle Prediction

## Goal

Implement `cyclePrediction.js`, a pure utility module that computes predicted period start windows from historical data, plus the `usePeriodPrediction` hook that feeds those predictions into the UI. Predicted periods render distinctly on the calendar built in spec 04.

---

## Deliverable Definition

- `src/utils/cyclePrediction.js` — pure functions, no React dependencies
- `src/hooks/usePeriodPrediction.js` — React hook wrapping the utility
- `src/utils/cyclePrediction.test.js` — comprehensive unit tests
- Calendar from spec 04 receives and renders prediction data

---

## Scope

**In this slice:**
- Pure `cyclePrediction.js` with: average cycle length, variance, predicted start window, confidence score
- `usePeriodPrediction(periods)` hook
- Wire predictions into the `CalendarGrid` component from spec 04 (pass predictions as prop)
- Edge case handling: fewer than 2 cycles, cycles outside 21–35 day range

**Not in this slice:**
- Persisting predictions to IndexedDB (compute on the fly; no storage)
- User-adjustable prediction algorithm
- Multiple prediction models / advanced statistics
- Push notifications based on predictions (spec 06 has a UI toggle but no implementation)

---

## Implementation Notes

### Algorithm

A "cycle" is the number of days from the `startDate` of one period to the `startDate` of the next.

```
Step 1: Sort periods by startDate ascending
Step 2: Compute cycle lengths = [days between consecutive period startDates]
Step 3: averageCycleLength = mean of cycle lengths
Step 4: variance = standard deviation of cycle lengths
Step 5: predictedStart = lastPeriodStartDate + averageCycleLength days
Step 6: confidence = computed from variance (see below)
Step 7: Repeat for next N predictions (default: 3 future periods)
```

**Confidence score formula:**
```
confidence = max(0, 1 - (variance / averageCycleLength))
// 0.0 = very uncertain, 1.0 = perfectly consistent cycles
// Round to 2 decimal places
```

**Prediction window:**
```
predictedStart = lastStart + averageCycleLength
windowEarlyStart = predictedStart - floor(variance)
windowLateStart = predictedStart + ceil(variance)
```

### `cyclePrediction.js` public API

```js
/**
 * @param {Period[]} periods - sorted by startDate ascending, must have startDate
 * @returns {CycleSummary | null} - null if insufficient data
 */
function analyzeCycles(periods)
// Returns: { averageCycleLength, variance, cycleLengths, basedOnNCycles }

/**
 * @param {Period[]} periods
 * @param {number} count - number of future periods to predict (default 3)
 * @returns {Prediction[]}
 */
function predictNextPeriods(periods, count = 3)
// Returns array of Prediction objects, or [] if < 2 complete cycles

/**
 * @param {number[]} cycleLengths
 * @returns {{ flagged: boolean, reason: string | null }}
 */
function checkCycleAnomalies(cycleLengths)
// Flags if any cycle is outside 21–35 days range
```

### Edge cases

| Condition | Behavior |
|-----------|----------|
| 0 or 1 period logged | `predictNextPeriods` returns `[]`; `analyzeCycles` returns `null` |
| Only 1 complete cycle (2 start dates) | Predict using that single cycle; confidence = low (1 cycle) |
| A cycle length < 21 days | Flag it; still compute average but include `anomalyFlag: true` in result |
| A cycle length > 35 days | Same flagging behavior |
| `endDate` is null | That period still counts for cycle length calculation (only startDate is needed) |

### Prediction object shape
```js
{
  id: 'pred-{timestamp}-{index}',    // not stored; generated at runtime
  predictedStartDate: string,         // ISO date string
  windowEarlyStart: string,           // ISO date string
  windowLateStart: string,            // ISO date string
  confidence: number,                 // 0–1
  basedOnLastNCycles: number,
  anomalyFlag: boolean,
  schemaVersion: 1
}
```

### `usePeriodPrediction(periods)` hook

```js
// Input: Period[] (from usePeriodData)
// Output:
{
  predictions: Prediction[],      // empty array if insufficient data
  cycleSummary: CycleSummary | null,
  hasEnoughData: boolean,         // true if >= 2 complete cycles
  anomalyDetected: boolean,
}
```

The hook is pure computation — no async, no state beyond the computed values. Use `useMemo` to avoid recalculating on every render.

### Wiring into CalendarGrid (spec 04)

In the parent component that renders `<CalendarGrid>`:
```jsx
const { predictions } = usePeriodPrediction(periods);
<CalendarGrid periods={periods} predictions={predictions} ... />
```

The `CalendarGrid` already accepts `predictions` as a prop (built in spec 04). This slice completes the data flow.

### Test cases
- `analyzeCycles([])` → `null`
- `analyzeCycles([oneperiod])` → `null`
- `analyzeCycles([p1, p2])` → correct average and variance for 1 cycle
- `predictNextPeriods([p1, p2, p3])` → 3 predictions with correct `predictedStartDate`
- Prediction dates advance by `averageCycleLength` days each
- Confidence = 1.0 when all cycles are identical length
- Confidence < 1.0 when cycles vary
- Anomaly flag raised for a 20-day cycle
- Anomaly flag raised for a 36-day cycle
- `predictNextPeriods` with fewer than 2 periods → returns `[]`

---

## Acceptance Criteria

- [ ] `analyzeCycles` returns `null` for 0 or 1 period
- [ ] `predictNextPeriods` with 3+ periods returns 3 `Prediction` objects
- [ ] Predicted `startDate` advances by average cycle length between each prediction
- [ ] Confidence is 1.0 when all cycle lengths are equal
- [ ] Cycles < 21 or > 35 days trigger `anomalyFlag: true`
- [ ] Calendar renders predicted period days with a visually distinct (lighter/muted) style
- [ ] `usePeriodPrediction` returns `hasEnoughData: false` with fewer than 2 cycles
- [ ] All unit tests pass (`npm run test`)

---

## Slice Completion Checklist

Before marking this slice done, complete all three steps:

1. **Update `overview.md`:** Mark `05-cycle-prediction.md` checkbox as `[x]` and update the progress counter.

2. **Update `CLAUDE.md`:** Record `usePeriodPrediction` hook contract (updated with actual return shape if it differs), `cyclePrediction.js` public API, and the anomaly detection thresholds (21–35 day range).

3. **Update `README.md`:** Add "Cycle Prediction" to the features list explaining how predictions work (average of past cycles, shown on calendar), including the privacy angle (all computation is local).
