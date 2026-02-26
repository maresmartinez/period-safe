# CLAUDE.md — PeriodSafe Quick Reference

## Project Identity

**PeriodSafe** — local-first period tracker. No backend. Data never leaves the browser.
All user data is stored in IndexedDB / localStorage on the user's device only.

Master spec: `.claude/specs/PeriodSafe.md`
Progress tracker: `.claude/specs/overview.md`

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18+ |
| Build tool | Vite |
| Styling | Tailwind CSS (no component libraries) |
| Global state | React Context + useReducer (one context per domain: periods, settings, UI) |
| Storage | IndexedDB via `idb` library + localStorage |
| Testing | Vitest + React Testing Library + `fake-indexeddb` |
| Hosting | Vercel |
| CI/CD | GitHub Actions |
| Router | React Router v6 |

---

## Repo Structure

```
src/
  components/       # Shared UI primitives (Button, Card, Modal, Toast, etc.)
    calendar/       # Calendar view components
    period-form/    # Period logging form components
    settings/       # Settings page components
    import-export/  # Import/export page components
    navigation/     # Header, bottom nav, layout shell
  hooks/            # Custom React hooks
  utils/            # Pure utility functions (cyclePrediction.js, etc.)
  services/         # Data access layer (periodService.js)
  stores/           # Context providers / reducers
  assets/           # Static assets
  config.js         # App config (version, env flags)
  main.jsx          # Entry point
  App.jsx           # Root component + router
```

---

## Data Models

```js
// Schema version: 1
Period: {
  id: string,           // uuid
  startDate: string,    // ISO 8601 date
  endDate: string,      // ISO 8601 date (nullable)
  flow: 'light' | 'medium' | 'heavy' | null,
  symptoms: string[],   // e.g. ['cramps', 'fatigue', 'headache']
  mood: number,         // 1–5 integer (nullable)
  notes: string,        // free text (nullable)
  schemaVersion: 1
}

UserSettings: {
  cycleLengthAverage: number,   // days, default 28
  cycleVariance: number,        // days
  reminderEnabled: boolean,
  reminderDaysBefore: number,
  theme: 'light' | 'dark',
  schemaVersion: 1
}

Prediction: {
  id: string,
  predictedStartDate: string,   // ISO 8601 date
  confidence: number,           // 0–1
  basedOnLastNCycles: number,
  schemaVersion: 1
}
```

---

## Critical Rules

1. **No data transmission** — no fetch/XHR to external servers, ever
2. **No PII logging** — console logs must never contain dates, symptoms, or any user data
3. **WCAG 2.1 AA** — all interactive elements keyboard-reachable; color contrast 4.5:1 text / 3:1 large
4. **async/await + try/catch** — all IndexedDB and async operations must handle errors explicitly
5. **2-space indents, Prettier, ESLint** — enforced; no exceptions
6. **48px minimum touch targets** — all buttons/inputs on mobile
7. **No component libraries** — only Tailwind CSS for styling

---

## Service Layer Pattern

`src/services/periodService.js` is the single owner of all IndexedDB access.

```js
// Function naming convention:
getPeriod(id)           // → Period | null
getAllPeriods()          // → Period[]
createPeriod(data)      // → Period (with generated id)
updatePeriod(id, data)  // → Period
deletePeriod(id)        // → void

// Settings (localStorage):
getSettings()           // → UserSettings
saveSettings(data)      // → UserSettings

// DB init:
initDB()                // → IDBDatabase (called once on app start)
```

Error contract: all functions throw with a structured error `{ code, message }` on failure; callers must catch.

---

## Custom Hook Contracts

```js
usePeriodData()
  // Returns: { periods, loading, error, createPeriod, updatePeriod, deletePeriod }

usePeriodPrediction(periods)
  // Returns: { predictions, confidence, nextPredictedStart }
  // Requires >= 2 complete cycles; returns null values if insufficient data

useLocalStorage(key, defaultValue)
  // Returns: [value, setValue]
  // Syncs with localStorage; survives page refresh
```

---

## Commands

```bash
npm run dev          # Vite dev server at http://localhost:5173
npm run build        # Production build → dist/
npm run test         # Run all Vitest tests
npm run test:watch   # Watch mode
```

---

## Architectural Defaults (Recorded Decisions)

- **State:** React Context + useReducer — no Zustand or Redux; one context per domain (periods, settings, UI)
- **Router:** React Router v6
- **IndexedDB:** `idb` wrapper library (not raw IndexedDB API)
- **Encryption at rest:** Deferred post-MVP (TweetNaCl or libsodium.js are candidates)
- **Date library:** `date-fns` (if needed; prefer native Date where trivial)
- **No analytics, no error tracking** (e.g., no Sentry) for MVP

---

## Spec 01 — Implementation Notes (Scaffold)

**Actual package versions installed (2026-02):**
- React 19.2.0 (not 18; template defaulted to 19)
- Vite 7.3.1
- Tailwind CSS **4.2.1** (v4, not v3 — breaking change from spec)
- ESLint 9.39.3 (flat config format — uses `eslint.config.js`, not `.eslintrc.cjs`)
- Vitest 4.0.18

