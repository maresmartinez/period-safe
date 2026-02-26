import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CalendarGrid from './CalendarGrid.jsx';

// Wrap in ToastProvider for Modal (which uses Portal)
import { ToastProvider } from '../../stores/ToastContext.jsx';

function renderCalendar(props = {}) {
  const defaults = {
    periods: [],
    predictions: [],
    initialMonth: 0,   // January
    initialYear: 2024,
    onPeriodClick: vi.fn(),
  };
  const merged = { ...defaults, ...props };

  render(
    <ToastProvider>
      <CalendarGrid {...merged} />
    </ToastProvider>
  );

  return merged;
}

describe('CalendarGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // 1. Renders correct number of cells for a given month/year
  // -----------------------------------------------------------------------
  it('renders the correct number of gridcells for January 2024', () => {
    // January 2024: starts Monday → 1 Sun padding day before.
    // Ends Wednesday Jan 31 → 3 trailing padding days (Thu–Sat).
    // Total = 35 cells (5 weeks × 7)
    renderCalendar({ initialMonth: 0, initialYear: 2024 });
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(35);
  });

  it('renders 42 cells for a month requiring 6 weeks', () => {
    // March 2024: starts Friday (5 leading padding days) + 31 days + 6 trailing = 42 cells
    renderCalendar({ initialMonth: 2, initialYear: 2024 }); // March
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(42);
  });

  // -----------------------------------------------------------------------
  // 2. Period days are marked with correct data attribute
  // -----------------------------------------------------------------------
  it('marks period days with data-date and includes "has period" in aria-label', () => {
    const periods = [
      {
        id: 'p1',
        startDate: '2024-01-10',
        endDate: '2024-01-13',
        flow: 'medium',
        symptoms: [],
        mood: null,
        notes: null,
        schemaVersion: 1,
      },
    ];
    renderCalendar({ periods });

    // Each day in the range should have "has period" in aria-label
    expect(
      screen.getByRole('gridcell', { name: /january 10, 2024.*has period/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('gridcell', { name: /january 11, 2024.*has period/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('gridcell', { name: /january 12, 2024.*has period/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('gridcell', { name: /january 13, 2024.*has period/i })
    ).toBeInTheDocument();
    // Jan 14 is NOT in the period
    expect(
      screen.getByRole('gridcell', { name: /january 14, 2024/i })
    ).not.toHaveAttribute('aria-label', expect.stringContaining('has period'));
  });

  // -----------------------------------------------------------------------
  // 3. Clicking a period cell calls onPeriodClick with the correct period
  // -----------------------------------------------------------------------
  it('calls onPeriodClick with the correct period when a period cell is clicked', () => {
    const period = {
      id: 'p2',
      startDate: '2024-01-15',
      endDate: '2024-01-15',
      flow: 'light',
      symptoms: ['cramps'],
      mood: 3,
      notes: 'test',
      schemaVersion: 1,
    };
    const { onPeriodClick } = renderCalendar({ periods: [period] });

    const cell = screen.getByRole('gridcell', { name: /january 15, 2024.*has period/i });
    fireEvent.click(cell);

    expect(onPeriodClick).toHaveBeenCalledOnce();
    expect(onPeriodClick).toHaveBeenCalledWith(period);
  });

  it('opens PeriodDetailModal when a period cell is clicked', () => {
    const period = {
      id: 'p3',
      startDate: '2024-01-20',
      endDate: null,
      flow: 'heavy',
      symptoms: [],
      mood: null,
      notes: null,
      schemaVersion: 1,
    };
    renderCalendar({ periods: [period] });

    const cell = screen.getByRole('gridcell', { name: /january 20, 2024.*has period/i });
    fireEvent.click(cell);

    expect(screen.getByRole('dialog', { name: /period details/i })).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // 4. Keyboard: ArrowRight from last day of month navigates to next month
  // -----------------------------------------------------------------------
  it('navigates to next month when ArrowRight is pressed on the last day of January', () => {
    renderCalendar({ initialMonth: 0, initialYear: 2024 });

    // Click Jan 31 to set focus there
    const jan31 = screen.getByRole('gridcell', { name: /january 31, 2024/i });
    fireEvent.click(jan31);

    // Press ArrowRight on the grid
    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'ArrowRight' });

    // Calendar should now show February 2024
    expect(screen.getByRole('grid', { name: /february 2024/i })).toBeInTheDocument();
  });

  it('navigates to previous month when ArrowLeft is pressed on the first day', () => {
    renderCalendar({ initialMonth: 1, initialYear: 2024 }); // February 2024

    const feb1 = screen.getByRole('gridcell', { name: /february 1, 2024/i });
    fireEvent.click(feb1);

    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'ArrowLeft' });

    expect(screen.getByRole('grid', { name: /january 2024/i })).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // 5. Non-period days do not trigger onPeriodClick
  // -----------------------------------------------------------------------
  it('does not call onPeriodClick when a non-period cell is clicked', () => {
    const { onPeriodClick } = renderCalendar({ periods: [] });

    const cell = screen.getByRole('gridcell', { name: /january 5, 2024/i });
    fireEvent.click(cell);

    expect(onPeriodClick).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // 6. Month nav: "Next" increments month; wraps year at December
  // -----------------------------------------------------------------------
  it('increments the month when "Next month" button is clicked', () => {
    renderCalendar({ initialMonth: 5, initialYear: 2024 }); // June 2024

    fireEvent.click(screen.getByRole('button', { name: /next month/i }));

    expect(screen.getByRole('grid', { name: /july 2024/i })).toBeInTheDocument();
  });

  it('wraps to January of the next year when next is clicked in December', () => {
    renderCalendar({ initialMonth: 11, initialYear: 2024 }); // December 2024

    fireEvent.click(screen.getByRole('button', { name: /next month/i }));

    expect(screen.getByRole('grid', { name: /january 2025/i })).toBeInTheDocument();
  });

  it('decrements the month when "Previous month" button is clicked', () => {
    renderCalendar({ initialMonth: 2, initialYear: 2024 }); // March 2024

    fireEvent.click(screen.getByRole('button', { name: /previous month/i }));

    expect(screen.getByRole('grid', { name: /february 2024/i })).toBeInTheDocument();
  });

  it('wraps to December of the previous year when prev is clicked in January', () => {
    renderCalendar({ initialMonth: 0, initialYear: 2024 }); // January 2024

    fireEvent.click(screen.getByRole('button', { name: /previous month/i }));

    expect(screen.getByRole('grid', { name: /december 2023/i })).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // 7. ARIA: each gridcell has aria-label containing the date
  // -----------------------------------------------------------------------
  it('gives every gridcell an aria-label containing the date', () => {
    renderCalendar({ initialMonth: 0, initialYear: 2024 });
    const cells = screen.getAllByRole('gridcell');
    for (const cell of cells) {
      expect(cell).toHaveAttribute('aria-label');
      // Label must include a year (4-digit number)
      expect(cell.getAttribute('aria-label')).toMatch(/\d{4}/);
    }
  });

  it('includes "predicted period" in aria-label for predicted dates', () => {
    const predictions = [{ id: 'pr1', predictedStartDate: '2024-01-25', confidence: 0.8, basedOnLastNCycles: 3, schemaVersion: 1 }];
    renderCalendar({ predictions });

    expect(
      screen.getByRole('gridcell', { name: /january 25, 2024.*predicted period/i })
    ).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // Additional: PageUp/PageDown keyboard navigation
  // -----------------------------------------------------------------------
  it('navigates to previous month on PageUp', () => {
    renderCalendar({ initialMonth: 3, initialYear: 2024 }); // April 2024

    // Click a cell to focus grid
    fireEvent.click(screen.getByRole('gridcell', { name: /april 15, 2024/i }));

    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'PageUp' });

    expect(screen.getByRole('grid', { name: /march 2024/i })).toBeInTheDocument();
  });

  it('navigates to next month on PageDown', () => {
    renderCalendar({ initialMonth: 3, initialYear: 2024 }); // April 2024

    fireEvent.click(screen.getByRole('gridcell', { name: /april 15, 2024/i }));

    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'PageDown' });

    expect(screen.getByRole('grid', { name: /may 2024/i })).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // Additional: Enter/Space opens modal on period cell
  // -----------------------------------------------------------------------
  it('opens modal when Enter is pressed on a focused period cell', () => {
    const period = {
      id: 'p4',
      startDate: '2024-01-08',
      endDate: null,
      flow: null,
      symptoms: [],
      mood: null,
      notes: null,
      schemaVersion: 1,
    };
    renderCalendar({ periods: [period] });

    // Click the period cell to move focus there
    const cell = screen.getByRole('gridcell', { name: /january 8, 2024.*has period/i });
    fireEvent.click(cell);

    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'Enter' });

    expect(screen.getByRole('dialog', { name: /period details/i })).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // Additional: single-day period shows correct detail in modal
  // -----------------------------------------------------------------------
  it('shows period detail data in the modal', () => {
    const period = {
      id: 'p5',
      startDate: '2024-01-18',
      endDate: '2024-01-22',
      flow: 'heavy',
      symptoms: ['cramps', 'fatigue'],
      mood: 4,
      notes: 'Rough week',
      schemaVersion: 1,
    };
    renderCalendar({ periods: [period] });

    fireEvent.click(screen.getByRole('gridcell', { name: /january 18, 2024.*has period/i }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/january 18, 2024/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/january 22, 2024/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/heavy/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/cramps/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/fatigue/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/rough week/i)).toBeInTheDocument();
  });
});
