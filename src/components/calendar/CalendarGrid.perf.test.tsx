import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import CalendarGrid from './CalendarGrid.tsx';
import type { Period, FlowLevel } from '../../types.ts';

const FLOW_VALUES: FlowLevel[] = ['light', 'medium', 'heavy'];

/**
 * Generate `count` test periods spread across `count` days.
 * Periods are spaced approximately 28 days apart (staggered).
 */
function generateTestPeriods(count: number): Period[] {
  const periods: Period[] = [];
  const baseDate = new Date(2015, 0, 1); // Jan 1, 2015

  for (let i = 0; i < count; i++) {
    // Stagger periods across ~28 day cycles
    const startDate = new Date(baseDate);
    startDate.setDate(startDate.getDate() + i * 28);
    const startISO = startDate.toISOString().split('T')[0];

    // End date is 5 days after start
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 5);
    const endISO = endDate.toISOString().split('T')[0];

    periods.push({
      id: `perf-test-${i}`,
      startDate: startISO,
      endDate: endISO,
      flow: FLOW_VALUES[i % 3],
      symptoms: ['cramps', 'fatigue'],
      mood: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
      notes: `Test period ${i + 1}`,
      schemaVersion: 1,
    });
  }

  return periods;
}

describe('CalendarGrid Performance', () => {
  it('renders 500 periods within 200ms', () => {
    const periods = generateTestPeriods(500);

    const start = performance.now();
    render(
      <CalendarGrid
        periods={periods}
        predictions={[]}
        currentMonth={0}
        currentYear={2024}
        onGoToPrevMonth={() => {}}
        onGoToNextMonth={() => {}}
      />
    );
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(200);
    console.log(`✓ 500-period render completed in ${elapsed.toFixed(2)}ms`);
  });

  it('renders 100 periods within 50ms', () => {
    const periods = generateTestPeriods(100);

    const start = performance.now();
    render(
      <CalendarGrid
        periods={periods}
        predictions={[]}
        currentMonth={0}
        currentYear={2024}
        onGoToPrevMonth={() => {}}
        onGoToNextMonth={() => {}}
      />
    );
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(50);
    console.log(`✓ 100-period render completed in ${elapsed.toFixed(2)}ms`);
  });
});