**Tailwind v4 deviations from spec (v3 expected):**
- No `tailwind.config.js` — v4 uses CSS-first configuration
- Uses `@tailwindcss/vite` Vite plugin instead of PostCSS plugin
- Dark mode configured in CSS: `@variant dark (&:where(.dark, .dark *));`
- CSS entry: `@import 'tailwindcss';` + `@theme { --font-sans: 'Inter', ... }`
- `autoprefixer` and `postcss` installed but not actively used (Vite plugin handles it)

**ESLint v9 deviations (flat config):**
- Uses `eslint.config.js` (ESM flat config) instead of `.eslintrc.cjs`
- `eslint-plugin-jsx-a11y` uses `.flatConfigs.recommended`
- `eslint-plugin-react` uses `.configs.flat.recommended` and `.configs.flat['jsx-runtime']`

**Vitest config note:**
- `passWithNoTests: true` added so `npm run test` exits 0 with no test files yet
- `environmentOptions.jsdom.url: 'http://localhost'` required for jsdom 28
- jsdom 28 has file-backed localStorage (emits `--localstorage-file` warning) — replaced with a localStorage mock in `src/test-setup.js`
- Fake timer tests: use `fireEvent` (synchronous) instead of `userEvent` when `vi.useFakeTimers()` is active

---

## Spec 02 — Implementation Notes (IndexedDB Storage)

**Packages installed:**
- `idb` (latest) — IndexedDB wrapper
- `fake-indexeddb` (dev dep) — imported via `import 'fake-indexeddb/auto'` in `src/test-setup.js`

**DB reset between tests:**
- Call `resetDB()` exported from `src/services/db.js` to clear the singleton (not global reassignment)
- Follow with `clearAllPeriods()` and `resetSettings()` in `beforeEach`

**Error codes:** `'DB_ERROR'`, `'NOT_FOUND'`, `'VALIDATION_ERROR'`

**settingsService:** localStorage-based, not IndexedDB. Functions: `getSettings()`, `saveSettings(data)`, `resetSettings()`

---

## Spec 08 — Implementation Notes (UI Design System)

**Tailwind v4 color tokens:** Defined in `src/index.css` inside `@theme {}` using CSS custom properties (`--color-rose-500`, etc.) — **no `tailwind.config.js`** (v4 CSS-first config).

**Button variants:** `primary` (rose-500), `secondary` (neutral-100/700 dark), `ghost` (transparent), `danger` (red-600)
**Button sizes:** `sm` (min-h-[40px]), `md` (min-h-[48px]), `lg` (min-h-[52px])

**Modal:** React Portal to `document.body`; focus trap via manual `Tab` keydown handler; ESC calls `onClose`; `aria-modal="true"`, `role="dialog"`, title linked via `useId()`

**Toast system:**
- `src/stores/ToastContext.jsx` — `ToastProvider` + `useToastContext()`
- `src/hooks/useToast.js` — `useToast()` → `{ showToast }`
- `src/components/Toast.jsx` — `ToastContainer` (renders via Portal); `role="alert"`, `aria-live="assertive"` for errors, `"polite"` for others
- `ToastProvider` wraps `App.jsx`; `ToastContainer` placed inside provider

**No external focus-trap package** — focus trap implemented manually in `Modal.jsx`

---

## Spec 03 — Implementation Notes (Period Logging Form)

**Files:**
- `src/components/period-form/PeriodForm.jsx` — form component
- `src/components/period-form/PeriodForm.test.jsx` — 11 behavior tests (RTL + Vitest)

**Component API:**
```jsx
<PeriodForm
  initialData={period | null}   // null = create mode; Period object = edit mode
  onSuccess={(period) => void}  // called with saved period on success
  onCancel={() => void}         // called when user clicks Cancel
/>
```

**Symptoms list (predefined):**
`['cramps', 'fatigue', 'headache', 'bloating', 'mood swings', 'back pain', 'nausea', 'breast tenderness']`

**Validation approach (submit-time only, not on-blur):**
- Inline errors rendered below each field with `role="alert"` + `aria-describedby` on input
- Errors clear when user changes the affected field value
- Rules: startDate required & not in future; endDate ≥ startDate if provided

**Edit mode:** Detected via `Boolean(initialData?.id)`. Calls `updatePeriod` instead of `createPeriod`.

**Mood picker:** 5 toggle buttons with `aria-pressed` + `aria-label="Mood: N out of 5"`. Click same value to deselect (returns `null`).

**ARIA structure:**
- Symptoms in `<fieldset>` / `<legend>` (implicit `role="group"`)
- Mood buttons in `<div role="group" aria-labelledby="mood-label">`
- Notes char count uses `aria-live="polite"`

**No new hooks/utilities created** — uses `useToast` from spec 08 and `periodService` from spec 02 directly.

---

## Spec 04 — Implementation Notes (Calendar View)

