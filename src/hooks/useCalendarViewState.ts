import { useState, useCallback, useEffect } from 'react';
import type { CalendarView } from '../types.ts';

const STORAGE_KEY = 'periodSafe_calendarView';

interface PersistedState {
  view: CalendarView;
  currentYear: number;
  currentMonth: number;
  currentDay: number;
}

function readFromStorage(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    const { view, currentYear, currentMonth, currentDay } = parsed;
    if (
      (view === 'week' || view === 'month' || view === 'year') &&
      typeof currentYear === 'number' &&
      typeof currentMonth === 'number' &&
      typeof currentDay === 'number'
    ) {
      return { view, currentYear, currentMonth, currentDay };
    }
    return null;
  } catch {
    return null;
  }
}

export interface UseCalendarViewStateReturn {
  view: CalendarView;
  anchorDate: Date;
  setView: (v: CalendarView) => void;
  goToPrev: () => void;
  goToNext: () => void;
  goToToday: () => void;
  jumpToDate: (iso: string) => void;
}

export default function useCalendarViewState(): UseCalendarViewStateReturn {
  const [view, setViewState] = useState<CalendarView>(() => {
    return readFromStorage()?.view ?? 'month';
  });

  const [anchorDate, setAnchorDate] = useState<Date>(() => {
    const saved = readFromStorage();
    if (saved) {
      return new Date(saved.currentYear, saved.currentMonth, saved.currentDay);
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });

  // Persist to localStorage whenever view or anchorDate changes
  useEffect(() => {
    const state: PersistedState = {
      view,
      currentYear: anchorDate.getFullYear(),
      currentMonth: anchorDate.getMonth(),
      currentDay: anchorDate.getDate(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage not available; ignore
    }
  }, [view, anchorDate]);

  const setView = useCallback((v: CalendarView) => {
    setViewState(v);
  }, []);

  const goToPrev = useCallback(() => {
    setAnchorDate((prev) => {
      const d = new Date(prev);
      if (view === 'week') {
        d.setDate(d.getDate() - 7);
      } else if (view === 'month') {
        if (d.getMonth() === 0) {
          return new Date(d.getFullYear() - 1, 11, 1);
        }
        return new Date(d.getFullYear(), d.getMonth() - 1, 1);
      } else {
        return new Date(d.getFullYear() - 1, d.getMonth(), d.getDate());
      }
      return d;
    });
  }, [view]);

  const goToNext = useCallback(() => {
    setAnchorDate((prev) => {
      const d = new Date(prev);
      if (view === 'week') {
        d.setDate(d.getDate() + 7);
      } else if (view === 'month') {
        if (d.getMonth() === 11) {
          return new Date(d.getFullYear() + 1, 0, 1);
        }
        return new Date(d.getFullYear(), d.getMonth() + 1, 1);
      } else {
        return new Date(d.getFullYear() + 1, d.getMonth(), d.getDate());
      }
      return d;
    });
  }, [view]);

  const goToToday = useCallback(() => {
    const now = new Date();
    setAnchorDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  }, []);

  const jumpToDate = useCallback((iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    setAnchorDate(new Date(y, m - 1, d));
  }, []);

  return { view, anchorDate, setView, goToPrev, goToNext, goToToday, jumpToDate };
}
