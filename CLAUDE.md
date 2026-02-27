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

## Spec 05 — Implementation Notes (Cycle Prediction)

**Files:**
- `src/utils/cyclePrediction.js` — pure functions, no React deps
- `src/hooks/usePeriodPrediction.js` — `usePeriodPrediction(periods)` hook
- `src/utils/cyclePrediction.test.js` — 31 unit tests

**Public API (`cyclePrediction.js`):**
```js
analyzeCycles(periods)          // → CycleSummary | null (null if < 2 periods)
predictNextPeriods(periods, count = 3) // → Prediction[] ([] if < 2 periods)
checkCycleAnomalies(cycleLengths)      // → { flagged: boolean, reason: string|null }
```

**`usePeriodPrediction(periods)` returns:**
```js
{
  predictions: Prediction[],    // empty if < 2 periods
  cycleSummary: CycleSummary|null,
  hasEnoughData: boolean,       // true if periods.length >= 3 (2+ complete cycles)
  anomalyDetected: boolean,
}
```

**Algorithm:**
- Cycle length = days between consecutive `startDate` values (sorted ascending)
- `averageCycleLength` = mean of cycle lengths
- `variance` = population standard deviation of cycle lengths
- `confidence` = `max(0, round(1 - variance / averageCycleLength, 2))`
- `windowEarlyStart` = `predictedStartDate - floor(variance)` days
- `windowLateStart` = `predictedStartDate + ceil(variance)` days
- Predictions advance: `lastPeriodStartDate + round(averageCycleLength) * (i+1)`

**Anomaly thresholds:** < 21 days or > 35 days → `anomalyFlag: true`

**Calendar enrichment:** `buildPredictedDateSet` in `CalendarGrid.jsx` now marks the full window (`windowEarlyStart` → `windowLateStart`) as predicted days, displayed with rose-100 background + dashed border.

**`endDate` irrelevant** — cycle length uses only `startDate`. Periods with `endDate: null` are handled fine.

---

## Spec 06 — Implementation Notes (Settings)

**Files:**
- `src/hooks/useSettings.js` — hook wrapping `settingsService`
- `src/components/settings/SettingsPage.jsx` — three-section settings UI
- `src/components/settings/SettingsPage.test.jsx` — 16 tests

**`useSettings()` returns:**
```js
{
  settings,        // current UserSettings object (null while loading)
  saveSettings,    // (partial) => UserSettings — merges and persists; also applies theme
  resetSettings,   // () => UserSettings — resets to defaults + applies theme
  loading,         // boolean (false immediately after first useEffect run)
}
```

**Dark mode implementation (Tailwind v4):**
- `@variant dark (&:where(.dark, .dark *));` already in `src/index.css` — no `tailwind.config.js` needed
- Apply/remove `dark` class on `document.documentElement`: `document.documentElement.classList.toggle('dark', theme === 'dark')`
- `applyTheme(theme)` helper exported from `useSettings.js`
- `saveSettings({ theme })` automatically calls `applyTheme` when `theme` key is present

**Theme initialization (no flash):** `src/main.jsx` reads `periodSafe_userSettings` from localStorage before React renders and adds `dark` class if `settings.theme === 'dark'`

**Settings sections:**
1. **Cycle** — number input `min="21" max="35"`, save button, inline validation error (`role="alert"`)
2. **Reminders** — `role="switch" aria-checked={false}` toggle, `disabled`, opacity-50, "Coming soon" copy
3. **Appearance** — two `aria-pressed` buttons (Light/Dark); instant apply on click, no separate save

**Reminders are UI-only for MVP** — no browser notification API called

---

## Spec 07 — Implementation Notes (Import/Export)

**Files:**
- `src/utils/dataTransfer.js` — pure functions (no React deps)
- `src/utils/dataTransfer.test.js` — 22 unit tests
- `src/components/import-export/ImportExportPage.jsx` — full UI

**Export JSON envelope shape:**
```json
{
  "schemaVersion": 1,
  "exportedAt": "<ISO timestamp>",
  "appName": "PeriodSafe",
  "data": {
    "periods": [ /* Period[] */ ],
    "settings": { /* UserSettings */ }
  }
}
```
Export filename: `periodsafe-export-YYYY-MM-DD.json`

**`validateImportShape(parsed)` — what it checks:**
- Root must be an object (not array/null)
- `schemaVersion` must be a number ≤ `SCHEMA_VERSION`
- `data` must be an object
- `data.periods` must be an array; each period needs `id` (string) and valid `startDate` (ISO)
- `data.settings` being null/missing is recoverable (defaults used); array is rejected
- Returns `{ valid: boolean, errors: string[] }`
- File size > 10MB rejected by the UI before parsing (constant `MAX_IMPORT_FILE_SIZE`)

**Import strategies:**
- **overwrite** — calls `clearAllPeriods()` + `saveSettings(file.settings)`, then inserts all periods with preserved IDs
- **merge** — checks `getPeriod(period.id)` before inserting; skips duplicates; does NOT apply file settings

**ID preservation note:** `createPeriod` always generates new UUIDs, so import uses `db.put('periods', record)` directly via `initDB()` to preserve original IDs from the export file. This is critical for merge-mode deduplication.

**UI structure:** Privacy banner → Export card → Import card (hidden `<input type="file">`) → Danger zone (clear all). Overwrite/merge choice presented in a Modal after successful validation.

---

## Spec 09 — Implementation Notes (Navigation/Layout)

**Dependency added:** `react-router-dom` (added to production dependencies)

**Router:** `HashRouter` in `src/main.jsx` — wraps the entire app so URLs use `#/` (e.g. `/#/settings`). Vercel-compatible without custom rewrite rules.