**Files:**
- `src/utils/dateUtils.js` — `getCalendarDays`, `isDateInRange`, `formatDisplayDate`, `formatShortDate`, `toISODateString`
- `src/components/calendar/useCalendar.js` — `useCalendar(initialMonth?, initialYear?)` hook
- `src/components/calendar/CalendarCell.jsx` — memoized individual day cell
- `src/components/calendar/PeriodDetailModal.jsx` — read-only period detail using `Modal` primitive
- `src/components/calendar/CalendarGrid.jsx` — main calendar component
- `src/components/calendar/CalendarGrid.test.jsx` — 18 tests
- `src/hooks/usePeriodData.js` — `usePeriodData()` hook → `{ periods, loading, error, createPeriod, updatePeriod, deletePeriod }`

**CalendarGrid API:**
```jsx
<CalendarGrid
  periods={Period[]}              // from usePeriodData
  predictions={Prediction[]}      // may be empty array
  onPeriodClick={(period) => void} // optional, called on period cell click
  initialMonth={0}                // optional, for testing only (0-11)
  initialYear={2024}              // optional, for testing only
/>
```

**useCalendar hook:**
```js
const { currentMonth, currentYear, goToPrevMonth, goToNextMonth, goToToday } = useCalendar(initialMonth?, initialYear?);
// currentMonth: 0–11; currentYear: full year
// initialMonth/Year: optional overrides for testing; default to current date
```

**Period visual states (bar-and-circle pattern):**
- `start`: absolute bar spans right-half of cell; circle on top → creates rounded-left pill
- `mid`: absolute bar spans full width; circle on top → seamless connection
- `end`: absolute bar spans left-half of cell; circle on top → creates rounded-right pill
- `single`: no bar; just the circle — full rounded pill
- Predicted day: circle with `bg-rose-100` + dashed border (no bar; only `predictedStartDate` marked for now — spec 05 will enrich)

**Keyboard navigation (handled on `<table onKeyDown>`):**
- ArrowLeft/Right/Up/Down: move focus ±1 day / ±1 week
- Home/End: start/end of current week (Sunday/Saturday)
- PageUp/PageDown: same day previous/next month
- Enter/Space: open PeriodDetailModal for period days; no-op otherwise
- Month auto-navigates when focusedDate crosses a month boundary

**focusedDate management:**
- `focusedDate` state drives which cell gets `tabIndex={0}` and `data-date` for DOM focus
- Clicking any cell sets `focusedDate`; period cells also open the modal
- `keyboardNavRef` boolean prevents the `useEffect` from resetting `focusedDate` to the 1st when keyboard nav triggers a month change

**ARIA grid pattern:** `<table role="grid">` → `<thead><tr role="row"><th role="columnheader">` → `<tbody><tr role="row"><td role="gridcell" aria-label aria-selected tabIndex>`

**dateUtils key behavior:**
- All date operations use local time (new Date(y, m-1, d)) to avoid UTC offset bugs
- `getCalendarDays` always returns a multiple of 7 (35 or 42 cells)
- Period range comparison uses lexicographic ISO string comparison (`currentStr <= endStr`)

---

## Navigation

- Progress tracker: [`.claude/specs/overview.md`](.claude/specs/overview.md)
- Master spec: [`.claude/specs/PeriodSafe.md`](.claude/specs/PeriodSafe.md)
- Spec 01 — Project scaffold: [`.claude/specs/01-project-scaffold.md`](.claude/specs/01-project-scaffold.md)
- Spec 02 — IndexedDB storage: [`.claude/specs/02-indexeddb-storage.md`](.claude/specs/02-indexeddb-storage.md)
- Spec 03 — Period logging form: [`.claude/specs/03-period-logging-form.md`](.claude/specs/03-period-logging-form.md)
- Spec 04 — Calendar view: [`.claude/specs/04-calendar-view.md`](.claude/specs/04-calendar-view.md)
- Spec 05 — Cycle prediction: [`.claude/specs/05-cycle-prediction.md`](.claude/specs/05-cycle-prediction.md)
- Spec 06 — Settings: [`.claude/specs/06-settings.md`](.claude/specs/06-settings.md)
- Spec 07 — Import/export: [`.claude/specs/07-import-export.md`](.claude/specs/07-import-export.md)
- Spec 08 — UI design system: [`.claude/specs/08-ui-design-system.md`](.claude/specs/08-ui-design-system.md)
- Spec 09 — Navigation/layout: [`.claude/specs/09-navigation-layout.md`](.claude/specs/09-navigation-layout.md)
- Spec 10 — Accessibility audit: [`.claude/specs/10-accessibility-audit.md`](.claude/specs/10-accessibility-audit.md)
- Spec 11 — CI/CD deployment: [`.claude/specs/11-ci-cd-deployment.md`](.claude/specs/11-ci-cd-deployment.md)
- Spec 12 — Performance & polish: [`.claude/specs/12-performance-and-polish.md`](.claude/specs/12-performance-and-polish.md)
