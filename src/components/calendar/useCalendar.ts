import { useState, useCallback } from 'react';

interface CalendarState {
  currentMonth: number;
  currentYear: number;
}

interface UseCalendarReturn {
  currentMonth: number;
  currentYear: number;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
}

/**
 * Manages month/year navigation state for the calendar.
 * @param initialMonth - 0-indexed month (defaults to current month)
 * @param initialYear - Full year (defaults to current year)
 */
export default function useCalendar(initialMonth?: number, initialYear?: number): UseCalendarReturn {
  const now = new Date();
  const [{ currentMonth, currentYear }, setState] = useState<CalendarState>({
    currentMonth: initialMonth ?? now.getMonth(),
    currentYear: initialYear ?? now.getFullYear(),
  });

  const goToPrevMonth = useCallback(() => {
    setState(({ currentMonth, currentYear }) => {
      if (currentMonth === 0) {
        return { currentMonth: 11, currentYear: currentYear - 1 };
      }
      return { currentMonth: currentMonth - 1, currentYear };
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setState(({ currentMonth, currentYear }) => {
      if (currentMonth === 11) {
        return { currentMonth: 0, currentYear: currentYear + 1 };
      }
      return { currentMonth: currentMonth + 1, currentYear };
    });
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setState({ currentMonth: today.getMonth(), currentYear: today.getFullYear() });
  }, []);

  return { currentMonth, currentYear, goToPrevMonth, goToNextMonth, goToToday };
}
