import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import useCalendarViewState from './useCalendarViewState.ts';

const STORAGE_KEY = 'periodSafe_calendarView';

describe('useCalendarViewState', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // Initialization
  // -----------------------------------------------------------------------
  it('defaults to month view and today when localStorage is empty', () => {
    const { result } = renderHook(() => useCalendarViewState());
    expect(result.current.view).toBe('month');
    const now = new Date();
    expect(result.current.anchorDate.getFullYear()).toBe(now.getFullYear());
    expect(result.current.anchorDate.getMonth()).toBe(now.getMonth());
  });

  it('reads view from localStorage on init', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ view: 'week', currentYear: 2024, currentMonth: 5, currentDay: 15 })
    );
    const { result } = renderHook(() => useCalendarViewState());
    expect(result.current.view).toBe('week');
    expect(result.current.anchorDate.getFullYear()).toBe(2024);
    expect(result.current.anchorDate.getMonth()).toBe(5);
    expect(result.current.anchorDate.getDate()).toBe(15);
  });

  it('falls back to defaults on malformed localStorage data', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json{{{');
    const { result } = renderHook(() => useCalendarViewState());
    expect(result.current.view).toBe('month');
  });

  it('falls back to defaults on invalid view value in localStorage', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ view: 'daily', currentYear: 2024, currentMonth: 0, currentDay: 1 })
    );
    const { result } = renderHook(() => useCalendarViewState());
    expect(result.current.view).toBe('month');
  });

  // -----------------------------------------------------------------------
  // setView
  // -----------------------------------------------------------------------
  it('changes view without changing anchorDate', () => {
    const { result } = renderHook(() => useCalendarViewState());
    const initialAnchor = result.current.anchorDate;
    act(() => result.current.setView('year'));
    expect(result.current.view).toBe('year');
    expect(result.current.anchorDate).toEqual(initialAnchor);
  });

  // -----------------------------------------------------------------------
  // goToPrev / goToNext
  // -----------------------------------------------------------------------
  it('goToPrev in month view decrements month', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ view: 'month', currentYear: 2024, currentMonth: 5, currentDay: 1 })
    );
    const { result } = renderHook(() => useCalendarViewState());
    act(() => result.current.goToPrev());
    expect(result.current.anchorDate.getMonth()).toBe(4); // May
    expect(result.current.anchorDate.getFullYear()).toBe(2024);
  });

  it('goToPrev in month view wraps from January to December of previous year', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ view: 'month', currentYear: 2024, currentMonth: 0, currentDay: 1 })
    );
    const { result } = renderHook(() => useCalendarViewState());
    act(() => result.current.goToPrev());
    expect(result.current.anchorDate.getMonth()).toBe(11); // December
    expect(result.current.anchorDate.getFullYear()).toBe(2023);
  });

  it('goToNext in month view increments month', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ view: 'month', currentYear: 2024, currentMonth: 5, currentDay: 1 })
    );
    const { result } = renderHook(() => useCalendarViewState());
    act(() => result.current.goToNext());
    expect(result.current.anchorDate.getMonth()).toBe(6); // July
    expect(result.current.anchorDate.getFullYear()).toBe(2024);
  });

  it('goToNext in month view wraps from December to January of next year', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ view: 'month', currentYear: 2024, currentMonth: 11, currentDay: 1 })
    );
    const { result } = renderHook(() => useCalendarViewState());
    act(() => result.current.goToNext());
    expect(result.current.anchorDate.getMonth()).toBe(0); // January
    expect(result.current.anchorDate.getFullYear()).toBe(2025);
  });

  it('goToPrev in week view subtracts 7 days', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ view: 'week', currentYear: 2024, currentMonth: 5, currentDay: 15 })
    );
    const { result } = renderHook(() => useCalendarViewState());
    act(() => result.current.goToPrev());
    expect(result.current.anchorDate.getDate()).toBe(8);
    expect(result.current.anchorDate.getMonth()).toBe(5);
  });

  it('goToNext in week view adds 7 days', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ view: 'week', currentYear: 2024, currentMonth: 5, currentDay: 15 })
    );
    const { result } = renderHook(() => useCalendarViewState());
    act(() => result.current.goToNext());
    expect(result.current.anchorDate.getDate()).toBe(22);
    expect(result.current.anchorDate.getMonth()).toBe(5);
  });

  it('goToPrev in year view subtracts 1 year', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ view: 'year', currentYear: 2024, currentMonth: 5, currentDay: 1 })
    );
    const { result } = renderHook(() => useCalendarViewState());
    act(() => result.current.goToPrev());
    expect(result.current.anchorDate.getFullYear()).toBe(2023);
  });

  it('goToNext in year view adds 1 year', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ view: 'year', currentYear: 2024, currentMonth: 5, currentDay: 1 })
    );
    const { result } = renderHook(() => useCalendarViewState());
    act(() => result.current.goToNext());
    expect(result.current.anchorDate.getFullYear()).toBe(2025);
  });

  // -----------------------------------------------------------------------
  // goToToday
  // -----------------------------------------------------------------------
  it('goToToday sets anchorDate to today', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ view: 'month', currentYear: 2020, currentMonth: 0, currentDay: 1 })
    );
    const { result } = renderHook(() => useCalendarViewState());
    act(() => result.current.goToToday());
    const now = new Date();
    expect(result.current.anchorDate.getFullYear()).toBe(now.getFullYear());
    expect(result.current.anchorDate.getMonth()).toBe(now.getMonth());
    expect(result.current.anchorDate.getDate()).toBe(now.getDate());
  });

  // -----------------------------------------------------------------------
  // jumpToDate
  // -----------------------------------------------------------------------
  it('jumpToDate updates anchorDate to the given ISO date', () => {
    const { result } = renderHook(() => useCalendarViewState());
    act(() => result.current.jumpToDate('2023-08-15'));
    expect(result.current.anchorDate.getFullYear()).toBe(2023);
    expect(result.current.anchorDate.getMonth()).toBe(7); // August = index 7
    expect(result.current.anchorDate.getDate()).toBe(15);
  });

  it('jumpToDate does not change the view', () => {
    const { result } = renderHook(() => useCalendarViewState());
    act(() => result.current.setView('week'));
    act(() => result.current.jumpToDate('2023-08-15'));
    expect(result.current.view).toBe('week');
  });

  // -----------------------------------------------------------------------
  // Persistence
  // -----------------------------------------------------------------------
  it('persists view and anchorDate to localStorage after setView', () => {
    const { result } = renderHook(() => useCalendarViewState());
    act(() => result.current.setView('year'));
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(stored.view).toBe('year');
  });

  it('persists anchorDate to localStorage after jumpToDate', () => {
    const { result } = renderHook(() => useCalendarViewState());
    act(() => result.current.jumpToDate('2025-03-10'));
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(stored.currentYear).toBe(2025);
    expect(stored.currentMonth).toBe(2);
    expect(stored.currentDay).toBe(10);
  });
});
