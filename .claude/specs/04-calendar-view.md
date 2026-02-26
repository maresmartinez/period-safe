# Spec 04 — Calendar View

## Goal

Build a month-grid calendar that visually marks logged period date ranges, supports month navigation, opens a read-only period detail modal on cell click, is fully keyboard-navigable, uses correct ARIA grid semantics, and renders correctly from 320px to desktop.

---

## Deliverable Definition

- `src/components/calendar/CalendarGrid.jsx` — month grid with period range marking
- `src/components/calendar/CalendarCell.jsx` — individual day cell
- `src/components/calendar/PeriodDetailModal.jsx` — read-only detail modal
- `src/components/calendar/useCalendar.js` — local hook for month navigation state
- Tests for calendar rendering, period marking, and navigation

---

## Scope

**In this slice:**
- Month grid (7 columns × 5–6 rows) for the current month
- Previous/Next month navigation buttons
- Logged period date ranges highlighted visually (rose/mauve color from spec 08 design tokens)
- Predicted period dates rendered distinctly (lighter/different style) — uses data from spec 05's hook, but the calendar must accept predictions as a prop with a clear fallback when undefined
- Cell click on a period day → opens `PeriodDetailModal` (read-only)
- Keyboard nav within the grid: Arrow keys move between days, Enter/Space opens detail
- ARIA grid semantics: `role="grid"`, `role="row"`, `role="gridcell"`, `aria-selected`, `aria-label` on each cell
- Mobile layout at 320px: grid must not overflow horizontally; font/cell sizes scale down

**Not in this slice:**
- Editing a period from the detail modal (read-only only)
- Adding a period from the calendar (the form from spec 03 is wired up in spec 09)
- Multi-month view / year view
- Statistics or cycle length charts

---

## Implementation Notes

### Component API

```jsx
<CalendarGrid
  periods={Period[]}              // logged periods from usePeriodData
  predictions={Prediction[]}      // predicted periods (may be empty array)
  onPeriodClick={(period) => void} // opens detail modal
/>
```

### Month navigation state (`useCalendar.js`)
```js
const { currentMonth, currentYear, goToPrevMonth, goToNextMonth, goToToday } = useCalendar();
// currentMonth: 0–11 (JS Date month index)
// currentYear: full year number
```

### Day cell visual states
| State | Style |
|-------|-------|
| Normal day | White/neutral background |
| Today | Slightly highlighted border or dot |
| Period day (logged) | Rose/mauve background, white text |
| Predicted period day | Lighter rose, dashed border or muted tone |
| Period start day | Left-rounded pill shape |
| Period end day | Right-rounded pill shape |
| Mid-period day | Full-width bar (no rounding) |
| Day outside current month | Muted/dimmed text |

### Period range calculation
Given `periods` array, compute which calendar dates fall within any period's `[startDate, endDate]` range. Store as a `Set<string>` of ISO date strings for O(1) lookup during grid render.

### ARIA requirements
```jsx
<table role="grid" aria-label="Period calendar, [Month Year]">
  <thead>
    <tr role="row">
      <th role="columnheader" abbr="Sunday">Su</th>
      ...
    </tr>
  </thead>
  <tbody>
    <tr role="row">
      <td
        role="gridcell"
        aria-label="[Day], [Month] [Date], [Year][, has period][, predicted period]"
        aria-selected={isSelected}
        tabIndex={isFocused ? 0 : -1}
      >
        {day}
      </td>
    </tr>
  </tbody>
</table>
```

### Keyboard navigation
- Arrow keys move focus within the grid (wrap to next/prev month at edges)
- `Home` / `End` → first/last day of week
- `PageUp` / `PageDown` → prev/next month
- `Enter` or `Space` → open detail modal for period days; no-op for empty days

### `PeriodDetailModal` content
Display all fields of the selected period in a read-only layout:
- Start date, end date
- Flow (formatted: "Light / Medium / Heavy")
- Symptoms (comma-separated or tag chips)
- Mood (numeric or label)
- Notes (plain text)
- Close button (ESC also closes; focus trap inside modal — from spec 08 `Modal` primitive)

### Date utility functions (add to `src/utils/dateUtils.js`)
```js
getCalendarDays(year, month)   // → array of Date objects for the grid (including padding days)
isDateInRange(date, start, end) // → boolean
formatDisplayDate(isoString)    // → "January 15, 2025"
formatShortDate(isoString)      // → "Jan 15"
```

### Test cases
- Renders correct number of cells for a given month/year
- Period days are marked with correct CSS class or data attribute
- Clicking a period cell calls `onPeriodClick` with the correct period
- Keyboard: ArrowRight from last day of month navigates to next month
- Non-period days do not trigger `onPeriodClick`
- Month nav: "Next" increments month; wraps year at December
- ARIA: each gridcell has `aria-label` containing the date

---

## Acceptance Criteria

- [ ] Calendar renders a 7-column month grid for the current month
- [ ] Prev/Next buttons change the displayed month and year
- [ ] Logged period date ranges are visually distinct (different background color)
- [ ] Predicted period dates render with a distinct (lighter/muted) style
- [ ] Clicking a logged period day opens `PeriodDetailModal` with correct data
- [ ] ESC closes the modal; focus returns to the triggering calendar cell
- [ ] Arrow key navigation moves focus cell by cell within the grid
- [ ] Each gridcell has an `aria-label` describing the date (and period status)
- [ ] Grid renders without horizontal overflow at 320px viewport
- [ ] All tests pass (`npm run test`)

---

## Slice Completion Checklist

Before marking this slice done, complete all three steps:

1. **Update `overview.md`:** Mark `04-calendar-view.md` checkbox as `[x]` and update the progress counter.

2. **Update `CLAUDE.md`:** Record `CalendarGrid` and `PeriodDetailModal` component APIs, `useCalendar` hook contract, and any date utility functions added to `dateUtils.js`.

3. **Update `README.md`:** Add "Calendar View" to the features list with a brief description, including the prediction visualization note.