**Route table:**
| Path | Component | File |
|------|-----------|------|
| `/` | `CalendarPage` | `src/components/calendar/CalendarPage.jsx` |
| `/log` | `PeriodFormPage` | `src/components/period-form/PeriodFormPage.jsx` |
| `/settings` | `SettingsPage` | `src/components/settings/SettingsPage.jsx` |
| `/export` | `ImportExportPage` | `src/components/import-export/ImportExportPage.jsx` |
| `*` | `NotFoundPage` | `src/components/navigation/NotFoundPage.jsx` |

**Page wrapper components (new):**
- `CalendarPage.jsx` — loads data via `usePeriodData` + `usePeriodPrediction`, renders `CalendarGrid`, includes mobile FAB (`/log` link, fixed bottom-20 right-4, md:hidden)
- `PeriodFormPage.jsx` — renders `PeriodForm` with `onSuccess`/`onCancel` both navigating to `/`

**Navigation components (new in `src/components/navigation/`):**
- `Header.jsx` — sticky top-0, z-20, h-14; app title links to `/`; settings gear icon links to `/settings`
- `BottomNav.jsx` — fixed bottom, md:hidden; 4 `NavLink` items with icons+labels; active = rose color
- `TabNav.jsx` — hidden md:flex; horizontal tabs below header; active = rose border-b + rose text
- `NotFoundPage.jsx` — minimal 404 page with "Go back home" link

**App.jsx structure:** All page components are `React.lazy()`-loaded; wrapped in `<Suspense>` with `<LoadingSpinner>` fallback. `ToastProvider` + `ToastContainer` wrap everything. Layout: `Header` → `TabNav` → `<main>` → `BottomNav`.

**main.jsx:** `HashRouter` wraps `<App />` in `StrictMode`. Theme-init code (dark class) runs before render.

**Bug fixed:** `ImportExportPage.jsx` was using default import for `useToast` — corrected to named import `{ useToast }`.

**Tests:** `src/components/navigation/Navigation.test.jsx` — 12 tests covering Header title, settings link, NotFoundPage heading + home link, BottomNav/TabNav active state highlighting per route.

---

## Spec 11 — Implementation Notes (CI/CD & Deployment)

**CI workflow:** `.github/workflows/ci.yml` — runs on every push and PR; steps: `npm ci` → `npm run lint` → `npm run test` → `npm run build` → `node scripts/check-bundle-size.js`

**CD:** Vercel GitHub integration handles production deploys (push to `main`) and PR preview deploys automatically — no `deploy.yml` needed.

**Bundle size check:** `scripts/check-bundle-size.js` — gzips all `dist/assets/*.js` files; fails with exit 1 if total > 100KB. Run locally with `npm run check-size`.

**`vercel.json`:** `outputDirectory: "dist"`, `framework: "vite"`, catch-all rewrite to `/index.html`. Rewrite is redundant with `HashRouter` but kept as good practice.

**Environment variables:** Must be prefixed `VITE_` to be accessible via `import.meta.env.VITE_*`. No secrets required for MVP — Vercel integration uses its own OAuth token.

**HashRouter note:** URLs use `#/` (e.g. `/#/settings`) — no server-side routing config needed for Vercel.

---

## Spec 12 — Implementation Notes (Performance & Polish)

**Error Boundary component:** `src/components/ErrorBoundary.jsx` — class component using `getDerivedStateFromError()` and `componentDidCatch()`. Wraps all lazy-loaded routes in `App.jsx`. Shows user-friendly error UI with "Refresh the page" button on error; logs only non-sensitive error name/message (never user data).

**Privacy Banner component:** `src/components/PrivacyBanner.jsx` — functional component with localStorage persistence key `periodSafe_privacyAcknowledged`. Displays on first visit with "Learn more" link opening a Modal with full privacy explanation. Fixed to bottom (above bottom nav on mobile). Uses `aria-live="polite"` for screen readers.

**SEO meta tags:** Added to `index.html`:
- `<meta name="description">` — app description for search results
- `<meta name="theme-color" content="#f43f5e">` — browser chrome color
- `<meta property="og:title">` and `<meta property="og:description">` — social sharing

**Lighthouse CI config:** `.lighthouserc.json` — defines CI targets:
- Performance: ≥ 90
- Accessibility: = 100 (strict)
- Best Practices: ≥ 90
- SEO: ≥ 80
Runs 3 iterations of Lighthouse on homepage and settings page.

**Performance test:** `src/components/calendar/CalendarGrid.perf.test.jsx` — two perf tests:
- 500 periods render in < 200ms
- 100 periods render in < 50ms
Uses `generateTestPeriods()` utility to seed 500+ periods spread across 14+ years, testing both rendering speed and calendar navigation responsiveness.

**Smoke test docs:** `docs/smoke-test.md` — comprehensive manual test checklist covering:
- Privacy banner on first visit
- Full period logging workflow (create, edit, view)
- Calendar month navigation + keyboard nav (desktop only)
- Cycle prediction rendering
- Settings (cycle length, dark/light mode)
- Import/export workflow (overwrite & merge)
- Clear all data workflow
- Keyboard-only navigation
- Browser compatibility (Chrome, Firefox, Safari, iOS, Android)

**README finalization:** Includes all required MVP sections:
- Privacy statement (top, prominent) → links to privacy banner in app
- Features list (all MVP features)
- Tech stack table
- Setup & local dev instructions
- CLI commands reference
- Project folder structure
- Deployment instructions (Vercel integration)
- Accessibility statement + WCAG 2.1 AA claim
- Testing instructions
- Contributing guidelines
- Known limitations (post-MVP features deferred)
- License, Support, Changelog

**App.jsx changes:** Now wraps routes in `<ErrorBoundary>` and includes `<PrivacyBanner />` before the main layout div.

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
