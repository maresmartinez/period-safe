/**
 * Returns an array of Date objects for a calendar month grid view,
 * including leading and trailing padding days from adjacent months.
 * The grid always starts on Sunday.
 * @param {number} year
 * @param {number} month - 0-indexed (0=January, 11=December)
 * @returns {Date[]}
 */
export function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay(); // 0=Sunday
  const endPadding = 6 - lastDay.getDay();

  const days = [];

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
 * @param {string|Date} date
 * @param {string|Date} start
 * @param {string|Date} end
 * @returns {boolean}
 */
export function isDateInRange(date, start, end) {
  const d = toLocalDate(date);
  const s = toLocalDate(start);
  const e = toLocalDate(end);
  return d >= s && d <= e;
}

/**
 * Formats an ISO date string as "January 15, 2025".
 * @param {string} isoString - YYYY-MM-DD
 * @returns {string}
 */
export function formatDisplayDate(isoString) {
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
 * @param {string} isoString - YYYY-MM-DD
 * @returns {string}
 */
export function formatShortDate(isoString) {
  if (!isoString) return '';
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Converts a Date object or ISO string to a YYYY-MM-DD string (local time).
 * @param {Date|string} date
 * @returns {string}
 */
export function toISODateString(date) {
  if (typeof date === 'string') return date.slice(0, 10);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Normalize a Date or ISO string to a midnight local-time Date for comparisons
function toLocalDate(dateOrString) {
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
