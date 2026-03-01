/**
 * Returns an array of Date objects for a calendar month grid view,
 * including leading and trailing padding days from adjacent months.
 * The grid always starts on Sunday.
 */
export function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay(); // 0=Sunday
  const endPadding = 6 - lastDay.getDay();

  const days: Date[] = [];

  // Previous month trailing days
  for (let i = startPadding - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  // Next month leading days
  for (let i = 1; i <= endPadding; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

/**
 * Returns true if the given date falls within [start, end] inclusive.
 * All arguments are ISO date strings (YYYY-MM-DD) or Date objects.
 */
export function isDateInRange(date: string | Date, start: string | Date, end: string | Date): boolean {
  const d = toLocalDate(date);
  const s = toLocalDate(start);
  const e = toLocalDate(end);
  return d >= s && d <= e;
}

/**
 * Formats an ISO date string as "January 15, 2025".
 */
export function formatDisplayDate(isoString: string): string {
  if (!isoString) return '';
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats an ISO date string as "Jan 15".
 */
export function formatShortDate(isoString: string): string {
  if (!isoString) return '';
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Converts a Date object or ISO string to a YYYY-MM-DD string (local time).
 */
export function toISODateString(date: Date | string): string {
  if (typeof date === 'string') return date.slice(0, 10);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns the Sunday that starts the week containing the given date.
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - d.getDay());
  return d;
}

/**
 * Returns an array of 7 Date objects for the week (Sun–Sat) containing `date`.
 */
export function getWeekDays(date: Date): Date[] {
  const sunday = getWeekStart(date);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i));
  }
  return days;
}

/**
 * Formats a week range label, e.g. "Mar 2 – Mar 8, 2025".
 */
export function formatWeekRangeLabel(weekStart: Date): string {
  const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
  const startLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endLabel = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startLabel} – ${endLabel}`;
}

/**
 * Formats a year label, e.g. "2025".
 */
export function formatYearLabel(year: number): string {
  return String(year);
}

// Normalize a Date or ISO string to a midnight local-time Date for comparisons
function toLocalDate(dateOrString: Date | string): Date {
  if (typeof dateOrString === 'string') {
    const [y, m, d] = dateOrString.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(
    dateOrString.getFullYear(),
    dateOrString.getMonth(),
    dateOrString.getDate()
  );
}
