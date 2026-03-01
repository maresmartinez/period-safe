import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CalendarToolbar from './CalendarToolbar.tsx';
import type { CalendarView } from '../../types.ts';

function renderToolbar(overrides: Partial<{
  view: CalendarView;
  label: string;
  onSetView: (v: CalendarView) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onJumpToDate: () => void;
}> = {}) {
  const props = {
    view: 'month' as CalendarView,
    label: 'March 2025',
    onSetView: vi.fn(),
    onPrev: vi.fn(),
    onNext: vi.fn(),
    onToday: vi.fn(),
    onJumpToDate: vi.fn(),
    ...overrides,
  };
  render(<CalendarToolbar {...props} />);
  return props;
}

describe('CalendarToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // View switcher
  // -----------------------------------------------------------------------
  it('renders Week, Month, and Year view buttons', () => {
    renderToolbar();
    // Each view button appears twice (mobile + desktop)
    expect(screen.getAllByRole('button', { name: /week/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('button', { name: /month/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('button', { name: /year/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('sets aria-pressed=true on the active view button', () => {
    renderToolbar({ view: 'week' });
    // Use exact name to avoid matching "Previous week" / "Next week" nav buttons
    const weekButtons = screen.getAllByRole('button', { name: /^week$/i });
    expect(weekButtons.length).toBeGreaterThanOrEqual(1);
    for (const btn of weekButtons) {
      expect(btn).toHaveAttribute('aria-pressed', 'true');
    }
  });

  it('sets aria-pressed=false on inactive view buttons', () => {
    renderToolbar({ view: 'month' });
    const yearButtons = screen.getAllByRole('button', { name: /year/i });
    for (const btn of yearButtons) {
      expect(btn).toHaveAttribute('aria-pressed', 'false');
    }
  });

  it('calls onSetView with the correct view when a view button is clicked', () => {
    const { onSetView } = renderToolbar({ view: 'month' });
    const yearButtons = screen.getAllByRole('button', { name: /year/i });
    fireEvent.click(yearButtons[0]);
    expect(onSetView).toHaveBeenCalledWith('year');
  });

  // -----------------------------------------------------------------------
  // Navigation buttons
  // -----------------------------------------------------------------------
  it('renders Previous month and Next month buttons', () => {
    renderToolbar({ view: 'month' });
    expect(screen.getAllByRole('button', { name: /previous month/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('button', { name: /next month/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('renders Previous week and Next week buttons in week view', () => {
    renderToolbar({ view: 'week' });
    expect(screen.getAllByRole('button', { name: /previous week/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('button', { name: /next week/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('renders Previous year and Next year buttons in year view', () => {
    renderToolbar({ view: 'year' });
    expect(screen.getAllByRole('button', { name: /previous year/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('button', { name: /next year/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('calls onPrev when a Previous button is clicked', () => {
    const { onPrev } = renderToolbar();
    const prevButtons = screen.getAllByRole('button', { name: /previous month/i });
    fireEvent.click(prevButtons[0]);
    expect(onPrev).toHaveBeenCalledOnce();
  });

  it('calls onNext when a Next button is clicked', () => {
    const { onNext } = renderToolbar();
    const nextButtons = screen.getAllByRole('button', { name: /next month/i });
    fireEvent.click(nextButtons[0]);
    expect(onNext).toHaveBeenCalledOnce();
  });

  // -----------------------------------------------------------------------
  // Today and Jump to Date
  // -----------------------------------------------------------------------
  it('renders a Today button', () => {
    renderToolbar();
    expect(screen.getAllByRole('button', { name: /today/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('calls onToday when Today button is clicked', () => {
    const { onToday } = renderToolbar();
    const todayButtons = screen.getAllByRole('button', { name: /today/i });
    fireEvent.click(todayButtons[0]);
    expect(onToday).toHaveBeenCalledOnce();
  });

  it('calls onJumpToDate when Jump to Date button is clicked', () => {
    const { onJumpToDate } = renderToolbar();
    // On mobile it renders as an icon button "Jump to date", on desktop as text "Jump to Date"
    const jumpButtons = screen.getAllByRole('button', { name: /jump to date/i });
    fireEvent.click(jumpButtons[0]);
    expect(onJumpToDate).toHaveBeenCalledOnce();
  });

  // -----------------------------------------------------------------------
  // Label
  // -----------------------------------------------------------------------
  it('displays the provided label', () => {
    renderToolbar({ label: 'March 2025' });
    const headings = screen.getAllByRole('heading', { name: /march 2025/i });
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it('updates the label text when label prop changes', () => {
    const { rerender } = render(
      <CalendarToolbar
        view="month"
        label="March 2025"
        onSetView={vi.fn()}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onToday={vi.fn()}
        onJumpToDate={vi.fn()}
      />
    );
    rerender(
      <CalendarToolbar
        view="month"
        label="April 2025"
        onSetView={vi.fn()}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onToday={vi.fn()}
        onJumpToDate={vi.fn()}
      />
    );
    const headings = screen.getAllByRole('heading', { name: /april 2025/i });
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });
});
